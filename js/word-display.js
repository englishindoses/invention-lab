// Keep each plaque's dimensions fixed; size the text to its available space.
Lab.fitWord = display => {
  if (!display.clientWidth || !display.clientHeight) return;
  display.style.removeProperty('font-size');
  const maximum = parseFloat(getComputedStyle(display).fontSize);
  const fits = () => display.scrollWidth <= display.clientWidth
    && display.scrollHeight <= display.clientHeight;
  if (fits()) return;
  let lower = 1;
  let upper = maximum;
  while (upper - lower > 0.25) {
    const middle = (lower + upper) / 2;
    display.style.fontSize = `${middle}px`;
    if (fits()) lower = middle;
    else upper = middle;
  }
  display.style.fontSize = `${Math.floor(lower * 4) / 4}px`;
};
(() => {
  const displays = [...document.querySelectorAll('.word-display')];
  let pendingFrame;
  const scheduleFit = () => {
    cancelAnimationFrame(pendingFrame);
    pendingFrame = requestAnimationFrame(() => displays.forEach(Lab.fitWord));
  };
  const resizeObserver = new ResizeObserver(scheduleFit);
  const textObserver = new MutationObserver(scheduleFit);
  displays.forEach(display => {
    resizeObserver.observe(display.parentElement);
    textObserver.observe(display, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  });
  new MutationObserver(scheduleFit).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  document.fonts.ready.then(scheduleFit);
  scheduleFit();
})();
