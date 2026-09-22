/* =====================================================
   MANAVTACLASS JAVASCRIPT
===================================================== */


/* ============================================
   RAZORPAY PAYMENT LINKS
   REPLACE THESE WITH YOUR EXISTING LINKS
============================================ */

// const paymentLinks = {

//   6: "PASTE_CLASS_6_RAZORPAY_LINK_HERE",

//   7: "PASTE_CLASS_7_RAZORPAY_LINK_HERE",

//   8: "PASTE_CLASS_8_RAZORPAY_LINK_HERE",

//   9: "PASTE_CLASS_9_RAZORPAY_LINK_HERE",

//   10: "PASTE_CLASS_10_RAZORPAY_LINK_HERE",

//   11: "PASTE_CLASS_11_RAZORPAY_LINK_HERE",

//   12: "PASTE_CLASS_12_RAZORPAY_LINK_HERE"

// };


/* ============================================
   MOBILE MENU
============================================ */

const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

if (menuToggle && mobileMenu) {

  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");

    menuToggle.textContent =
      mobileMenu.classList.contains("open")
        ? "×"
        : "☰";
  });


  mobileMenu.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {

      mobileMenu.classList.remove("open");

      menuToggle.textContent = "☰";

    });

  });

}


/* ============================================
   FAQ
============================================ */

document.querySelectorAll(".faq-question").forEach(button => {

  button.addEventListener("click", () => {

    const item = button.parentElement;

    document.querySelectorAll(".faq-item").forEach(other => {

      if (other !== item) {
        other.classList.remove("active");
      }

    });

    item.classList.toggle("active");

  });

});


/* ============================================
   SCROLL REVEAL
============================================ */

const revealElements =
  document.querySelectorAll(".reveal");

const observer =
  new IntersectionObserver(
    entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add("visible");

          observer.unobserve(entry.target);

        }

      });

    },
    {
      threshold: 0.12
    }
  );


revealElements.forEach(element => {
  observer.observe(element);
});


/* ============================================
   YEAR
============================================ */

const yearElement =
  document.getElementById("year");

if (yearElement) {

  yearElement.textContent =
    new Date().getFullYear();

}


/* ============================================
   ENROLLMENT
============================================ */

document.querySelectorAll(".enroll-btn")
  .forEach(button => {

    button.addEventListener("click", event => {

      event.preventDefault();

      const selectedClass =
        button.dataset.class;

      const paymentURL =
        paymentLinks[selectedClass];


      /*
        Prevent accidental clicks before
        payment links are added.
      */

      if (
        !paymentURL ||
        paymentURL.includes("PASTE_CLASS")
      ) {

        alert(
          `Payment link for Class ${selectedClass} has not been configured yet.`
        );

        return;

      }


      /* Analytics event */

      if (typeof gtag === "function") {

        gtag(
          "event",
          "begin_checkout",
          {
            class_selected: selectedClass,
            value: 29,
            currency: "INR"
          }
        );

      }


      /* Redirect */

      window.location.href =
        paymentURL;

    });

  });


/* ============================================
   GOOGLE ANALYTICS PLACEHOLDER
============================================ */

/*
  Add your Google Analytics measurement code
  in the <head> of your pages when ready.

  Example:

  G-XXXXXXXXXX

  Do NOT paste the example ID.
*/


/* ============================================
   SMOOTH INTERNAL LINKS
============================================ */

document.querySelectorAll(
  'a[href^="#"]'
).forEach(anchor => {

  anchor.addEventListener("click", function (event) {

    const target =
      document.querySelector(
        this.getAttribute("href")
      );

    if (target) {

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth"
      });

    }

  });

});


/* ============================================
   EXTERNAL LINKS
============================================ */

document.querySelectorAll(
  'a[target="_blank"]'
).forEach(link => {

  link.setAttribute(
    "rel",
    "noopener noreferrer"
  );

});