Lab.audio = (() => {
  let context;
  return function (kind, enabled) {
    if (!enabled) return;
    try {
      context = context || new (window.AudioContext || window.webkitAudioContext)();
      context.resume().catch(() => {});
      const notes = { pull: [130, 180, 240], reveal: [520, 660], sale: [523, 659, 784], jackpot: [523, 659, 784, 1047, 1319], unsold: [220, 165], badge: [784, 988, 1175], bonus: [440, 660] }[kind] || [440];
      notes.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const start = context.currentTime + index * 0.09;
        oscillator.type = kind === 'pull' ? 'triangle' : 'sine';
        oscillator.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.08, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.17);
      });
    } catch (error) { /* Audio is optional; gameplay remains available. */ }
  };
})();
