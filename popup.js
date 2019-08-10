const rangeElem = document.getElementById('column-count')
var currentValElem = document.getElementById('current-column-count')
rangeElem.oninput = updateRange
setColumns(3)

function updateRange (event) {
  setColumns(event.target.value)
}

function setColumns (count) {
  currentValElem.textContent = count
  rangeElem.value = count
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var port = chrome.tabs.connect(tabs[0].id, { name: 'columns' })
    port.runtime.sendMessage({
      message: 'setColumns',
      columnCount: count
    })
  })
}

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  var port = chrome.tabs.connect(tabs[0].id, { name: 'columns' })
  port.onMessage.addListener(
    function (request, sender, sendResponse) {
      if (request.message === 'updateColumns') {
        setColumns(request.columnCount)
      }
    })
})
