/* ========================================================================== 
   MADVERSE — SHARED MOTION CONTROLLER
   Dependency-free and section-agnostic. New sections opt in through generic
   data attributes; no page structure or section names are encoded here.
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var observer = null;
  var targetSelector = '[data-motion="reveal"], .reveal';
  var groupSelector = "[data-motion-group], .reveal-group";
  var observed = new WeakSet();

  /* Older compact legal/application footers receive the shared Careers link. */
  function ensureFooterCareersLink() {
    document.querySelectorAll(".site-footer__group").forEach(function (group) {
      var heading = group.querySelector(".site-footer__heading");
      var list = group.querySelector(".site-footer__links");
      if (!heading || !list || heading.textContent.trim().toLowerCase() !== "explore") return;
      if (list.querySelector('a[href="careers.html"]')) return;

      var item = document.createElement("li");
      var link = document.createElement("a");
      link.href = "careers.html";
      link.innerHTML = 'Careers <span aria-hidden="true">&nearr;</span>';
      if (/(?:careers|apply)\.html$/i.test(window.location.pathname)) link.setAttribute("aria-current", "page");
      item.appendChild(link);
      list.appendChild(item);
    });
  }

  /* Keep long-form legal pages on the same reveal rhythm as the main site. */
  function enhanceLegalPageMotion() {
    document.querySelectorAll(".legal-content__rail").forEach(function (rail) {
      if (!rail.hasAttribute("data-motion")) rail.setAttribute("data-motion", "reveal");
    });

    document.querySelectorAll(".legal-content__body").forEach(function (body) {
      if (!body.hasAttribute("data-motion-group")) body.setAttribute("data-motion-group", "");
      Array.prototype.forEach.call(body.children, function (section) {
        if (!section.hasAttribute("data-motion")) section.setAttribute("data-motion", "reveal");
      });
    });
  }

  function setStaggerIndexes(scope) {
    scope.querySelectorAll(groupSelector).forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, index) {
        if (!child.matches(targetSelector)) return;
        child.style.setProperty("--motion-index", Math.min(index, 8));
      });
    });
  }

  function show(target) {
    target.classList.add("is-visible");
  }

  function getGroupTargets(group) {
    return Array.prototype.filter.call(group.children, function (child) {
      return child.matches(targetSelector);
    });
  }

  function observe(scope) {
    var targets = Array.prototype.slice.call(scope.querySelectorAll(targetSelector));
    var groups = Array.prototype.slice.call(scope.querySelectorAll(groupSelector));
    if (scope.nodeType === 1 && scope.matches(targetSelector)) {
      targets.unshift(scope);
    }
    if (scope.nodeType === 1 && scope.matches(groupSelector)) {
      groups.unshift(scope);
    }
    setStaggerIndexes(scope);

    /* A grouped sequence is observed as one section-level trigger. */
    targets = targets.filter(function (target) {
      return !target.parentElement || !target.parentElement.matches(groupSelector);
    });

    targets.forEach(function (target) {
      if (observed.has(target)) return;
      observed.add(target);

      if (reducedMotionQuery.matches || !observer) {
        show(target);
        return;
      }

      observer.observe(target);
    });

    groups.forEach(function (group) {
      if (observed.has(group)) return;
      observed.add(group);

      if (reducedMotionQuery.matches || !observer) {
        getGroupTargets(group).forEach(show);
        return;
      }

      observer.observe(group);
    });
  }

  function createObserver() {
    if (!("IntersectionObserver" in window) || reducedMotionQuery.matches) {
      return null;
    }

    return new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var isGroup = entry.target.matches(groupSelector);
        var motionTargets = isGroup ? getGroupTargets(entry.target) : [entry.target];

        if (!entry.isIntersecting) {
          if (entry.target.getAttribute("data-motion-once") === "false") {
            motionTargets.forEach(function (target) {
              target.classList.remove("is-visible");
            });
          }
          return;
        }

        motionTargets.forEach(show);
        if (entry.target.getAttribute("data-motion-once") !== "false") {
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px"
    });
  }

  function revealAll() {
    document.querySelectorAll(targetSelector).forEach(show);
  }

  ensureFooterCareersLink();
  enhanceLegalPageMotion();
  root.classList.add("motion-ready");
  observer = createObserver();
  observe(document);

  function handleMotionPreference(event) {
    if (event.matches) revealAll();
  }

  if (typeof reducedMotionQuery.addEventListener === "function") {
    reducedMotionQuery.addEventListener("change", handleMotionPreference);
  } else {
    reducedMotionQuery.addListener(handleMotionPreference);
  }

  /* Async or framework-rendered sections call refresh(newSection). */
  window.MadverseMotion = Object.freeze({
    refresh: function (scope) {
      observe(scope || document);
    }
  });

  function setupTestimonials() {
    var track = document.querySelector("[data-testimonial-track]");
    var previous = document.querySelector("[data-testimonial-previous]");
    var next = document.querySelector("[data-testimonial-next]");
    if (!track || !previous || !next) return;

    var cards = Array.prototype.slice.call(track.querySelectorAll("[data-testimonial-card]"));
    var activeIndex = 0;
    var isTransitioning = false;
    var autoplayTimer = null;
    var autoplayDelay = 5000;
    var touchStartX = 0;
    var touchStartY = 0;
    if (cards.length < 2) return;

    function stopAutoplay() {
      if (!autoplayTimer) return;
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }

    function startAutoplay() {
      stopAutoplay();
      if (reducedMotionQuery.matches || document.hidden) return;
      autoplayTimer = window.setInterval(function () {
        showCard(activeIndex + 1, 1);
      }, autoplayDelay);
    }

    function syncPreview() {
      var previewIndex = (activeIndex + 1) % cards.length;

      cards.forEach(function (card, index) {
        var isActive = index === activeIndex;
        var isPreview = index === previewIndex;
        card.classList.toggle("is-preview", isPreview);
        card.hidden = !isActive && !isPreview;
        card.setAttribute("aria-hidden", String(!isActive));
      });
    }

    function showCard(index, direction) {
      if (isTransitioning) return;

      var nextIndex = (index + cards.length) % cards.length;
      if (nextIndex === activeIndex) return;

      var currentCard = cards[activeIndex];
      var nextCard = cards[nextIndex];
      var offset = direction > 0 ? 22 : -22;

      cards.forEach(function (card) {
        if (card === nextCard || !card.classList.contains("is-preview")) return;
        card.classList.remove("is-preview");
        card.hidden = true;
      });

      if (reducedMotionQuery.matches || typeof currentCard.animate !== "function") {
        currentCard.hidden = true;
        activeIndex = nextIndex;
        syncPreview();
        return;
      }

      isTransitioning = true;
      previous.disabled = true;
      next.disabled = true;

      var exitAnimation = currentCard.animate([
        { opacity: 1, transform: "translateX(0)" },
        { opacity: 0, transform: "translateX(" + (-offset) + "px)" }
      ], {
        duration: 220,
        easing: "cubic-bezier(.4, 0, 1, 1)",
        fill: "forwards"
      });

      exitAnimation.finished.then(function () {
        currentCard.hidden = true;
        exitAnimation.cancel();
        nextCard.classList.remove("is-preview");
        nextCard.hidden = false;
        nextCard.setAttribute("aria-hidden", "false");

        var enterAnimation = nextCard.animate([
          { opacity: 0, transform: "translateX(" + offset + "px)" },
          { opacity: 1, transform: "translateX(0)" }
        ], {
          duration: 360,
          easing: "cubic-bezier(.16, 1, .3, 1)",
          fill: "both"
        });

        enterAnimation.finished.then(function () {
          enterAnimation.cancel();
          activeIndex = nextIndex;
          syncPreview();
          isTransitioning = false;
          previous.disabled = false;
          next.disabled = false;
        });
      });
    }

    previous.addEventListener("click", function () {
      showCard(activeIndex - 1, -1);
      startAutoplay();
    });

    next.addEventListener("click", function () {
      showCard(activeIndex + 1, 1);
      startAutoplay();
    });

    track.addEventListener("touchstart", function (event) {
      if (!event.touches.length) return;
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
      stopAutoplay();
    }, { passive: true });

    track.addEventListener("touchend", function (event) {
      if (!event.changedTouches.length) return;

      var deltaX = event.changedTouches[0].clientX - touchStartX;
      var deltaY = event.changedTouches[0].clientY - touchStartY;
      var isHorizontalSwipe = Math.abs(deltaX) >= 40 && Math.abs(deltaX) > Math.abs(deltaY);

      if (isHorizontalSwipe) {
        showCard(activeIndex + (deltaX < 0 ? 1 : -1), deltaX < 0 ? 1 : -1);
      }

      startAutoplay();
    }, { passive: true });

    track.addEventListener("touchcancel", startAutoplay, { passive: true });

    track.addEventListener("pointerenter", stopAutoplay);
    track.addEventListener("pointerleave", startAutoplay);
    track.addEventListener("focusin", stopAutoplay);
    track.addEventListener("focusout", startAutoplay);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopAutoplay();
      else startAutoplay();
    });

    syncPreview();
    startAutoplay();
  }

  setupTestimonials();
})();
