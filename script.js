/* =========================================================
   MANAVTACLASS JAVASCRIPT
   ========================================================= */


/* ================= HEADER ================= */

const header = document.getElementById("siteHeader");

window.addEventListener("scroll", () => {

  if (!header) return;

  if (window.scrollY > 20) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }

});


/* ================= MOBILE MENU ================= */

const mobileMenuBtn =
  document.getElementById("mobileMenuBtn");

const mobileNav =
  document.getElementById("mobileNav");


if (mobileMenuBtn && mobileNav) {

  mobileMenuBtn.addEventListener("click", () => {

    mobileNav.classList.toggle("active");

  });


  mobileNav.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {

      mobileNav.classList.remove("active");

    });

  });

}


/* ================= FAQ ================= */

const faqItems =
  document.querySelectorAll(".faq-item");


faqItems.forEach(item => {

  const question =
    item.querySelector(".faq-question");

  const answer =
    item.querySelector(".faq-answer");


  question.addEventListener("click", () => {

    const isActive =
      item.classList.contains("active");


    faqItems.forEach(otherItem => {

      otherItem.classList.remove("active");

      const otherAnswer =
        otherItem.querySelector(".faq-answer");

      otherAnswer.style.maxHeight = null;

    });


    if (!isActive) {

      item.classList.add("active");

      answer.style.maxHeight =
        answer.scrollHeight + "px";

    }

  });

});


/* ================= SCROLL REVEAL ================= */

const revealElements =
  document.querySelectorAll(".reveal");


const revealObserver =
  new IntersectionObserver(

    entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add("visible");

          revealObserver.unobserve(
            entry.target
          );

        }

      });

    },

    {
      threshold: 0.12
    }

  );


revealElements.forEach(element => {

  revealObserver.observe(element);

});


/* ================= CURRENT YEAR ================= */

const currentYear =
  document.getElementById("currentYear");


if (currentYear) {

  currentYear.textContent =
    new Date().getFullYear();

}


/* ================= SMOOTH INTERNAL LINKS ================= */

document.querySelectorAll(
  'a[href^="#"]'
).forEach(link => {

  link.addEventListener("click", function (event) {

    const targetId =
      this.getAttribute("href");

    if (!targetId || targetId === "#") {
      return;
    }

    const target =
      document.querySelector(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();

    const headerHeight =
      document.querySelector(".site-header")
        ?.offsetHeight || 0;

    const targetPosition =
      target.getBoundingClientRect().top +
      window.scrollY -
      headerHeight -
      15;

    window.scrollTo({

      top: targetPosition,

      behavior: "smooth"

    });

  });

});


/* ================= EXTERNAL LINKS ================= */

document.querySelectorAll(
  'a[target="_blank"]'
).forEach(link => {

  link.setAttribute(
    "rel",
    "noopener noreferrer"
  );

});