'use strict';

const MINE = '💣';
const FLAG = '🚩';
var gMines;
var gBoard;
var gTimerStart;
var gTimerInterval;
var gGameTime;
var gMinesFlagged;
var gIsGameOn;
var gShownCount;
var gLives;
var gIsHintOn;
var gHintsLeft;
var gLastCells;
var gNumLastActions;
var gIsManuallyOn;
var gIsEyeOn;
var gUsedCellsForEye;
var gEyesLeft;
var gIsTimerOn;
var gLevel = {
  SIZE: 0,
  MINES: 0,
};

function getSize(elSize) {
  var elTable = document.querySelector('table');
  elTable.style.display = 'inline-block';
  switch (elSize.innerText) {
    case 'Beginner':
      gLevel.SIZE = 4;
      gLevel.MINES = 2;
      gLives = 0;
      gHintsLeft = 1;
      gEyesLeft = 1;
      break;
    case 'Medium':
      gLevel.SIZE = 8;
      gLevel.MINES = 12;
      gLives = 3;
      gHintsLeft = 2;
      gEyesLeft = 2;
      break;
    case 'Expert':
      gLevel.SIZE = 12;
      gLevel.MINES = 30;
      gLives = 6;
      gHintsLeft = 3;
      gEyesLeft = 3;
      break;
  }
  initGame();
}

function initGame() {
  initGameVisuals();
  gUsedCellsForEye = [];
  gIsEyeOn = false;
  gIsManuallyOn = false;
  gLastCells = [];
  gNumLastActions = [];
  gUsedCellsForEye = [];
  gIsGameOn = false;
  gMinesFlagged = 0;
  gShownCount = 0;
  gIsHintOn = false;
  gIsTimerOn = false;
  setHints();
  setEyes();
  gBoard = buildBoard();
  renderBoard();
}

function buildBoard() {
  gMines = [];
  var mineI = 0;
  var mineJ = 0;
  var board = [];
  for (var i = 0; i < gLevel.SIZE; i++) {
    board[i] = [];
    for (var j = 0; j < gLevel.SIZE; j++) {
      board[i][j] = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      };
    }
  }
  for (var i = 0; i < gLevel.MINES; i++) {
    mineI = getRandomIntInclusive(0, gLevel.SIZE - 1);
    mineJ = getRandomIntInclusive(0, gLevel.SIZE - 1);
    while (board[mineI][mineJ].isMine) {
      mineI = getRandomIntInclusive(0, gLevel.SIZE - 1);
      mineJ = getRandomIntInclusive(0, gLevel.SIZE - 1);
    }
    board[mineI][mineJ].isMine = true;
    gMines.push({ i: mineI, j: mineJ });
  }
  setMinesNegsCount(board);
  return board;
}

function setMinesNegsCount(board) {
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      board[i][j].minesAroundCount = setMinesNegsCountSingleCell(board, i, j);
    }
  }
}

function setMinesNegsCountSingleCell(board, i, j) {
  var minesCounter = 0;
  for (var inspectedCellI = i - 1; inspectedCellI <= i + 1; inspectedCellI++) {
    if (inspectedCellI < 0 || inspectedCellI >= gLevel.SIZE) continue;
    for (
      var inspectedCellJ = j - 1;
      inspectedCellJ <= j + 1;
      inspectedCellJ++
    ) {
      if (
        inspectedCellJ < 0 ||
        inspectedCellJ >= gLevel.SIZE ||
        (inspectedCellJ === j && inspectedCellI === i)
      )
        continue;
      if (board[inspectedCellI][inspectedCellJ].isMine) minesCounter++;
    }
  }
  return minesCounter;
}

function renderBoard() {
  var strHTML = '';
  for (var i = 0; i < gLevel.SIZE; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < gLevel.SIZE; j++) {
      var tdId = `cell-${i}-${j}`;
      strHTML += `<td id="${tdId}" onclick="cellClicked(this,${i},${j})" oncontextmenu="cellMarked(this,${i},${j})"></td>`;
    }
    strHTML += '</tr>';
  }
  var elBoard = document.querySelector('.board');
  elBoard.innerHTML = strHTML;
}

function cellClicked(elCell, i, j) {
  if (!gIsGameOn) {
    cellClickedMarkedVisuals();
    if (gBoard[i][j].isMine && !gIsManuallyOn) firstTimeMine(elCell, i, j);
  }
  if (gIsHintOn && !gBoard[i][j].isShown) {
    printCellsForHint(elCell, i, j);
    return;
  }
  if (gBoard[i][j].isShown) return;
  if (gBoard[i][j].isMarked) return;
  if (gBoard[i][j].isMine) {
    if (gLevel.SIZE != 4) {
      gLives--;
      var elLivesSpan = document.querySelector('span');
      elLivesSpan.innerText = gLives;
      elLivesSpan.style.color = 'rgb(95, 207, 202)';
      setTimeout(livesNumColorChange, 1000);
      if (gLives === 0) gameOver();
    } else {
      elCell.innerHTML = MINE;
      gameOver();
    }
    return;
  }
  printNegsNum(elCell, i, j);
  if (
    gShownCount === gLevel.SIZE * gLevel.SIZE - gLevel.MINES &&
    gMinesFlagged === gLevel.MINES
  ) {
    gameOver();
  }
  return;
}

function printNegsNum(elCell, i, j) {
  var NumberOfLastCells = 0;
  switch (gBoard[i][j].minesAroundCount) {
    case 0:
      elCell.innerHTML = '0';
      elCell.style.color = 'rgb(167, 70, 70)';
      for (
        var inspectedCellI = i - 1;
        inspectedCellI <= i + 1;
        inspectedCellI++
      ) {
        if (inspectedCellI < 0 || inspectedCellI >= gLevel.SIZE) continue;
        for (
          var inspectedCellJ = j - 1;
          inspectedCellJ <= j + 1;
          inspectedCellJ++
        ) {
          if (
            inspectedCellJ < 0 ||
            inspectedCellJ >= gLevel.SIZE ||
            gBoard[inspectedCellI][inspectedCellJ].isMine ||
            gBoard[inspectedCellI][inspectedCellJ].isShown ||
            gBoard[inspectedCellI][inspectedCellJ].isMarked
          )
            continue;
          gBoard[inspectedCellI][inspectedCellJ].isShown = true;
          gShownCount++;
          var elInspectedCell = document.querySelector(
            `#cell-${inspectedCellI}-${inspectedCellJ}`
          );
          elInspectedCell.innerHTML =
            gBoard[inspectedCellI][inspectedCellJ].minesAroundCount;
          switch (gBoard[inspectedCellI][inspectedCellJ].minesAroundCount) {
            case 0:
              elInspectedCell.style.color = 'rgb(167, 70, 70)';
              break;
            case 1:
              elInspectedCell.style.color = 'blue';
              break;
            case 2:
              elInspectedCell.style.color = 'green';
              break;
            case 3:
              elInspectedCell.style.color = 'red';
              break;
            case 4:
              elInspectedCell.style.color = 'darkblue';
              break;
            case 5:
              elInspectedCell.style.color = 'brown';
              break;
            case 6:
              elInspectedCell.style.color = 'teal';
              break;
            case 7:
              elInspectedCell.style.color = 'purple';
              break;
            case 8:
              elInspectedCell.style.color = 'gray';
              break;
          }
          gLastCells.push({ i: inspectedCellI, j: inspectedCellJ });
          NumberOfLastCells++;
        }
      }
      gNumLastActions.push(NumberOfLastCells);
      break;
    case 1:
      elCell.innerHTML = '1';
      elCell.style.color = 'blue';
      gBoard[i][j].isShown = true;
      gShownCount++;
      gLastCells.push({ i: i, j: j });
      gNumLastActions.push(1);
      break;
    case 2:
      elCell.innerHTML = '2';
      elCell.style.color = 'green';
      gBoard[i][j].isShown = true;
      gShownCount++;
      gLastCells.push({ i: i, j: j });
      gNumLastActions.push(1);
      break;
    case 3:
      elCell.innerHTML = '3';
      elCell.style.color = 'red';
      gBoard[i][j].isShown = true;
      gShownCount++;
      gLastCells.push({ i: i, j: j });
      gNumLastActions.push(1);
      break;
    case 4:
      elCell.innerHTML = '4';
      elCell.style.color = 'darkblue';
      gBoard[i][j].isShown = true;
      gShownCount++;
      gLastCells.push({ i: i, j: j });
      gNumLastActions.push(1);
      break;
    case 5:
      elCell.innerHTML = '5';
      elCell.style.color = 'brown';
      gBoard[i][j].isShown = true;
      gShownCount++;
      gLastCells.push({ i: i, j: j });
      gNumLastActions.push(1);
      break;
    case 6:
      elCell.innerHTML = '6';
      elCell.style.color = 'teal';
      gBoard[i][j].isShown = true;
      gShownCount++;
      gLastCells.push({ i: i, j: j });
      gNumLastActions.push(1);
      break;
    case 7:
      elCell.innerHTML = '7';
      elCell.style.color = 'purple';
      gBoard[i][j].isShown = true;
      gShownCount++;
      gLastCells.push({ i: i, j: j });
      gNumLastActions.push(1);
      break;
    case 8:
      elCell.innerHTML = '8';
      elCell.style.color = 'gray';
      gBoard[i][j].isShown = true;
      gShownCount++;
      gLastCells.push({ i: i, j: j });
      gNumLastActions.push(1);
      break;
  }
}

function cellMarked(elCell, i, j) {
  if (!gIsGameOn) cellClickedMarkedVisuals();
  if (gBoard[i][j].isShown || gIsEyeOn) return;
  if (gBoard[i][j].isMine && !gBoard[i][j].isMarked) {
    elCell.innerHTML = FLAG;
    gMinesFlagged++;
    gBoard[i][j].isMarked = true;
    gLastCells.push({ i: i, j: j });
    gNumLastActions.push(1);
    if (
      gShownCount === gLevel.SIZE * gLevel.SIZE - gLevel.MINES &&
      gMinesFlagged === gLevel.MINES
    ) {
      gameOver();
    }
    return;
  }
  if (gBoard[i][j].isMarked) {
    gLastCells.pop();
    gNumLastActions.pop();
    elCell.innerHTML = '';
    gBoard[i][j].isMarked = false;
    if (gBoard[i][j].isMine) gMinesFlagged--;
    return;
  } else {
    elCell.innerHTML = FLAG;
    gBoard[i][j].isMarked = true;
    gLastCells.push({ i: i, j: j });
    gNumLastActions.push(1);
    return;
  }
}

function firstTimeMine(elCell, i, j) {
  gBoard[i][j].isMine = false;
  gBoard[i][j].isShown = true;
  for (var gMinesIdx = 0; gMinesIdx < gMines.length; gMinesIdx++) {
    if (gMines[gMinesIdx].i === i && gMines[gMinesIdx].j === j) {
      gMines.splice(gMinesIdx, 1);
    }
  }
  var mineI = getRandomIntInclusive(0, gLevel.SIZE - 1);
  var mineJ = getRandomIntInclusive(0, gLevel.SIZE - 1);
  while (gBoard[mineI][mineJ].isMine || gBoard[mineI][mineJ].isShown) {
    mineI = getRandomIntInclusive(0, gLevel.SIZE - 1);
    mineJ = getRandomIntInclusive(0, gLevel.SIZE - 1);
  }
  gBoard[mineI][mineJ].isMine = true;
  gMines.push({ i: mineI, j: mineJ });
  setMinesNegsCount(gBoard);
  printNegsNum(elCell, i, j);
}

function printCellsForHint(elCell, i, j) {
  gIsHintOn = false;
  var cellsPrintedForHint = [];
  for (var inspectedCellI = i - 1; inspectedCellI <= i + 1; inspectedCellI++) {
    if (inspectedCellI < 0 || inspectedCellI >= gLevel.SIZE) continue;
    for (
      var inspectedCellJ = j - 1;
      inspectedCellJ <= j + 1;
      inspectedCellJ++
    ) {
      if (
        inspectedCellJ < 0 ||
        inspectedCellJ >= gLevel.SIZE ||
        gBoard[inspectedCellI][inspectedCellJ].isShown
      )
        continue;
      gBoard[inspectedCellI][inspectedCellJ].isShown = true;
      cellsPrintedForHint.push({ i: inspectedCellI, j: inspectedCellJ });
      var elCell = document.querySelector(
        `#cell-${inspectedCellI}-${inspectedCellJ}`
      );
      if (gBoard[inspectedCellI][inspectedCellJ].isMine)
        elCell.innerHTML = MINE;
      else
        elCell.innerHTML =
          gBoard[inspectedCellI][inspectedCellJ].minesAroundCount;
    }
  }
  setTimeout(function () {
    hideCellsForHint(cellsPrintedForHint);
  }, 1000);
}

function hideCellsForHint(cellsPrintedForHint) {
  for (var idx = 0; idx < cellsPrintedForHint.length; idx++) {
    gBoard[cellsPrintedForHint[idx].i][
      cellsPrintedForHint[idx].j
    ].isShown = false;
    var elCell = document.querySelector(
      `#cell-${cellsPrintedForHint[idx].i}-${cellsPrintedForHint[idx].j}`
    );
    if (gBoard[cellsPrintedForHint[idx].i][cellsPrintedForHint[idx].j].isMarked)
      elCell.innerHTML = FLAG;
    else elCell.innerHTML = '';
  }
  gHintsLeft--;
}

function undoAction() {
  var lastCell;
  if (gNumLastActions.length === 0) gIsGameOn = false;
  else {
    var NumberOfLastCells = gNumLastActions.pop();
    for (
      var stopIndicator = 0;
      stopIndicator < NumberOfLastCells;
      stopIndicator++
    ) {
      lastCell = gLastCells.pop();
      if (gBoard[lastCell.i][lastCell.j].isShown) {
        gShownCount--;
        gBoard[lastCell.i][lastCell.j].isShown = false;
        var elCell = document.querySelector(
          `#cell-${lastCell.i}-${lastCell.j}`
        );
        elCell.innerHTML = '';
      } else {
        gBoard[lastCell.i][lastCell.j].isMarked = false;
        var elCell = document.querySelector(
          `#cell-${lastCell.i}-${lastCell.j}`
        );
        elCell.innerHTML = '';
        if (gBoard[lastCell.i][lastCell.j].isMine) gMinesFlagged--;
      }
    }
  }
}

function manPosMines() {
  if (gIsGameOn) return;
  alert(`You Need To Place ${gLevel.MINES} Mines`);
  while (gMines.length !== 0) {
    gBoard[gMines[gMines.length - 1].i][
      gMines[gMines.length - 1].j
    ].isMine = false;
    gMines.pop();
  }
  for (var i = 0; i < gLevel.MINES; i++) {
    var userPos = userInputMinePos(i);
    while (gBoard[userPos.i][userPos.j].isMine) {
      alert('You Already Placed A Mine Here.');
      userPos = userInputMinePos(i);
    }
    gBoard[userPos.i][userPos.j].isMine = true;
    gMines.push(userPos);
  }
  setMinesNegsCount(gBoard);
  gIsManuallyOn = true;
}

function eyeClicked(elEye) {
  if (!gIsGameOn || gEyesLeft === 0 || elEye.classList.contains('clicked'))
    return;
  gIsEyeOn = true;
  var safeCells = [];
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (!gBoard[i][j].isShown && !gBoard[i][j].isMine)
        safeCells.push({ i: i, j: j });
    }
  }
  var chosenCell = safeCells[getRandomIntInclusive(0, safeCells.length - 1)];
  gUsedCellsForEye.push(chosenCell);
  var elCell = document.querySelector(`#cell-${chosenCell.i}-${chosenCell.j}`);
  elCell.classList.add('mark');
  elEye.style.visibility = 'hidden';
  setTimeout(function () {
    revertCellColor(chosenCell.i, chosenCell.j);
  }, 1100);
  gEyesLeft--;
  gIsEyeOn = false;
}

function gameOver() {
  clearInterval(gTimerInterval);
  gIsEyeOn = true;
  gIsHintOn = true;
  gameOverVisuals();
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      gBoard[i][j].isShown = true;
    }
  }
  if (
    gShownCount === gLevel.SIZE * gLevel.SIZE - gLevel.MINES &&
    gMinesFlagged === gLevel.MINES
  ) {
    var elSmiley = document.querySelector('.smiley');
    elSmiley.innerText = '😎';
    for (var i = 0; i < gLevel.SIZE; i++) {
      for (var j = 0; j < gLevel.SIZE; j++) {
        if (gBoard[i][j].isMine) continue;
        var elCell = document.querySelector(`#cell-${i}-${j}`);
        elCell.innerHTML = gBoard[i][j].minesAroundCount;
      }
    }
  } else {
    var elSmiley = document.querySelector('.smiley');
    elSmiley.innerText = '🤯';
    for (var i = 0; i < gMines.length; i++) {
      var elMine = document.querySelector(
        `#cell-${gMines[i].i}-${gMines[i].j}`
      );
      elMine.innerHTML = MINE;
      gBoard[gMines[i].i][gMines[i].j].isMarked = true;
    }
  }
}
