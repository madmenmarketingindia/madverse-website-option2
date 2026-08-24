(() => {
  const filters = [...document.querySelectorAll('[data-think-filter]')];
  const cards = [...document.querySelectorAll('[data-think-category]')];

  if (!filters.length || !cards.length) return;

  cards.forEach((card) => {
    if (card.querySelector('.think-card__link')) return;

    const title = card.querySelector('h3');
    const link = document.createElement('a');
    link.className = 'think-card__link';
    link.href = 'article.html';
    link.setAttribute('aria-label', `Read article: ${title ? title.textContent.trim() : 'perspective'}`);
    card.insertBefore(link, card.firstChild);
  });

  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      const category = filter.dataset.thinkFilter;

      filters.forEach((item) => {
        const selected = item === filter;
        item.classList.toggle('is-active', selected);
        item.setAttribute('aria-pressed', String(selected));
      });

      cards.forEach((card) => {
        card.hidden = category !== 'all' && card.dataset.thinkCategory !== category;
      });
    });
  });
})();
