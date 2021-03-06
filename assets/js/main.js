const getEl = el => document.getElementById(el)
const setStyle = (el, prop, val) => el.style[prop] = val
const setAttr = (el, attr, val) => el.setAttribute(attr, val)
const addClass = (el, className) => el.classList.add(className)
const removeClass = (el, className) => el.classList.remove(className)
const resetStyles = el => el.removeAttribute('style')
const removeAllChildren = el => {
  while (el.hasChildNodes()) el.removeChild(el.lastChild)
}

const WRAPPER = getEl('wrapper'),
      PAPER = getEl('paper'),
      LETTERS = getEl('letters'),
      CURSOR = getEl('cursor')

let HAS_STARTED_TYPING = false,
    LAST_TYPE_TIMESTAMP = 0

const MIN_COL = 9,
      MAX_COL = (LETTERS.clientWidth / 10) - 2,
      MIN_ROW = 4,
      MAX_ROW = 34,
      LETTER_WIDTH = 10,
      LETTER_HEIGHT = 20,
      COLORS = {
        BLUE: 'rgb(3,169,244)',
        RED: 'rgb(239,83,80)',
        PURPLE: 'rgb(171,71,188)',
        GREEN: 'rgb(67,160,71)',
        YELLOW:' rgb(253,216,53)'
      }

const STATE = {
  range: 0.1,
  pos: {
    row: MIN_ROW,
    col: MIN_COL
  }
}

const getRandColor = () => {
  const rand = Math.floor((Math.random() * 5) + 1)
  switch(rand){
    case 1:
      return COLORS.BLUE
    case 2:
      return COLORS.RED
    case 3:
      return COLORS.PURPLE
    case 4:
      return COLORS.GREEN
    case 5:
      return COLORS.YELLOW
  }
}

const getRandPosOffScreen = () => {
  const lowX1 = 0 - (window.innerWidth * 0.3),
        highX1 = 0 - (window.innerWidth * 0.2),
        lowY1 = 0,
        highY1 = window.innerHeight,
        
        lowX2 = window.innerWidth * 1.2,
        highX2 = window.innerWidth * 1.3,
        lowY2 = 0,
        highY2 = window.innerHeight,
        
        lowX3 = 0,
        highX3 = window.innerWidth,
        lowY3 = 0 - (window.innerHeight * 0.3),
        highY3 = 0 - (window.innerHeight * 0.2),
        
        lowX4 = 0,
        highX4 = window.innerWidth,
        lowY4 = window.innerHeight * 1.2,
        highY4 = window.innerHeight * 1.3
  
  const rand = Math.floor((Math.random() * 4) + 1)
  
  let x = 0,
      y = 0
  
  switch(rand){
    case 1:
      x = Math.floor(Math.random() * (highX1 - lowX1 + 1)) + lowX1
      y = Math.floor(Math.random() * (highY1 - lowY1)) + lowY1
      break
    case 2:
      x = Math.floor(Math.random() * (highX2 - lowX2 + 1)) + lowX2
      y = Math.floor(Math.random() * (highY2 - lowY2)) + lowY2
      break
    case 3:
      x = Math.floor(Math.random() * (highX3 - lowX3 + 1)) + lowX3
      y = Math.floor(Math.random() * (highY3 - lowY3)) + lowY3
      break
    case 4:
      x = Math.floor(Math.random() * (highX4 - lowX4 + 1)) + lowX4
      y = Math.floor(Math.random() * (highY4 - lowY4)) + lowY4
      break
  }
  
  return { x, y }
}

const setLetterPos = (letter, x, y) => {
  setStyle(letter, 'left', x + 'px')
  setStyle(letter, 'top', y + 'px')
}

const setLetterColor = letter => {
  const color = getRandColor()
  setStyle(letter, 'color', color)
}

const createLetter = key => {
  const letter = document.createElement('div')
  letter.innerHTML = key
  setLetterColor(letter)
  addClass(letter, 'off-screen')
  addClass(letter, 'letter')
  return letter
}

const setInitialLetterPos = letter => {
  const pos = getRandPosOffScreen()
  setLetterPos(letter, pos.x, pos.y)
}
 
const isValidLetter = e => {
  return !e.ctrlKey 
    && e.key !== 'Enter'
    && !(e.key === ' ' && STATE.pos.col === MIN_COL)
}

const isEndOfPage = () => {
  return STATE.pos.row === MAX_ROW && STATE.pos.col === MAX_COL
}

const initializeLetter = key => {
  const letter = createLetter(key)
  setInitialLetterPos(letter)
  LETTERS.appendChild(letter)
  return letter
}

const bumpLetterPos = isUp => {
  if(isUp){
    if(STATE.pos.col < MAX_COL){
      STATE.pos.col = Math.min(STATE.pos.col + 1, MAX_COL)
    }
    else{
      STATE.pos.col = MIN_COL
      STATE.pos.row = Math.min(STATE.pos.row + 1, MAX_ROW)
    }
  }
  else{
    if(STATE.pos.col > MIN_COL){
      STATE.pos.col = Math.max(STATE.pos.col - 1, MIN_COL)
    }
    else{
      STATE.pos.col = MAX_COL
      STATE.pos.row = Math.max(STATE.pos.row - 1, MIN_ROW)
    }
  }
}

const bumpCursorPos = () => {
  const x = STATE.pos.col * LETTER_WIDTH + CURSOR.clientWidth,
        y = STATE.pos.row * LETTER_HEIGHT
  setLetterPos(CURSOR, x, y)
}

const determineFinalLetterPos = () => {
  let x = 0,
      y = 0
  if(STATE.pos.col <= MAX_COL){
    x = STATE.pos.col * LETTER_WIDTH
    y = STATE.pos.row * LETTER_HEIGHT
  }
  else{
    x = STATE.pos.col * LETTER_WIDTH
    y = (STATE.pos.row + 1) * LETTER_HEIGHT
  }
  
  bumpLetterPos(true)
  bumpCursorPos()
  
  return {x, y}
}

const setFinalLetterPos = letter => {
  const pos = determineFinalLetterPos()
  setLetterPos(letter, pos.x, pos.y)
}

const getLastLetter = () => {
  const letters = LETTERS.childNodes
  let letter = null
  for(let i = letters.length - 1; i >= 0; i--){
    if(!letters[i].dataset.removed){
      letter = letters[i]
      break
    }
  }
  return letter
}

const setLeavingLetterPos = letter => {
  const pos = getRandPosOffScreen()
  setLetterPos(letter, pos.x, pos.y)
  addClass(letter, 'off-screen')
}

const removeLetter = () => {
  const letter = getLastLetter(),
        color = getRandColor()
  if(letter === null) return 0
  LAST_TYPE_TIMESTAMP = moment()
  setStyle(letter, 'color', color)
  setLeavingLetterPos(letter)
  setAttr(letter, 'data-removed', true)
  bumpLetterPos(false)
  bumpCursorPos()
  setTimeout(() => {
    LETTERS.removeChild(letter)
  }, 500)
}

const handleAlternateKeys = e => {
  switch(e.keyCode){
    case 8: // Backspace
      removeLetter()
      break
    case 9: // Tab
      e.preventDefault()
      break
    case 13: // Enter
      break
  }
}

const typeLetter = key => {
  LAST_TYPE_TIMESTAMP = moment()
  const letter = initializeLetter(key)
  setFinalLetterPos(letter)
  setTimeout(() => {
    removeClass(letter, 'off-screen')
    setTimeout(() => setStyle(letter, 'color', 'black'), 500)
  }, 13)
}

let typeInterval = null
const typeSentence = sentence => {
  let i = 0
  typeInterval = setInterval(() => {
    typeLetter(sentence[i])
    if(i === sentence.length - 1) clearInterval(typeInterval)
    i++
  }, 200)
}

const onInitialType = () => {
  STATE.pos.row = MIN_ROW
  STATE.pos.col = MIN_COL
  removeAllChildren(LETTERS)
  clearInterval(typeInterval)
  HAS_STARTED_TYPING = true
}

const checkIfTyping = () => {
  const timeToLastType = moment() - LAST_TYPE_TIMESTAMP
  if(!PAPER.classList.contains('typing') && timeToLastType <= 300){
    addClass(PAPER, 'typing')
  }
  else if(PAPER.classList.contains('typing') && timeToLastType > 300){
    removeClass(PAPER, 'typing')
  }
}

window.onkeypress = e => {
  //if(!HAS_STARTED_TYPING) onInitialType()
 // if(!isEndOfPage() && isValidLetter(e)) typeLetter(e.key)
}

window.onkeydown = e => {
 // if(!HAS_STARTED_TYPING) onInitialType()
 // handleAlternateKeys(e) 
}

let mockSentence = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Faucibus nisl tincidunt eget nullam non nisi est sit amet. Et odio pellentesque diam volutpat commodo sed egestas egestas fringilla. Molestie at elementum eu facilisis sed odio morbi quis commodo. Odio pellentesque diam volutpat commodo sed egestas egestas. Erat velit scelerisque in dictum non consectetur a erat nam. Nec nam aliquam sem et tortor consequat. Sit amet venenatis urna cursus eget. Quis lectus nulla at volutpat diam. Cursus euismod quis viverra nibh. Morbi blandit cursus risus at ultrices mi.`

let sentence = `Durante muito tempo caminhei sozinho, e pra mim estava tudo bem, estava ok. 
   Mas, de repente, voc?? entrou na minha vida, e tudo mudou. Desde o dia que voc?? entrou em minha vida, nada ?? mais da mesma forma, nada ?? mais igual. 
Os dias tem sido melhores, eles fazem mais sentido.
A vida faz mais sentido, ela tem mais cor.

Temos muitas coisas a fazer, muitas coisas a viver, e eu quero voc?? do meu lado sempre. Sendo minha amiga,
minha parceira, minha namorada, sendo a mulher da minha vida
Amar ?? tamb??m se esfor??ar para que tudo d?? certo, e eu amo voc??!
\t\t\t\t\t\t
A vida fica mais bonita contigo`;


window.onload = () => {
  typeSentence(sentence)
  //setInterval(() => checkIfTyping(), 10)
}