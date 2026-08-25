(() => {
  const filters = [...document.querySelectorAll('[data-think-filter]')];
  const cards = [...document.querySelectorAll('[data-think-category]')];
  const moreWrap = document.querySelector('[data-think-more-wrap]');
  const moreButton = document.querySelector('[data-think-more]');
  const initialCardLimit = 5;
  let allCardsVisible = false;

  if (!filters.length || !cards.length) return;

  cards.forEach((card) => {
    if (card.querySelector('.think-card__link')) return;

    const title = card.querySelector('h3');
    const link = document.createElement('a');
    link.className = 'think-card__link';
    link.href = card.dataset.articleHref || 'article.html';
    link.setAttribute('aria-label', `Read article: ${title ? title.textContent.trim() : 'perspective'}`);
    card.insertBefore(link, card.firstChild);
  });

  const updateCards = (category = 'all') => {
    const isAll = category === 'all';

    cards.forEach((card, index) => {
      const matchesCategory = isAll || card.dataset.thinkCategory === category;
      const withinPreview = allCardsVisible || index < initialCardLimit;
      card.hidden = !matchesCategory || (isAll && !withinPreview);

      if (!card.hidden) card.classList.add('is-visible');
    });

    if (moreWrap && moreButton) {
      const hasMore = isAll && !allCardsVisible && cards.length > initialCardLimit;
      moreWrap.hidden = !hasMore;
      moreButton.setAttribute('aria-expanded', String(allCardsVisible));
    }
  };

  if (moreButton) {
    moreButton.addEventListener('click', () => {
      allCardsVisible = true;
      updateCards('all');
    });
  }

  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      const category = filter.dataset.thinkFilter;

      filters.forEach((item) => {
        const selected = item === filter;
        item.classList.toggle('is-active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });

      updateCards(category);
    });
  });

  updateCards();
})();
