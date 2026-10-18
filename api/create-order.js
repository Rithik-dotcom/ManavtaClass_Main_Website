const Razorpay = require("razorpay");
const plans = require("./plans");
const crypto = require("crypto");

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

    const { planId, student, phone, email } = req.body || {};
    const plan = plans[planId];

    if (!plan) {
      return res.status(400).json({
        error: "Invalid plan selected"
      });
    }

    if (
      typeof student !== "string" ||
      student.trim().length < 2 ||
      student.trim().length > 100 ||
      typeof phone !== "string" ||
      !/^[6-9]\d{9}$/.test(phone) ||
      typeof email !== "string" ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return res.status(400).json({
        error: "Please enter valid student and parent details"
      });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const order = await razorpay.orders.create({
      amount: plan.offerPrice * 100,
      currency: "INR",
      receipt: "mc_" + crypto.randomBytes(12).toString("hex"),
      notes: {
        planId,
        student: student.trim(),
        phone,
        email: email.trim()
      }
    });

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      planName: plan.name
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    return res.status(500).json({
      error: "Could not create Razorpay order. Check Vercel function logs."
    });
  }
};