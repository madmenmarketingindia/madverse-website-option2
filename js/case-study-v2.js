(function () {
  "use strict";

  var links = Array.prototype.slice.call(document.querySelectorAll('.case-v2-nav a[href^="#"]'));
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var effectSections = Array.prototype.slice.call(document.querySelectorAll(
    ".case-v2-snapshot, .case-overview, .case-challenge, .case-strategy, .case-solution, .case-impact, .case-next"
  ));

  if (!("IntersectionObserver" in window) || reducedMotion) {
    effectSections.forEach(function (section) { section.classList.add("is-section-active"); });
    return;
  }

  var sections = links.map(function (link) {
    return document.querySelector(link.getAttribute("href"));
  }).filter(Boolean);

  function activate(id) {
    links.forEach(function (link) {
      var active = link.getAttribute("href") === "#" + id;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  var observer = new IntersectionObserver(function (entries) {
    var visible = entries.filter(function (entry) { return entry.isIntersecting; })
      .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
    if (visible.length) activate(visible[0].target.id);
  }, { rootMargin: "-22% 0px -62% 0px", threshold: [0, .2, .5] });

  sections.forEach(function (section) { observer.observe(section); });
  if (sections.length) activate(sections[0].id);

  var effectObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-section-active");
      effectObserver.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -14% 0px", threshold: .12 });

  effectSections.forEach(function (section) { effectObserver.observe(section); });
})();
