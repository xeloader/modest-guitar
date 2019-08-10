function setColumns (columnCount) {
  var tabWrapper = document.querySelector('code > pre')
  tabWrapper.style.columnCount = columnCount
  tabWrapper.style.backgroundColor = 'blue'
}
chrome.storage.local.get('columnCount', (items) => {
  const columnCount = items.columnCount
  chrome.runtime.sendMessage({
    message: 'updateColumns',
    columnCount: items.columnCount
  })
  setColumns(columnCount)
})

var port = chrome.runtime.connect({ name: 'columns' })
port.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === 'setColumns') {
    chrome.storage.local.set({
      columnCount: request.columnCount
    })
    setColumns(request.columnCount)
  }
})
