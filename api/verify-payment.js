const Razorpay = require("razorpay");
const crypto = require("crypto");
const plans = require("./plans");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error("Missing Razorpay environment variables");
    }

    const { orderId, paymentId, signature } = req.body || {};

    if (
      typeof orderId !== "string" ||
      !/^order_[a-zA-Z0-9]+$/.test(orderId) ||
      typeof paymentId !== "string" ||
      !/^pay_[a-zA-Z0-9]+$/.test(paymentId) ||
      typeof signature !== "string" ||
      !/^[a-f0-9]{64}$/i.test(signature)
    ) {
      return res.status(400).json({
        error: "Invalid payment details"
      });
    }

    const expected = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest();

    const received = Buffer.from(signature, "hex");

    if (
      received.length !== expected.length ||
      !crypto.timingSafeEqual(received, expected)
    ) {
      return res.status(400).json({
        error: "Payment signature verification failed"
      });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const [order, payment] = await Promise.all([
      razorpay.orders.fetch(orderId),
      razorpay.payments.fetch(paymentId)
    ]);

    if (
      payment.order_id !== order.id ||
      order.currency !== "INR" ||
      payment.currency !== "INR" ||
      payment.amount !== order.amount
    ) {
      return res.status(400).json({
        error: "Payment does not match the order"
      });
    }

    const plan = plans[order.notes?.planId];

    if (!plan || order.amount !== plan.offerPrice * 100) {
      return res.status(400).json({
        error: "Invalid plan amount"
      });
    }

    if (payment.status !== "captured") {
      return res.status(409).json({
        error: "Payment is not captured yet"
      });
    }

    return res.status(200).json({
      verified: true,
      paymentId: payment.id,
      planName: plan.name,
      amount: plan.offerPrice
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);

    return res.status(500).json({
      error: "Payment verification failed. Check Vercel function logs."
    });
  }
};