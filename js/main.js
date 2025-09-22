'use strict'

const MINE = '💣'
const FLAG = '🚩'

// Holds the current game state:

// isOn: true when game is on
// revealedCount: How many cells are revealed
// markedCount: How many cells are marked (with a flag)
// secsPassed: How many seconds passed

var gGame = {
  isOn: false,
  revealedCount: 0,
  markedCount: 0,
  secsPassed: 0,
}
// This is an object by which the board size is set
// (in this case: 4x4 board and how  many mines to place)
var gLevel = {
  SIZE: 4,
  MINES: 2,
}
var gBoard
var gLives

function init() {
  gGame.revealedCount = 0
  gGame.markedCount = 0
  var elRestart = document.querySelector('.restart')
  elRestart.innerHTML = '😃'
  gGame.isOn = true
  gBoard = buildBoard(gLevel.SIZE)
  renderBoard(gBoard, '.board-container')
}

function buildBoard(size) {
  //     Builds the board
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
  addMines(board)
  setMinesNegsCount(board)
  return board
}

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
      if (cell.gameElement === MINE) strHTML += MINE
      strHTML += `</td>`
    }
    strHTML += '</tr>'
  }
  strHTML += '</tbody></table>'

  const elContainer = document.querySelector(selector)
  elContainer.innerHTML = strHTML
}

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

function setMinesNegsCount(board) {
  //     Count mines around each cell
  // and set the cell's
  // minesAroundCount.

  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j]
      var counter = mineCounter(i, j, board)

      //   console.log(counter)
      currCell.minesAroundCount = counter
    }
  }
  return counter
}

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

function getEmptyRandomLocation(board) {
  const emptyCells = []
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      if (board[i][j].gameElement !== MINE) {
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
  var currCell = gBoard[i][j]

  if (currCell.isMarked) return
  if (currCell.isRevealed) return

  if (currCell.gameElement === MINE) {
    elCell.innerHTML = currCell.gameElement
    gGame.isOn = false
    gGame.revealedCount++
    checkGameOver()
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
}

function onCellMarked(elCell, i, j) {
  //     Called when a cell is right-
  // clicked
  // See how you can hide the context
  // menu on right click
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

function checkGameOver() {
  //   console.log('gLevel.SIZE', gLevel.SIZE * gLevel.SIZE)
  var elRestart = document.querySelector('.restart')
  var cells = gLevel.SIZE ** 2 - gLevel.MINES
  //   console.log('cells', cells)

  if (gGame.revealedCount === cells && gGame.markedCount === gLevel.MINES) {
    elRestart.innerText = '🥳'
    gGame.isOn = false
    return
  }
  if (!gGame.isOn) {
    elRestart.innerText = '😞'
    return
  }
}

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

function getClassName(i, j) {
  return `cell-${i}-${j}`
}

function onSetLevel(level, mines) {
  gLevel.SIZE = level
  gLevel.MINES = mines
  init()
}

function getRandomIntInclusive(min, max) {
  const minCeiled = Math.ceil(min)
  const maxFloored = Math.floor(max)
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled)
}
