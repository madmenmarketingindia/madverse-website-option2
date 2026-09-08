// Keep standard YouTube links available when JavaScript is disabled.
document.querySelectorAll('.video-lp-work [data-film-id]').forEach((link) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', link.getAttribute('aria-label'));
  button.append(...Array.from(link.childNodes));
  button.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.title = link.dataset.filmTitle;
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(link.dataset.filmId)}?autoplay=1`;
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    button.replaceWith(frame);
    frame.focus();
  });
  link.replaceWith(button);
});
