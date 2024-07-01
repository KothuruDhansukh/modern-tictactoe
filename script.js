const cells = document.querySelectorAll('.cell');
let currentPlayer = 'X';
let board = ['', '', '', '', '', '', '', '', ''];
let xPositions = [];
let oPositions = [];

cells.forEach(cell => {
  cell.addEventListener('click', () => {
    if (cell.textContent === '' && currentPlayer === 'X') {
      makeMove(cell, 'X');
      if (!checkWin()) {
        currentPlayer = 'O';
        setTimeout(computerMove, 500);
      }
    }
  });
});

function makeMove(cell, player) {
  cell.textContent = player;
  cell.classList.add(player.toLowerCase());
  board[cell.id.split('-')[1]] = player;

  if (player === 'X') {
    xPositions.push(cell.id.split('-')[1]);
    if (xPositions.length > 3) {
      const firstX = xPositions.shift();
      document.getElementById(`cell-${firstX}`).textContent = '';
      document.getElementById(`cell-${firstX}`).classList.remove('x');
      board[firstX] = '';
    }
  } else {
    oPositions.push(cell.id.split('-')[1]);
    if (oPositions.length > 3) {
      const firstO = oPositions.shift();
      document.getElementById(`cell-${firstO}`).textContent = '';
      document.getElementById(`cell-${firstO}`).classList.remove('o');
      board[firstO] = '';
    }
  }

  if (checkWin()) {
    setTimeout(() => {
      alert(`${player} wins!`);
      resetBoard();
    }, 100);
  } else if (board.every(cell => cell !== '')) {
    setTimeout(() => {
      alert('Draw!');
      resetBoard();
    }, 100);
  }
}

function computerMove() {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < board.length; i++) {
    if (board[i] === '') {
      board[i] = 'O';
      let score = minimax(board, 0, false);
      board[i] = '';
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  makeMove(document.getElementById(`cell-${move}`), 'O');
  currentPlayer = 'X';
}

function minimax(board, depth, isMaximizing) {
  let scores = {
    'X': -1,
    'O': 1,
    'tie': 0
  };

  let winner = getWinner();
  if (winner !== null) {
    return scores[winner];
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === '') {
        board[i] = 'O';
        let score = minimax(board, depth + 1, false);
        board[i] = '';
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === '') {
        board[i] = 'X';
        let score = minimax(board, depth + 1, true);
        board[i] = '';
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function getWinner() {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  if (board.every(cell => cell !== '')) {
    return 'tie';
  }

  return null;
}

function checkWin() {
  return getWinner() !== null;
}

function resetBoard() {
  board = ['', '', '', '', '', '', '', '', ''];
  xPositions = [];
  oPositions = [];
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('x');
    cell.classList.remove('o');
  });
  currentPlayer = 'X';
}
