# Modern Tic Tac Toe

Fast, accessible, and modern Tic Tac Toe with a polished UI, multiple game modes, difficulty levels, a strategic 3-piece variant, undo, and score persistence.

Live demo: https://kothurudhansukh.github.io/modern-tictactoe/
## Features

- Clean, modern UI with Light/Dark themes (persisted via localStorage)
- Modes: Player vs Computer (PvC) and local Player vs Player (PvP)
- AI difficulty: Easy, Medium, Hard (Hard uses minimax with alpha–beta pruning)
- Variants:
	- Classic: standard 3×3 Tic Tac Toe
	- 3 Pieces: each side may have only 3 marks; placing a 4th removes your oldest mark
- Removal Hint toggle: in 3-piece mode, highlights which X and O marks would be removed (for both players) when a new piece is placed
- Undo last move (PvC will undo AI + player to return the turn correctly)
- Rules modal, status line, win highlighting, and scoreboard (X, O, Ties)
- Score and settings persistence (mode, difficulty, variant, hint, theme)
- Keyboard-friendly and accessible (focus rings, Enter/Space to play)

## How to Play

1. Select Mode (PvC or PvP)
2. Choose Difficulty (PvC only): Easy, Medium, or Hard
3. Select Variant: Classic or 3 Pieces
4. Click any cell to place your mark. Get 3 in a row to win. Ties are recorded in Classic.

### 3 Pieces Variant

- Each player can have at most 3 pieces on the board.
- When you place a 4th, your oldest piece is removed automatically.
- Turn on “Removal Hint” to see which X and O pieces would be removed before a new placement.

## Controls

- New Game: reset the board but keep scores
- Undo: revert the last move (PvC undoes AI and player moves in a pair)
- Reset Scores: set X, O, and Ties to 0
- Rules: open the quick rules modal
- Theme: toggle Light/Dark
- Removal Hint (3-piece only): On/Off, highlights oldest X and O pieces

Keyboard:
- Tab/Shift+Tab to focus a cell
- Enter/Space to place a mark

## Run Locally

This is a static web app—no build is required.

- Option 1: Open `index.html` directly in your browser
- Option 2: Use VS Code’s “Live Server” extension for auto-reload

## Project Structure

```
modern-tictactoe/
├─ index.html    # Markup: header, controls, board, scoreboard, modal
├─ style.css     # Theme variables, layout, board/cell styles, modal
└─ script.js     # Game logic, AI, modes, variants, undo, storage, accessibility
```

## Tech

- HTML, CSS, Vanilla JavaScript
- No external dependencies

## Notes

- Scores and preferences (mode, difficulty, variant, theme, hint) persist using localStorage
- The “Removal Hint” button is visible only in the 3-piece variant and highlights both players’ oldest pieces

## Ideas / Next Steps

- Add sound effects and an optional confetti win animation
- Add move hints or a strategy coach overlay
- Record a move history panel per round
