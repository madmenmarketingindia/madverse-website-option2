(() => {
  const links = [...document.querySelectorAll('.article-body__rail nav a')];
  const sections = links
    .map((link) => document.querySelector(link.hash))
    .filter(Boolean);

  if (!links.length || !sections.length) return;

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.hash);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', link.hash);
    });
  });

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    links.forEach((link) => {
      const active = link.hash === `#${visible.target.id}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-18% 0px -62% 0px', threshold: [0, .2, .5] });

  sections.forEach((section) => observer.observe(section));
})();
