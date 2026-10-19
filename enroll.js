
/* =====================================================
   MANAVTACLASS ENROLLMENT & RAZORPAY CHECKOUT
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const plans = {
    "6-7": { original: 21999, offer: 14999 },
    "7-8": { original: 21999, offer: 14999 },
    "8-9": { original: 23999, offer: 15999 },
    "9-10": { original: 24999, offer: 17999 },
    "10-11": { original: 24999, offer: 17999 }
  };

  // HTML elements
  const form = document.getElementById("enrollmentForm");
  const planSelect = document.getElementById("plan");
  const button = document.getElementById("payButton");
  const status = document.getElementById("status");

  const originalPrice = document.getElementById("originalPrice");
  const offerPrice = document.getElementById("offerPrice");
  const savings = document.getElementById("savings");

  const studentInput = document.getElementById("studentName");
  const phoneInput = document.getElementById("parentPhone");

  function showStatus(message) {
    if (status) status.textContent = message;
  }

  // Validate required HTML elements
  const requiredElements = {
    enrollmentForm: form,
    plan: planSelect,
    payButton: button,
    status: status,
    originalPrice: originalPrice,
    offerPrice: offerPrice,
    savings: savings,
    studentName: studentInput,
    parentPhone: phoneInput
  };

  const missing = Object.entries(requiredElements)
    .filter(([, element]) => !element)
    .map(([id]) => id);

  if (missing.length > 0) {
    console.error("Missing enrollment HTML IDs:", missing);
    showStatus(
      "Form setup error. Missing HTML IDs: " + missing.join(", ")
    );
    return;
  }

  // Format Indian currency
  const inr = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);

  // Update course pricing
  function updatePrice() {
    const selected = plans[planSelect.value];

    if (!selected) {
      originalPrice.textContent = "—";
      offerPrice.textContent = "—";
      savings.textContent = "Please select a valid plan.";
      return;
    }

    originalPrice.textContent = inr(selected.original);
    offerPrice.textContent = inr(selected.offer);
    savings.textContent =
      `You save ${inr(selected.original - selected.offer)}`;
  }

  planSelect.addEventListener("change", updatePrice);
  updatePrice();

  // Safely parse API responses
  async function readResponse(response) {
    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        `Invalid server response (HTTP ${response.status}). ` +
        "Please check the Vercel API route and function logs."
      );
    }

    if (!response.ok) {
      throw new Error(
        data.error || `Request failed (HTTP ${response.status}).`
      );
    }

    return data;
  }

  // Enrollment form submission
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    if (typeof window.Razorpay !== "function") {
      showStatus(
        "Razorpay checkout could not load. Refresh and try again."
      );
      return;
    }

    const student = studentInput.value.trim();
    const phone = phoneInput.value.trim();
    const planId = planSelect.value;

    // Validate selected plan
    if (!Object.prototype.hasOwnProperty.call(plans, planId)) {
      showStatus("Please select a valid course plan.");
      return;
    }

    // Validate student name and Indian mobile number
    if (
      student.length < 2 ||
      student.length > 100 ||
      !/^[6-9]\d{9}$/.test(phone)
    ) {
      showStatus(
        "Enter a valid student name and 10-digit parent mobile number."
      );
      return;
    }

    button.disabled = true;
    showStatus("Preparing your secure checkout...");

    try {
      // Create Razorpay order on the server
      const orderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          planId,
          student,
          phone
        })
      });

      const order = await readResponse(orderResponse);

      if (
        !order.orderId ||
        !order.keyId ||
        !Number.isInteger(order.amount) ||
        order.amount <= 0 ||
        order.currency !== "INR"
      ) {
        throw new Error(
          "Incomplete order details received from the server."
        );
      }

      // Open Razorpay checkout
      const checkout = new window.Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: "ManavtaClass",
        description: order.planName || "Long-Term Learning Plan",

        prefill: {
          name: student,
          contact: phone
        },

        theme: {
          color: "#1646a0"
        },

        // Verify payment on the server
        handler: async (payment) => {
          showStatus("Verifying your payment...");

          try {
            const verifyResponse = await fetch(
              "/api/verify-payment",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  orderId: order.orderId,
                  paymentId: payment.razorpay_payment_id,
                  signature: payment.razorpay_signature
                })
              }
            );

            const result = await readResponse(verifyResponse);

            if (!result.verified) {
              throw new Error(
                "Payment verification was not confirmed."
              );
            }

            showStatus(
              `Payment verified successfully. ` +
              `Reference: ${result.paymentId}. ` +
              "Please save this reference for your records."
            );

          } catch (error) {
            console.error("Payment verification error:", error);

            showStatus(
              "Payment could not be confirmed automatically. " +
              "Keep your Razorpay payment reference and contact support."
            );

          } finally {
            button.disabled = false;
          }
        },

        // User closes checkout
        modal: {
          ondismiss: () => {
            button.disabled = false;
            showStatus(
              "Checkout closed. You can try again when ready."
            );
          }
        }
      });

      // Payment failure event
      checkout.on("payment.failed", (response) => {
        console.error(
          "Razorpay payment failed:",
          response.error
        );

        button.disabled = false;

        showStatus(
          "Payment failed or was not completed. Please try again."
        );
      });

      checkout.open();

    } catch (error) {
      console.error("Enrollment checkout error:", error);

      showStatus(
        error.message || "Something went wrong. Please try again."
      );

      button.disabled = false;
    }
  });
});
