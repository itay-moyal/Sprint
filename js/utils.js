'use strict'

function renderBoard(mat, selector) {
  var strHTML = '<table><tbody>'
  for (var i = 0; i < mat.length; i++) {
    strHTML += '<tr>'
    for (var j = 0; j < mat[0].length; j++) {
      const cell = mat[i][j]
      const className = `cell cell-${i}-${j}`

      strHTML += `<td class="${className}">${cell}</td>`
    }
    strHTML += '</tr>'
  }
  strHTML += '</tbody></table>'

  const elContainer = document.querySelector(selector)
  elContainer.innerHTML = strHTML
}

function createMat(rows, cols) {
  const mat = []
  for (var i = 0; i < rows; i++) {
    const row = []
    for (var j = 0; j < cols; j++) {
      row.push('')
    }
    mat.push(row)
  }
  return mat
}

function getRandomIntInclusive(min, max) {
  const minCeiled = Math.ceil(min)
  const maxFloored = Math.floor(max)
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled)
}

function shuffle(items) {
  for (var i = items.length - 1; i > 0; i--) {
    const idx = Math.floor(Math.random() * (i + 1))
    const temp = items[i]
    items[i] = items[idx]
    items[idx] = temp
  }
}

function getFormatedTimePassed(timeDiff) {
  const seconds = Math.floor(timeDiff / 1000)
  const milliSeconds = (timeDiff - seconds * 1000 + '').padStart(2, '0')
  return `${(seconds + '').padStart(2, '0')} : ${milliSeconds}`
}

function getEmptyCells(board) {
  const emptyCells = []
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      if (!board[i][j].gameElement) emptyCells.push({ i, j })
    }
  }
  return emptyCells
}

function getRandomEmptyCell(board) {
  const emptyCells = getEmptyCells(board)
  if (!emptyCells.length) return null
  const idx = getRandomIntInclusive(0, emptyCells.length - 1)
  return emptyCells[idx]
}

function countNeighbors(mat, rowIdx, colIdx, targetValue) {
  var count = 0
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= mat.length) continue
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= mat[0].length) continue
      if (i === rowIdx && j === colIdx) continue
      if (mat[i][j] === targetValue) count++
    }
  }
  return count
}

function getClassName(position) {
  return `cell-${position.i}-${position.j}`
}

// location is an object like this - { i: 2, j: 7 }
function renderCell(location, value) {
  // Select the elCell and set the value
  const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
  elCell.innerHTML = value
}

// const cell = getRandomEmptyCell(board)
// renderCell(cell.i, cell.j, '💎')

function playSound(filePath) {
  const sound = new Audio(filePath)
  sound.play()
}

function getRandomColor() {
  const letters = '0123456789ABCDEF'
  var color = '#'

  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}
