const rangeElem = document.querySelector('#column-count')
const currentValElem = document.querySelector('#current-column-count')
const checkDarkMode = document.querySelector('#dark-mode')

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
  checkDarkMode.addEventListener('click', (event) => {
    sendToCS({
      message: 'setDarkMode',
      darkMode: event.target.checked
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
      }
    })
}

function init () {
  setupListeners()

  sendToCS({ message: 'getColumns' })
  sendToCS({ message: 'getDarkMode' })
}

init()