const plans = {
  "6-7": { original: 21999, offer: 14999 },
  "7-8": { original: 21999, offer: 14999 },
  "8-9": { original: 23999, offer: 15999 },
  "9-10": { original: 24999, offer: 17999 },
  "10-11": { original: 24999, offer: 17999 },
};

const form = document.getElementById("enrollmentForm");
const planSelect = document.getElementById("plan");
const button = document.getElementById("payButton");
const status = document.getElementById("status");

const inr = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

function updatePrice() {
  const selected = plans[planSelect.value];

  document.getElementById("originalPrice").textContent =
    inr(selected.original);

  document.getElementById("offerPrice").textContent =
    inr(selected.offer);

  document.getElementById("savings").textContent =
    `You save ${inr(selected.original - selected.offer)}`;
}

planSelect.addEventListener("change", updatePrice);
updatePrice();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!form.reportValidity()) return;

  if (typeof window.Razorpay !== "function") {
    status.textContent =
      "Payment checkout could not load. Please refresh and try again.";
    return;
  }

  button.disabled = true;
  status.textContent = "Preparing your secure checkout...";

  try {
    const student = document.getElementById("studentName")
      .value.trim();

    const phone = document.getElementById("parentPhone")
      .value.trim();

    const email = document.getElementById("parentEmail")
      .value.trim();

    const planId = planSelect.value;

    // The server determines the price from planId.
    const orderResponse = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId,
        student,
        phone,
        email,
      }),
    });

    const order = await orderResponse.json();

    if (!orderResponse.ok) {
      throw new Error(order.error || "Unable to create the order.");
    }

    const checkout = new Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: "INR",
      name: "ManavtaClass",
      description: order.planName,
      prefill: {
        name: student,
        contact: phone,
        email,
      },
      theme: { color: "#1646a0" },

      handler: async function (payment) {
        status.textContent = "Verifying your payment...";

        try {
          const verifyResponse = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: order.orderId,
              paymentId: payment.razorpay_payment_id,
              signature: payment.razorpay_signature,
            }),
          });

          const result = await verifyResponse.json();

          if (!verifyResponse.ok || !result.verified) {
            throw new Error(
              result.error || "Payment verification failed."
            );
          }

          status.textContent =
            `Payment verified successfully. Reference: ${result.paymentId}. ` +
            "Please save this reference for your records.";
        } catch (error) {
          status.textContent =
            "We could not confirm your payment automatically. " +
            "Please contact ManavtaClass support with your payment reference.";
        } finally {
          button.disabled = false;
        }
      },

      modal: {
        ondismiss: function () {
          button.disabled = false;
          status.textContent =
            "Checkout closed. You can try again when ready.";
        },
      },
    });

    checkout.on("payment.failed", function () {
      button.disabled = false;
      status.textContent =
        "Payment failed or was not completed. Please try again.";
    });

    checkout.open();
  } catch (error) {
    status.textContent = error.message || "Something went wrong.";
    button.disabled = false;
  }
});