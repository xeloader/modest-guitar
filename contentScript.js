function setColumns (columnCount) {
  var tabWrapper = document.querySelector('code > pre')
  tabWrapper.style.columnCount = columnCount
}

// send to the popup script
function sendToPopup (message) {
  chrome.runtime.sendMessage(message)
}

function getColumns (cb) {
  chrome.storage.local.get('columnCount', (items) => {
    cb(items.columnCount || 2)
  })
}

getColumns((columnCount) => {
  setColumns(columnCount)
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === 'setColumns') {
    chrome.storage.local.set({
      columnCount: request.columnCount
    })
    setColumns(request.columnCount)
  } else if (request.message === 'getColumns') {
    getColumns((columnCount) => {
      sendToPopup({
        message: 'updateColumns',
        columnCount: columnCount
      })
    })
  }
})
