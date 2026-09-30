Lab.achievements = [
  { id: 'first', name: 'First Sale', description: 'Sell your first invention.', icon: '✦', stat: 'sold', target: 1 },
  { id: 'inventor', name: 'Inventor', description: 'Create 5 inventions.', icon: '⚒', stat: 'created', target: 5 },
  { id: 'super', name: 'Super Inventor', description: 'Create 20 inventions.', icon: '✹', stat: 'created', target: 20 },
  { id: 'seller', name: 'Salesperson', description: 'Sell 5 inventions.', icon: '◆', stat: 'sold', target: 5 },
  { id: 'master', name: 'Master Salesperson', description: 'Sell 20 inventions.', icon: '♛', stat: 'sold', target: 20 },
  { id: 'big', name: 'Big Sale', description: 'Sell an invention for 50 coins.', icon: '★', stat: 'bigSales', target: 1 },
  { id: 'collector', name: 'Coin Collector', description: 'Earn 100 coins from sales.', icon: '◉', stat: 'earned', target: 100 },
  { id: 'empire', name: 'Invention Empire', description: 'Earn 500 coins from sales.', icon: '♜', stat: 'earned', target: 500 },
  { id: 'experimenter', name: 'Experimenter', description: 'Pull the levers 25 times.', icon: '⚡', stat: 'pulls', target: 25 },
  { id: 'wild', name: 'Wild Inventor', description: 'Pull the levers 100 times.', icon: '✺', stat: 'pulls', target: 100 }
];
Lab.unlock = function (profile) {
  const unlocked = [];
  for (const badge of Lab.achievements) {
    if (!profile.achievements[badge.id] && profile.stats[badge.stat] >= badge.target) {
      profile.achievements[badge.id] = new Date().toISOString();
      unlocked.push(badge);
    }
  }
  return unlocked;
};
