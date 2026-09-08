/**
 * game-logic.js — Pure Tic-Tac-Toe engine
 * No DOM, no UI, no side effects. Just cold, hard logic.
 */

const GameLogic = (() => {
  'use strict';

  const EMPTY = '';
  const X = 'X';
  const O = 'O';

  // All possible winning lines (indices into flat 3x3 board)
  const WIN_LINES = [
    [0, 1, 2], // rows
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6], // cols
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8], // diagonals
    [2, 4, 6],
  ];

  /**
   * Create a fresh board — 9 empty cells.
   * @returns {string[]}
   */
  function createBoard() {
    return Array(9).fill(EMPTY);
  }

  /**
   * Deep clone a board state.
   * @param {string[]} board
   * @returns {string[]}
   */
  function cloneBoard(board) {
    return [...board];
  }

  /**
   * Check if a cell is playable.
   * @param {string[]} board
   * @param {number} index
   * @returns {boolean}
   */
  function isValidMove(board, index) {
    return index >= 0 && index < 9 && board[index] === EMPTY;
  }

  /**
   * Make a move. Returns a NEW board (immutable style).
   * @param {string[]} board
   * @param {number} index
   * @param {string} player — 'X' or 'O'
   * @returns {string[]} new board state
   */
  function makeMove(board, index, player) {
    if (!isValidMove(board, index)) return null;
    const newBoard = cloneBoard(board);
    newBoard[index] = player;
    return newBoard;
  }

  /**
   * Check for a winner. Returns { winner, line } or null.
   * @param {string[]} board
   * @returns {{ winner: string, line: number[] } | null}
   */
  function checkWinner(board) {
    for (const line of WIN_LINES) {
      const [a, b, c] = line;
      if (board[a] !== EMPTY && board[a] === board[b] && board[b] === board[c]) {
        return { winner: board[a], line };
      }
    }
    return null;
  }

  /**
   * Is the board full?
   * @param {string[]} board
   * @returns {boolean}
   */
  function isBoardFull(board) {
    return board.every(cell => cell !== EMPTY);
  }

  /**
   * Is the game over? Returns status object.
   * @param {string[]} board
   * @returns {{ over: boolean, winner: string|null, line: number[]|null, isDraw: boolean }}
   */
  function getGameStatus(board) {
    const result = checkWinner(board);
    if (result) {
      return { over: true, winner: result.winner, line: result.line, isDraw: false };
    }
    if (isBoardFull(board)) {
      return { over: true, winner: null, line: null, isDraw: true };
    }
    return { over: false, winner: null, line: null, isDraw: false };
  }

  /**
   * Get all available (empty) cell indices.
   * @param {string[]} board
   * @returns {number[]}
   */
  function getAvailableMoves(board) {
    return board.reduce((moves, cell, i) => {
      if (cell === EMPTY) moves.push(i);
      return moves;
    }, []);
  }

  /**
   * Switch player.
   * @param {string} player
   * @returns {string}
   */
  function opponent(player) {
    return player === X ? O : X;
  }

  return {
    EMPTY, X, O, WIN_LINES,
    createBoard, cloneBoard, isValidMove, makeMove,
    checkWinner, isBoardFull, getGameStatus, getAvailableMoves, opponent,
  };
})();
