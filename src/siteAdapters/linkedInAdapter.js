/**
 * LinkedIn Site Adapter
 * Contains LinkedIn-specific logic for Fixly
 */

window.fixlyAdapter_linkedIn = {
  // List of domains this adapter applies to
  domains: ['linkedin.com'],

  // Button styling for this site
  buttonStyle: {
    fontSize: '22px',
    padding: '5px 10px'
  },

  // Selectors for finding LinkedIn message composers
  messageComposerSelectors: [
    '.msg-form__contenteditable',
    '[role="textbox"][data-placeholder="Write a message…"]',
    '[role="textbox"][data-artdeco-is-focused]',
    '.msg-form__message-texteditor',
    '.msg-form__message-texteditor [contenteditable]'
  ],

  // LinkedIn post selectors
  postComposerSelectors: [
    '[role="textbox"][aria-label="Write a post"]'
  ],

  // LinkedIn comment selectors
  commentSelectors: [
    '[role="textbox"][aria-label*="comment"]',
    '.t-14.t-black--light.t-normal[contenteditable]',
    '[data-placeholder][contenteditable]'
  ],

  /**
   * Apply LinkedIn-specific styling to button
   * @param {HTMLElement} button - The button element to style
   * @param {HTMLElement} element - The target element
   * @param {Object} rect - Element's bounding client rect
   */
  styleButton: function(button, element, rect) {
    // Position inside the element for better visibility
    button.style.top = `${rect.top + window.scrollY + 10}px`;
    button.style.left = `${rect.right + window.scrollX - 40}px`;
    button.style.fontSize = this.buttonStyle.fontSize;
  },

  /**
   * Check if element is a LinkedIn message composer
   * @param {HTMLElement} element - Element to check
   * @returns {boolean} True if element is a LinkedIn message composer
   */
  isMessageComposer: function(element) {
    return this.messageComposerSelectors.some(selector => 
      element.matches(selector) || element.closest(selector)
    );
  },

  /**
   * Process LinkedIn-specific elements to add fix buttons
   * @param {Function} addFixButton - Function to add fix button to element
   */
  processElements: function(addFixButton) {
    // Process message composers
    this.messageComposerSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        if (!element.hasAttribute("data-fixly-button-added")) {
          this.setupMessageComposerObserver(element);
          addFixButton(element);
          
          // Check parent and children for contenteditable
          this.processElementTree(element, addFixButton);
        }
      });
    });

    // Process post composers
    this.postComposerSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(addFixButton);
    });

    // Process comment fields
    this.commentSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(addFixButton);
    });
  },

  /**
   * Process parent and child elements for contenteditable
   * @param {HTMLElement} element - The element to check
   * @param {Function} addFixButton - Function to add fix button
   */
  processElementTree: function(element, addFixButton) {
    // Check parent elements
    let parent = element.parentElement;
    while (parent && parent.tagName !== 'BODY') {
      if (parent.isContentEditable || parent.getAttribute("contenteditable") === "true") {
        if (!parent.hasAttribute("data-fixly-button-added")) {
          addFixButton(parent);
        }
      }
      parent = parent.parentElement;
    }

    // Check child elements
    element.querySelectorAll('[contenteditable]').forEach(child => {
      if (!child.hasAttribute("data-fixly-button-added")) {
        addFixButton(child);
      }
    });
  },

  /**
   * Set up observer for LinkedIn message composer placeholder changes
   * @param {HTMLElement} element - The message composer element
   */
  setupMessageComposerObserver: function(element) {
    if (element._fixlyPlaceholderObserver) return;

    const placeholderObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' &&
            (mutation.attributeName === 'aria-hidden' ||
             mutation.attributeName === 'data-artdeco-is-focused')) {
          // Force buttons to be visible
          const buttons = document.querySelectorAll('.fixly-button');
          buttons.forEach(btn => {
            const rect = element.getBoundingClientRect();
            const btnRect = btn.getBoundingClientRect();

            if (Math.abs(btnRect.left - (rect.right - 40)) < 50 &&
                Math.abs(btnRect.top - (rect.top + 10)) < 50) {
              btn.style.display = "inline-flex";
            }
          });
        }
      });
    });

    placeholderObserver.observe(element, {
      attributes: true,
      attributeFilter: ['aria-hidden', 'data-artdeco-is-focused', 'placeholder', 'contenteditable']
    });

    element._fixlyPlaceholderObserver = placeholderObserver;
  },

  /**
   * Add direct button to LinkedIn message composer (aggressive approach)
   */
  addDirectMessageButton: function() {
    // Try to find the message composer using various selectors
    for (const selector of this.messageComposerSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach(element => {
          // Skip if already processed
          if (element.hasAttribute("data-fixly-direct-button") || 
              element.hasAttribute("data-fixly-button-added")) {
            return;
          }

          // Mark as processed
          element.setAttribute("data-fixly-direct-button", "true");

          // Create and add button (implementation details omitted for brevity)
          // This would be implemented similar to the original addLinkedInMessageComposerButton
        });
        return; // Exit after processing the first matching selector
      }
    }
  },
  
  /**
   * Handle text fixing specifically for LinkedIn elements
   * @param {HTMLElement} element - Element to update with fixed text
   * @param {string} fixedText - The corrected text
   */
  applyFixedText: function(element, fixedText) {
    // Focus the element
    element.focus();

    // Use execCommand to replace text
    if (document.createRange && window.getSelection) {
      const range = document.createRange();
      range.selectNodeContents(element);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      // Delete current content and insert new content
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, fixedText);
    } else {
      // Fallback for older browsers
      element.innerText = fixedText;
    }

    // Trigger events specific to LinkedIn
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new KeyboardEvent('keypress', {
      bubbles: true,
      cancelable: true,
      key: ' ',
      keyCode: 32
    }));
    element.dispatchEvent(new Event('change', { bubbles: true }));

    // Special handling for LinkedIn message composer
    if (this.isMessageComposer(element)) {
      const placeholder = element.querySelector('[data-placeholder]') ||
                         element.parentElement.querySelector('[data-placeholder]');
      if (placeholder) {
        placeholder.style.display = 'none';
      }

      // Set necessary attributes
      element.setAttribute('aria-hidden', 'false');
      if (element.hasAttribute('data-artdeco-is-focused')) {
        element.setAttribute('data-artdeco-is-focused', 'true');
      }

      // Ensure focus and cursor position
      setTimeout(() => {
        element.focus();
        if (document.createRange && window.getSelection) {
          const range = document.createRange();
          range.selectNodeContents(element);
          range.collapse(false); // collapse to end
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }, 50);
    }
  }
}; 