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
  var storageKey = "madverse.work.browsing.v1";
  var savedState = null;
  var restoringScroll = false;

  try {
    savedState = JSON.parse(window.sessionStorage.getItem(storageKey));
  } catch (error) {
    // Private browsing or unavailable storage must not break project filters.
  }
  if (!savedState || !buttons.some(function (button) {
    return button.dataset.workFilter === savedState.filter;
  }) || !Number.isFinite(savedState.additionalVisible) || savedState.additionalVisible < 0 ||
      !Number.isFinite(savedState.scrollY) || savedState.scrollY < 0) {
    savedState = null;
  }

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
  var additionalVisible = savedState
    ? Math.min(Math.floor(savedState.additionalVisible / pageSize) * pageSize, cards.length)
    : 0;

  function saveState() {
    if (restoringScroll) return;
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify({
        filter: filters.dataset.activeFilter || "all",
        additionalVisible: additionalVisible,
        scrollY: window.scrollY
      }));
    } catch (error) {
      // Browsing remains functional even if saving is blocked.
    }
  }

  function syncButtons(filter) {
    buttons.forEach(function (button) {
      var selected = button.dataset.workFilter === filter;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function applyFilter(filter) {
    var orderedCards = filter === "all" ? mixedCards : cards;
    var matchingCards = orderedCards.filter(function (card) {
      var categories = (card.dataset.workCategory || "").split(/\s+/);
      return filter === "all" || categories.indexOf(filter) !== -1;
    });
    var visibleLimit = (filter === "all" ? allPageSize : pageSize) + additionalVisible;
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

    restoringScroll = false;
    syncButtons(selected.dataset.workFilter);
    filters.dataset.activeFilter = selected.dataset.workFilter;
    additionalVisible = 0;
    applyFilter(selected.dataset.workFilter);
    saveState();
    filters.dispatchEvent(new CustomEvent("workfilterchange", {
      bubbles: true,
      detail: { filter: selected.dataset.workFilter }
    }));
  });

  if (loadMore) {
    loadMore.addEventListener("click", function () {
      restoringScroll = false;
      additionalVisible += pageSize;
      applyFilter(filters.dataset.activeFilter || "all");
      saveState();
    });
  }

  filters.dataset.activeFilter = savedState ? savedState.filter : "all";
  syncButtons(filters.dataset.activeFilter);
  applyFilter(filters.dataset.activeFilter);

  // Rebuild the visible list before restoring scroll. Explicit anchor links win.
  restoringScroll = !!savedState && !window.location.hash;
  function restoreScroll() {
    if (!restoringScroll) return;
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        if (!restoringScroll) return;
        var root = document.documentElement;
        var previousBehavior = root.style.scrollBehavior;
        root.style.scrollBehavior = "auto";
        window.scrollTo({ top: savedState.scrollY, left: 0, behavior: "instant" });
        root.style.scrollBehavior = previousBehavior;
        restoringScroll = false;
      });
    });
  }
  window.addEventListener("pageshow", function (event) {
    // A back/forward-cache return already preserves the live DOM and position.
    if (event.persisted) { restoringScroll = false; return; }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(restoreScroll, restoreScroll);
    } else restoreScroll();
  });
  // Never pull the visitor back after they have started interacting.
  ["wheel", "touchstart", "pointerdown", "keydown"].forEach(function (type) {
    window.addEventListener(type, function () { restoringScroll = false; }, { passive: true });
  });
  window.addEventListener("pagehide", saveState);
  if (grid) grid.addEventListener("click", saveState);
})();
