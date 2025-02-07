const wrapperSelector = 'main';
const tabsSelector = 'code > pre';
const tabsWithPaddingSelector = 'section.P8ReX'
const mainContentSelector = 'article.o2tA_.JJ8_m'

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

function setColumns(columnCount) {
  const tabWrapper = document.querySelector(tabsSelector)
  if (tabWrapper) {
    tabWrapper.style.columnCount = columnCount
  }
}

// send to the popup script
function sendToPopup(message) {
  chrome.runtime.sendMessage(message)
}

function getColumns(cb) {
  chrome.storage.local.get('columnCount', (items) => {
    cb(items.columnCount || 2)
  })
}

function getWrapper() {
  const main = document.querySelector(wrapperSelector)
  if (main) {
    return main.parentNode
  }
}

function maximizeViewport() {
  const wrapper = getWrapper()
  if (wrapper) {
    wrapper.style.maxWidth = 'unset'
  }
}

function createButton(title) {
  const $button = document.createElement('button')
  const buttonClasses = 'rPQkl mcpNL IxFbd gm3Af lTEpj qOnLe'.split(' ')
  $button.classList.add(...buttonClasses)

  const $title = document.createElement('span')
  const titleClasses = 'KNVWh _sWeD'.split(' ')
  $title.classList.add(...titleClasses)
  $title.textContent = title

  $button.appendChild($title)

  return $button
}

function setupStyles() {
  const $style = document.createElement('style')
  $style.id = "modest-guitar-color-scheme"
  $style.textContent = `  
    .mg-fullscreen.dark-mode { 
      ${tabsWithPaddingSelector} {
        filter: invert();
      }
    }  
     
    body.dark-mode{
      ${mainContentSelector} {
        filter: invert();
      }
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
    .mg-fullscreen ${tabsSelector} {
      background-color: transparent;
    }
  `

  $style.textContent += `
    p.mg {
      margin: 0;
    }
    .mg-action-bar {
      display: flex;
      align-items: center;
      border: 1px solid rgba(0,0,0,0.25);
      margin-bottom: 0.5rem;
      margin-left: -0.5rem;
      padding-left: 0.5rem;
      gap: 0.5rem;
    }
  `

  $style.textContent += `
    .material-symbols-outlined {
      font-size: 18px;
      font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 20
    }
  `
  document.body.append($style)

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode')
  }

  const iconImport = document.createElement('link')
  iconImport.setAttribute('rel', 'stylesheet')
  iconImport.setAttribute('href', 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=routine')

  document.head.appendChild(iconImport)
}

function createFullscreenButton(title) {
  const $button = createButton(title)
  const $icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  $icon.setAttribute('width', 16)
  $icon.setAttribute('height', 16)
  $icon.setAttribute('viewBox', '0 0 16 16')
  $icon.setAttribute('fill', 'none')
  $icon.innerHTML = `
  <g>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.59109 8.82321C7.88398 9.11611 7.88398 9.59098 7.59109 9.88388L4.16431 13.3107L6.93943 13.3106C7.35365 13.3106 7.68945 13.6465 7.68945 14.0607C7.68946 14.4749 7.35368 14.8107 6.93946 14.8107L2.35366 14.8106C1.93945 14.8106 1.60366 14.4749 1.60366 14.0606L1.60364 9.47486C1.60365 9.06065 1.93943 8.72486 2.35364 8.72486C2.76786 8.72486 3.10365 9.06065 3.10364 9.47486L3.10365 12.25L6.53043 8.82321C6.82332 8.53032 7.2982 8.53032 7.59109 8.82321Z" fill="black"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.82331 7.59101C8.53042 7.29812 8.53042 6.82324 8.82331 6.53035L12.2501 3.10357L9.47497 3.10357C9.06075 3.10357 8.72494 2.76777 8.72494 2.35355C8.72494 1.93933 9.06072 1.60355 9.47494 1.60355L14.0607 1.60358C14.475 1.60357 14.8107 1.93937 14.8107 2.35358L14.8108 6.93936C14.8108 7.35358 14.475 7.68936 14.0608 7.68936C13.6465 7.68936 13.3108 7.35358 13.3108 6.93936L13.3108 4.16423L9.88397 7.59101C9.59108 7.8839 9.1162 7.8839 8.82331 7.59101Z" fill="black"/>
  </g>
    `
  $icon.classList.add(...'is4YP iWDbw sTohX YEJsU'.split(' '))
  $button.prepend($icon)
  return $button
}

function createDarkModeTogglebutton(title) {
  const $button = createButton(title)
  const $icon = document.createElement('i')
  $icon.setAttribute('width', 16)
  $icon.setAttribute('height', 16)
  $icon.setAttribute('viewBox', '0 0 16 16')
  $icon.setAttribute('fill', 'none')
  $icon.innerHTML = `<span class="material-symbols-outlined">routine</span>`
  $icon.classList.add(...'is4YP iWDbw sTohX YEJsU'.split(' '))
  $button.prepend($icon)
  return $button
}

function handleDarkModeToggle() {
  document.body.classList.toggle('dark-mode')
}

function handleFullscreen() {
  const tabsWithPaddingWrapper = document.querySelector(tabsWithPaddingSelector)
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    tabsWithPaddingWrapper.requestFullscreen()
  }
}

function setupControls() {
  const tabsWrapper = document.querySelector(tabsSelector)

  const actionWrapper = document.createElement('section')
  actionWrapper.classList.add('mg-action-bar')

  const $mgLogo = document.createElement('p')
  $mgLogo.classList.add('mg')
  $mgLogo.textContent = 'Modest Guitar'
  actionWrapper.appendChild($mgLogo)

  const fsButton = createFullscreenButton('Fullscreen')
  actionWrapper.appendChild(fsButton)

  const darkModeToggleButton = createDarkModeTogglebutton('Toggle Dark Mode')
  actionWrapper.appendChild(darkModeToggleButton)

  // add on top of tabs
  tabsWrapper.insertAdjacentElement("beforebegin", actionWrapper)

  fsButton.addEventListener('click', handleFullscreen)

  darkModeToggleButton.addEventListener('click', handleDarkModeToggle)

  return () => {
    fsButton.removeEventListener('click', handleFullscreen)
    darkModeToggleButton.removeEventListener('click', handleDarkModeToggle)
  }
}

function fixChordHighlight() {
  // force every chord highlight to render no matter screen size
  const script = document.createElement('script');
  script.textContent = `window.innerHeight = 10_000;`;
  document.documentElement.appendChild(script);
  script.remove();
}

function setupListeners() {
  document.addEventListener('fullscreenchange', () => {
    const isFullscreen = document.fullscreenElement != null
    if (isFullscreen) {
      document.body.classList.add('mg-fullscreen')
    } else {
      document.body.classList.remove('mg-fullscreen')
    }
  })
}

async function init() {
  await waitForElm(wrapperSelector)
  await waitForElm(tabsSelector)

  setupStyles()
  fixChordHighlight()
  maximizeViewport()
  setupListeners()
  setupControls()
  getColumns((columnCount) => {
    setColumns(columnCount)
  })
}

init()

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
