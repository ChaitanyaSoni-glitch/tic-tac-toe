/**
 * ai.js — The brains behind the machine.
 * Easy: random moves.
 * Medium: mix of smart + random.
 * Impossible: minimax — literally unbeatable.
 */

const AI = (() => {
  'use strict';

  const { X, O, EMPTY, getAvailableMoves, makeMove, checkWinner, isBoardFull, opponent } = GameLogic;

  /**
   * Minimax with alpha-beta pruning.
   * Maximizer = AI player, Minimizer = human player.
   *
   * @param {string[]} board
   * @param {string} currentPlayer — whose turn it is right now
   * @param {string} aiPlayer — the AI's symbol
   * @param {number} depth
   * @param {number} alpha
   * @param {number} beta
   * @returns {number} score
   */
  function minimax(board, currentPlayer, aiPlayer, depth, alpha, beta) {
    const result = checkWinner(board);
    if (result) {
      return result.winner === aiPlayer ? (10 - depth) : (depth - 10);
    }
    if (isBoardFull(board)) return 0;

    const isMaximizing = currentPlayer === aiPlayer;
    const moves = getAvailableMoves(board);

    if (isMaximizing) {
      let best = -Infinity;
      for (const move of moves) {
        const newBoard = makeMove(board, move, currentPlayer);
        const score = minimax(newBoard, opponent(currentPlayer), aiPlayer, depth + 1, alpha, beta);
        best = Math.max(best, score);
        alpha = Math.max(alpha, best);
        if (beta <= alpha) break; // prune
      }
      return best;
    } else {
      let best = Infinity;
      for (const move of moves) {
        const newBoard = makeMove(board, move, currentPlayer);
        const score = minimax(newBoard, opponent(currentPlayer), aiPlayer, depth + 1, alpha, beta);
        best = Math.min(best, score);
        beta = Math.min(beta, best);
        if (beta <= alpha) break; // prune
      }
      return best;
    }
  }

  /**
   * Get the best move using minimax.
   * @param {string[]} board
   * @param {string} aiPlayer
   * @returns {number} cell index
   */
  function getBestMove(board, aiPlayer) {
    let bestScore = -Infinity;
    let bestMove = -1;
    const moves = getAvailableMoves(board);

    for (const move of moves) {
      const newBoard = makeMove(board, move, aiPlayer);
      const score = minimax(newBoard, opponent(aiPlayer), aiPlayer, 0, -Infinity, Infinity);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  }

  /**
   * Random move — for easy AI.
   * @param {string[]} board
   * @returns {number}
   */
  function getRandomMove(board) {
    const moves = getAvailableMoves(board);
    return moves[Math.floor(Math.random() * moves.length)];
  }

  /**
   * Medium AI — plays optimal ~60% of the time, random otherwise.
   * Also blocks immediate wins and takes immediate wins always.
   * @param {string[]} board
   * @param {string} aiPlayer
   * @returns {number}
   */
  function getMediumMove(board, aiPlayer) {
    const moves = getAvailableMoves(board);
    const humanPlayer = opponent(aiPlayer);

    // Always take a win if available
    for (const move of moves) {
      const newBoard = makeMove(board, move, aiPlayer);
      if (checkWinner(newBoard)) return move;
    }

    // Always block opponent's win
    for (const move of moves) {
      const newBoard = makeMove(board, move, humanPlayer);
      if (checkWinner(newBoard)) return move;
    }

    // 60% chance of playing optimally, 40% random
    if (Math.random() < 0.6) {
      return getBestMove(board, aiPlayer);
    }
    return getRandomMove(board);
  }

  /**
   * Get AI move based on difficulty.
   * @param {string[]} board
   * @param {string} aiPlayer
   * @param {'easy'|'medium'|'impossible'} difficulty
   * @returns {number}
   */
  function getMove(board, aiPlayer, difficulty) {
    switch (difficulty) {
      case 'easy':
        return getRandomMove(board);
      case 'medium':
        return getMediumMove(board, aiPlayer);
      case 'impossible':
        return getBestMove(board, aiPlayer);
      default:
        return getBestMove(board, aiPlayer);
    }
  }

  return { getMove, getBestMove, getRandomMove, getMediumMove };
})();
