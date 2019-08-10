const rangeElem = document.getElementById('column-count')
var currentValElem = document.getElementById('current-column-count')
rangeElem.oninput = updateRange

sendToCS({ message: 'getColumns' })

function updateRange (event) {
  setColumns(event.target.value)
}

// send to content script
function sendToCS (message) {
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, message)
    })
  })
}

function setColumns (count) {
  currentValElem.textContent = count
  rangeElem.value = count
  sendToCS({
    message: 'setColumns',
    columnCount: count
  })
}

chrome.runtime.onMessage.addListener(
  function (request) {
    if (request.message === 'updateColumns') {
      setColumns(request.columnCount)
    }
  })
