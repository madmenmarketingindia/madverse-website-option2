/* Accessible mobile navigation. No assumptions about section count/order. */
(function () {
  "use strict";

  var header = document.querySelector("[data-site-header]");
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-site-nav]");

  if (!header || !toggle || !nav) return;

  var desktopQuery = window.matchMedia("(min-width: 1024px)");
  var lastFocused = null;
  var focusableSelector = [
    "a[href]", "button:not([disabled])", "input:not([disabled])",
    "select:not([disabled])", "textarea:not([disabled])", "[tabindex]:not([tabindex='-1'])"
  ].join(",");

  function setOpen(open, restoreFocus) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    nav.setAttribute("aria-hidden", String(!open));
    nav.classList.toggle("is-open", open);
    header.classList.toggle("is-menu-open", open);
    document.body.classList.toggle("has-open-nav", open);
    nav.inert = !open && !desktopQuery.matches;

    if (open) {
      lastFocused = document.activeElement;
      var firstTarget = nav.querySelector(focusableSelector);
      if (firstTarget) firstTarget.focus();
    } else if (restoreFocus && lastFocused) {
      lastFocused.focus();
    }
  }

  function handleKeydown(event) {
    if (toggle.getAttribute("aria-expanded") !== "true") return;

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false, true);
      return;
    }

    if (event.key !== "Tab") return;

    var items = Array.prototype.slice.call(header.querySelectorAll(focusableSelector))
      .filter(function (item) { return !item.closest("[inert]"); });
    if (!items.length) return;

    var first = items[0];
    var last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true", true);
  });

  nav.addEventListener("click", function (event) {
    if (event.target.closest("a") && !desktopQuery.matches) setOpen(false, false);
  });

  document.addEventListener("keydown", handleKeydown);

  desktopQuery.addEventListener("change", function () {
    setOpen(false, false);
    nav.inert = false;
    nav.setAttribute("aria-hidden", String(!desktopQuery.matches));
  });

  function updateScrolledState() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  window.addEventListener("scroll", updateScrolledState, { passive: true });
  nav.inert = !desktopQuery.matches;
  nav.setAttribute("aria-hidden", String(!desktopQuery.matches));
  updateScrolledState();
})();
