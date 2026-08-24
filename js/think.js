(() => {
  const filters = [...document.querySelectorAll('[data-think-filter]')];
  const cards = [...document.querySelectorAll('[data-think-category]')];

  if (!filters.length || !cards.length) return;

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
