# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A browser-based sports scoreboard application designed to be projected on a wall via a beamer. No frameworks, no build tools, no backend — pure HTML/CSS/JavaScript served as static files.

## Running the App

Open `index.html` directly in a browser, or serve via any static file server. No build step or package manager is needed.

## Architecture

Three files make up the entire application:

- `index.html` — Main page structure (French language UI)
- `assets/scripts/script.js` — All application logic
- `assets/styles/styles.css` — All styling with responsive breakpoint at 768px

### State Management

A single global `gameState` object holds all data (scores, timer, penalties, team names, period). Every mutation follows the pattern:

```
User Action → Function → gameState update → updateUI() → saveData() (localStorage)
```

State is persisted to localStorage and restored on page load via `loadData()`.

### Key Code Areas in script.js

- **State & persistence**: `gameState` object (top of file), `loadData()`/`saveData()`
- **Game timer loop**: `startTimer()` — runs every 1s, handles period switching and end-of-game
- **Penalty countdown loop**: Separate 1s interval that decrements active penalty timers when game is running
- **UI sync**: `updateUI()` updates all DOM elements from gameState; `updatePenaltiesDisplay()` renders penalty lists
- **Form toggling**: Inline forms (not modals) for penalties and time adjustment, toggled via show/hide functions

### Keyboard Shortcuts

- **Spacebar**: Toggle game timer
- **Arrow Left/Right**: Add goal to team 1/2
- **Escape**: Close all open forms

### External Dependency

Canvas Confetti library loaded from CDN (`canvas-confetti@1.6.0`) for goal/end-of-game celebrations.

## Important Conventions

- All UI text is hardcoded in **French** — maintain French for user-facing strings
- HTML uses inline `onclick` attributes for static elements; dynamic elements use `addEventListener`
- Accessibility: ARIA labels, `.sr-only` class for screen readers, 44px minimum touch targets, focus management
- Penalty tracking uses both `timeLeft` and `originalTime` fields to support proportional adjustment when game time changes
