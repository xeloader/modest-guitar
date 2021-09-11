const wrapperSelector = 'main';
const tabsSelector = 'code > pre';

function waitForElm(selector) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector))
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector))
        observer.disconnect()
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  })
}

function setColumns (columnCount) {
  const tabWrapper = document.querySelector(tabsSelector)
  if (tabWrapper) {
    tabWrapper.style.columnCount = columnCount
  }
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
  const main = document.querySelector(wrapperSelector)
  if (main) {
    return main.parentNode
  }
}

function maximizeViewport () {
  const wrapper = getWrapper()
  if (wrapper) {
    wrapper.style.maxWidth = 'unset'
  }
}

Promise.all([
  waitForElm(wrapperSelector),
  waitForElm(tabsSelector)
]).then(() => {
  maximizeViewport()
  
  getColumns((columnCount) => {
    setColumns(columnCount)
  })
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
