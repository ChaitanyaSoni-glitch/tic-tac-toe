# 🎮 Tic Tac Toe

A premium, futuristic **Tic-Tac-Toe** browser game with AI opponents, glassmorphism UI, and buttery smooth animations.

> **Challenge your mind. Never miss a move.**

## ✨ Features

- **3 AI Difficulty Levels** — Easy (random), Medium (smart hybrid), Impossible (minimax + alpha-beta pruning — literally unbeatable)
- **Player vs Player** — Local multiplayer
- **Player vs AI** — Choose your symbol (X or O), the AI adapts
- **Dark Futuristic Aesthetic** — Glassmorphism cards, neon glow, particle background
- **Sound Effects** — Procedurally generated via Web Audio API (no audio files)
- **Confetti Burst** — Canvas particle celebration on win
- **Dark/Light Theme Toggle**
- **Persistent State** — Scores, settings, and preferences saved to localStorage
- **Fully Responsive** — Plays beautifully on desktop, tablet, and mobile
- **Keyboard Accessible** — Arrow keys + Enter/Space, ARIA labels, focus states

## 🚀 How to Play

1. Clone the repo or download the files
2. Open `index.html` in any modern browser
3. Pick your mode, symbol, and difficulty
4. Crush it

No build step. No dependencies. No server. Just open and play.

## 🏗 Architecture

| File | Purpose |
|------|---------|
| `index.html` | Main HTML — home screen, game screen, modal |
| `css/styles.css` | Styling — themes, glassmorphism, animations, responsive |
| `js/game-logic.js` | Pure game engine — board state, win detection |
| `js/ai.js` | AI brain — easy, medium, impossible (minimax) |
| `js/audio.js` | Web Audio API sound synthesizer |
| `js/storage.js` | localStorage persistence layer |
| `js/particles.js` | Canvas ambient particles + confetti |
| `js/app.js` | Main controller — screens, events, game flow |

## 🎯 AI: Impossible Mode

The impossible AI uses the **Minimax algorithm with alpha-beta pruning**. It evaluates every possible future game state and always picks the optimal move. It will never lose — the best you can do is draw.

## 📱 Responsive

Tested across breakpoints:
- **Mobile** (360px+) — compact board, touch-friendly buttons
- **Tablet** (480px+) — comfortable layout
- **Desktop** (768px+) — full-size board

## ♿ Accessibility

- Full keyboard navigation (arrow keys to move, Enter/Space to place)
- ARIA roles: `grid`, `gridcell`, `radiogroup`, `dialog`
- `aria-pressed`, `aria-checked`, `aria-label`, `aria-live`
- Visible focus states on every interactive element
- Works with screen readers

## 📄 License

Do whatever you want with it. It's a game. Have fun.