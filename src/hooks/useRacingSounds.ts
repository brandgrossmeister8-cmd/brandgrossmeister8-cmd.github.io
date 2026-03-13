// Racing sound effects using Web Audio API - no external dependencies needed
const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

function playEngineRev(duration = 2.5) {
  if (!audioCtx) return;
  audioCtx.resume();

  const now = audioCtx.currentTime;

  // Main engine oscillator — sawtooth for that raw growl
  const osc1 = audioCtx.createOscillator();
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(60, now);
  osc1.frequency.exponentialRampToValueAtTime(180, now + duration * 0.6);
  osc1.frequency.exponentialRampToValueAtTime(220, now + duration * 0.85);
  osc1.frequency.exponentialRampToValueAtTime(80, now + duration);

  // Sub-bass for rumble
  const osc2 = audioCtx.createOscillator();
  osc2.type = 'sawtooth';
  osc2.frequency.setValueAtTime(30, now);
  osc2.frequency.exponentialRampToValueAtTime(90, now + duration * 0.6);
  osc2.frequency.exponentialRampToValueAtTime(110, now + duration * 0.85);
  osc2.frequency.exponentialRampToValueAtTime(40, now + duration);

  // Higher harmonic for "scream"
  const osc3 = audioCtx.createOscillator();
  osc3.type = 'square';
  osc3.frequency.setValueAtTime(120, now);
  osc3.frequency.exponentialRampToValueAtTime(360, now + duration * 0.6);
  osc3.frequency.exponentialRampToValueAtTime(440, now + duration * 0.85);
  osc3.frequency.exponentialRampToValueAtTime(160, now + duration);

  // Distortion for grit
  const distortion = audioCtx.createWaveShaper();
  const samples = 256;
  const curve = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = (Math.PI + 200) * x / (Math.PI + 200 * Math.abs(x));
  }
  distortion.curve = curve;
  distortion.oversample = '4x';

  // Gain envelope
  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.15, now + 0.1);
  gainNode.gain.linearRampToValueAtTime(0.25, now + duration * 0.5);
  gainNode.gain.linearRampToValueAtTime(0.3, now + duration * 0.8);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

  // Low-pass filter to shape tone
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(400, now);
  filter.frequency.exponentialRampToValueAtTime(1200, now + duration * 0.7);
  filter.frequency.exponentialRampToValueAtTime(300, now + duration);
  filter.Q.value = 3;

  // Noise for exhaust texture
  const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * duration, audioCtx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseData.length; i++) {
    noiseData[i] = Math.random() * 2 - 1;
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = noiseBuffer;

  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0, now);
  noiseGain.gain.linearRampToValueAtTime(0.04, now + 0.2);
  noiseGain.gain.linearRampToValueAtTime(0.08, now + duration * 0.7);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

  const noiseFilter = audioCtx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 800;
  noiseFilter.Q.value = 1;

  // Connect: oscillators → distortion → filter → gain → destination
  osc1.connect(distortion);
  osc2.connect(distortion);
  osc3.connect(distortion);
  distortion.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audioCtx.destination);

  osc1.start(now);
  osc2.start(now);
  osc3.start(now);
  noise.start(now);

  osc1.stop(now + duration);
  osc2.stop(now + duration);
  osc3.stop(now + duration);
  noise.stop(now + duration);
}

function playCountdownBeep(high = false) {
  if (!audioCtx) return;
  audioCtx.resume();

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = high ? 880 : 440;

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.15);
}

function playFinishFanfare() {
  if (!audioCtx) return;
  audioCtx.resume();

  const now = audioCtx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;

    const gain = audioCtx.createGain();
    const t = now + i * 0.15;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  });
}

export const racingSounds = {
  engineRev: playEngineRev,
  countdownBeep: playCountdownBeep,
  finishFanfare: playFinishFanfare,
};
