/* Opt landing-page content into the existing shared motion controller.
   Load before main.js; no separate observer or animation library is needed. */
(function () {
  "use strict";
  var main = document.querySelector("main");
  if (!main) return;
  main.setAttribute("data-landing-motion", "");

  var selector = [
    "header", "article", "figure", "details", "dl > div", "ol > li",
    '[class*="__grid"] > *', '[class*="__links"] > *', '[class*="__list"] > *',
    '[class*="__head"]', '[class*="__copy"]', '[class*="__intro"]',
    '[class*="__note"]', '[class*="__close"]'
  ].join(",");

  main.querySelectorAll("section").forEach(function (section) {
    var siblingCounts = new Map();
    section.querySelectorAll(selector).forEach(function (target) {
      // Never animate a nested element twice or wrap existing CTA reveals.
      if (target.closest('[data-motion="reveal"], .reveal') ||
          target.querySelector('[data-motion="reveal"], .reveal') ||
          target.closest("details") !== (target.matches("details") ? target : null)) return;
      var index = siblingCounts.get(target.parentElement) || 0;
      siblingCounts.set(target.parentElement, index + 1);
      target.setAttribute("data-motion", "reveal");
      target.setAttribute("data-motion-once", "true");
      target.setAttribute("data-motion-variant", target.matches("figure") ? "fade" : "up");
      target.style.setProperty("--motion-delay", Math.min(index, 3) * 60 + "ms");
    });
  });
})();
