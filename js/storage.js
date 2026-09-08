/**
 * storage.js — localStorage persistence layer.
 * Saves scores, settings, preferences.
 */

const Storage = (() => {
  'use strict';

  const STORAGE_KEY = 'tictactoe_state';

  const DEFAULTS = {
    scores: { X: 0, O: 0, draws: 0 },
    gameMode: 'ai',       // 'ai' | 'pvp'
    difficulty: 'medium',  // 'easy' | 'medium' | 'impossible'
    playerSymbol: 'X',     // human plays as X or O
    soundEnabled: true,
    theme: 'dark',         // 'dark' | 'light'
  };

  /**
   * Load saved state, merged with defaults for any missing keys.
   * @returns {object}
   */
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULTS, scores: { ...DEFAULTS.scores } };
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULTS,
        ...parsed,
        scores: { ...DEFAULTS.scores, ...(parsed.scores || {}) },
      };
    } catch (e) {
      return { ...DEFAULTS, scores: { ...DEFAULTS.scores } };
    }
  }

  /**
   * Save state to localStorage.
   * @param {object} state
   */
  function save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Storage full or unavailable — not critical
    }
  }

  /**
   * Update a specific key in the saved state.
   * @param {string} key
   * @param {*} value
   */
  function update(key, value) {
    const state = load();
    state[key] = value;
    save(state);
  }

  /**
   * Reset scores only.
   */
  function resetScores() {
    update('scores', { ...DEFAULTS.scores });
  }

  /**
   * Nuke everything.
   */
  function clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* whatever */ }
  }

  return { load, save, update, resetScores, clear, DEFAULTS };
})();
