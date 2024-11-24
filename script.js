const internetFreedomScore = 0 // Adjust this from 0 to 100 (0 = fully obscured, 100 = fully visible)

const introSection = document.getElementById('intro-section')

// Wrap text nodes in span elements for proper rect calculation
function wrapTextNodes () {
  const textNodes = []
  const walk = document.createTreeWalker(
    introSection,
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
wrapTextNodes() // Wrap text nodes in span elements before creating bars
createBars()

// Recalculate bars on window resize
window.addEventListener('resize', () => {
  wrapTextNodes() // Wrap text nodes again to handle any changes due to resizing
  createBars()
})
