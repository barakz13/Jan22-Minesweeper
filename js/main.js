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
var gLevel = {
    SIZE: 0,
    MINES: 0
};



function initGame() {
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = '';
    gIsGameOn = false;
    gMinesFlagged = 0;
    gShownCount = 0;
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
                isMarked: false
            }
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


function getSize(elSize) {
    var elSmiley = document.querySelector('.smiley');
    elSmiley.innerText = '😃';
    switch (elSize.innerText) {
        case 'Beginner':
            gLevel.SIZE = 4;
            gLevel.MINES = 2;
            var elLives = document.querySelector('h2');
            elLives.style.display = 'block';
            elLives.innerText = `Lives: 0`
            break;
        case 'Medium':
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            gLives = 3;
            var elLives = document.querySelector('h2');
            elLives.style.display = 'block';
            elLives.innerText = `Lives: ${gLives}`
            break;
        case 'Expert':
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            gLives = 6;
            var elLives = document.querySelector('h2');
            elLives.style.display = 'block';
            elLives.innerText = `Lives: ${gLives}`
            break;
    }
    initGame();
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
        for (var inspectedCellJ = j - 1; inspectedCellJ <= j + 1; inspectedCellJ++) {
            if ((inspectedCellJ < 0 || inspectedCellJ >= gLevel.SIZE) || (inspectedCellJ === j && inspectedCellI === i)) continue;
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
        var elBtn1 = document.querySelector('.beginner');
        var elBtn2 = document.querySelector('.medium');
        var elBtn3 = document.querySelector('.expert');
        elBtn1.style.display = 'none';
        elBtn2.style.display = 'none';
        elBtn3.style.display = 'none';
        startTimer();
        gIsGameOn = true;
        if (gBoard[i][j].isMine) firstTimeMine(elCell, i, j);
    }
    if (gBoard[i][j].isShown) return;
    if (gBoard[i][j].isMarked) return;
    if (gBoard[i][j].isMine) {
        if (gLevel.SIZE != 4) {
            gLives--;
            var elLives = document.querySelector('h2');
            elLives.innerText = `Lives: ${gLives}`
            if (gLives === 0) gameOver();
        }
        else {
            elCell.innerHTML = MINE;
            gameOver();
        }
        return;
    }
    printNegsNum(elCell, i, j);
    if ((gShownCount === ((gLevel.SIZE * gLevel.SIZE) - gLevel.MINES)) && (gMinesFlagged === gLevel.MINES)) {
        gameOver();
    }
    return;
}

function printNegsNum(elCell, i, j) {
    switch (gBoard[i][j].minesAroundCount) {
        case 0:
            elCell.innerHTML = '0';
            for (var inspectedCellI = i - 1; inspectedCellI <= i + 1; inspectedCellI++) {
                if (inspectedCellI < 0 || inspectedCellI >= gLevel.SIZE) continue;
                for (var inspectedCellJ = j - 1; inspectedCellJ <= j + 1; inspectedCellJ++) {
                    if ((inspectedCellJ < 0 || inspectedCellJ >= gLevel.SIZE) ||
                        (gBoard[inspectedCellI][inspectedCellJ].isMine) ||
                        (gBoard[inspectedCellI][inspectedCellJ].isShown)) continue;
                    gBoard[inspectedCellI][inspectedCellJ].isShown = true;
                    gShownCount++;
                    var elCell = document.querySelector(`#cell-${inspectedCellI}-${inspectedCellJ}`)
                    elCell.innerHTML = gBoard[inspectedCellI][inspectedCellJ].minesAroundCount;
                }
            }
            break;
        case 1:
            elCell.innerHTML = '1';
            gBoard[i][j].isShown = true;
            gShownCount++;
            break;
        case 2:
            elCell.innerHTML = '2';
            gBoard[i][j].isShown = true;
            gShownCount++;
            break;
        case 3:
            elCell.innerHTML = '3';
            gBoard[i][j].isShown = true;
            gShownCount++;
            break;
        case 4:
            elCell.innerHTML = '4';
            gBoard[i][j].isShown = true;
            gShownCount++;
            break;
        case 5:
            elCell.innerHTML = '5';
            gBoard[i][j].isShown = true;
            gShownCount++;
            break;
        case 6:
            elCell.innerHTML = '6';
            gBoard[i][j].isShown = true;
            gShownCount++;
            break;
        case 7:
            elCell.innerHTML = '7';
            gBoard[i][j].isShown = true;
            gShownCount++;
            break;
        case 8:
            elCell.innerHTML = '8';
            gBoard[i][j].isShown = true;
            gShownCount++;
            break;
    }
}




function cellMarked(elCell, i, j) {
    if (!gIsGameOn) {
        var elBtn1 = document.querySelector('.beginner');
        var elBtn2 = document.querySelector('.medium');
        var elBtn3 = document.querySelector('.expert');
        elBtn1.style.display = 'none';
        elBtn2.style.display = 'none';
        elBtn3.style.display = 'none';
        startTimer();
        gIsGameOn = true;
    }
    if ((gBoard[i][j].isMine) && (!gBoard[i][j].isMarked)) {
        elCell.innerHTML = FLAG
        gMinesFlagged++
        if ((gShownCount === ((gLevel.SIZE * gLevel.SIZE) - gLevel.MINES)) && (gMinesFlagged === gLevel.MINES)) {
            gameOver();
        }
    }
    if (gBoard[i][j].isShown) return;
    if (gBoard[i][j].isMarked) {
        elCell.innerHTML = '';
        gBoard[i][j].isMarked = false;
        if (gBoard[i][j].isMine) gMinesFlagged--;
        return;
    }
    else {
        elCell.innerHTML = FLAG
        gBoard[i][j].isMarked = true;
        return;
    }
}



function gameOver() {
    var elAgain = document.querySelector('.again');
    elAgain.style.display = 'block';
    clearInterval(gTimerInterval);
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            gBoard[i][j].isShown = true;
        }
    }
    if ((gShownCount === ((gLevel.SIZE * gLevel.SIZE) - gLevel.MINES)) && (gMinesFlagged === gLevel.MINES)) {
        var elSmiley = document.querySelector('.smiley');
        elSmiley.innerText = '😎';
        for (var i = 0; i < gLevel.SIZE; i++) {
            for (var j = 0; j < gLevel.SIZE; j++) {
                if (gBoard[i][j].isMine) continue;
                var elCell = document.querySelector(`#cell-${i}-${j}`)
                elCell.innerHTML = gBoard[i][j].minesAroundCount;
            }
        }
    }
    else {
        var elSmiley = document.querySelector('.smiley');
        elSmiley.innerText = '🤯';
        for (var i = 0; i < gMines.length; i++) {
            var elMine = document.querySelector(`#cell-${gMines[i].i}-${gMines[i].j}`)
            elMine.innerHTML = MINE;
            gBoard[gMines[i].i][gMines[i].j].isMarked = true;
        }
    }
}





function firstTimeMine(elCell, i, j) {
    gBoard[i][j].isMine = false;
    printNegsNum(elCell, i, j);
    for (var gMinesIdx = 0; gMinesIdx < gMines.length; gMinesIdx++) {
        if ((gMines[gMinesIdx].i === i) && (gMines[gMinesIdx].j === j)) {
            gMines.splice(gMinesIdx, 1);
        }
    }
    var mineI = getRandomIntInclusive(0, gLevel.SIZE - 1);
    var mineJ = getRandomIntInclusive(0, gLevel.SIZE - 1);
    while ((gBoard[mineI][mineJ].isMine) || (gBoard[mineI][mineJ].isShown)) {
        mineI = getRandomIntInclusive(0, gLevel.SIZE - 1);
        mineJ = getRandomIntInclusive(0, gLevel.SIZE - 1);
    }
    gBoard[mineI][mineJ].isMine = true;
    gMines.push({ i: mineI, j: mineJ });
}


function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function startTimer() {
    gTimerStart = Date.now();
    gTimerInterval = setInterval(showTimer, 100);
}

function showTimer() {
    gGameTime = (Date.now() - gTimerStart) / 1000;
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = `Time: ${gGameTime} seconds`;
}

function showButtons() {
    var elLives = document.querySelector('h2');
    elLives.style.display = 'none';
    var elAgain = document.querySelector('.again');
    elAgain.style.display = 'none';
    var elBtn1 = document.querySelector('.beginner');
    var elBtn2 = document.querySelector('.medium');
    var elBtn3 = document.querySelector('.expert');
    elBtn1.style.display = 'block';
    elBtn2.style.display = 'block';
    elBtn3.style.display = 'block';
}

function smileyRestart() {
    var elLives = document.querySelector('h2');
    elLives.style.display = 'none';
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = '';
    clearInterval(gTimerInterval);
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = '';
    var elBtn1 = document.querySelector('.beginner');
    var elBtn2 = document.querySelector('.medium');
    var elBtn3 = document.querySelector('.expert');
    elBtn1.style.display = 'block';
    elBtn2.style.display = 'block';
    elBtn3.style.display = 'block';
}