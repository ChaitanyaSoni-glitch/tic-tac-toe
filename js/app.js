/**
 * app.js — Main application controller.
 * Manages screens, game state, UI updates, and user interaction.
 * The conductor of this whole damn orchestra.
 */

const App = (() => {
  'use strict';

  const { X, O, createBoard, isValidMove, makeMove, getGameStatus, opponent } = GameLogic;

  // ===== State =====
  let state = {
    board: createBoard(),
    currentPlayer: X,
    gameMode: 'ai',       // 'ai' | 'pvp'
    difficulty: 'medium',
    playerSymbol: X,       // human is X or O (AI mode only)
    aiSymbol: O,
    scores: { X: 0, O: 0, draws: 0 },
    gameOver: false,
    soundEnabled: true,
    theme: 'dark',
  };

  // ===== DOM References =====
  let dom = {};

  function cacheDom() {
    dom = {
      // Screens
      homeScreen: document.getElementById('home-screen'),
      gameScreen: document.getElementById('game-screen'),

      // Home
      btnPlayAI: document.getElementById('btn-play-ai'),
      btnPlayPVP: document.getElementById('btn-play-pvp'),
      difficultySelector: document.getElementById('difficulty-selector'),
      difficultyBtns: document.querySelectorAll('.diff-btn'),
      symbolBtns: document.querySelectorAll('.symbol-btn'),
      btnStartGame: document.getElementById('btn-start-game'),

      // Game
      board: document.getElementById('game-board'),
      cells: null, // populated after board render
      turnIndicator: document.getElementById('turn-indicator'),
      scoreX: document.getElementById('score-x'),
      scoreO: document.getElementById('score-o'),
      scoreDraws: document.getElementById('score-draws'),
      btnRestart: document.getElementById('btn-restart'),
      btnNewGame: document.getElementById('btn-new-game'),
      btnBack: document.getElementById('btn-back'),
      gameBadge: document.getElementById('game-badge'),

      // Modal
      modalOverlay: document.getElementById('modal-overlay'),
      modalEmoji: document.getElementById('modal-emoji'),
      modalTitle: document.getElementById('modal-title'),
      modalSubtitle: document.getElementById('modal-subtitle'),
      btnPlayAgain: document.getElementById('btn-play-again'),
      btnModalNewGame: document.getElementById('btn-modal-new-game'),

      // Top bar
      btnToggleSound: document.getElementById('btn-toggle-sound'),
      btnToggleTheme: document.getElementById('btn-toggle-theme'),
      soundIcon: document.getElementById('sound-icon'),
      themeIcon: document.getElementById('theme-icon'),
    };
  }

  // ===== Initialization =====
  function init() {
    cacheDom();
    loadState();
    applyTheme();
    applySoundState();
    bindEvents();
    renderBoard();
    showScreen('home');
    Particles.init();
  }

  function loadState() {
    const saved = Storage.load();
    state.scores = saved.scores;
    state.gameMode = saved.gameMode;
    state.difficulty = saved.difficulty;
    state.playerSymbol = saved.playerSymbol;
    state.aiSymbol = opponent(state.playerSymbol);
    state.soundEnabled = saved.soundEnabled;
    state.theme = saved.theme;

    // Reflect saved selections on home screen
    updateHomeSelections();
  }

  function saveState() {
    Storage.save({
      scores: state.scores,
      gameMode: state.gameMode,
      difficulty: state.difficulty,
      playerSymbol: state.playerSymbol,
      soundEnabled: state.soundEnabled,
      theme: state.theme,
    });
  }

  // ===== Screen Management =====
  function showScreen(screen) {
    dom.homeScreen.classList.remove('active');
    dom.gameScreen.classList.remove('active');

    if (screen === 'home') {
      dom.homeScreen.classList.add('active');
      updateHomeSelections();
    } else if (screen === 'game') {
      dom.gameScreen.classList.add('active');
      updateScoreboard();
      updateTurnIndicator();
      updateGameBadge();
    }
  }

  // ===== Home Screen Logic =====
  function updateHomeSelections() {
    // Game mode buttons
    dom.btnPlayAI?.classList.toggle('btn-primary', state.gameMode === 'ai');
    dom.btnPlayAI?.classList.toggle('btn-secondary', state.gameMode !== 'ai');
    dom.btnPlayPVP?.classList.toggle('btn-primary', state.gameMode === 'pvp');
    dom.btnPlayPVP?.classList.toggle('btn-secondary', state.gameMode !== 'pvp');

    // ARIA pressed states for mode toggle
    dom.btnPlayAI?.setAttribute('aria-pressed', String(state.gameMode === 'ai'));
    dom.btnPlayPVP?.setAttribute('aria-pressed', String(state.gameMode === 'pvp'));

    // Difficulty visibility
    if (dom.difficultySelector) {
      dom.difficultySelector.classList.toggle('visible', state.gameMode === 'ai');
    }

    // Difficulty buttons
    dom.difficultyBtns.forEach(btn => {
      const isSelected = btn.dataset.difficulty === state.difficulty;
      btn.classList.toggle('selected', isSelected);
      btn.setAttribute('aria-checked', String(isSelected));
    });

    // Symbol buttons
    dom.symbolBtns.forEach(btn => {
      const isSelected = btn.dataset.symbol === state.playerSymbol;
      btn.classList.toggle('selected', isSelected);
      btn.setAttribute('aria-checked', String(isSelected));
    });
  }

  function selectMode(mode) {
    state.gameMode = mode;
    updateHomeSelections();
    saveState();
    AudioManager.buttonClick();
  }

  function selectDifficulty(diff) {
    state.difficulty = diff;
    updateHomeSelections();
    saveState();
    AudioManager.buttonClick();
  }

  function selectSymbol(symbol) {
    state.playerSymbol = symbol;
    state.aiSymbol = opponent(symbol);
    updateHomeSelections();
    saveState();
    AudioManager.buttonClick();
  }

  function startGame() {
    AudioManager.buttonClick();
    resetRound();
    showScreen('game');

    // If AI goes first (player chose O, AI is X)
    if (state.gameMode === 'ai' && state.aiSymbol === X) {
      setTimeout(doAIMove, 400);
    }
  }

  // ===== Board Rendering =====
  function renderBoard() {
    if (!dom.board) return;
    dom.board.innerHTML = '';

    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('button');
      cell.className = 'cell';
      cell.dataset.index = i;
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', `Cell ${Math.floor(i / 3) + 1}-${(i % 3) + 1}, empty`);
      cell.setAttribute('tabindex', '0');
      dom.board.appendChild(cell);
    }

    dom.cells = dom.board.querySelectorAll('.cell');
  }

  function updateBoardUI() {
    dom.cells.forEach((cell, i) => {
      const val = state.board[i];
      cell.textContent = val;
      cell.classList.remove('x-cell', 'o-cell', 'occupied', 'winning-cell', 'game-over');

      if (val === X) {
        cell.classList.add('x-cell', 'occupied');
        cell.setAttribute('aria-label', `Cell ${Math.floor(i / 3) + 1}-${(i % 3) + 1}, X`);
      } else if (val === O) {
        cell.classList.add('o-cell', 'occupied');
        cell.setAttribute('aria-label', `Cell ${Math.floor(i / 3) + 1}-${(i % 3) + 1}, O`);
      } else {
        cell.setAttribute('aria-label', `Cell ${Math.floor(i / 3) + 1}-${(i % 3) + 1}, empty`);
      }

      if (state.gameOver) {
        cell.classList.add('game-over');
      }
    });
  }

  // ===== Game Logic =====
  function handleCellClick(index) {
    if (state.gameOver) {
      AudioManager.invalidMove();
      return;
    }

    // In AI mode, only allow human's turn
    if (state.gameMode === 'ai' && state.currentPlayer !== state.playerSymbol) {
      AudioManager.invalidMove();
      return;
    }

    if (!isValidMove(state.board, index)) {
      AudioManager.invalidMove();
      return;
    }

    AudioManager.cellClick();
    placeMove(index);
  }

  function placeMove(index) {
    state.board = makeMove(state.board, index, state.currentPlayer);
    updateBoardUI();

    const status = getGameStatus(state.board);

    if (status.over) {
      endGame(status);
      return;
    }

    // Switch turn
    state.currentPlayer = opponent(state.currentPlayer);
    updateTurnIndicator();

    // AI's turn
    if (state.gameMode === 'ai' && state.currentPlayer === state.aiSymbol) {
      // Small delay for UX — feels more natural
      setTimeout(doAIMove, 350);
    }
  }

  function doAIMove() {
    if (state.gameOver) return;

    const moveIndex = AI.getMove(state.board, state.aiSymbol, state.difficulty);
    if (moveIndex === -1 || moveIndex === undefined) return;

    AudioManager.cellClick();
    placeMove(moveIndex);
  }

  function endGame(status) {
    state.gameOver = true;

    // Highlight winning cells
    if (status.line) {
      status.line.forEach(i => {
        dom.cells[i].classList.add('winning-cell');
      });
    }

    // Mark all cells as game-over
    dom.cells.forEach(cell => cell.classList.add('game-over'));

    // Update scores
    if (status.winner) {
      state.scores[status.winner]++;
      AudioManager.winSound();
    } else {
      state.scores.draws++;
      AudioManager.drawSound();
    }

    updateScoreboard();
    saveState();

    // Show modal after a beat
    setTimeout(() => {
      showGameOverModal(status);
      if (status.winner) {
        Particles.launchConfetti();
      }
    }, 600);
  }

  function resetRound() {
    state.board = createBoard();
    state.currentPlayer = X; // X always starts
    state.gameOver = false;
    closeModal();
    updateBoardUI();
    updateTurnIndicator();
  }

  function newGame() {
    state.scores = { X: 0, O: 0, draws: 0 };
    saveState();
    resetRound();
    updateScoreboard();
  }

  function goBack() {
    AudioManager.buttonClick();
    closeModal();
    showScreen('home');
  }

  // ===== UI Updates =====
  function updateScoreboard() {
    if (dom.scoreX) dom.scoreX.textContent = state.scores.X;
    if (dom.scoreO) dom.scoreO.textContent = state.scores.O;
    if (dom.scoreDraws) dom.scoreDraws.textContent = state.scores.draws;
  }

  function updateTurnIndicator() {
    if (!dom.turnIndicator) return;

    if (state.gameOver) {
      dom.turnIndicator.innerHTML = '';
      return;
    }

    const symbolClass = state.currentPlayer === X ? 'x-turn' : 'o-turn';
    let label = state.currentPlayer;

    if (state.gameMode === 'ai') {
      if (state.currentPlayer === state.playerSymbol) {
        label = `${state.currentPlayer} (YOU)`;
      } else {
        label = `${state.currentPlayer} (AI)`;
      }
    }

    dom.turnIndicator.innerHTML =
      `<span class="turn-symbol ${symbolClass}">${label}</span>'S TURN <span class="turn-dot">●</span>`;
  }

  function updateGameBadge() {
    if (!dom.gameBadge) return;

    if (state.gameMode === 'ai') {
      const diffLabel = state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1);
      dom.gameBadge.textContent = `AI · ${diffLabel}`;
      dom.gameBadge.className = 'badge badge-ai';
    } else {
      dom.gameBadge.textContent = 'PVP';
      dom.gameBadge.className = 'badge badge-pvp';
    }
  }

  // ===== Modal =====
  function showGameOverModal(status) {
    if (!dom.modalOverlay) return;

    if (status.winner) {
      const isX = status.winner === X;
      dom.modalEmoji.textContent = '🏆';
      dom.modalTitle.textContent = `${status.winner} WINS!`;
      dom.modalTitle.className = `modal-title ${isX ? 'x-win' : 'o-win'}`;

      if (state.gameMode === 'ai') {
        dom.modalSubtitle.textContent = status.winner === state.playerSymbol
          ? 'You crushed it!'
          : 'The machine wins this round.';
      } else {
        dom.modalSubtitle.textContent = `Player ${status.winner} takes the round!`;
      }
    } else {
      dom.modalEmoji.textContent = '🤝';
      dom.modalTitle.textContent = 'DRAW!';
      dom.modalTitle.className = 'modal-title draw-result';
      dom.modalSubtitle.textContent = 'A battle of equals.';
    }

    dom.modalOverlay.classList.add('active');

    // Focus the play again button for keyboard users
    setTimeout(() => dom.btnPlayAgain?.focus(), 100);
  }

  function closeModal() {
    if (dom.modalOverlay) {
      dom.modalOverlay.classList.remove('active');
    }
  }

  // ===== Theme =====
  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    saveState();
    AudioManager.buttonClick();
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    Particles.setTheme(state.theme === 'dark');
    if (dom.themeIcon) {
      dom.themeIcon.textContent = state.theme === 'dark' ? '☀️' : '🌙';
    }
  }

  // ===== Sound =====
  function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    applySoundState();
    saveState();
    // Play click AFTER toggling so it only plays if now unmuted
    AudioManager.buttonClick();
  }

  function applySoundState() {
    AudioManager.setMuted(!state.soundEnabled);
    if (dom.soundIcon) {
      dom.soundIcon.textContent = state.soundEnabled ? '🔊' : '🔇';
    }
    if (dom.btnToggleSound) {
      dom.btnToggleSound.setAttribute('aria-label',
        state.soundEnabled ? 'Mute sound' : 'Unmute sound');
    }
  }

  // ===== Event Binding =====
  function bindEvents() {
    // Home screen
    dom.btnPlayAI?.addEventListener('click', () => selectMode('ai'));
    dom.btnPlayPVP?.addEventListener('click', () => selectMode('pvp'));

    dom.difficultyBtns.forEach(btn => {
      btn.addEventListener('click', () => selectDifficulty(btn.dataset.difficulty));
    });

    dom.symbolBtns.forEach(btn => {
      btn.addEventListener('click', () => selectSymbol(btn.dataset.symbol));
    });

    dom.btnStartGame?.addEventListener('click', startGame);

    // Game screen
    dom.board?.addEventListener('click', (e) => {
      const cell = e.target.closest('.cell');
      if (cell) handleCellClick(parseInt(cell.dataset.index, 10));
    });

    dom.btnRestart?.addEventListener('click', () => {
      AudioManager.buttonClick();
      resetRound();
      // If AI goes first
      if (state.gameMode === 'ai' && state.aiSymbol === X) {
        setTimeout(doAIMove, 400);
      }
    });

    dom.btnNewGame?.addEventListener('click', () => {
      AudioManager.buttonClick();
      newGame();
      if (state.gameMode === 'ai' && state.aiSymbol === X) {
        setTimeout(doAIMove, 400);
      }
    });

    dom.btnBack?.addEventListener('click', goBack);

    // Modal
    dom.btnPlayAgain?.addEventListener('click', () => {
      AudioManager.buttonClick();
      resetRound();
      if (state.gameMode === 'ai' && state.aiSymbol === X) {
        setTimeout(doAIMove, 400);
      }
    });

    dom.btnModalNewGame?.addEventListener('click', () => {
      AudioManager.buttonClick();
      newGame();
      if (state.gameMode === 'ai' && state.aiSymbol === X) {
        setTimeout(doAIMove, 400);
      }
    });

    // Top bar
    dom.btnToggleSound?.addEventListener('click', toggleSound);
    dom.btnToggleTheme?.addEventListener('click', toggleTheme);

    // Keyboard navigation for board
    dom.board?.addEventListener('keydown', (e) => {
      const cell = e.target.closest('.cell');
      if (!cell) return;

      const index = parseInt(cell.dataset.index, 10);
      let target = -1;

      switch (e.key) {
        case 'ArrowRight': target = index % 3 < 2 ? index + 1 : index; break;
        case 'ArrowLeft': target = index % 3 > 0 ? index - 1 : index; break;
        case 'ArrowDown': target = index < 6 ? index + 3 : index; break;
        case 'ArrowUp': target = index > 2 ? index - 3 : index; break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleCellClick(index);
          return;
        default: return;
      }

      e.preventDefault();
      if (target !== -1 && dom.cells[target]) {
        dom.cells[target].focus();
      }
    });

    // Close modal on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dom.modalOverlay?.classList.contains('active')) {
        closeModal();
      }
    });

    // Close modal on backdrop click
    dom.modalOverlay?.addEventListener('click', (e) => {
      if (e.target === dom.modalOverlay) {
        closeModal();
      }
    });
  }

  return { init };
})();

// Boot up when DOM is ready
document.addEventListener('DOMContentLoaded', App.init);
