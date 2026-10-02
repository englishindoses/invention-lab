(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const loaded = Lab.storage.load();
  const data = loaded.data || { version: 1, active: null, profiles: [] };
  let admitted = false;
  let accessBusy = false;
  let currentView = 'home';
  const rolling = [false, false];
  let settling = false;
  let customerWallet = Lab.newCustomerWallet();
  const savedSession = Lab.session.load(data.profiles);
  if (savedSession) {
    data.active = savedSession.profileId;
    admitted = true;
    currentView = savedSession.view;
    customerWallet.coins = savedSession.customerCoins;
  }
  const profile = () => data.profiles.find(p => p.id === data.active);
  const busy = () => rolling.some(Boolean) || settling;
  const format = number => number.toLocaleString();
  function warn(message) {
    $('#storage-warning').hidden = false;
    $('#storage-warning').textContent = message;
    $('#save-status').textContent = 'NOT SAVED · EXPORT A BACKUP';
  }
  function persist() {
    if (!Lab.storage.save(data)) {
      warn('Changes could not be saved, or another tab changed this lab. Keep this tab open and export a backup from Statistics. Use one tab at a time.');
    } else {
      $('#save-status').textContent = 'SAVED ON THIS BROWSER';
      $('#storage-warning').hidden = true;
    }
    saveSession();
  }
  function saveSession() {
    if (admitted && !Lab.session.save(data.active, customerWallet.coins, currentView)) {
      $('#storage-warning').hidden = false;
      $('#storage-warning').textContent = 'This browser cannot remember your lesson session. Refreshing may require you to access the lab again.';
    }
  }
  function toast(message, badge = false) {
    const item = document.createElement('div');
    item.className = `toast${badge ? ' badge-toast' : ''}`;
    item.textContent = message;
    $('#notifications').append(item);
    setTimeout(() => item.remove(), badge ? 5000 : 3500);
  }
  function checkAchievements() {
    const inventorId = profile().id;
    const badges = Lab.unlock(profile());
    badges.forEach((badge, index) => setTimeout(() => {
      if (!admitted || profile()?.id !== inventorId) return;
      toast(`${badge.icon} Achievement unlocked: ${badge.name}`, true);
      Lab.audio('badge', profile().sound);
    }, 500 + index * 700));
  }
  function renderControls() {
    const p = profile();
    if (!p) return;
    $('#balance').textContent = format(p.coins);
    $('#customer-balance').textContent = format(customerWallet.coins);
    $('#customer-wallet-note').textContent = customerWallet.coins === 0 ? 'Budget spent for this lesson' : 'Left to spend this lesson';
    for (let slot = 0; slot < 2; slot++) {
      const display = $(`#word-${slot}`);
      if (!rolling[slot]) display.textContent = p.round.words[slot] || '?';
      display.classList.toggle('empty', !p.round.words[slot] && !rolling[slot]);
      $(`#lever-${slot}`).disabled = !admitted || rolling[slot] || settling || p.coins < Lab.config.leverCost;
    }
    $('#invention-name').disabled = settling;
    if ($('#invention-name').value !== p.round.name) $('#invention-name').value = p.round.name;
    $$('[data-price]').forEach(button => {
      const affordable = Number(button.dataset.price) <= customerWallet.coins;
      button.disabled = !admitted || busy() || !Lab.ready(p) || !affordable;
      button.title = affordable ? '' : 'Not enough customer coins this lesson';
    });
    $('#bonus').hidden = p.coins !== 0;
    $('#bonus').disabled = busy();
    $('#leave-lab').disabled = busy();
  }
  function renderPreferences() {
    const p = profile();
    if (!admitted || !p) { Lab.applyTheme('cartoon'); return; }
    $('#inventor-name').textContent = p.name;
    $('#theme').value = p.theme;
    Lab.applyTheme(p.theme);
    $('#machine-symbol').textContent = Lab.themes[p.theme].symbol;
    $('#sound').textContent = p.sound ? '♫ Sound on' : '♫ Sound off';
    $('#sound').setAttribute('aria-pressed', String(p.sound));
  }
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function renderCollection() {
    const target = $('#collection');
    const filter = $('#collection-filter').value;
    const inventions = profile().inventions.filter(i => filter === 'all' || (filter === 'sold' ? i.sold : !i.sold));
    target.replaceChildren();
    if (!inventions.length) {
      const empty = element('div', 'empty-state');
      empty.append(element('span', 'empty-icon', '✳'), element('h2', '', 'No inventions yet.'));
      const button = element('button', 'primary', 'Enter the Lab ↗');
      button.addEventListener('click', () => navigate('lab'));
      empty.append(button);
      target.append(empty);
    }
    for (const invention of inventions) {
      const card = element('article', 'invention-card');
      const art = element('div', 'card-art', '✳');
      const meta = element('div', 'card-meta');
      meta.append(element('span', `sale-tag${invention.sold ? ' sold' : ''}`, invention.sold ? `Sold · ${invention.salePrice} coins` : 'Not sold · 0 coins'), element('time', '', new Date(invention.createdAt).toLocaleDateString()));
      card.append(art, element('h2', '', invention.name), element('p', 'word-pair', `${invention.word1} + ${invention.word2}`), meta);
      target.append(card);
    }
  }
  function renderAchievements() {
    const p = profile();
    $('#badge-count').textContent = `${Lab.achievements.filter(b => p.achievements[b.id]).length} / ${Lab.achievements.length} UNLOCKED`;
    $('#achievements').replaceChildren(...Lab.achievements.map(badge => {
      const unlocked = Boolean(p.achievements[badge.id]);
      const card = element('article', `badge-card${unlocked ? ' unlocked' : ''}`);
      const progress = element('progress');
      progress.max = badge.target;
      progress.value = Math.min(p.stats[badge.stat], badge.target);
      progress.setAttribute('aria-label', `${badge.name} progress`);
      card.append(element('span', 'badge-symbol', badge.icon), element('h2', '', badge.name), element('p', '', badge.description), progress, element('small', '', unlocked ? '✓ Unlocked' : `Locked · ${progress.value} / ${badge.target}`));
      return card;
    }));
  }
  function renderStats() {
    const p = profile();
    const stats = [['Inventions Created', p.stats.created, 'Every idea counts.'], ['Inventions Sold', p.stats.sold, 'Ideas that sealed the deal.'], ['Coins Earned', p.stats.earned, 'From invention sales only.'], ['Lever Pulls', p.stats.pulls, 'A new possibility with every pull.'], ['Coins Spent', p.stats.spent, 'Invested in your imagination.'], ['Current Balance', p.coins, 'Ready for your next experiment.']];
    $('#statistics').replaceChildren(...stats.map(([name, value, note]) => {
      const card = element('article', 'stat-card');
      card.append(element('div', 'eyebrow', name), element('strong', '', format(value)));
      return card;
    }));
  }
  function renderView() {
    if (currentView === 'collection') renderCollection();
    if (currentView === 'achievements') renderAchievements();
    if (currentView === 'stats') renderStats();
  }
  function navigate(view) {
    if (!['home', 'lab', 'shop', 'collection', 'achievements', 'stats'].includes(view)) view = 'home';
    if (!admitted) view = 'home';
    currentView = view;
    saveSession();
    document.body.dataset.view = view;
    $('#lab-nav').hidden = !admitted;
    $('#member-tools').hidden = !admitted;
    $('#welcome-label').hidden = admitted;
    $$('.view').forEach(section => { section.hidden = section.id !== `view-${view}`; });
    $$('nav [data-view]').forEach(button => {
      button.classList.toggle('active', button.dataset.view === view);
      if (button.dataset.view === view) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    renderView();
    window.scrollTo(0, 0);
    document.dispatchEvent(new CustomEvent('lab:viewchange', { detail: { view, inventorName: admitted ? profile().name : null, profileId: admitted ? profile().id : null } }));
  }
  $$('[data-view]').forEach(button => button.addEventListener('click', () => navigate(button.dataset.view)));
  $('.brand').addEventListener('click', event => { event.preventDefault(); navigate(admitted ? 'lab' : 'home'); });
  for (let slot = 0; slot < 2; slot++) {
    $(`#lever-${slot}`).addEventListener('click', () => {
      if (!admitted || rolling[slot] || settling || !Lab.pull(profile(), slot)) return;
      rolling[slot] = true;
      checkAchievements();
      persist();
      renderControls();
      renderView();
      const lever = $(`#lever-${slot}`);
      lever.classList.add('pulling');
      $('#machine').classList.add('working');
      Lab.audio('pull', profile().sound);
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const cycle = reduced ? null : setInterval(() => {
        $(`#word-${slot}`).textContent = Lab.words[slot][Math.floor(Math.random() * Lab.words[slot].length)];
      }, 85);
      setTimeout(() => {
        clearInterval(cycle);
        rolling[slot] = false;
        lever.classList.remove('pulling');
        if (!rolling.some(Boolean)) $('#machine').classList.remove('working');
        Lab.audio('reveal', profile().sound);
        renderControls();
      }, reduced ? 100 : 700);
    });
  }
  $('#invention-name').addEventListener('input', event => {
    if (!admitted) return;
    profile().round.name = event.target.value;
    persist();
    renderControls();
  });
  function celebrate(price) {
    $('#machine').classList.add(price ? 'celebrating' : 'unsold');
    $('.wallet').classList.add('bump');
    if (!price || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (let index = 0; index < (price === 50 ? 45 : 16); index++) {
      const particle = element('span', 'particle', '✦');
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 0.45}s`;
      $('#particles').append(particle);
      setTimeout(() => particle.remove(), 2500);
    }
  }
  $$('[data-price]').forEach(button => button.addEventListener('click', () => {
    if (!admitted || busy()) return;
    const price = Number(button.dataset.price);
    const invention = Lab.sell(profile(), price, customerWallet);
    if (!invention) return;
    settling = true;
    checkAchievements();
    persist();
    renderControls();
    renderView();
    toast(price ? `Sold! ${invention.name} · +${price} coins` : `${invention.name} added to your collection.`);
    Lab.audio(price === 50 ? 'jackpot' : price ? 'sale' : 'unsold', profile().sound);
    celebrate(price);
    setTimeout(() => {
      settling = false;
      $('#machine').classList.remove('celebrating', 'unsold');
      $('.wallet').classList.remove('bump');
      renderControls();
    }, 1100);
  }));
  $('#bonus').addEventListener('click', () => {
    if (!admitted || busy() || !Lab.bonus(profile())) return;
    persist();
    renderControls();
    Lab.audio('bonus', profile().sound);
    toast('A fresh spark! +10 coins.');
  });
  $('#theme').addEventListener('change', event => { if (!admitted) return; profile().theme = event.target.value; persist(); renderPreferences(); renderControls(); });
  $('#sound').addEventListener('click', () => { if (!admitted) return; profile().sound = !profile().sound; persist(); renderPreferences(); renderControls(); Lab.audio('reveal', profile().sound); });
  $('#settings').addEventListener('click', () => { if (admitted) $('#settings-dialog').showModal(); });
  $('#close-settings').addEventListener('click', () => $('#settings-dialog').close());
  $('#leave-lab').addEventListener('click', () => {
    if (busy()) return;
    admitted = false;
    Lab.session.clear();
    $('#settings-dialog').close();
    $('#notifications').replaceChildren();
    $('#access-form').reset();
    $('#register-form').reset();
    $('#register-status').textContent = '';
    setAccessStatus('idle', 'AWAITING INVENTOR');
    renderPreferences();
    renderControls();
    navigate('home');
    $('#access-name').focus();
  });
  function setAccessStatus(state, text) {
    $('#access-status').dataset.state = state;
    $('#access-status').textContent = text;
  }
  function lockAccessForms(locked) {
    accessBusy = locked;
    $$('#register-form input, #register-form button, #access-form input, #access-form button').forEach(control => { control.disabled = locked; });
  }
  $('#register-form').addEventListener('submit', async event => {
    event.preventDefault();
    if (accessBusy) return;
    const name = $('#register-name').value;
    const password = $('#register-password').value;
    lockAccessForms(true);
    const status = $('#register-status');
    status.textContent = 'Registering…';
    status.dataset.state = 'pending';
    try {
      const inventor = await Lab.access.register(data, name, password);
      persist();
      status.textContent = 'Registered! Your lab is ready.';
      status.dataset.state = 'granted';
      $('#access-name').value = inventor.name;
      $('#access-password').value = '';
      $('#register-password').value = '';
      setAccessStatus('idle', 'AWAITING INVENTOR');
    } catch (error) {
      status.textContent = error.message || 'Registration could not be completed. Please try again.';
      status.dataset.state = 'denied';
    } finally { lockAccessForms(false); }
    if (status.dataset.state === 'granted') $('#access-password').focus();
  });
  $('#access-form').addEventListener('submit', async event => {
    event.preventDefault();
    if (accessBusy) return;
    const name = $('#access-name').value;
    const password = $('#access-password').value;
    lockAccessForms(true);
    setAccessStatus('pending', 'CHECKING…');
    try {
      const inventor = await Lab.access.match(data, name, password);
      if (!inventor) {
        setAccessStatus('denied', 'ACCESS DENIED');
        $('#access-password').value = '';
        Lab.audio('unsold', true);
        return;
      }
      setAccessStatus('granted', 'ACCESS GRANTED');
      Lab.audio('sale', inventor.sound);
      await new Promise(resolve => setTimeout(resolve, 900));
      data.active = inventor.id;
      customerWallet = Lab.newCustomerWallet();
      admitted = true;
      persist();
      $('#access-password').value = '';
      $('#collection-filter').value = 'all';
      renderPreferences();
      renderControls();
      navigate('lab');
    } catch (error) { setAccessStatus('denied', 'ACCESS UNAVAILABLE'); }
    finally { lockAccessForms(false); }
  });
  $('#collection-filter').addEventListener('change', renderCollection);
  $('#export').addEventListener('click', () => {
    if (!admitted) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `invention-lab-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  window.addEventListener('storage', event => {
    if (event.key === Lab.storage.key || event.key === null) warn('This lab changed in another tab. Export any unsaved work, then reload to use the latest save. Use one tab at a time.');
  });
  $('#how-to-play').addEventListener('click', () => $('#help-dialog').showModal());
  renderPreferences();
  renderControls();
  navigate(currentView);
  if (loaded.error) warn(loaded.error);
  else persist();
  document.body.dataset.ready = 'true';
})();
