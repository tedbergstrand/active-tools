// Shared AudioContext singleton — avoids creating multiple contexts
// across useMetronome, useSpeech, useTimer, and ToolSessionRunner.
let ctx = null;

export function getAudioContext() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Resume if suspended (happens after tab backgrounding or before user gesture)
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}
