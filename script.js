const internetFreedomScore = 0 // Adjust this from 0 to 100 (0 = fully obscured with a bar, 100 = fully visible)
const accessScore = 10 // Adjust this from 0 to 100 (0 = all characters hidden with a dot, 100 = fully visible)
const contentScore = 0 // Adjust this from 0 to 100 (0 = characters are blurred, 100 = fully visible)

// === Internet Freedom Visualization for Intro Section ===
const introSection = document.getElementById('intro-section')

// Wrap text nodes in span elements for proper rect calculation
function wrapTextNodes (element) {
  const textNodes = []
  const walk = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  )

  // Traverse the DOM to collect all text nodes
  while (walk.nextNode()) {
    textNodes.push(walk.currentNode)
  }

  // Wrap text nodes with span elements
  textNodes.forEach(node => {
    const span = document.createElement('span')
    node.parentNode.replaceChild(span, node)
    span.appendChild(node)
  })
}

// Create bars based on the freedom score
function createBars () {
  // Remove existing bars
  const existingBars = document.querySelectorAll('.line-bar')
  existingBars.forEach(bar => bar.remove())

  // Get all child elements (span elements) inside introSection
  const textNodes = introSection.querySelectorAll('span')

  // Calculate the bar height based on the internetFreedomScore
  const lineHeight = parseFloat(
    window.getComputedStyle(introSection).lineHeight
  )

  // Create bars for each line
  textNodes.forEach(node => {
    // Get bounding rect of each text node (span element)
    const rects = node.getClientRects()

    Array.from(rects).forEach(rect => {
      const lineBar = document.createElement('div')
      lineBar.classList.add('line-bar')

      // Use the full bounding box height of the text node
      const characterHeight = rect.height

      // Calculate bar height based on internetFreedomScore
      const barHeight =
        internetFreedomScore === 0
          ? characterHeight
          : characterHeight * (1 - internetFreedomScore / 100)

      // Position the bar over the text node's bounding box
      lineBar.style.width = `${rect.width}px`
      lineBar.style.height = `${barHeight}px`

      // If the internetFreedomScore is 0, fully cover the text by setting barHeight equal to characterHeight
      const topPosition =
        rect.top + (rect.height - barHeight) / 2 + window.scrollY // Center the bar vertically
      lineBar.style.left = `${rect.left}px`
      lineBar.style.top = `${topPosition}px`

      document.body.appendChild(lineBar)
    })
  })
}

// Initial render
wrapTextNodes(introSection) // Wrap text nodes in span elements before creating bars
createBars()

// Recalculate bars on window resize
window.addEventListener('resize', () => {
  wrapTextNodes(introSection)
  createBars()
})

// === Obstacles to Access Effect ===
const accessSection = document.getElementById('access-section')
function applyAccessEffect () {
  // Operate directly on all visible text nodes to leave the HTML tag structure (h2, p, etc.) intact
  function extractTextNodes (element) {
    const nodes = []
    const walk = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    )

    while (walk.nextNode()) {
      nodes.push(walk.currentNode)
    }

    return nodes
  }

  // Randomly selected characters are made visible; others are replaced by bullets (•)
  const textNodes = extractTextNodes(accessSection)
  const fullText = textNodes.map(node => node.textContent).join('')
  const filteredText = fullText.replace(/\s/g, '') // Exclude whitespaces

  const visibleCharactersCount = Math.floor(
    (accessScore / 100) * filteredText.length
  )
  const visibleIndices = new Set()

  while (visibleIndices.size < visibleCharactersCount) {
    visibleIndices.add(Math.floor(Math.random() * filteredText.length))
  }

  let charIndex = 0
  textNodes.forEach(node => {
    let result = ''

    for (let char of node.textContent) {
      if (/\s/.test(char)) {
        result += char // Preserve whitespace
      } else {
        result += visibleIndices.has(charIndex) ? char : '•'
        charIndex++
      }
    }

    node.textContent = result
  })
}

applyAccessEffect()

// === Limits on Content Effect ===
const blurOverlay = document.querySelector('.blur-overlay')
// Adjust the blur intensity based on the contentScore; the lower the contentScore, the higher the blur value, making the content harder to see
function applyBlurEffect () {
  const maxBlur = 8 // Higher value = stronger blur
  const blurValue = ((100 - contentScore) / 100) * maxBlur
  blurOverlay.style.filter = `blur(${blurValue}px)`
}

applyBlurEffect()
