const internetFreedomScore = 0 // Adjust this from 0 to 100 (0 = fully obscured with a bar, 100 = fully visible)
const accessScore = 10 // Adjust this from 0 to 100 (0 = all characters hidden with a dot, 100 = fully visible)
const contentScore = 0 // Adjust this from 0 to 100 (0 = characters are blurred, 100 = fully visible)
const rightsScore = 90 // Adjust this from 0 to 100 (0 = essentially every mouse movement captured, 100 = no mouse movement is captured)

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

// Effect C: Mouse trail based on rights score (only for the Violation of User Rights section)
const rightsSection = document.getElementById('rights-section')
const canvas = document.getElementById('mouse-trail')
const ctx = canvas.getContext('2d')

// Resize the canvas to match the rights section
function resizeCanvas () {
  const rect = rightsSection.getBoundingClientRect()

  // Resize the canvas to match the section
  canvas.width = rect.width
  canvas.height = rect.height
}

// Initial resize
resizeCanvas()

const trails = []

// Calculate the interval at which to capture the mouse movement based on the rights score
const captureInterval = Math.max(rightsScore * 50, 10) // Prevents the interval from being too low

let lastCaptureTime = 0

// Function to calculate capture interval based on rights score
function getCaptureInterval (score) {
  if (score >= 70) {
    return Math.max(10, score * 15) // Ensures interval doesn't go below 10ms
  } else if (score >= 40) {
    return Math.max(10, score * 12) // Ensures interval doesn't go below 10ms
  } else {
    return Math.max(10, score * 10) // Ensures interval doesn't go below 10ms
  }
}

// Function to calculate opacity based on rights score (linear scaling)
function getOpacity (score) {
  return 1 - score / 100.0 // Opacity decreases as score increases
}

// Event listener for tracking mouse movements
document.addEventListener('mousemove', event => {
  if (isMouseInsideRightsSection(event)) {
    if (rightsScore == 100) {
      // Don't capture mouse movement if the score is 100
      return
    }

    const captureInterval = getCaptureInterval(rightsScore) // Get the current capture interval based on rights score
    const currentTime = Date.now() // Get the current time

    // Capture mouse position at the specified interval
    if (currentTime - lastCaptureTime >= captureInterval) {
      const rect = rightsSection.getBoundingClientRect()
      trails.push({
        x: event.clientX - rect.left, // Adjust position relative to section
        y: event.clientY - rect.top, // Adjust position relative to section
        opacity: getOpacity(rightsScore) // Opacity based on the rights score
      })
      lastCaptureTime = currentTime
    }
  }
})

// Check if the mouse is inside the bounds of the rights section
function isMouseInsideRightsSection (event) {
  const rect = rightsSection.getBoundingClientRect()
  const mouseX = event.clientX
  const mouseY = event.clientY

  return (
    mouseX >= rect.left &&
    mouseX <= rect.right &&
    mouseY >= rect.top &&
    mouseY <= rect.bottom
  )
}

// Render the mouse trails on the canvas
function renderTrails () {
  ctx.clearRect(0, 0, canvas.width, canvas.height) // Clear the canvas before drawing new trails
  trails.forEach(trail => {
    ctx.fillStyle = `rgba(0, 0, 0, ${trail.opacity})` // Use black color for trails, set opacity based on rights score
    ctx.beginPath()
    ctx.arc(trail.x, trail.y, 5, 0, Math.PI * 2) // Draw the trail as a circle
    ctx.fill()
  })
  requestAnimationFrame(renderTrails) // Request the next animation frame
}

renderTrails() // Start rendering the trails

// Adjust canvas size and position on window resize
window.addEventListener('resize', resizeCanvas)
