const SELECTOR = {
  wrapper: 'main',
  tabs: 'code > pre'
}

const DEFAULT_STATE = {
  columnCount: 2,
  darkMode: false,
  truncText: false
}

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

function findParentWithCondition(elem, cb) {
  if (!elem || elem === document.documentElement) {
    return null;
  }

  if (cb(elem)) {
    return elem;
  }

  return findParentWithCondition(elem.parentNode, cb);
}

function getPaddedTab () {
  const tab = document.querySelector(SELECTOR.tabs)
  const paddedTab = findParentWithCondition(tab, (elem) => {
    const styles = window.getComputedStyle(elem)
    return styles.getPropertyValue('padding') !== '0px'
  })
  const fallback = tab
  return paddedTab || fallback
}

function getMainContent () {
  const tab = document.querySelector(SELECTOR.tabs)
  const mainContent = findParentWithCondition(tab, (elem) => {
    return elem.dataset.theme != null
  })
  const fallback = document.querySelector('main')
  return mainContent || fallback
}

function getCSSSelector (elem) {
  const classes = Array.from(elem.classList)
  const classSelector = classes.map(str => `.${str}`).join('')
  const tagSelector = elem.tagName.toLowerCase()
  return `${tagSelector}${classSelector}`
}

function setColumns (columnCount) {
  const tabWrapper = document.querySelector(SELECTOR.tabs)
  if (tabWrapper) {
    tabWrapper.style.columnCount = columnCount
  }
}

// send to the popup script
function sendToPopup (message) {
  chrome.runtime.sendMessage({
    to: 'popup',
    ...message
  })
}

function getColumns (cb) {
  chrome.storage.local.get('columnCount', (items) => {
    cb(items.columnCount || 2)
  })
}

function getWrapper () {
  const main = document.querySelector(SELECTOR.wrapper)
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

function createButton (title) {
  const $button = document.createElement('button')
  $button.classList.add('mg-button')

  const $title = document.createElement('span')
  $title.classList.add('mg-button-title')
  $title.textContent = title

  $button.appendChild($title)

  return $button
}

function setupStyles () {
  const $style = document.createElement('style')
  $style.id = "modest-guitar-color-scheme"

  const tabsWithPaddingSelector = getCSSSelector(getPaddedTab())
  const mainContentSelector = getCSSSelector(getMainContent())

  $style.textContent = `
    [data-dark-mode=true] ${mainContentSelector}:not([data-theme="dark"]) {
      filter: invert();
    }
    [data-dark-mode=true].mg-fullscreen ${mainContentSelector}:not([data-theme="dark"]) {
      filter: none;
    }
    [data-dark-mode=true].mg-fullscreen ${tabsWithPaddingSelector} {
      filter: invert();
    }
  `

  // fixes for ugs official themes
  $style.textContent += `
  [data-theme="dark"] .mg-button {
    color: white;
  }
  [data-theme="dark"] .mg-action-bar {
    border-color: rgba(255,255,255,0.2);
  }
  `

  $style.textContent += `
    .mg-fullscreen ${tabsWithPaddingSelector} {
      overflow-y: scroll;
      overflow-x: hidden;
      background-color: white;
      height: 100%;
      padding: 0.5rem 0.75rem;
    }
    .mg-exit-fullscreen {
      display: none;
    }
    .mg-enter-fullscreen {
      display: block;
    }
    .mg-fullscreen .mg-exit-fullscreen {
      display: block;
    }
    .mg-fullscreen .mg-enter-fullscreen {
      display: none;
    }
    .mg-fullscreen ${SELECTOR.tabs} {
      background-color: transparent !important;
    }
  `

  // disabled until chrome support
  $style.textContent += `
    /**
     * Ellipsis text overflowing columns
     * NOTE: Firefox only, doesnt work in Chrome.
     **/
    [data-trunc-text=true] ${SELECTOR.tabs},
    [data-trunc-text=true] ${SELECTOR.tabs} span {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `

  $style.textContent += `
    .mg-action-bar *:focus-visible {
      outline: 2px black solid;
      outline-offset: 2px;
      box-shadow: 0 0 0 5px white;
    }

    @keyframes mg-pulse {
      from {
        outline: 3px solid blue;
      }
      to {
        outline: 3px solid transparent;
      }
    }
    .mg-pulse {
      transition: outline 500ms linear;
      animation: mg-pulse infinite 500ms linear alternate-reverse;
    }
  `

  $style.textContent += `
    .mg-button {
      border: none;
      padding: 0.5rem;
      background-color: transparent;
      cursor: pointer;
      border: rgba(255,255,255,0.2);
      display: flex;
      gap: 0.5rem;
      font-family: inherit;
    }
    .mg-button .mg-icon {

    }
  `

  $style.textContent += `
    p.mg {
      margin: 0;
    }
    .mg-action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid rgba(0,0,0,0.25);
      margin-bottom: 0.5rem;
      margin-left: -0.5rem;
      padding-left: 0.5rem;
      gap: 0.5rem;
    }
    .mg-column-control {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  `

  document.body.append($style)
}

function createColumnControl () {
  const $slider = document.createElement('input')
  $slider.type = 'range'
  $slider.min = '1'
  $slider.max = '20'

  const $label = document.createElement('label')
  $label.classList.add('mg-column-control')
  $label.textContent = 'Columns'
  $label.appendChild($slider)

  return $label
}

function createFullscreenButton (title) {
  const $button = createButton(title)
  const $icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  $icon.setAttribute('width', 16)
  $icon.setAttribute('height', 16)
  $icon.setAttribute('viewBox', '0 0 16 16')
  $icon.setAttribute('fill', 'none')
  $icon.innerHTML = `
  <g>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.59109 8.82321C7.88398 9.11611 7.88398 9.59098 7.59109 9.88388L4.16431 13.3107L6.93943 13.3106C7.35365 13.3106 7.68945 13.6465 7.68945 14.0607C7.68946 14.4749 7.35368 14.8107 6.93946 14.8107L2.35366 14.8106C1.93945 14.8106 1.60366 14.4749 1.60366 14.0606L1.60364 9.47486C1.60365 9.06065 1.93943 8.72486 2.35364 8.72486C2.76786 8.72486 3.10365 9.06065 3.10364 9.47486L3.10365 12.25L6.53043 8.82321C6.82332 8.53032 7.2982 8.53032 7.59109 8.82321Z" fill="currentColor"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.82331 7.59101C8.53042 7.29812 8.53042 6.82324 8.82331 6.53035L12.2501 3.10357L9.47497 3.10357C9.06075 3.10357 8.72494 2.76777 8.72494 2.35355C8.72494 1.93933 9.06072 1.60355 9.47494 1.60355L14.0607 1.60358C14.475 1.60357 14.8107 1.93937 14.8107 2.35358L14.8108 6.93936C14.8108 7.35358 14.475 7.68936 14.0608 7.68936C13.6465 7.68936 13.3108 7.35358 13.3108 6.93936L13.3108 4.16423L9.88397 7.59101C9.59108 7.8839 9.1162 7.8839 8.82331 7.59101Z" fill="currentColor"/>
  </g>
    `
  $icon.classList.add('mg-icon')
  $button.prepend($icon)
  return $button
}

function handleExitFullscreen () {
  document.exitFullscreen()
}

function handleFullscreen () {
  getPaddedTab().requestFullscreen()
}

function setupControls () {
  const tabsWrapper = document.querySelector(SELECTOR.tabs)

  const actionWrapper = document.createElement('section')
  actionWrapper.classList.add('mg-action-bar')

  const $mgLogo = document.createElement('p')
  $mgLogo.classList.add('mg')
  $mgLogo.textContent = 'Modest Guitar'

  const enterFsWrapper = document.createElement('div')
  enterFsWrapper.classList.add('mg-enter-fullscreen')
  const fsButton = createFullscreenButton('Fullscreen')
  fsButton.addEventListener('click', handleFullscreen)
  enterFsWrapper.appendChild(fsButton)

  const exitFsWrapper = document.createElement('div')
  exitFsWrapper.classList.add('mg-exit-fullscreen')
  const exitFsButton = createFullscreenButton('Exit fullscreen')
  exitFsButton.addEventListener('click', handleExitFullscreen)
  exitFsWrapper.appendChild(exitFsButton)


  const columnControl = createColumnControl()
  const columnInput = columnControl.querySelector('input')
  columnInput.addEventListener('input', handleColumnSliderInput)

  actionWrapper.appendChild($mgLogo)
  actionWrapper.appendChild(columnControl)
  actionWrapper.appendChild(enterFsWrapper)
  actionWrapper.appendChild(exitFsWrapper)

  // add on top of tabs
  tabsWrapper.insertAdjacentElement("beforebegin", actionWrapper)

  return () => {
    fsButton.removeEventListener('click', handleFullscreen)
  }
}

function handleColumnSliderInput (event) {
  document.body.dataset.columnCount = event.target.value
}

// force every chord highlight to render no matter screen size
function fixChordHighlight () {
  const s = document.createElement('script');
  s.src = chrome.runtime.getURL('fixChordHighlight.js');
  document.documentElement.append(s);
}

async function setupState () {

  let prevColumnCount = null
  let prevDarkMode = null
  let prevTruncText = null

  const observer = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
      if (mutation.attributeName === 'data-column-count') {
        const columnCount = mutation.target.dataset.columnCount
        const slider = document.querySelector('.mg-column-control > input')
        slider.value = columnCount
        setColumns(columnCount)
        if (prevColumnCount !== columnCount) {
          sendToPopup({
            message: 'setColumns',
            columnCount
          })
          chrome.storage.local.set({ columnCount })
          prevColumnCount = columnCount
        }
      } else if (mutation.attributeName === 'data-dark-mode') {
        const darkMode = mutation.target.dataset.darkMode
        if (prevDarkMode !== darkMode) {
          sendToPopup({
            message: 'setDarkMode',
            darkMode
          })
          chrome.storage.local.set({ darkMode })
          prevDarkMode = darkMode
        }
      } else if (mutation.attributeName === 'data-trunc-text') {
        const truncText = mutation.target.dataset.truncText
        if (prevTruncText !== truncText) {
          sendToPopup({
            message: 'setTruncText',
            truncText
          })
          chrome.storage.local.set({ truncText })
          prevTruncText = truncText
        }
      }
    }
  })
  observer.observe(document.body, { attributes: true })

  // get stored preferences
  const userSettings = await chrome.storage.local.get(Object.keys(DEFAULT_STATE))

  // set preferences based on availabe info
  for (let [key, value] of Object.entries(DEFAULT_STATE)) {
    document.body.dataset[key] = userSettings[key] ?? value
  }
}

function setupListeners () {
  // incoming data
  chrome.runtime.onMessage.addListener((request) => {
    console.log('incoming', request)
    if (request.to !== 'cs') return
    if (request.message === 'setColumns') {
      document.body.dataset.columnCount = request.columnCount
    } else if (request.message === 'setDarkMode') {
      document.body.dataset.darkMode = request.darkMode
    } else if (request.message === 'setTruncText') {
      document.body.dataset.truncText = request.truncText
    } else if (request.message === 'getColumns') {
      sendToPopup({
        message: 'setColumns',
        columnCount: document.body.dataset.columnCount
      })
    } else if (request.message === 'getDarkMode') {
      sendToPopup({
        message: 'setDarkMode',
        darkMode: document.body.dataset.darkMode
      })
    } else if (request.message === 'getTruncText') {
      sendToPopup({
        message: 'setTruncText',
        truncText: document.body.dataset.truncText
      })
    } else if (request.message === 'focusFullscreenControl') {
      const elem = document.querySelector('.mg-action-bar')
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' })
      elem.classList.add('mg-pulse')
      setTimeout(() => elem.classList.remove('mg-pulse'), 3000)
    }
  })
  // fullscreen
  document.addEventListener('fullscreenchange', () => {
    const isFullscreen = document.fullscreenElement != null
    if (isFullscreen) {
      document.body.classList.add('mg-fullscreen')
    } else {
      document.body.classList.remove('mg-fullscreen')
    }
  })
}

async function init () {
  await waitForElm(SELECTOR.wrapper)
  await waitForElm(SELECTOR.tabs)

  setupStyles()
  setupControls()
  fixChordHighlight()
  maximizeViewport()

  await setupState()
  setupListeners()

}

init()
