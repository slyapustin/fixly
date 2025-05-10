/**
 * Fixly Base Site Adapter
 * Template for creating new site adapters
 * 
 * To create a new site adapter:
 * 1. Copy this file and rename it to [sitename]Adapter.js
 * 2. Implement the required methods
 * 3. Import and register your adapter in siteAdapters/index.js
 */

const baseAdapter = {
  /**
   * List of domains this adapter applies to (without www.)
   * Examples: ['example.com', 'subdomain.example.org']
   */
  domains: [],

  /**
   * Apply site-specific styling to button
   * @param {HTMLElement} button - The button element to style
   * @param {HTMLElement} element - The target element
   * @param {Object} rect - Element's bounding client rect
   */
  styleButton: function(button, element, rect) {
    // Implement site-specific button styling here
    // Example:
    // button.style.fontSize = "22px";
    // button.style.position = "absolute";
    // button.style.top = `${rect.top + window.scrollY + 10}px`;
    // button.style.left = `${rect.right + window.scrollX - 40}px`;
  },

  /**
   * Process site-specific elements to add fix buttons
   * This is called periodically to find elements
   * @param {Function} addFixButton - Function to add fix button to element
   */
  processElements: function(addFixButton) {
    // Implement to find and process site-specific elements
    // Example:
    // const selectors = ['.editor', '.text-area'];
    // selectors.forEach(selector => {
    //   document.querySelectorAll(selector).forEach(element => {
    //     if (!element.hasAttribute("data-fixly-button-added")) {
    //       addFixButton(element);
    //     }
    //   });
    // });
  },
  
  /**
   * Handle text fixing specifically for this site's elements
   * Optional - implement if site needs special handling
   * @param {HTMLElement} element - Element to update with fixed text
   * @param {string} fixedText - The corrected text
   */
  applyFixedText: function(element, fixedText) {
    // Implement site-specific text handling here
    // Default implementation will be used if not provided
    
    // Example:
    // if (element.isContentEditable) {
    //   // Special handling for contenteditable elements
    //   element.focus();
    //   if (document.createRange && window.getSelection) {
    //     const range = document.createRange();
    //     range.selectNodeContents(element);
    //     const selection = window.getSelection();
    //     selection.removeAllRanges();
    //     selection.addRange(range);
    //     document.execCommand('delete', false, null);
    //     document.execCommand('insertText', false, fixedText);
    //   } else {
    //     element.innerText = fixedText;
    //   }
    // } else {
    //   element.value = fixedText;
    // }
    // 
    // // Trigger events
    // element.dispatchEvent(new Event('input', { bubbles: true }));
  }
};

export default baseAdapter; 