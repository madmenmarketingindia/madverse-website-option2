(function () {
  "use strict";

  var filters = document.querySelector("[data-work-filters]");
  if (!filters) return;

  var buttons = Array.prototype.slice.call(filters.querySelectorAll("[data-work-filter]"));
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-work-card]"));
  var status = document.querySelector("[data-work-filter-status]");
  var loadMore = document.querySelector("[data-work-load-more]");
  var pageSize = 6;
  var isExpanded = false;

  function applyFilter(filter) {
    var matchingCards = cards.filter(function (card) {
      var categories = (card.dataset.workCategory || "").split(/\s+/);
      return filter === "all" || categories.indexOf(filter) !== -1;
    });
    var visibleLimit = isExpanded ? matchingCards.length : pageSize;
    var visibleCount = Math.min(visibleLimit, matchingCards.length);

    cards.forEach(function (card) {
      var matchIndex = matchingCards.indexOf(card);
      var isVisible = matchIndex !== -1 && matchIndex < visibleLimit;
      card.hidden = !isVisible;
    });

    if (status) {
      var selectedButton = buttons.find(function (button) {
        return button.dataset.workFilter === filter;
      });
      var label = selectedButton ? selectedButton.textContent.trim() : "work";
      status.textContent = filter === "all"
        ? "Showing " + visibleCount + " of " + matchingCards.length + " projects"
        : "Showing " + visibleCount + " of " + matchingCards.length + " " +
          label.toLowerCase() + " project" + (matchingCards.length === 1 ? "" : "s");
    }

    if (loadMore) {
      loadMore.hidden = visibleCount >= matchingCards.length;
    }
  }

  filters.addEventListener("click", function (event) {
    var selected = event.target.closest("[data-work-filter]");
    if (!selected || !filters.contains(selected)) return;

    buttons.forEach(function (button) {
      var isSelected = button === selected;
      button.classList.toggle("is-active", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });

    filters.dataset.activeFilter = selected.dataset.workFilter;
    isExpanded = false;
    applyFilter(selected.dataset.workFilter);
    filters.dispatchEvent(new CustomEvent("workfilterchange", {
      bubbles: true,
      detail: { filter: selected.dataset.workFilter }
    }));
  });

  if (loadMore) {
    loadMore.addEventListener("click", function () {
      isExpanded = true;
      applyFilter(filters.dataset.activeFilter || "all");
    });
  }

  filters.dataset.activeFilter = "all";
  applyFilter("all");
})();
