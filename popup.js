const rangeElem = document.querySelector('#column-count')
const currentValElem = document.querySelector('#current-column-count')
const checkDarkMode = document.querySelector('#dark-mode')
const checkTruncText = document.querySelector('#truncate-text')

const locateFullscreenBtn = document.querySelector('#locate-fullscreen-btn')

let darkMode = false

// send to content script
function sendToCS (message) {
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, {
        to: 'cs',
        ...message
      })
    })
  })
}

function setupListeners () {
  rangeElem.addEventListener('input', (event) => {
    sendToCS({
      message: 'setColumns',
      columnCount: event.target.value
    })
  })
  checkDarkMode.addEventListener('change', (event) => {
    sendToCS({
      message: 'setDarkMode',
      darkMode: event.target.checked
    })
  })

  checkTruncText.addEventListener('change', (event) => {
    sendToCS({
      message: 'setTruncText',
      truncText: event.target.checked
    })
  })

  locateFullscreenBtn.addEventListener('click', (event) => {
    event.preventDefault()
    sendToCS({
      message: 'focusFullscreenControl'
    })
  })

  chrome.runtime.onMessage.addListener((request) => {
      if (request.to !== 'popup') return
      console.log('incoming', request)
      if (request.message === 'setColumns') {
        const incomingColumnCount = Number(request.columnCount)
        currentValElem.textContent = incomingColumnCount
        rangeElem.value = incomingColumnCount
      } else if (request.message === 'setDarkMode') {
        const incomingDarkMode = request.darkMode === "true"
        console.log('incomingDarkMode', incomingDarkMode)
        if (darkMode !== incomingDarkMode) {
          checkDarkMode.checked = incomingDarkMode
          darkMode = incomingDarkMode
        }
      } else if (request.message === 'setTruncText') {
        const incomTruncText = request.truncText === 'true'
        checkTruncText.checked = incomTruncText
      }
    })
}

function init () {
  setupListeners()

  sendToCS({ message: 'getColumns' })
  sendToCS({ message: 'getDarkMode' })
  sendToCS({ message: 'getTruncText' })
}

init()