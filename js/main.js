let currentBoard = [];
let initialMove = true;
let wolfRegex = /wolf[0-9]*/;
let rabbitMove = true;
let selectedWolf = null;
const low = 2;
const medium = 5;
const high = 10;
let ai = false;


class Graph {
  constructor(parent, state) {
    this.parent = parent;
    this.state = state;
  }
}

class AI {

  constructor(initialDepth) {
    this.initialDepth = initialDepth;
  }

  alphaBeta(depth, node, maximizingPlayer, alpha, beta) {

    let bestMove;
    if (this.hasWon(node.state) === 100 ||this.hasWon(node.state) === -100 || depth <= 0) {
      return this.evaluate(node.state);
    }

    if (maximizingPlayer) {
      let best = -Infinity;


      let possibleMoves = this.possibleMovesRabbit(node.state);

      for (let i = 0; i < possibleMoves.length; i++) {
        let newBoard = this.copyBoards(node.state);

        this.move(newBoard, possibleMoves[i][0], possibleMoves[i][1], 'rabbit');

        let child = new Graph(node, newBoard);

        let val = this.alphaBeta(depth - 1, child,
          false, alpha, beta);

        if (val > best) {
          best = val;
          bestMove = possibleMoves[i];
        }

        alpha = Math.max(alpha, best);

        if (beta <= alpha)
          break;
      }

      if (this.initialDepth === depth && bestMove) {
        move(bestMove[0], bestMove[1], "rabbit");
      }
      return best;
    } else {
      let best = Infinity;

      let possibleMoves = new Map();

      for (let i = 1; i <= 4; i++) {
        possibleMoves.set(`wolf${i}`, this.possibleMovesWolf(`wolf${i}`, node.state));
      }


      for (let entry of possibleMoves) {
        for (let possibleMove of entry[1]) {
          let newBoard = this.copyBoards(node.state);

          this.move(newBoard, possibleMove[0], possibleMove[1], entry[0]);

          let child = new Graph(node, newBoard);

          let val = this.alphaBeta(depth - 1, child,
            true, alpha, beta);
          if (val < best) {
            best = val;
            bestMove = possibleMove;
          }

          beta = Math.min(beta, best);

          if (beta <= alpha)
            break;
        }
      }
      return best;
    }
  }

  hasWon = (board) => {
    let rabbitPos = this.findIndex('rabbit', board);
    if (rabbitPos[0] === 0) {
      return 100;
    }
    if (this.possibleMovesRabbit(board).length === 0) {
      return -100;
    }
    let wolvesCanMove = false;
    for (let i = 1; i <= 4; i++) {
      if (this.possibleMovesWolf(`wolf${i}`, board).length > 0) {
        wolvesCanMove = true;
      }
    }
    if (!wolvesCanMove) {
      return 100;
    }
    return 0;
  }

  move = (board, x, y, character) => {
    let currPos = this.findIndex(character, board);
    board[currPos[0]][currPos[1]] = 'black';
    board[x][y] = character;
  }

  possibleMovesRabbit = (board) => {
    let possible = [];
    let rabbitPosition = this.findIndex("rabbit", board);
    let rabbitX = rabbitPosition[0];
    let rabbitY = rabbitPosition[1];
    for (let i = -1; i < 2; i += 2) {
      for (let j = -1; j < 2; j += 2) {
        let currentX = rabbitX + i;
        let currentY = rabbitY + j;
        if (currentX >= 0 && currentX < 8 && currentY >= 0 && currentY < 8) {
          if (!board[currentX][currentY].match(wolfRegex)) {
            possible.push([currentX, currentY]);
          }
        }
      }
    }
    return possible;
  }

  possibleMovesWolf = (wolf, board) => {
    let possible = [];
    let wolfPosition = this.findIndex(wolf, board);
    let wolfX = wolfPosition[0];
    let wolfY = wolfPosition[1];
    for (let i = -1; i < 2; i += 2) {
      let currentX = wolfX + 1;
      let currentY = wolfY + i;
      if (currentX >= 0 && currentX < 8 && currentY >= 0 && currentY < 8) {
        if (!board[currentX][currentY].match(wolfRegex) && board[currentX][currentY] !== 'rabbit') {
          possible.push([currentX, currentY]);
        }
      }
    }
    return possible;
  }

  findIndex = (element, board) => {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (element === board[i][j]) {
          return [i, j];
        }
      }
    }
  }

  evaluate = (board) => {
    let sum = 0;
    let x = this.findIndex("rabbit", board)[0];
    sum = -x * 2;
    sum += this.hasWon(board);
    return sum;
  }

  copyBoards = (board) => {
    let copiedBoard = [];
    for (let i = 0; i < 8; i++) {
      copiedBoard[i] = [];
      for (let j = 0; j < 8; j++) {
        copiedBoard[i][j] = board[i][j];
      }
    }
    return copiedBoard;
  }
}


const checkWin = () => {
  let rabbitPos = findIndex('rabbit');
  if (rabbitPos[0] === 0) {
    endGame("Rabbit won!");
    return;
  }
  if (possibleMovesRabbit().length === 0) {
    endGame("Wolves won!");
    return;
  }
  let wolvesCanMove = false;
  for (let i = 1; i < 4; i++) {
    if (possibleMovesWolf(`wolf${i}`).length > 0) {
      wolvesCanMove = true;
    }
  }
  if (!wolvesCanMove) {
    endGame("Rabbit won!");
  }
}

const endGame = (message) => {

  let button = document.createElement('button');
  button.innerHTML = "Replay"
  button.setAttribute('onclick', 'window.location.reload()');
  let winMessage = document.createElement('h1');
  winMessage.textContent = message;
  document.body.appendChild(winMessage);
  document.body.appendChild(button);
  printView();
}


const selectWolf = (wolf) => {
  if (!selectedWolf) {
    selectedWolf = wolf;
  } else {
    selectedWolf = null;
  }
  update();
}

const move = (x, y, character) => {
  let currPos = findIndex(character);
  currentBoard[currPos[0]][currPos[1]] = 'black';
  currentBoard[x][y] = character;
  if (character.match(wolfRegex)) {
    rabbitMove = true;
    selectedWolf = null;
  } else {
    rabbitMove = false;
  }
  update();
  checkWin();
}

const place = (x, y) => {
  currentBoard[x][y] = 'rabbit';
  update();
}

const findIndex = (element) => {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (element === currentBoard[i][j]) {
        return [i, j];
      }
    }
  }
}

const possibleMovesWolf = (wolf) => {
  let possible = [];
  let wolfPosition = findIndex(wolf);
  let wolfX = wolfPosition[0];
  let wolfY = wolfPosition[1];
  for (let i = -1; i < 2; i += 2) {
    let currentX = wolfX + 1;
    let currentY = wolfY + i;
    if (currentX >= 0 && currentX < 8 && currentY >= 0 && currentY < 8) {
      if (!currentBoard[currentX][currentY].match(wolfRegex) && currentBoard[currentX][currentY] !== 'rabbit') {
        possible.push([currentX, currentY]);
      }
    }
  }
  return possible;
}

const possibleMovesRabbit = () => {
  let possible = [];
  let rabbitPosition = findIndex("rabbit");
  let rabbitX = rabbitPosition[0];
  let rabbitY = rabbitPosition[1];
  for (let i = -1; i < 2; i += 2) {
    for (let j = -1; j < 2; j += 2) {
      let currentX = rabbitX + i;
      let currentY = rabbitY + j;
      if (currentX >= 0 && currentX < 8 && currentY >= 0 && currentY < 8) {
        if (!currentBoard[currentX][currentY].match(wolfRegex)) {
          possible.push([currentX, currentY]);
        }
      }
    }
  }
  return possible;
}

const printView = () => {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let td = document.getElementById(`cell-${i}-${j}`);
      if ((i + j) % 2 === 1) {
        if (currentBoard[i][j].match(wolfRegex)) {
          let wolf = document.createElement('img');
          wolf.src = 'img/wolf.png';
          td.innerHTML = '';
          td.appendChild(wolf);
        } else if (currentBoard[i][j] === 'rabbit') {
          let rabbit = document.createElement("img");
          rabbit.src = 'img/rabbit.png';
          td.innerHTML = '';
          td.appendChild(rabbit);
        } else if (currentBoard[i][j] === 'black') {
          td.innerHTML = '';
        }
        td.setAttribute('class', 'cell blackcell');
      }
    }
  }
}

const update = () => {
  let button;
  checkWin();
  printView();
  console.log(possibleMovesRabbit());
  if (rabbitMove) {
    if (ai) {
      let a = agent.alphaBeta(agent.initialDepth, new Graph(null, currentBoard.slice()), true, -12, 0);
      console.log(a);
    } else {
      let possibleMoves = possibleMovesRabbit();
      for (let possibleMove of possibleMoves) {
        let cell = document.getElementById(`cell-${possibleMove[0]}-${possibleMove[1]}`);
        cell.classList.add('cell-select');
        let button = document.createElement('button');
        button.textContent = ""
        button.setAttribute('class', 'place-button');
        button.setAttribute("onclick", `move(${possibleMove[0]}, ${possibleMove[1]}, 'rabbit')`);
        cell.appendChild(button);
      }
    }
  } else {
    if (!selectedWolf) {
      for (let i = 1; i <= 4; i++) {
        let wolfPos = findIndex(`wolf${i}`);
        let button = document.createElement('button');
        button.textContent = "";
        button.setAttribute('class', 'place-button');
        button.setAttribute("onclick", `selectWolf('wolf${i}')`);
        let cell = document.getElementById(`cell-${wolfPos[0]}-${wolfPos[1]}`);
        cell.classList.add('wolf-select');
        cell.innerHTML = '';
        cell.appendChild(button);

        let wolf = document.createElement('img');
        wolf.src = 'img/wolf.png';
        button.appendChild(wolf);
      }
    } else {
      let wolfMoves = possibleMovesWolf(selectedWolf);
      let wolfPos = findIndex(selectedWolf);
      let unselect = document.createElement('button');
      unselect.textContent = "";
      unselect.setAttribute('class', 'place-button');
      unselect.setAttribute("onclick", `selectWolf('${selectedWolf}')`);
      let cell = document.getElementById(`cell-${wolfPos[0]}-${wolfPos[1]}`);
      cell.classList.add('wolf-select');
      cell.innerHTML = '';
      cell.appendChild(unselect);

      let wolf = document.createElement('img');
      wolf.src = 'img/wolf.png';
      unselect.appendChild(wolf);

      for (let wolfMove of wolfMoves) {

        let cell = document.getElementById(`cell-${wolfMove[0]}-${wolfMove[1]}`);
        cell.classList.add('cell-select');

        button = document.createElement('button');
        button.textContent = "";
        button.setAttribute('class', 'place-button');
        button.setAttribute("onclick", `move(${wolfMove[0]}, ${wolfMove[1]}, '${selectedWolf}')`);

        cell.appendChild(button);
      }
    }
  }
}

const init = () => {


  initialMove = true;

  for (let i = 0; i < 8; i++) {
    let wolfCount = 1;
    currentBoard[i] = [];
    for (let j = 0; j < 8; j++) {
      if ((i + j) % 2 === 0) {
        currentBoard[i][j] = 'white';
      } else {
        if (i === 0) {
          currentBoard[i][j] = `wolf${wolfCount}`;
          wolfCount++;
        } else {
          currentBoard[i][j] = 'black';
        }
      }
    }
  }

  let center = document.createElement('center');

  let ChessTable = document.createElement('table');
  for (let i = 0; i < 8; i++) {

    let tr = document.createElement('tr');
    for (let j = 0; j < 8; j++) {
      let wolf = document.createElement('img');
      wolf.src = 'img/wolf.png';
      let td = document.createElement('td');

      let button = document.createElement('button');
      button.textContent = ""
      button.setAttribute('class', 'place-button');

      if ((i + j) % 2 === 0) {

        td.setAttribute('class', 'cell whitecell');
        tr.appendChild(td);
      } else {

        td.setAttribute('class', 'cell blackcell');

        tr.appendChild(td);

        if (currentBoard[i][j].match(wolfRegex)) {
          td.appendChild(wolf);
        }
        if (currentBoard[i][j] === 'rabbit') {
          let rabbit = document.createElement("img");
          rabbit.src = 'img/rabbit.png';
          td.appendChild(rabbit);
        }
        if (initialMove) {
          if (i === 7) {
            if (!ai) {
              td.classList.add('cell-select');
              td.appendChild(button);
              button.setAttribute("onclick", `place(${i}, ${j})`);
              currentBoard[i][j] = 'black';
            }
          }
        }
      }
      td.setAttribute("id", `cell-${i}-${j}`);
    }

    ChessTable.appendChild(tr);
  }
  center.appendChild(ChessTable);
  initialMove = false;

  ChessTable.setAttribute('cellspacing', '0');
  ChessTable.setAttribute('width', '270px');
  document.body.appendChild(center);
  if (ai) {
    place(7, Math.floor(Math.random() * 3) * 2);
  }
}

const play = (toggleAi, difficulty) => {
  ai = toggleAi;
  agent.initialDepth = difficulty;
  document.getElementById('button1').remove();
  document.getElementById('button2').remove();
  init();
}

const agent = new AI(10);
