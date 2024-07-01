
let playerScore = 0;
let computerScore = 0;
let currentPlayer = 'X'; // Player always starts with X
let board = ['', '', '', '', '', '', '', '', ''];
let xPositions = [];
let oPositions = [];

function updateScoreboard() {
  document.getElementById('player-score').textContent = `Player: ${playerScore}`;
  document.getElementById('computer-score').textContent = `Computer: ${computerScore}`;
}

function displayRules() {
  alert(`Rules of Tic Tac Toe:
  
  1. The game is played on a 3x3 grid.
  2. You are X, and the computer is O.
  3. You take turns placing your symbol in an empty cell.
  4. You can only have a maximum of 3 Os on the board at any time. If a fourth O is placed, the oldest one will be removed.
  5. The first player to get 3 of their symbols in a row (vertically, horizontally, or diagonally) wins.
  6. If all cells are filled and no player has won, the game is a draw.
  
  Enjoy the game!`);
}

displayRules();

updateScoreboard();

const cells = document.querySelectorAll('.cell');
cells.forEach(cell => {
  cell.addEventListener('click', () => {
    if (cell.textContent === '') {
      makeMove(cell, currentPlayer);
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
      if (player === 'X') {
        playerScore++;
      } else {
        computerScore++;
      }
      updateScoreboard();
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
      let score = minimax(board, 0, false, -Infinity, Infinity);
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

function minimax(board, depth, isMaximizing, alpha, beta) {
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
        let score = minimax(board, depth + 1, false, alpha, beta);
        board[i] = '';
        bestScore = Math.max(score, bestScore);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) {
          break;
        }
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === '') {
        board[i] = 'X';
        let score = minimax(board, depth + 1, true, alpha, beta);
        board[i] = '';
        bestScore = Math.min(score, bestScore);
        beta = Math.min(beta, score);
        if (beta <= alpha) {
          break;
        }
      }
    }
    return bestScore;
  }
}

function checkWin() {
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
      return true;
    }
  }

  return false;
}

function resetBoard() {
  board = ['', '', '', '', '', '', '', '', ''];
  xPositions = [];
  oPositions = [];
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('x', 'o');
  });
  currentPlayer = 'X'; 
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
