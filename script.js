/* ==========================================================================
   Bean Boutique — script.js
   Theme module · Navigation module · Animation module · Form module · Footer
   ========================================================================== */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     Theme module
  ------------------------------------------------------------------ */
  var ThemeModule = (function () {
    var STORAGE_KEY = "beanboutique-theme";
    var toggleBtn = document.getElementById("themeToggle");
    var root = document.documentElement;

    function getTheme() {
      return root.getAttribute("data-theme") || "light";
    }

    function applyTheme(theme) {
      root.setAttribute("data-theme", theme);
      if (toggleBtn) {
        toggleBtn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      }
      try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* storage unavailable */ }
    }

    function toggle() {
      applyTheme(getTheme() === "dark" ? "light" : "dark");
    }

    function init() {
      // Sync toggle UI with whatever the inline bootstrap script already set.
      applyTheme(getTheme());
      if (toggleBtn) toggleBtn.addEventListener("click", toggle);
    }

    return { init: init };
  })();

  /* ------------------------------------------------------------------
     Navigation module
  ------------------------------------------------------------------ */
  var NavModule = (function () {
    var hamburger = document.getElementById("hamburger");
    var mobileMenu = document.getElementById("mobileMenu");
    var nav = document.getElementById("siteNav");

    function closeMenu() {
      mobileMenu.classList.remove("is-open");
      hamburger.setAttribute("aria-expanded", "false");
      hamburger.setAttribute("aria-label", "Open menu");
    }

    function openMenu() {
      mobileMenu.classList.add("is-open");
      hamburger.setAttribute("aria-expanded", "true");
      hamburger.setAttribute("aria-label", "Close menu");
      var firstLink = mobileMenu.querySelector("a");
      if (firstLink) firstLink.focus();
    }

    function trapFocus(e) {
      if (!mobileMenu.classList.contains("is-open")) return;
      var focusable = mobileMenu.querySelectorAll("a");
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
      if (e.key === "Escape") {
        closeMenu();
        hamburger.focus();
      }
    }

    function init() {
      if (!hamburger || !mobileMenu) return;

      hamburger.addEventListener("click", function () {
        var isOpen = mobileMenu.classList.contains("is-open");
        if (isOpen) closeMenu(); else openMenu();
      });

      mobileMenu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", closeMenu);
      });

      document.addEventListener("keydown", trapFocus);

      document.addEventListener("click", function (e) {
        if (
          mobileMenu.classList.contains("is-open") &&
          !mobileMenu.contains(e.target) &&
          !hamburger.contains(e.target)
        ) {
          closeMenu();
        }
      });

      // Smooth scroll with sticky-nav offset (progressive enhancement over CSS scroll-padding-top).
      document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener("click", function (e) {
          var id = link.getAttribute("href").slice(1);
          var target = document.getElementById(id);
          if (!target) return;
          e.preventDefault();
          var navHeight = nav ? nav.offsetHeight : 0;
          var top = target.getBoundingClientRect().top + window.pageYOffset - navHeight + 1;
          window.scrollTo({ top: top, behavior: prefersReducedMotion ? "auto" : "smooth" });
          history.pushState(null, "", "#" + id);
        });
      });
    }

    return { init: init };
  })();

  /* ------------------------------------------------------------------
     Animation module — scroll reveal + floating decorations
  ------------------------------------------------------------------ */
  var AnimationModule = (function () {
    function initScrollReveal() {
      var targets = document.querySelectorAll(".fade-in");
      if (!("IntersectionObserver" in window) || prefersReducedMotion) {
        targets.forEach(function (el) { el.classList.add("is-visible"); });
        return;
      }
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );
      targets.forEach(function (el) { observer.observe(el); });
    }

    function initFloatingDecor() {
      var container = document.getElementById("floatDecor");
      if (!container || prefersReducedMotion) return;

      var beanPath = "M12 2c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9zm0 2v14";
      var leafPath = "M4 20c8-1 14-7 15-16-9 1-15 7-15 16z";
      var shapes = [beanPath, leafPath];
      var count = window.innerWidth < 700 ? 4 : 7;

      for (var i = 0; i < count; i++) {
        var svgNS = "http://www.w3.org/2000/svg";
        var svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("width", 14 + Math.random() * 14);
        svg.setAttribute("height", 14 + Math.random() * 14);
        svg.classList.add("float-item");

        var path = document.createElementNS(svgNS, "path");
        path.setAttribute("d", shapes[i % shapes.length]);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "currentColor");
        path.setAttribute("stroke-width", "1.4");
        svg.appendChild(path);

        svg.style.left = Math.random() * 92 + "%";
        svg.style.top = Math.random() * 88 + "%";
        svg.style.animationDuration = 9 + Math.random() * 10 + "s";
        svg.style.animationDelay = Math.random() * 4 + "s";

        container.appendChild(svg);
      }
    }

    function init() {
      initScrollReveal();
      initFloatingDecor();
    }

    return { init: init };
  })();

  /* ------------------------------------------------------------------
     Form module — contact form + newsletter, client-side validation
  ------------------------------------------------------------------ */
  var FormModule = (function () {
    function showError(input, message) {
      var describedBy = input.getAttribute("aria-describedby");
      var el = describedBy ? document.getElementById(describedBy) : null;
      if (el) el.textContent = message;
      input.setAttribute("aria-invalid", message ? "true" : "false");
    }

    function validateContactForm(form) {
      var valid = true;
      var name = form.querySelector("#cf-name");
      var email = form.querySelector("#cf-email");
      var phone = form.querySelector("#cf-phone");
      var message = form.querySelector("#cf-message");

      if (!name.value.trim()) {
        showError(name, "Please enter your name.");
        valid = false;
      } else {
        showError(name, "");
      }

      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim() || !emailPattern.test(email.value.trim())) {
        showError(email, "Please enter a valid email address.");
        valid = false;
      } else {
        showError(email, "");
      }

      if (phone.value.trim() && !/^[0-9()+\-.\s]{7,}$/.test(phone.value.trim())) {
        showError(phone, "Please enter a valid phone number.");
        valid = false;
      } else {
        showError(phone, "");
      }

      if (!message.value.trim()) {
        showError(message, "Please enter a message.");
        valid = false;
      } else {
        showError(message, "");
      }

      return valid;
    }

    function initContactForm() {
      var form = document.getElementById("contactForm");
      var status = document.getElementById("formStatus");
      if (!form) return;

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (validateContactForm(form)) {
          status.textContent = "Thanks — your message has been sent. We'll reply within one business day.";
          form.reset();
          form.querySelectorAll('[aria-invalid="true"]').forEach(function (el) {
            el.setAttribute("aria-invalid", "false");
          });
        } else {
          status.textContent = "Please fix the highlighted fields and try again.";
        }
      });
    }

    function initNewsletterForm() {
      var form = document.getElementById("newsletterForm");
      var status = document.getElementById("newsletterStatus");
      if (!form) return;

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = form.querySelector("#nf-email");
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email.value.trim() && emailPattern.test(email.value.trim())) {
          status.textContent = "You're subscribed. Look out for roast notes soon.";
          form.reset();
        } else {
          status.textContent = "Please enter a valid email address.";
        }
      });
    }

    function init() {
      initContactForm();
      initNewsletterForm();
    }

    return { init: init };
  })();

  /* ------------------------------------------------------------------
     Footer module
  ------------------------------------------------------------------ */
  var FooterModule = (function () {
    function init() {
      var yearEl = document.getElementById("year");
      if (yearEl) yearEl.textContent = new Date().getFullYear();
    }
    return { init: init };
  })();

  /* ------------------------------------------------------------------
     Boot
  ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    ThemeModule.init();
    NavModule.init();
    AnimationModule.init();
    FormModule.init();
    FooterModule.init();
  });
})();