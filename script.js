
/* =====================================================
   MANAVTACLASS JAVASCRIPT
   Safe initialization for all website pages
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

  /* ============================================
     MOBILE MENU
  ============================================ */

  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      const isOpen = mobileMenu.classList.toggle("open");

      menuToggle.textContent = isOpen ? "×" : "☰";
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
      );
    });

    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileMenu.classList.remove("open");
        menuToggle.textContent = "☰";
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
      });
    });
  }


  /* ============================================
     FAQ ACCORDION
     Only one FAQ opens at a time
  ============================================ */

  const faqButtons = document.querySelectorAll(".faq-question");

  faqButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const item = button.closest(".faq-item");

      if (!item) return;

      const answer = item.querySelector(".faq-answer");

      if (!answer) return;

      const isOpen = button.getAttribute("aria-expanded") === "true";

      // Close every FAQ first
      document.querySelectorAll(".faq-item").forEach(function (faqItem) {
        faqItem.classList.remove("active");

        const faqButton = faqItem.querySelector(".faq-question");
        const faqAnswer = faqItem.querySelector(".faq-answer");

        if (faqButton) {
          faqButton.setAttribute("aria-expanded", "false");

          const icon = faqButton.querySelector("span");
          if (icon) icon.textContent = "+";
        }

        if (faqAnswer) {
          faqAnswer.style.display = "none";
        }
      });

      // Open the clicked FAQ only if it was closed
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
    const observer = new IntersectionObserver(
      function (entries, observerInstance) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observerInstance.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealElements.forEach(function (element) {
      observer.observe(element);
    });
  } else {
    revealElements.forEach(function (element) {
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

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (event) {
      const href = anchor.getAttribute("href");

      if (!href || href === "#") return;

      // Resolve the target by ID without using an unsafe selector.
      let targetId;

      try {
        targetId = decodeURIComponent(href.slice(1));
      } catch (error) {
        return;
      }

      const target = document.getElementById(targetId);

      if (target) {
        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });


  /* ============================================
     EXTERNAL LINKS SECURITY
  ============================================ */

  document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
    link.setAttribute("rel", "noopener noreferrer");
  });

});
