(function () {
  'use strict';
  var root = document.querySelector('.collective-selector');
  if (!root) return;
  var tabs = root.querySelector('#challenge-tabs');
  var buttons = Array.from(tabs.querySelectorAll('button'));
  var panel = root.querySelector('#challenge-panel');
  var teams = root.querySelector('[data-challenge-teams]');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var activeAnimation;
  var challenges = {
    brand: { label: 'Your brand launch collective', title: 'From first idea to first impression.', cta: 'Discuss your brand launch', teams: [
      ['Mad Men Marketing', 'Sets the positioning and launch strategy.', 'mad-men-marketing.html'],
      ['Mad Men Design', 'Builds the identity and visual system.', 'mad-men-design.html'],
      ['Mad Men Advertising', 'Turns the launch idea into a campaign.', 'mad-men-advertising.html']
    ] },
    campaign: { label: 'Your campaign collective', title: 'One idea. Built to move people.', cta: 'Discuss your campaign', teams: [
      ['Mad Men Advertising', 'Shapes the campaign idea and creative direction.', 'mad-men-advertising.html'],
      ['Mad Men Production', 'Brings the idea to life through film and content.', 'mad-men-production.html'],
      ['Mad Men Perform', 'Connects media and optimisation to campaign goals.', 'mad-men-perform.html']
    ] },
    digital: { label: 'Your digital experience collective', title: 'From brand ambition to digital experience.', cta: 'Discuss your digital experience', teams: [
      ['Mad Men Marketing', 'Defines the audience, purpose and business goals.', 'mad-men-marketing.html'],
      ['Mad Men Design', 'Shapes the visual identity and user experience.', 'mad-men-design.html'],
      ['Mad Men Technologies', 'Builds the website, app or digital platform.', 'mad-men-technologies.html']
    ] },
    content: { label: 'Your content growth collective', title: 'A clear voice. More ways to connect.', cta: 'Discuss your content growth', teams: [
      ['Mad Men Hatters', 'Develops the voice, scripts and content writing.', 'mad-men-hatters.html'],
      ['Mad Men Production', 'Creates film and content for modern screens.', 'mad-men-production.html'],
      ['Mad ENAiBLe', 'Expands creative possibilities with AI-assisted assets.', 'mad-enaible.html']
    ] }
  };
  function select(button, animate) {
    var data = challenges[button.dataset.challenge];
    buttons.forEach(function (item) {
      var selected = item === button;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', button.id);
    root.querySelector('[data-challenge-label]').textContent = data.label;
    root.querySelector('[data-challenge-title]').textContent = data.title;
    root.querySelector('[data-challenge-cta]').textContent = data.cta;
    var fragment = document.createDocumentFragment();
    data.teams.forEach(function (team, index) {
      var li = document.createElement('li');
      var link = document.createElement('a');
      link.href = team[2];
      var number = document.createElement('span');
      number.className = 'collective-selector__number';
      number.setAttribute('aria-hidden', 'true');
      number.textContent = '0' + (index + 1);
      var body = document.createElement('span');
      var name = document.createElement('strong');
      name.textContent = team[0];
      var description = document.createElement('span');
      description.textContent = team[1];
      body.append(name, description);
      var arrow = document.createElement('span');
      arrow.className = 'collective-selector__arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↗';
      link.append(number, body, arrow);
      li.append(link);
      fragment.append(li);
    });
    teams.replaceChildren(fragment);
    if (activeAnimation) activeAnimation.cancel();
    if (animate && !reduced.matches && teams.animate) {
      activeAnimation = teams.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 250, easing: 'ease-out' });
    }
  }
  tabs.setAttribute('role', 'tablist');
  panel.setAttribute('role', 'tabpanel');
  panel.tabIndex = 0;
  buttons.forEach(function (button, index) {
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panel.id);
    button.addEventListener('click', function () { select(button, true); });
    button.addEventListener('keydown', function (event) {
      var next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % buttons.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + buttons.length - 1) % buttons.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else return;
      event.preventDefault();
      buttons[next].focus();
      select(buttons[next], true);
    });
  });
  select(buttons[0], false);
  tabs.hidden = false;
})();
