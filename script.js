
/* =====================================================
   MANAVTACLASS JAVASCRIPT
===================================================== */

/* ============================================
   MOBILE MENU
============================================ */

const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");

    menuToggle.textContent = isOpen ? "×" : "☰";
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mobileMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      menuToggle.textContent = "☰";
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ============================================
   FAQ ACCORDION — SINGLE CLICK HANDLER
============================================ */

document.querySelectorAll(".faq-question").forEach(button => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");

    if (!item) return;

    const answer = item.querySelector(".faq-answer");
    const isOpen = button.getAttribute("aria-expanded") === "true";

    if (!answer) return;

    // Close all FAQ items first
    document.querySelectorAll(".faq-item").forEach(faqItem => {
      faqItem.classList.remove("active");

      const faqButton = faqItem.querySelector(".faq-question");
      const faqAnswer = faqItem.querySelector(".faq-answer");

      if (faqButton) {
        faqButton.setAttribute("aria-expanded", "false");
      }

      if (faqAnswer) {
        faqAnswer.style.display = "none";
      }

      const icon = faqButton?.querySelector("span");
      if (icon) icon.textContent = "+";
    });

    // Open the clicked item if it was previously closed
    if (!isOpen) {
      item.classList.add("active");
      button.setAttribute("aria-expanded", "true");
      answer.style.display = "block";

      const icon = button.querySelector("span");
      if (icon) icon.textContent = "−";
    }
  });
});

/* ============================================
   SCROLL REVEAL
============================================ */

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12
  });

  revealElements.forEach(element => {
    observer.observe(element);
  });
} else {
  revealElements.forEach(element => {
    element.classList.add("visible");
  });
}










/* ============================================
   COPYRIGHT YEAR
============================================ */

const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/* ============================================
   SMOOTH INTERNAL LINKS
============================================ */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (event) {
    const href = this.getAttribute("href");

    if (!href || href === "#") return;

    const target = document.querySelector(href);

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

document.querySelectorAll('a[target="_blank"]').forEach(link => {
  link.setAttribute("rel", "noopener noreferrer");
});
