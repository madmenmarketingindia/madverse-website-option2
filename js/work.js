(function () {
  "use strict";

  var filters = document.querySelector("[data-work-filters]");
  if (!filters) return;

  var buttons = Array.prototype.slice.call(filters.querySelectorAll("[data-work-filter]"));
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-work-card]"));
  var status = document.querySelector("[data-work-filter-status]");
  var loadMore = document.querySelector("[data-work-load-more]");
  var grid = document.querySelector("[data-work-grid]");
  var pageSize = 6;

  // Assign each project to one bucket so multi-category cards appear only once.
  var categories = buttons.map(function (button) {
    return button.dataset.workFilter;
  }).filter(function (category) { return category !== "all"; });
  var buckets = categories.map(function () { return []; });
  var uncategorised = [];
  cards.forEach(function (card) {
    var tags = (card.dataset.workCategory || "").split(/\s+/);
    var bucketIndex = categories.findIndex(function (category) {
      return tags.indexOf(category) !== -1;
    });
    if (bucketIndex === -1) uncategorised.push(card);
    else buckets[bucketIndex].push(card);
  });
  var mixedCards = [];
  var longestBucket = buckets.reduce(function (longest, bucket) {
    return Math.max(longest, bucket.length);
  }, 0);
  for (var round = 0; round < longestBucket; round += 1) {
    buckets.forEach(function (bucket) {
      if (bucket[round]) mixedCards.push(bucket[round]);
    });
  }
  mixedCards = mixedCards.concat(uncategorised);
  var allPageSize = Math.max(pageSize, buckets.filter(function (bucket) {
    return bucket.length > 0;
  }).length);

  cards.forEach(function (card) {
    if (card.querySelector(".work-project__link")) return;

    var title = card.querySelector("h3");
    var link = document.createElement("a");
    link.className = "work-project__link";
    link.href = "case-study.html";
    link.setAttribute("aria-label", "View case study: " + (title ? title.textContent.trim() : "project"));
    card.insertBefore(link, card.firstChild);
  });
  var isExpanded = false;

  function applyFilter(filter) {
    var orderedCards = filter === "all" ? mixedCards : cards;
    var matchingCards = orderedCards.filter(function (card) {
      var categories = (card.dataset.workCategory || "").split(/\s+/);
      return filter === "all" || categories.indexOf(filter) !== -1;
    });
    var visibleLimit = isExpanded ? matchingCards.length : (filter === "all" ? allPageSize : pageSize);
    var visibleCount = Math.min(visibleLimit, matchingCards.length);

    cards.forEach(function (card) {
      var matchIndex = matchingCards.indexOf(card);
      var isVisible = matchIndex !== -1 && matchIndex < visibleLimit;
      card.hidden = !isVisible;
    });
    // Reorder the actual elements so visual, keyboard and reading order agree.
    if (grid) {
      orderedCards.forEach(function (card) { grid.appendChild(card); });
    }

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
