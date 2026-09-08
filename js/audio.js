/**
 * audio.js — Web Audio API sound synthesizer.
 * No external files. Generates all sounds procedurally.
 * Because real rebels don't need mp3s.
 */

const AudioManager = (() => {
  'use strict';

  let ctx = null;
  let muted = false;

  function getContext() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  function setMuted(value) {
    muted = value;
  }

  function isMuted() {
    return muted;
  }

  /**
   * Play a tone with optional frequency sweep.
   */
  function playTone(freq, duration, type = 'sine', volume = 0.15, freqEnd = null) {
    if (muted) return;
    try {
      const ac = getContext();
      const osc = ac.createOscillator();
      const gain = ac.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ac.currentTime);
      if (freqEnd) {
        osc.frequency.exponentialRampToValueAtTime(freqEnd, ac.currentTime + duration);
      }

      gain.gain.setValueAtTime(volume, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);

      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + duration);
    } catch (e) {
      // Silent fail — audio isn't critical
    }
  }

  /**
   * Play noise burst (for click/tap sounds).
   */
  function playNoise(duration, volume = 0.08) {
    if (muted) return;
    try {
      const ac = getContext();
      const bufferSize = ac.sampleRate * duration;
      const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
      }

      const source = ac.createBufferSource();
      const gain = ac.createGain();
      source.buffer = buffer;
      gain.gain.setValueAtTime(volume, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);

      source.connect(gain);
      gain.connect(ac.destination);
      source.start();
    } catch (e) { /* silent */ }
  }

  // === Sound Effects ===

  function cellClick() {
    playTone(600, 0.08, 'sine', 0.12);
    playTone(900, 0.06, 'sine', 0.06);
  }

  function invalidMove() {
    playTone(200, 0.15, 'square', 0.1);
    setTimeout(() => playTone(150, 0.15, 'square', 0.08), 100);
  }

  function winSound() {
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.25, 'sine', 0.12), i * 120);
    });
  }

  function drawSound() {
    playTone(440, 0.3, 'triangle', 0.1);
    setTimeout(() => playTone(350, 0.4, 'triangle', 0.08), 200);
  }

  function buttonClick() {
    playNoise(0.04, 0.06);
    playTone(800, 0.05, 'sine', 0.08);
  }

  return {
    setMuted, isMuted,
    cellClick, invalidMove, winSound, drawSound, buttonClick,
  };
})();
