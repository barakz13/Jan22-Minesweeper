'use strict';

function initGameVisuals() {
  var elHints = document.querySelectorAll('.hint');
  var elEyes = document.querySelectorAll('.eye');
  for (var i = 0; i < elHints.length; i++) {
    elHints[i].style.visibility = 'visible';
  }
  for (var i = 0; i < elEyes.length; i++) {
    elEyes[i].style.visibility = 'visible';
  }
  var elManually = document.querySelector('.manually');
  elManually.style.display = 'block';
  var elProps = document.querySelector('.gameprops');
  elProps.style.cursor = 'default';
  elProps.style.display = 'flex';
  var elSmiley = document.querySelector('.smiley');
  elSmiley.innerText = '😃';
  var elLives = document.querySelector('h2');
  elLives.style.display = 'block';
  elLives.innerHTML = `Lives: <span>${gLives}</span>`;
  var elTimer = document.querySelector('.timer');
  elTimer.innerText = '';
  if (gLives === 0) {
    var elLivesSpan = document.querySelector('span');
    elLivesSpan.style.color = 'rgb(95, 207, 202)';
  }
}

function cellClickedMarkedVisuals() {
  var elHints = document.querySelector('.hints');
  elHints.style.cursor = 'pointer';
  var elUndo = document.querySelector('.undo');
  elUndo.style.display = 'block';
  var elManually = document.querySelector('.manually');
  elManually.style.display = 'none';
  var elLevels = document.querySelector('.levels');
  elLevels.style.display = 'none';
  var elProps = document.querySelector('.gameprops');
  elProps.style.cursor = 'pointer';
  gIsGameOn = true;
  if (!gIsTimerOn) startTimer();
}

function hintClicked(elHint) {
  if (gIsHintOn) return;
  if (gIsGameOn && gHintsLeft !== 0) {
    elHint.style.visibility = 'hidden';
    gIsHintOn = true;
  }
}

function userInputMinePos(i) {
  var mineI = +prompt(
    `Please Enter The Row Number (0-3) Mine Number ${i + 1} (empty input = 0)`
  );
  while (mineI < 0 || mineI > gLevel.SIZE - 1) {
    alert('Please Enter A Valid Number.');
    var mineI = +prompt(
      `Please Enter The Row Number (0-3) Mine Number ${i + 1} (empty input = 0)`
    );
  }
  var mineJ = +prompt(
    `Please Enter The Column Number (0-3) Mine Number ${
      i + 1
    } (empty input = 0)`
  );
  while (mineJ < 0 || mineJ > gLevel.SIZE - 1) {
    alert('Please Enter A Valid Number.');
    var mineJ = +prompt(
      `Please Enter The Column Number (0-3) Mine Number ${
        i + 1
      } (empty input = 0)`
    );
  }
  return { i: mineI, j: mineJ };
}

function restartGame() {
  gIsGameOn = false;
  clearInterval(gTimerInterval);
  var elTable = document.querySelector('table');
  elTable.style.display = 'none';
  var elHints = document.querySelector('.hints');
  elHints.style.cursor = 'default';
  var elUndo = document.querySelector('.undo');
  elUndo.style.display = 'none';
  var elSmiley = document.querySelector('.smiley');
  elSmiley.innerText = '😃';
  var elTimer = document.querySelector('.timer');
  elTimer.innerText = '';
  var elBoard = document.querySelector('.board');
  elBoard.innerHTML = '';
  var elAgain = document.querySelector('.again');
  elAgain.style.display = 'none';
  var elManually = document.querySelector('.manually');
  elManually.style.display = 'none';
  var elLevels = document.querySelector('.levels');
  elLevels.style.display = 'flex';
  var elProps = document.querySelector('.gameprops');
  elProps.style.display = 'none';
  elProps.style.cursor = 'default';
  var elEye1 = document.querySelector('.h7');
  elEye1.classList.remove('clicked');
  var elEye2 = document.querySelector('.h8');
  elEye2.classList.remove('clicked');
  var elEye3 = document.querySelector('.h9');
  elEye3.classList.remove('clicked');
  var elLives = document.querySelector('h2');
  elLives.style.display = 'none';
  var elHint1 = document.querySelector('h4');
  elHint1.classList.remove('clicked');
  var elHint2 = document.querySelector('h5');
  elHint2.classList.remove('clicked');
  var elHint3 = document.querySelector('h6');
  elHint3.classList.remove('clicked');
}

function setHints() {
  var elHint1 = document.querySelector('h4');
  var elHint2 = document.querySelector('h5');
  var elHint3 = document.querySelector('h6');
  switch (gHintsLeft) {
    case 1:
      elHint1.style.display = 'none';
      elHint2.style.display = 'block';
      elHint3.style.display = 'none';
      break;
    case 2:
      elHint1.style.display = 'block';
      elHint2.style.display = 'block';
      elHint3.style.display = 'none';
      break;
    case 3:
      elHint1.style.display = 'block';
      elHint2.style.display = 'block';
      elHint3.style.display = 'block';
  }
}

function setEyes() {
  var elEye1 = document.querySelector('.h7');
  var elEye2 = document.querySelector('.h8');
  var elEye3 = document.querySelector('.h9');
  switch (gEyesLeft) {
    case 1:
      elEye1.style.display = 'none';
      elEye2.style.display = 'block';
      elEye3.style.display = 'none';
      break;
    case 2:
      elEye1.style.display = 'block';
      elEye2.style.display = 'block';
      elEye3.style.display = 'none';
      break;
    case 3:
      elEye1.style.display = 'block';
      elEye2.style.display = 'block';
      elEye3.style.display = 'block';
  }
}

function gameOverVisuals() {
  var elAgain = document.querySelector('.again');
  elAgain.style.visibility = 'visible';
  var elUndo = document.querySelector('.undo');
  elUndo.style.display = 'none';
  var elProps = document.querySelector('.gameprops');
  elProps.style.color = 'rgb(167, 70, 70)';
  elProps.style.cursor = 'default';
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

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function livesNumColorChange() {
  if (gLives != 0) {
    var elLivesSpan = document.querySelector('span');
    elLivesSpan.style.color = 'rgb(167, 70, 70)';
  }
}

function revertCellColor(i, j) {
  var elCell = document.querySelector(`#cell-${i}-${j}`);
  elCell.classList.remove('mark');
}
