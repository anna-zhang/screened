const maxInternetFreedomScore = 100 // Maximum Internet Freedom score
var internetFreedomScore = maxInternetFreedomScore // Adjust this from 0 to maxInternetFreedomScore (0 = fully obscured with a bar, maxInternetFreedomScore = fully visible); default to best score (no visualization)

const maxAccessScore = 25 // Maximum Obstacles to Access score
var accessScore = maxAccessScore // Adjust this from 0 to maxAccessScore (0 = all characters hidden with a dot, maxAccessScore = fully visible); default to best score (no visualization)

const maxContentScore = 35 // Maximum Limits on Content score
var contentScore = maxContentScore // Adjust this from 0 to maxContentScore (0 = characters are blurred, maxContentScore = fully visible); default to best score (no visualization)

const maxRightsScore = 40 // Maximum Violation of User Rights score
var rightsScore = maxRightsScore // Adjust this from 0 to maxRightsScore (0 = essentially every mouse movement captured, maxRightsScore = no mouse movement is captured); default to best score (no visualization)

let isVisualizationOn = false
let lastSelectedCountry = null
const toggleVisualizationCheckbox = document.getElementById(
  'toggle-visualization'
)
const toggleVisualizationContainer = document.getElementById(
  'visualization-toggle-container'
)
const toggleLabel = document.getElementById('toggle-label')
const controls = document.getElementById('controls')

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

      // Use just the font size
      const characterHeight = parseFloat(
        window.getComputedStyle(introSection).fontSize
      )

      // Calculate bar height based on internetFreedomScore
      const barHeight =
        internetFreedomScore === 0
          ? characterHeight
          : characterHeight *
            (1 - internetFreedomScore / maxInternetFreedomScore)

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
const visibilityState = {} // Store visibility indices for each country

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

  if (!lastSelectedCountry) {
    return
  }

  console.log('lastSelectedCountry: ', lastSelectedCountry)
  var visibleIndicesSet = visibilityState[lastSelectedCountry]

  console.log('visibleIndicesSet: ', visibleIndicesSet)

  if (!visibleIndicesSet) {
    visibilityState[lastSelectedCountry] = new Map() // Initialize as a Map
    // Loop through each stored text node and calculate the number of visible characters
    originalTextNodes.forEach(({ node, originalText }) => {
      const filteredText = originalText.replace(/\s/g, '') // Remove whitespaces for calculation

      // Calculate the number of visible characters based on the access score
      const visibleCharactersCount = Math.floor(
        (accessScore / maxAccessScore) * filteredText.length
      )
      console.log(
        `Visible Characters: ${visibleCharactersCount}/${filteredText.length}`
      )

      // Generate random indices for visible characters
      visibleIndicesSet = new Set()
      while (visibleIndicesSet.size < visibleCharactersCount) {
        visibleIndicesSet.add(Math.floor(Math.random() * filteredText.length))
      }

      console.log('visibleIndicesSet after generating: ', visibleIndicesSet)

      // Store visibility data for the country
      visibilityState[lastSelectedCountry].set(node, visibleIndicesSet)
    })
  }

  originalTextNodes.forEach(({ node, originalText }) => {
    // Rebuild the text node with bullets for non-visible characters
    let charIndex = 0
    let result = ''

    for (let i = 0; i < originalText.length; i++) {
      if (/\s/.test(originalText[i])) {
        // Preserve whitespace
        result += originalText[i]
      } else {
        // Replace character with bullet (•) if not in the visible set
        result += visibilityState[lastSelectedCountry].get(node).has(charIndex)
          ? originalText[i]
          : '•'
        charIndex++
      }
    }

    // Update the node's text content with the modified result
    node.textContent = result
  })
}

// Function to clear the effect and return the text to its original state when the visualization is turned off
function clearAccessEffect () {
  const textNodes = []

  const walk = document.createTreeWalker(
    accessSection,
    NodeFilter.SHOW_TEXT,
    null,
    false
  )

  while (walk.nextNode()) {
    const node = walk.currentNode

    if (!node.originalContent) {
      node.originalContent = node.textContent
    }

    textNodes.push(node)
  }

  textNodes.forEach(node => {
    // Restore the original text for each text node
    const originalText = node.originalContent || node.textContent
    node.textContent = originalText
  })
}

applyAccessEffect()

// === Limits on Content Effect ===
const blurOverlay = document.querySelector('.blur-overlay')
// Adjust the blur intensity based on the contentScore; the lower the contentScore, the higher the blur value, making the content harder to see
function applyBlurEffect () {
  console.log('Updating blur effect...')
  const maxBlur = 8 // Higher value = stronger blur
  const blurValue =
    ((maxContentScore - contentScore) / maxContentScore) * maxBlur
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

// Function to clear the canvas completely on country switch
function clearCanvas () {
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
  return 1 - score / maxRightsScore // Opacity decreases as score increases
}

// Event listener for tracking mouse movements
document.addEventListener('mousemove', event => {
  if (!isVisualizationOn) {
    // Visualization isn't on, so don't capture mouse movements
    return
  }

  if (isMouseInsideRightsSection(event)) {
    if (rightsScore == maxRightsScore) {
      // Don't capture mouse movement if the score is maxInternetFreedomScore
      return
    }

    const captureInterval = getCaptureInterval(rightsScore) // Get the current capture interval based on rights score
    const currentTime = Date.now() // Get the current time

    // Capture mouse position at the specified interval
    if (currentTime - lastCaptureTime >= captureInterval) {
      const rect = rightsSection.getBoundingClientRect()
      const trail = {
        x: event.clientX - rect.left, // Adjust position relative to section
        y: event.clientY - rect.top, // Adjust position relative to section
        opacity: getOpacity(rightsScore) // Opacity based on the rights score
      }

      ctx.fillStyle = `rgba(0, 0, 0, ${trail.opacity})` // Use black color for trails, set opacity based on rights score
      ctx.beginPath()
      ctx.arc(trail.x, trail.y, 5, 0, Math.PI * 2) // Draw the trail as a circle
      ctx.fill()
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

// Adjust canvas size and position on window resize
window.addEventListener('resize', resizeCanvas)

// === Handle visualization controls ===
const scoresSection = document.getElementById('visualization-container')

document.addEventListener('DOMContentLoaded', () => {
  const countrySelect = document.getElementById('country-select')
  const accessScoreDisplay = document.getElementById('access-score')
  const contentScoreDisplay = document.getElementById('content-score')
  const rightsScoreDisplay = document.getElementById('rights-score')
  const internetFreedomScoreDisplay = document.getElementById(
    'internet-freedom-score'
  )

  // Set up introduction / help dialog
  const closeDialogBtn = document.getElementById('close-dialog-btn')
  const questionBtn = document.getElementById('question-btn')
  const body = document.body

  body.classList.add('dialog-open') // Dialog is open on first entry, disable interactions and scroll

  // Function to open the dialog and disable interactions
  const openDialog = () => {
    dialog.style.display = 'flex'
    dialog.style.opacity = 1
    body.classList.add('dialog-open') // Disable interactions and scroll
  }

  // Function to close the dialog and enable interactions
  const closeDialog = () => {
    dialog.style.opacity = 0
    setTimeout(() => {
      dialog.style.display = 'none'
    }, 300) // Wait for the fade-out animation to complete
    body.classList.remove('dialog-open') // Enable interactions and scroll
  }

  // Close the dialog when the close button is clicked
  closeDialogBtn.addEventListener('click', closeDialog)

  // Open the dialog again when the question button is clicked
  questionBtn.addEventListener('click', openDialog)

  // Set up dragging functionality for the visualization controls container
  const draggableControlsElement = document.getElementById('controls-container')
  let isDragging = false
  let offsetX = 0
  let offsetY = 0

  // Helper function to ensure the container stays within the viewport
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

  // Dragging functionality
  draggableControlsElement.addEventListener('mousedown', event => {
    isDragging = true
    offsetX = event.clientX - draggableControlsElement.offsetLeft
    offsetY = event.clientY - draggableControlsElement.offsetTop
    draggableControlsElement.style.cursor = 'grabbing'
  })

  document.addEventListener('mousemove', event => {
    if (isDragging) {
      // Calculate the new position
      const x = event.clientX - offsetX
      const y = event.clientY - offsetY

      // Get the viewport dimensions
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Get the element's dimensions
      const elementWidth = draggableControlsElement.offsetWidth
      const elementHeight = draggableControlsElement.offsetHeight

      // Clamp the position within the viewport boundaries
      const clampedX = clamp(x, 0, viewportWidth - elementWidth)
      const clampedY = clamp(y, 0, viewportHeight - elementHeight)

      // Set the new position
      draggableControlsElement.style.left = `${clampedX}px`
      draggableControlsElement.style.top = `${clampedY}px`
    }
  })

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false
      draggableControlsElement.style.cursor = 'grab'
    }
  })

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
    lastSelectedCountry = event.target.value
    toggleVisualizationCheckbox.checked = true
    toggleVisualizationContainer.style.display = 'block'
    isVisualizationOn = true
    toggleLabel.textContent = 'Visualizations On' // Visualizations are turned on
    clearCanvas() // New country selected, so clear the canvas for the mouse trails
    canvas.style.display = 'block' // Show the mouse trails
    scoresSection.style.display = 'block' // Show the selected country's scores
    updateVisualizations()
  })

  // Function to update visualizations
  function updateVisualizations () {
    if (lastSelectedCountry) {
      const selectedCountryData = countryData[lastSelectedCountry]

      if (selectedCountryData) {
        accessScore = selectedCountryData.accessScore
        contentScore = selectedCountryData.contentScore
        rightsScore = selectedCountryData.rightsScore
        internetFreedomScore = selectedCountryData.internetFreedomScore

        // Update text and show it
        accessScoreDisplay.textContent = `${accessScore} / ${maxAccessScore}`
        contentScoreDisplay.textContent = `${contentScore} / ${maxContentScore}`
        rightsScoreDisplay.textContent = `${rightsScore} / ${maxRightsScore}`
        internetFreedomScoreDisplay.textContent = `${internetFreedomScore} / ${maxInternetFreedomScore}`
        scoresSection.style.display = 'block'
      }
      console.log(
        'Updating visualizations with new scores:',
        selectedCountryData
      )
    }

    createBars()
    applyAccessEffect()
    applyBlurEffect()
  }

  // Reset visualizations to "best scores" state
  function resetVisualizations () {
    accessScore = maxAccessScore
    contentScore = maxContentScore
    rightsScore = maxRightsScore
    internetFreedomScore = maxInternetFreedomScore

    // Remove the selected country's effect by re-creating the effect using the max scores, effectively turning off the visualization
    createBars()
    clearAccessEffect()
    applyBlurEffect()

    // No country selected
    scoresSection.style.display = 'hidden'
  }

  // Toggle visualization on or off
  function toggleVisualizations () {
    isVisualizationOn = toggleVisualizationCheckbox.checked

    if (isVisualizationOn) {
      toggleLabel.textContent = 'Visualizations On'
      canvas.style.display = 'block' // Show the mouse trails

      // Reapply the last selected country's data
      if (lastSelectedCountry) {
        updateVisualizations()
      }
    } else {
      toggleLabel.textContent = 'Visualizations Off'
      canvas.style.display = 'none' // Hide the mouse trails
      resetVisualizations() // Set it back to best scores state, i.e., no distortions
    }
  }

  // Add event listener for the toggle
  toggleVisualizationCheckbox.addEventListener('change', toggleVisualizations)
  resetVisualizations()
})
