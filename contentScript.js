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

function getWrapper () {
  const main = document.getElementsByTagName('main')
  if (main) {
    return main[0].parentNode
  }
}

function maximizeViewport () {
  const wrapper = getWrapper()
  if (wrapper) {
    wrapper.style.maxWidth = 'unset'
  }
}

maximizeViewport()

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
