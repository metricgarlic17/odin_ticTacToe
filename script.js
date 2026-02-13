const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 4, 8],
  [2, 4, 6],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
];

const GameBoard = (() => {
  const board = Array(9).fill("");

  const getBoard = () => board;

  const reset = () => {
    for (let i = 0; i < board.length; i++) {
      board[i] = "";
    }
  };

  const playMark = (index, mark) => {
    if (board[index] !== "") return false;
    board[index] = mark;
    return true;
  };

  return { getBoard, reset, playMark };
})();

const createPlayer = (name, mark) => {
  return { name, mark };
};

const Game = (() => {
  let players = [];
  let gameOver = false;
  let currentPlayerIndex = 0;

  const start = (p1 = "Player 1", p2 = "Player 2") => {
    players = [createPlayer(p1, "X"), createPlayer(p2, "O")];
    currentPlayerIndex = 0;
    gameOver = false;
    GameBoard.reset();
  };

  const getCurrentPlayer = () => players[currentPlayerIndex];

  const switchTurn = () => {
    currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
  };

  const checkWinner = (board) => {
    for (const [a, b, c] of WIN_LINES) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const checkTie = (board) => board.every((cell) => cell !== "");

  const playMove = (index) => {
    if (gameOver) return { ok: false, message: "Game is over" };

    const player = getCurrentPlayer();
    const placed = GameBoard.playMark(index, player.mark);
    if (!placed) return { ok: false, message: "Spot taken" };

    const board = GameBoard.getBoard();
    const winnerMark = checkWinner(board);

    if (winnerMark) {
      gameOver = true;
      const winner = players.find((p) => p.mark === winnerMark);
      return { ok: true, status: "win", winner };
    }

    if (checkTie(board)) {
      gameOver = true;
      return { ok: true, status: "tie" };
    }

    switchTurn();
    return { ok: true, status: "continue", nextPlayer: getCurrentPlayer() };
  };

  const isGameOver = () => gameOver;
  return { start, playMove, getCurrentPlayer, isGameOver };
})();

const DisplayController = (() => {
  // Grab HTML elements

  const boardDiv = document.querySelector("#board");
  const statusP = document.querySelector("#status");
  const startBtn = document.querySelector("#start");
  const p1Input = document.querySelector("#p1");
  const p2Input = document.querySelector("#p2");

  // Draw the board array onto the page

  const render = () => {
    const board = GameBoard.getBoard(); // get the real board data

    boardDiv.innerHTML = ""; // clear old square (so we can rebuild fresh)

    board.forEach((cell, index) => {
      const square = document.createElement("button");

      square.classList.add("square");

      square.textContent = cell;

      square.addEventListener("click", () => handleSquareClick(index));

      boardDiv.appendChild(square);
    });

    // show current player's turn if game not over
    if (!Game.isGameOver()) {
      const current = Game.getCurrentPlayer();
      statusP.textContent = `${current.name}'s turn (${current.mark})`;
    }
  };

  // Hanlde square click : send move into game logi

  const handleSquareClick = (index) => {
    const result = Game.playMove(index);

    // if move rejected (spot taken or game over), show message and stop
    if (!result.ok) {
      statusP.textContent = result.message;
      return;
    }

    render();

    if (result.status === "win") {
      statusP.textContent = `${result.winner.name} wins! (${result.winner.mark})`;
    } else if (result.status === "tie") {
      statusP.textContent = `It's a tie`;
    }
  };

  startBtn.addEventListener("click", () => {
    const p1Name = p1Input.value.trim() || "Player 1";
    const p2Name = p2Input.value.trim() || "Player 2";

    Game.start(p1Name, p2Name);
    render(); // show empty board + turn message
  });

  return { render };
})();
