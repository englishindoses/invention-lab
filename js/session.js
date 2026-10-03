// Lesson access, current screen, and customer budget last for this browser tab.
// Passwords are never included. Leave Lab explicitly clears the lesson.
Lab.session = (() => {
  const key = 'invention-lab-session-v1';
  const views = ['lab', 'shop', 'collection', 'achievements', 'stats'];
  return {
    load(profiles) {
      try {
        const saved = JSON.parse(sessionStorage.getItem(key));
        const limit = saved?.customerLimit ?? Lab.config.customerStartingCoins;
        if (!Number.isSafeInteger(limit) || limit < 0 || limit > 999999) return null;
        if (!saved || saved.version !== 1 || !profiles.some(p => p.id === saved.profileId && p.access) ||
          !Number.isSafeInteger(saved.customerCoins) || saved.customerCoins < 0 || saved.customerCoins > limit ||
          !views.includes(saved.view)) return null;
        return { ...saved, customerLimit: limit };
      } catch { return null; }
    },
    save(profileId, customerCoins, view, customerLimit = Lab.config.customerStartingCoins) {
      try {
        sessionStorage.setItem(key, JSON.stringify({ version: 1, profileId, customerCoins, customerLimit, view: views.includes(view) ? view : 'lab' }));
        return true;
      } catch { return false; }
    },
    clear() {
      try { sessionStorage.removeItem(key); } catch { /* Unavailable storage cannot hold a session. */ }
    }
  };
})();
