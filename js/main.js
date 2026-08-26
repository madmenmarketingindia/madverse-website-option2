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

  /* Keep the company profile discoverable in every footer and mobile menu. */
  function ensureCompanyProfileLinks() {
    var isCompanyProfile = /company-profile\.html$/i.test(window.location.pathname);

    document.querySelectorAll(".site-footer__group").forEach(function (group) {
      var heading = group.querySelector(".site-footer__heading");
      var list = group.querySelector(".site-footer__links");
      if (!heading || !list || heading.textContent.trim().toLowerCase() !== "explore") return;
      if (list.querySelector('a[href="company-profile.html"]')) return;

      var item = document.createElement("li");
      var link = document.createElement("a");
      link.href = "company-profile.html";
      link.innerHTML = 'Company Profile <span aria-hidden="true">&nearr;</span>';
      if (isCompanyProfile) link.setAttribute("aria-current", "page");
      item.appendChild(link);

      var careersLink = list.querySelector('a[href="careers.html"]');
      list.insertBefore(item, careersLink ? careersLink.parentElement : null);
    });

    document.querySelectorAll(".site-nav__list").forEach(function (list) {
      if (list.querySelector('a[href="company-profile.html"]')) return;

      var item = document.createElement("li");
      var link = document.createElement("a");
      item.className = "site-nav__company-profile";
      link.className = "site-nav__link";
      link.href = "company-profile.html";
      link.textContent = "Company Profile";
      if (isCompanyProfile) link.setAttribute("aria-current", "page");
      item.appendChild(link);
      list.appendChild(item);
    });
  }

  function ensureFooterSocialLinks() {
    document.querySelectorAll(".site-footer__inner").forEach(function (footer) {
      var brand = footer.querySelector(".site-footer__brand");
      if (!brand) return;

      var identity = footer.querySelector(".site-footer__identity");
      if (!identity) {
        identity = document.createElement("div");
        identity.className = "site-footer__identity";
        footer.insertBefore(identity, brand);
        identity.appendChild(brand);
      }

      if (!identity.querySelector(".site-footer__statement")) {
        var statement = document.createElement("p");
        statement.className = "site-footer__statement";
        statement.textContent = "One connected collective, built to turn ambitious ideas into meaningful growth.";
        identity.appendChild(statement);
      }

      var social = footer.querySelector(".site-footer__social");
      if (social) {
        var oldLabel = social.querySelector(":scope > span");
        if (oldLabel) oldLabel.remove();
        identity.appendChild(social);
        return;
      }

      social = document.createElement("nav");
      social.className = "site-footer__social";
      social.setAttribute("aria-label", "Social media");
      social.innerHTML = [
        '<div>',
        '<a href="https://www.instagram.com/madmenmarketingindia/" target="_blank" rel="noopener noreferrer" aria-label="Mad Men Marketing on Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4.25"></circle><circle cx="17.4" cy="6.7" r="1"></circle></svg></a>',
        '<a href="https://www.facebook.com/madmenmarketingindia" target="_blank" rel="noopener noreferrer" aria-label="Mad Men Marketing on Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 21v-8h2.8l.5-3.2h-3.3V7.7c0-.9.3-1.6 1.7-1.6H18V3.2c-.3 0-1.4-.2-2.6-.2-2.6 0-4.4 1.6-4.4 4.5v2.3H8V13h3v8h3.5z"></path></svg></a>',
        '<a href="https://www.youtube.com/channel/UCEw7wOvcr2RI026demAf-ww/videos" target="_blank" rel="noopener noreferrer" aria-label="Mad Men Marketing on YouTube"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.3 7.1a2.8 2.8 0 0 0-2-2C17.6 4.6 12 4.6 12 4.6s-5.6 0-7.3.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2.2 12a29 29 0 0 0 .5 4.9 2.8 2.8 0 0 0 2 2c1.7.5 7.3.5 7.3.5s5.6 0 7.3-.5a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .5-4.9 29 29 0 0 0-.5-4.9z"></path><path class="site-footer__social-play" d="m10 15.5 5-3.5-5-3.5z"></path></svg></a>',
        '</div>'
      ].join("");
      identity.appendChild(social);
    });
  }

  /* Keep long-form legal pages on the same reveal rhythm as the main site. */
  function enhanceLegalPageMotion() {
    document.querySelectorAll(".legal-content__rail").forEach(function (rail) {
      if (!rail.hasAttribute("data-motion")) rail.setAttribute("data-motion", "reveal");
    });

    document.querySelectorAll(".legal-content__body").forEach(function (body) {
      /* Legal bodies can be taller than the viewport, so observe each section
         independently instead of waiting for a percentage of the full group. */
      body.removeAttribute("data-motion-group");
      body.classList.remove("reveal-group");
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
  ensureCompanyProfileLinks();
  ensureFooterSocialLinks();
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

  // Temporary Collective lineup compatibility for older compact footer markup.
  document.querySelectorAll(".site-footer__links").forEach(function (list) {
    var mecca = Array.from(list.querySelectorAll("a")).find(function (link) {
      return link.textContent.trim().indexOf("Mecca") === 0;
    });
    var madAcad = Array.from(list.querySelectorAll("a")).find(function (link) {
      return link.textContent.trim().indexOf("Mad Acad") === 0;
    });

    if (!mecca || !madAcad) return;

    mecca.childNodes[0].nodeValue = "Mad Men Digital ";
    madAcad.childNodes[0].nodeValue = "Mad Men Hatters ";

    var eniableItem = madAcad.parentElement.cloneNode(true);
    eniableItem.querySelector("a").childNodes[0].nodeValue = "Mad ENAiBLe ";
    madAcad.parentElement.after(eniableItem);
  });

  setupTestimonials();
})();
