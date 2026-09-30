Lab.themes = { cartoon: { name: 'Cartoon Lab', subtitle: 'A little strange. A lot of brilliant.', symbol: '⚙' }, future: { name: 'Future Lab', subtitle: 'Big ideas. Beyond this galaxy.', symbol: '⌘' }, magic: { name: 'Magic Machine', subtitle: 'Where the impossible comes to life.', symbol: '✧' } };
Lab.applyTheme = theme => {
  document.documentElement.dataset.theme = theme;
  [0, 1].forEach(index => {
    const control = document.querySelector(`#lever-${index}`);
    const side = index === 0 ? 'left' : 'right';
    control?.setAttribute('aria-label', theme === 'magic'
      ? `Stir ${side} cauldron, 1 coin`
      : `Pull ${side} lever, 1 coin`);
  });
};
