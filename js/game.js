Lab.newProfile = function (name) {
  return { id: crypto.randomUUID(), name, createdAt: new Date().toISOString(), coins: Lab.config.startingCoins,
    theme: 'cartoon', sound: true, stats: { created: 0, sold: 0, earned: 0, pulls: 0, spent: 0, bigSales: 0 },
    inventions: [], achievements: {}, round: { words: ['', ''], name: '' } };
};
Lab.ready = p => p.round.words.every(Boolean) && Boolean(p.round.name.trim());
Lab.pull = function (p, slot, random = Math.random) {
  if (![0, 1].includes(slot) || p.coins < Lab.config.leverCost) return false;
  const candidates = Lab.words[slot].filter(word => word !== p.round.words[slot]);
  p.round.words[slot] = candidates[Math.floor(random() * candidates.length)];
  p.coins -= Lab.config.leverCost;
  p.stats.pulls++;
  p.stats.spent += Lab.config.leverCost;
  return true;
};
Lab.newCustomerWallet = () => ({ coins: Lab.config.customerStartingCoins, limit: Lab.config.customerStartingCoins });
Lab.sell = function (p, price, customerWallet) {
  if (!Lab.ready(p) || !Lab.config.salePrices.includes(price)) return false;
  if (customerWallet && (!Number.isFinite(customerWallet.coins) || customerWallet.coins < price)) return false;
  const invention = { id: crypto.randomUUID(), name: p.round.name.trim(), word1: p.round.words[0], word2: p.round.words[1], sold: price > 0, salePrice: price, createdAt: new Date().toISOString() };
  p.inventions.unshift(invention);
  if (customerWallet) customerWallet.coins -= price;
  p.coins += price;
  p.stats.created++;
  if (price > 0) p.stats.sold++;
  if (price >= 50) p.stats.bigSales++;
  p.stats.earned += price;
  p.round = { words: ['', ''], name: '' };
  return invention;
};
Lab.bonus = function (p) {
  if (p.coins !== 0) return false;
  p.coins += Lab.config.bonusCoins;
  return true;
};
