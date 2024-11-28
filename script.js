var internetFreedomScore = 90 // Adjust this from 0 to 100 (0 = fully obscured with a bar, 100 = fully visible)
var accessScore = 90 // Adjust this from 0 to 100 (0 = all characters hidden with a dot, 100 = fully visible)
var contentScore = 90 // Adjust this from 0 to 100 (0 = characters are blurred, 100 = fully visible)
var rightsScore = 90 // Adjust this from 0 to 100 (0 = essentially every mouse movement captured, 100 = no mouse movement is captured)

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
// Store the original text nodes content
let originalTextNodes = []

// Function to store the original text content from all text nodes inside the access-section
function storeOriginalTextNodes () {
  // Clear the array to re-store content if it's being reset
  originalTextNodes = []

  // Walk through the entire access-section and collect all text nodes
  const textNodes = []
  const walker = document.createTreeWalker(
    accessSection,
    NodeFilter.SHOW_TEXT,
    null,
    false
  )

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode)
  }

  // Store original text nodes and their parent elements
  textNodes.forEach(node => {
    originalTextNodes.push({
      node: node,
      originalText: node.textContent.trim()
    })
  })
}

// Function to apply the access effect based on access score
function applyAccessEffect () {
  console.log('Updating access effect...')

  // Loop through each stored text node and calculate the number of visible characters
  originalTextNodes.forEach(({ node, originalText }) => {
    const filteredText = originalText.replace(/\s/g, '') // Remove whitespaces for calculation

    // Calculate the number of visible characters based on the access score
    const visibleCharactersCount = Math.floor(
      (accessScore / 100) * filteredText.length
    )
    console.log(
      `Visible Characters: ${visibleCharactersCount}/${filteredText.length}`
    )

    // Generate random indices for visible characters
    const visibleIndicesSet = new Set()
    while (visibleIndicesSet.size < visibleCharactersCount) {
      visibleIndicesSet.add(Math.floor(Math.random() * filteredText.length))
    }

    // Rebuild the text node with bullets for non-visible characters
    let charIndex = 0
    let result = ''

    for (let i = 0; i < originalText.length; i++) {
      if (/\s/.test(originalText[i])) {
        // Preserve whitespace
        result += originalText[i]
      } else {
        // Replace character with bullet (•) if not in the visible set
        result += visibleIndicesSet.has(charIndex) ? originalText[i] : '•'
        charIndex++
      }
    }

    // Update the node's text content with the modified result
    node.textContent = result
  })
}

applyAccessEffect()

// === Limits on Content Effect ===
const blurOverlay = document.querySelector('.blur-overlay')
// Adjust the blur intensity based on the contentScore; the lower the contentScore, the higher the blur value, making the content harder to see
function applyBlurEffect () {
  console.log('Updating blur effect...')
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

var trails = []

// Function to clear the canvas and prepare for the new frame
function clearCanvas () {
  trails = [] // Reset stored trails
  ctx.clearRect(0, 0, canvas.width, canvas.height) // Clear the whole canvas
}

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
  trails.forEach(trail => {
    ctx.fillStyle = `rgba(0, 0, 0, ${trail.opacity})` // Use black color for trails, set opacity based on rights score
    ctx.beginPath()
    ctx.arc(trail.x, trail.y, 5, 0, Math.PI * 2) // Draw the trail as a circle
    ctx.fill()
  })
}

// Animation loop with requestAnimationFrame
function animate () {
  renderTrails() // Capture trails
  requestAnimationFrame(animate) // Call the next animation frame
}

// Start the animation loop
animate()

// Adjust canvas size and position on window resize
window.addEventListener('resize', resizeCanvas)

document.addEventListener('DOMContentLoaded', () => {
  const countrySelect = document.getElementById('country-select')
  const accessScoreDisplay = document.getElementById('access-score')
  const contentScoreDisplay = document.getElementById('content-score')
  const rightsScoreDisplay = document.getElementById('rights-score')
  const internetFreedomScoreDisplay = document.getElementById(
    'internet-freedom-score'
  )

  // Store the original text content for the access effect
  storeOriginalTextNodes()

  // Store all the country data from the JSON
  let countryData = {}

  // Load the JSON data
  fetch('data/2024_internet_freedom_scores.json') // 2024 Internet Freedom Scores JSON file path
    .then(response => response.json())
    .then(data => {
      // Populate country data
      data.forEach(row => {
        countryData[row.country] = row
      })

      // Populate the dropdown
      populateCountryDropdown(data)
    })

  // Populate the dropdown with countries
  function populateCountryDropdown (data) {
    data.forEach(row => {
      const option = document.createElement('option')
      option.value = row.country
      option.textContent = row.country
      countrySelect.appendChild(option)
    })
  }

  // Handle country selection
  countrySelect.addEventListener('change', event => {
    const selectedCountry = event.target.value
    const countryScores = countryData[selectedCountry]

    // Update the page based on country selection
    if (countryScores) {
      accessScoreDisplay.textContent = countryScores.accessScore
      accessScore = countryScores.accessScore
      contentScoreDisplay.textContent = countryScores.contentScore
      contentScore = countryScores.contentScore
      rightsScoreDisplay.textContent = countryScores.rightsScore
      rightsScore = countryScores.rightsScore
      internetFreedomScoreDisplay.textContent =
        countryScores.internetFreedomScore
      internetFreedomScore = countryScores.internetFreedomScore

      // Update visualizations based on selected country's scores
      updateVisualizations(countryScores)
    }
  })

  // Function to update visualizations
  function updateVisualizations (scores) {
    console.log('Updating visualizations with new scores:', scores)
    createBars()
    applyAccessEffect()
    applyBlurEffect()
    clearCanvas() // Clear canvas when a new country is selected
  }
})
