(function () {
  "use strict";

  var filterBar = document.querySelector("[data-career-filters]");
  var roleList = document.querySelector("[data-career-list]");
  var emptyState = document.querySelector("[data-career-empty]");
  if (!filterBar || !roleList) return;

  var buttons = Array.prototype.slice.call(filterBar.querySelectorAll("[data-career-filter]"));
  var roles = Array.prototype.slice.call(roleList.querySelectorAll("[data-career-role]"));

  function filterRoles(filter) {
    var visibleCount = 0;

    buttons.forEach(function (button) {
      var active = button.getAttribute("data-career-filter") === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    roles.forEach(function (role) {
      var visible = filter === "all" || role.getAttribute("data-career-role") === filter;
      role.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    if (emptyState) emptyState.hidden = visibleCount !== 0;
  }

  filterBar.addEventListener("click", function (event) {
    var button = event.target.closest("[data-career-filter]");
    if (!button || !filterBar.contains(button)) return;
    filterRoles(button.getAttribute("data-career-filter"));
  });
})();
