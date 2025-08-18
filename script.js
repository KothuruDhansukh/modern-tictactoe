
// State
const state = {
  mode: 'pvc', // pvc | pvp
  difficulty: 'medium', // easy | medium | hard
  variant: 'classic', // classic | limited (3 pieces)
  board: Array(9).fill(''),
  turn: 'X',
  history: [], // stack of { index, player, removed?: { index, player } }
  scores: { X: 0, O: 0, T: 0 },
  positions: { X: [], O: [] },
  locked: false,
};

// Elements
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const cells = $$('.cell');
const statusEl = $('#status');
const modeSel = $('#mode-select');
const diffSel = $('#difficulty-select');
const varSel = $('#variant-select');
const newBtn = $('#new-game');
const undoBtn = $('#undo-move');
const resetBtn = $('#reset-scores');
const rulesBtn = $('#rules-btn');
const rulesModal = $('#rules-modal');
const closeRules = $('#close-rules');
const closeRules2 = $('#close-rules-2');
const themeToggle = $('#theme-toggle');
const scoreX = $('#score-x');
const scoreO = $('#score-o');
const scoreT = $('#score-tie');
const hintToggle = $('#hint-toggle');

// Init theme
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') document.documentElement.setAttribute('data-theme', 'light');
updateThemeToggleLabel();

// Init settings
const savedSettings = JSON.parse(localStorage.getItem('settings') || '{}');
if (savedSettings.mode) state.mode = savedSettings.mode;
if (savedSettings.difficulty) state.difficulty = savedSettings.difficulty;
if (savedSettings.variant) state.variant = savedSettings.variant;
state.showRemovalHint = savedSettings.showRemovalHint ?? false;
modeSel.value = state.mode;
diffSel.value = state.difficulty;
varSel.value = state.variant;
diffSel.disabled = state.mode !== 'pvc';
// initialize hint toggle label
if (hintToggle) {
  hintToggle.textContent = `Removal Hint: ${state.showRemovalHint ? 'On' : 'Off'}`;
  hintToggle.setAttribute('aria-pressed', String(!!state.showRemovalHint));
}
updateHintVisibility();

// Scores
const savedScores = JSON.parse(localStorage.getItem('scores') || '{}');
state.scores = { X: savedScores.X || 0, O: savedScores.O || 0, T: savedScores.T || 0 };
renderScores();

// Bind events
cells.forEach((cell, idx) => {
  cell.addEventListener('click', () => handleCellClick(idx));
  cell.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCellClick(idx);
    }
  });
});

modeSel.addEventListener('change', () => {
  state.mode = modeSel.value;
  diffSel.disabled = state.mode !== 'pvc';
  persistSettings();
  newGame();
});
diffSel.addEventListener('change', () => {
  state.difficulty = diffSel.value;
  persistSettings();
  newGame();
});
varSel.addEventListener('change', () => {
  state.variant = varSel.value;
  persistSettings();
  updateHintVisibility();
  newGame();
});

newBtn.addEventListener('click', () => newGame());
undoBtn.addEventListener('click', () => undo());
resetBtn.addEventListener('click', () => resetScores());
rulesBtn.addEventListener('click', () => openModal());
closeRules.addEventListener('click', () => closeModal());
closeRules2.addEventListener('click', () => closeModal());
rulesModal.addEventListener('click', (e) => { if (e.target === rulesModal) closeModal(); });
themeToggle.addEventListener('click', () => toggleTheme());
if (hintToggle) hintToggle.addEventListener('click', () => toggleHint());

// Startup
renderBoard();
setStatus(`${state.turn}'s turn`);
showHintForCurrentTurn();

// Functions
function setStatus(text) { statusEl.textContent = text; }

function renderScores() {
  scoreX.textContent = `X: ${state.scores.X}`;
  scoreO.textContent = `O: ${state.scores.O}`;
  scoreT.textContent = `Ties: ${state.scores.T}`;
}

function persistScores() { localStorage.setItem('scores', JSON.stringify(state.scores)); }
function persistSettings() { localStorage.setItem('settings', JSON.stringify({ mode: state.mode, difficulty: state.difficulty, variant: state.variant, showRemovalHint: !!state.showRemovalHint })); }

function handleCellClick(index) {
  if (state.locked) return;
  if (state.board[index]) return; // occupied
  if (winner(state.board)) return;
  // clear any prior hint before placing
  clearHint();

  playMove(index, state.turn);

  const w = winner(state.board);
  if (w) return endRound(w);
  if (state.variant === 'classic' && isFull(state.board)) return endRound('T');

  // Switch or AI
  state.turn = state.turn === 'X' ? 'O' : 'X';
  setStatus(`${state.turn}'s turn`);
  showHintForCurrentTurn();

  if (state.mode === 'pvc' && state.turn === 'O') {
    state.locked = true;
    setTimeout(() => {
      const aiIndex = chooseAiMove();
      playMove(aiIndex, 'O');
      const w2 = winner(state.board);
      if (w2) return endRound(w2);
      if (state.variant === 'classic' && isFull(state.board)) return endRound('T');
      clearHint();
      state.turn = 'X';
      setStatus("X's turn");
      state.locked = false;
      showHintForCurrentTurn();
    }, 300);
  }
}

function playMove(index, player) {
  state.board[index] = player;
  const cell = cells[index];
  cell.textContent = player;
  cell.classList.add(player.toLowerCase());

  // variant limited (3 pieces each): remove oldest
  if (!state.positions[player]) state.positions[player] = [];
  state.positions[player].push(index);

  let removed;
  if (state.variant === 'limited' && state.positions[player].length > 3) {
    const oldIndex = state.positions[player].shift();
    state.board[oldIndex] = '';
    const oldCell = cells[oldIndex];
    oldCell.textContent = '';
    oldCell.classList.remove('x', 'o', 'hint');
    removed = { index: oldIndex, player };
  }

  state.history.push({ index, player, removed });
}

function undo() {
  if (state.locked) return;
  if (!state.history.length) return;

  const last = state.history.pop();
  state.board[last.index] = '';
  const cell = cells[last.index];
  cell.textContent = '';
  cell.classList.remove('x', 'o', 'win');
  // remove last occurrence in positions
  const arr = state.positions[last.player];
  const posIdx = arr.lastIndexOf(last.index);
  if (posIdx > -1) arr.splice(posIdx, 1);

  if (last.removed) {
    // restore removed oldest piece
    state.board[last.removed.index] = last.removed.player;
    const rc = cells[last.removed.index];
    rc.textContent = last.removed.player;
    rc.classList.add(last.removed.player.toLowerCase());
    state.positions[last.removed.player].unshift(last.removed.index);
  }

  // Clear win highlights and continue
  clearWinHighlight();
  state.turn = last.player; // give turn back to the one who undid
  setStatus(`${state.turn}'s turn`);
  showHintForCurrentTurn();

  // In PvC, undo twice to give the player the move again
  if (state.mode === 'pvc' && state.turn === 'O' && state.history.length) {
    undo();
  }
}
// Close modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !rulesModal.hidden) closeModal();
});

function newGame() {
  state.board = Array(9).fill('');
  state.turn = 'X';
  state.history = [];
  state.positions = { X: [], O: [] };
  state.locked = false;
  renderBoard();
  clearWinHighlight();
  setStatus("X's turn");
  clearHint();
  showHintForCurrentTurn();
}

function resetScores() {
  state.scores = { X: 0, O: 0, T: 0 };
  persistScores();
  renderScores();
}

function renderBoard() {
  state.board.forEach((v, i) => {
    const c = cells[i];
    c.textContent = v;
    c.classList.remove('x', 'o', 'win');
    if (v) c.classList.add(v.toLowerCase());
  });
}

function endRound(w) {
  state.locked = true;
  if (w === 'T') {
    setStatus('Tie game');
    state.scores.T++;
  } else {
    setStatus(`${w} wins!`);
    state.scores[w]++;
    const line = winningLine(state.board);
    if (line) highlightWin(line);
  }
  renderScores();
  persistScores();
  // auto-new round shortly after
  setTimeout(() => { newGame(); }, 1000);
}

function clearWinHighlight() { cells.forEach(c => c.classList.remove('win')); }
function highlightWin([a, b, c]) { [a, b, c].forEach(i => cells[i].classList.add('win')); }
function clearHint() { cells.forEach(c => c.classList.remove('hint')); }
function showHintForCurrentTurn() {
  clearHint();
  if (!state.showRemovalHint) return;
  if (state.variant !== 'limited') return;
  const xArr = state.positions.X || [];
  const oArr = state.positions.O || [];
  if (xArr.length === 3 && typeof xArr[0] === 'number') cells[xArr[0]].classList.add('hint');
  if (oArr.length === 3 && typeof oArr[0] === 'number') cells[oArr[0]].classList.add('hint');
}
function updateHintVisibility() {
  if (!hintToggle) return;
  const limited = state.variant === 'limited';
  hintToggle.style.display = limited ? 'inline-block' : 'none';
  if (!limited) {
    state.showRemovalHint = false;
    hintToggle.textContent = 'Removal Hint: Off';
    hintToggle.setAttribute('aria-pressed', 'false');
    clearHint();
    persistSettings();
  }
}

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function winningLine(b) {
  for (const [a, b1, c] of LINES) {
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) return [a, b1, c];
  }
  return null;
}

function winner(b) {
  const line = winningLine(b);
  if (line) return b[line[0]];
  return null;
}

function isFull(b) { return b.every(x => x); }

// AI
function chooseAiMove() {
  const empty = state.board.map((v, i) => v ? null : i).filter(v => v !== null);
  // For limited variant, use heuristic (win > block > center > corner > random)
  if (state.variant === 'limited') {
    return heuristicMove('O');
  }
  if (state.difficulty === 'easy') {
    return empty[Math.floor(Math.random() * empty.length)];
  }
  if (state.difficulty === 'medium') {
    // 60% best move, 40% random
    if (Math.random() < 0.6) return bestMove('O');
    return empty[Math.floor(Math.random() * empty.length)];
  }
  // hard
  return bestMove('O');
}

function heuristicMove(ai) {
  const human = ai === 'X' ? 'O' : 'X';
  const empties = state.board.map((v, i) => v ? null : i).filter(v => v !== null);
  // try winning move
  for (const i of empties) {
    state.board[i] = ai;
    if (winner(state.board) === ai) { state.board[i] = ''; return i; }
    state.board[i] = '';
  }
  // block human
  for (const i of empties) {
    state.board[i] = human;
    if (winner(state.board) === human) { state.board[i] = ''; return i; }
    state.board[i] = '';
  }
  // center
  if (empties.includes(4)) return 4;
  // corners
  const corners = [0, 2, 6, 8].filter(i => empties.includes(i));
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  // random
  return empties[Math.floor(Math.random() * empties.length)];
}

function bestMove(ai) {
  const human = ai === 'X' ? 'O' : 'X';
  let best = -Infinity, move = null;
  for (let i = 0; i < 9; i++) {
    if (!state.board[i]) {
      state.board[i] = ai;
      const score = minimax(state.board, 0, false, -Infinity, Infinity, ai, human);
      state.board[i] = '';
      if (score > best) { best = score; move = i; }
    }
  }
  return move;
}

function minimax(b, depth, isMax, alpha, beta, ai = 'O', human = 'X') {
  const w = winner(b);
  if (w === ai) return 10 - depth;
  if (w === human) return depth - 10;
  if (isFull(b)) return 0;

  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) if (!b[i]) {
      b[i] = ai;
      const score = minimax(b, depth + 1, false, alpha, beta, ai, human);
      b[i] = '';
      best = Math.max(best, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) if (!b[i]) {
      b[i] = human;
      const score = minimax(b, depth + 1, true, alpha, beta, ai, human);
      b[i] = '';
      best = Math.min(best, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return best;
  }
}

// Modal & Theme
function openModal() { rulesModal.hidden = false; }
function closeModal() { rulesModal.hidden = true; }

function toggleTheme() {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  if (isLight) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }
  updateThemeToggleLabel();
}

function updateThemeToggleLabel() {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  themeToggle.textContent = isLight ? '🌞 Light' : '🌙 Dark';
  themeToggle.setAttribute('aria-pressed', String(!isLight));
}
function toggleHint() {
  state.showRemovalHint = !state.showRemovalHint;
  if (hintToggle) {
    hintToggle.textContent = `Removal Hint: ${state.showRemovalHint ? 'On' : 'Off'}`;
    hintToggle.setAttribute('aria-pressed', String(!!state.showRemovalHint));
  }
  persistSettings();
  clearHint();
  showHintForCurrentTurn();
}
