/**
 * Utility functions for Fixly
 */

// Create a global object for Fixly utilities
window.fixlyUtils = {};

/**
 * Get normalized domain without www. prefix
 * @returns {string} Normalized domain
 */
window.fixlyUtils.getNormalizedDomain = function() {
  let domain = window.location.hostname;
  if (domain.startsWith('www.')) {
    domain = domain.substring(4);
  }
  return domain;
};

/**
 * Check if the extension is disabled for the current site
 * @param {Array} disabledSites - List of disabled sites
 * @returns {boolean} True if extension is disabled for current site
 */
window.fixlyUtils.isDisabledForCurrentSite = function(disabledSites) {
  const currentDomain = window.fixlyUtils.getNormalizedDomain();
  return disabledSites.includes(currentDomain);
};

/**
 * Apply fixed text to an element with appropriate handling
 * based on element type
 * @param {HTMLElement} element - Element to update
 * @param {string} fixedText - The corrected text
 */
window.fixlyUtils.applyFixedText = function(element, fixedText) {
  if (element.isContentEditable || element.getAttribute("contenteditable") === "true") {
    // For contenteditable elements
    element.focus();
    if (document.createRange && window.getSelection) {
      // Modern browsers
      const range = document.createRange();
      range.selectNodeContents(element);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      // Delete the current content
      document.execCommand('delete', false, null);

      // Insert the new content
      document.execCommand('insertText', false, fixedText);
    } else {
      // Fallback for older browsers
      element.innerText = fixedText;
    }

    // Dispatch input event to trigger any listeners
    const inputEvent = new Event('input', { bubbles: true });
    element.dispatchEvent(inputEvent);
  } else {
    // For regular inputs and textareas
    element.value = fixedText;

    // Trigger input event
    const inputEvent = new Event('input', { bubbles: true });
    element.dispatchEvent(inputEvent);
  }
};

/**
 * Get text content from an element
 * @param {HTMLElement} element - Element to get text from
 * @returns {string} The text content
 */
window.fixlyUtils.getElementText = function(element) {
  if (element.isContentEditable || element.getAttribute("contenteditable") === "true") {
    return element.innerText || element.textContent;
  } else {
    return element.value;
  }
};

/**
 * Clean up orphaned buttons
 */
window.fixlyUtils.cleanupOrphanedButtons = function() {
  const buttonClasses = ['.fixly-button', '.fixly-direct-button'];
  
  buttonClasses.forEach(buttonClass => {
    document.querySelectorAll(buttonClass).forEach(button => {
      // Skip buttons marked as persistent
      if (button.hasAttribute("data-fixly-persistent")) {
        return;
      }
      
      // Check if button is visible and has associated element
      const rect = button.getBoundingClientRect();
      
      // If button is not visible, remove it
      if (rect.width === 0 || rect.height === 0 ||
          rect.left < 0 || rect.top < 0 ||
          rect.right > window.innerWidth || rect.bottom > window.innerHeight) {
        button.remove();
        return;
      }
      
      // Check if there's an element with our data attribute near the button
      const elementsAtPoint = document.elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      const hasAssociatedElement = elementsAtPoint.some(el =>
        el.hasAttribute("data-fixly-button-added") ||
        el.hasAttribute("data-fixly-direct-button")
      );
      
      if (!hasAssociatedElement) {
        button.remove();
      }
    });
  });
}; 