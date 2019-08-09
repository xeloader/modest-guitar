const rangeElem = document.getElementById('column-count')
var currentValElem = document.getElementById('current-column-count')
setRangeValue()
rangeElem.oninput = setRangeValue

function setRangeValue () {
  currentValElem.textContent = rangeElem.value
}
