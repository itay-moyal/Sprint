'use strict'

// Further Tasks Checklist
// First click is never a Mine - X
// Lives - V
// The Smiley button - V

// BONUSES Checklist
// Add support for HINTS - X
// Best Score - X
// Full Expand - Working but buggy, need to think about a fix
// Safe click - V
// Dark Mode - X
// Undo - X
// Manually positioned mines - X
// MEGA HINT - X
// MINE EXTERMINATOR - X

const MINE = '💣'
const FLAG = '🚩'

// isOn: true when game is on
// revealedCount: How many cells are revealed
// markedCount: How many cells are marked (with a flag)
// secsPassed: How many seconds passed

var gGame = {
  isOn: false,
  revealedCount: 0,
  markedCount: 0,
  secsPassed: null,
}
var gLevel = {
  SIZE: 4,
  MINES: 2,
}
var gBoard
var gStartTime = null
var gLives
var gStartGame
var gSafeCounter

// Starting / Restarting game
function init() {
  resetGameStats()
  resetDOM()

  gBoard = buildBoard(gLevel.SIZE)
  renderBoard(gBoard, '.board-container')

  clearInterval(gGame.secsPassed)
  // console.log('gBoard', gBoard)
}

// Sets all the stats to starting point
function resetGameStats() {
  gGame.isOn = true
  gStartGame = 0
  gGame.revealedCount = 0
  gGame.markedCount = 0
  gLives = 3
  gSafeCounter = 3
}

// Resets stats on DOM
function resetDOM() {
  var elCounter = document.querySelector('.safe-text span')
  var elLives = document.querySelector('.lives-count')
  var elRestart = document.querySelector('.restart')
  var elTimer = document.querySelector('.timer span')

  elCounter.innerText = gSafeCounter
  elLives.innerText = gLives
  elRestart.innerText = '😃'
  elTimer.innerText = '00 : 00'
}

// Model
function buildBoard(size) {
  // Builds the board
  // Set some mines
  // Call setMinesNegsCount()
  // Return the created board
  const board = []

  for (var i = 0; i < size; i++) {
    board.push([])

    for (var j = 0; j < size; j++) {
      board[i][j] = {
        minesAroundCount: 0,
        isRevealed: false,
        isMine: false,
        isMarked: false,
        gameElement: null,
      }
    }
  }
  return board
}

// DOM
function renderBoard(mat, selector) {
  var strHTML = '<table><tbody>'
  for (var i = 0; i < mat.length; i++) {
    strHTML += '<tr>'
    for (var j = 0; j < mat[0].length; j++) {
      const cell = mat[i][j]
      const className = getClassName(i, j)

      strHTML += `<td class="${className}"
      onclick="onCellClicked(this,${i},${j})" 
      oncontextmenu="onCellMarked(this,${i},${j});return false;">`
      //   if (cell.gameElement !== MINE) strHTML += cell.minesAroundCount
      // if (cell.gameElement === MINE) strHTML += 'X'
      strHTML += `</td>`
    }
    strHTML += '</tr>'
  }
  strHTML += '</tbody></table>'
  const elContainer = document.querySelector(selector)
  elContainer.innerHTML = strHTML
}

// Count mines around each cell
function mineCounter(rowIdx, colIdx, board) {
  var mineCount = 0
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= board.length) continue

    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= board[0].length) continue
      if (i === rowIdx && j === colIdx) continue
      if (board[i][j].gameElement === MINE) {
        mineCount++
      }
    }
  }
  return mineCount
}

// sets minesAroundCount in each cell
function setMinesNegsCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j]
      var counter = mineCounter(i, j, board)
      // console.log(counter)
      currCell.minesAroundCount = counter
    }
  }
}

// Placing mines randomly
function addMines(board) {
  var activeMines = 0
  while (activeMines < gLevel.MINES) {
    const location = getEmptyRandomLocation(board)
    if (!location) return
    const emptyCell = board[location.i][location.j]

    if (!emptyCell.isMine) {
      emptyCell.gameElement = MINE
      emptyCell.isMine = true
      activeMines++
    }
  }
  setMinesNegsCount(board)
}

// Gets empty random location
function getEmptyRandomLocation(board) {
  const emptyCells = []
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      var cell = board[i][j]
      if (cell.gameElement !== MINE && !cell.isRevealed) {
        emptyCells.push({ i, j })
        // console.log(emptyCells)
      }
    }
  }
  if (emptyCells.length === 0) return null
  const randIdx = getRandomIntInclusive(0, emptyCells.length - 1)
  return emptyCells[randIdx]
}

function onCellClicked(elCell, i, j) {
  if (!gGame.isOn) return
  gStartGame++
  if (gStartGame === 1) {
    // Mines do spawn after the first click but first click can still be a mine...
    // Couldn't think of a way to figure this out.
    addMines(gBoard)
    gStartTime = new Date()
    gGame.secsPassed = setInterval(gameTimer, 1000)
  }
  var currCell = gBoard[i][j]

  if (currCell.isMarked) return
  if (currCell.isRevealed) return

  if (currCell.gameElement === MINE) {
    gLives--
    var elLives = document.querySelector('.lives-count')
    elLives.innerText = gLives
    elCell.innerHTML = MINE

    setTimeout(() => {
      elCell.innerHTML = ''
      currCell.isRevealed = false
    }, 2000)

    if (gLives < 0) {
      elLives.innerText = 'No lives left, Game over.'
      gGame.isOn = false
      checkGameOver()
    }
    return
  }

  if (currCell.minesAroundCount === 0) {
    expandReveal(gBoard, elCell, i, j)
    checkGameOver()
  } else {
    gGame.revealedCount++
    elCell.classList.add('clicked')
    currCell.isRevealed = true
    elCell.innerText = currCell.minesAroundCount
  }
  checkGameOver()
  // console.log('gBoard', gBoard)
}

function onCellMarked(elCell, i, j) {
  if (!gGame.isOn) return

  var currCell = gBoard[i][j]

  if (currCell.isRevealed) return

  elCell.addEventListener('contextmenu', (ev) => {
    ev.preventDefault()
  })

  if (!currCell.isMarked) {
    currCell.isMarked = true
    elCell.innerHTML = FLAG
    if (currCell.isMine) {
      gGame.markedCount++
      checkGameOver()
    }
  } else {
    currCell.isMarked = false
    elCell.innerText = ''
    if (currCell.isMine) {
      gGame.markedCount--
    }
  }
}

// Checking if player won or lost
function checkGameOver() {
  //   console.log('gLevel.SIZE', gLevel.SIZE * gLevel.SIZE)
  var elRestart = document.querySelector('.restart')
  var cells = gLevel.SIZE ** 2 - gLevel.MINES
  //   console.log('cells', cells)

  if (gGame.revealedCount === cells && gGame.markedCount === gLevel.MINES) {
    elRestart.innerText = '🥳'
    gGame.isOn = false
    clearInterval(gGame.secsPassed)

    return
  }
  if (!gGame.isOn) {
    elRestart.innerText = '😞'
    clearInterval(gGame.secsPassed)
    return
  }
}

// Revealing cells around clicked cell
function expandReveal(board, elCell, i, j) {
  if (board[i][j].isRevealed) return

  //Taking care of current pos
  board[i][j].isRevealed = true
  elCell.innerText = board[i][j].minesAroundCount
  gGame.revealedCount++
  elCell.classList.add('clicked')
  // console.log(board[i][j], 'i', i, 'j', j)

  if (board[i][j].minesAroundCount === 0) {
    for (var x = i - 1; x <= i + 1; x++) {
      if (x < 0 || x >= board.length) continue

      for (var y = j - 1; y <= j + 1; y++) {
        if (y < 0 || y >= board[0].length) continue
        if (x === i && y == j) continue

        //Taking care of neighbors pos
        var neighborCell = board[x][y]
        var elNeighbor = document.querySelector(`.${getClassName(x, y)}`)

        if (!neighborCell.isRevealed) {
          // Doing the recursion thing,but it is currently bugged.
          // expandReveal(board, elNeighbor, x, y)

          // console.log(board[x][y], 'x', x, 'y', y)
          elNeighbor.classList.add('clicked')
          elNeighbor.innerText = neighborCell.minesAroundCount
          neighborCell.isRevealed = true
          gGame.revealedCount++
        }
      }
    }
  }
}

// Sets game level and mines as - EASY / MEDIUM / HARD
function onSetLevel(level, mines) {
  gLevel.SIZE = level
  gLevel.MINES = mines
  init()
}

// Calculate game time
function gameTimer() {
  const elTimer = document.querySelector('.timer span')

  const elapsedTime = Date.now() - gStartTime
  const seconds = String(Math.floor((elapsedTime % (1000 * 60)) / 1000))
  const minutes = String(
    Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60))
  )
  elTimer.innerHTML = `${minutes.padStart(2, 0)} : ${seconds.padStart(2, 0)}`
}

// Announcing the player about a safe to click cell
function safeClick() {
  if (!gGame.isOn) return
  var randomLocation = getEmptyRandomLocation(gBoard)

  if (gSafeCounter > 0) {
    var getCellClass = getClassName(randomLocation.i, randomLocation.j)
    var elCell = document.querySelector(`.${getCellClass}`)
    elCell.classList.add('safe')

    setTimeout(() => {
      elCell.classList.remove('safe')
    }, 1500)

    gSafeCounter--
    var elCounter = document.querySelector('.safe-text span')
    elCounter.innerHTML = gSafeCounter
    return
  }
}
function getRandomIntInclusive(min, max) {
  const minCeiled = Math.ceil(min)
  const maxFloored = Math.floor(max)
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled)
}
function getClassName(i, j) {
  return `cell-${i}-${j}`
}
