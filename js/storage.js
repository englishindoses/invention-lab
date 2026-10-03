Lab.storage = (() => {
  const key = 'invention-lab-v1';
  let lastSaved = null;
  let blocked = false;
  const validProfile = p => p && typeof p.id === 'string' && typeof p.name === 'string' &&
    (!p.access || (typeof p.access.salt === 'string' && typeof p.access.passwordDigest === 'string' && /^[a-f0-9]{64}$/.test(p.access.passwordDigest))) &&
    Number.isSafeInteger(p.coins) && p.coins >= 0 && ['cartoon', 'future', 'magic'].includes(p.theme) && typeof p.sound === 'boolean' &&
    p.stats && ['created', 'sold', 'earned', 'pulls', 'spent', 'bigSales'].every(k => Number.isSafeInteger(p.stats[k]) && p.stats[k] >= 0) &&
    p.round && Array.isArray(p.round.words) && p.round.words.length === 2 && p.round.words.every(w => typeof w === 'string') && typeof p.round.name === 'string' &&
    p.achievements && typeof p.achievements === 'object' && !Array.isArray(p.achievements) && Array.isArray(p.inventions) &&
    p.inventions.every(i => i && ['id', 'name', 'word1', 'word2', 'createdAt'].every(k => typeof i[k] === 'string') && typeof i.sold === 'boolean' && (i.salePrice === 5 || Lab.config.salePrices.includes(i.salePrice)));
  return {
    key,
    load() {
      try {
        lastSaved = localStorage.getItem(key);
        if (!lastSaved) return { data: null };
        const data = JSON.parse(lastSaved);
        if (data.version !== 1 || !Array.isArray(data.profiles) || !data.profiles.every(validProfile) || (data.profiles.length ? !data.profiles.some(p => p.id === data.active) : data.active !== null)) throw new Error('Invalid saved data');
        return { data };
      } catch (error) {
        blocked = true;
        return { data: null, error: 'Your saved data could not be opened. It has not been overwritten. This session is temporary; export a backup before closing.' };
      }
    },
    save(data) {
      if (blocked) return false;
      try {
        if (localStorage.getItem(key) !== lastSaved) {
          blocked = true;
          return false;
        }
        const serialized = JSON.stringify(data);
        localStorage.setItem(key, serialized);
        lastSaved = serialized;
        return true;
      } catch (error) { return false; }
    }
  };
})();
