// Lesson access, current screen, and customer budget last for this browser tab.
// Passwords are never included. Leave Lab explicitly clears the lesson.
Lab.session = (() => {
  const key = 'invention-lab-session-v1';
  const views = ['lab', 'shop', 'collection', 'achievements', 'stats'];
  return {
    load(profiles) {
      try {
        const saved = JSON.parse(sessionStorage.getItem(key));
        if (!saved || saved.version !== 1 || !profiles.some(p => p.id === saved.profileId && p.access) ||
          !Number.isSafeInteger(saved.customerCoins) || saved.customerCoins < 0 || saved.customerCoins > Lab.config.customerStartingCoins ||
          !views.includes(saved.view)) return null;
        return saved;
      } catch { return null; }
    },
    save(profileId, customerCoins, view) {
      try {
        sessionStorage.setItem(key, JSON.stringify({ version: 1, profileId, customerCoins, view: views.includes(view) ? view : 'lab' }));
        return true;
      } catch { return false; }
    },
    clear() {
      try { sessionStorage.removeItem(key); } catch { /* Unavailable storage cannot hold a session. */ }
    }
  };
})();
