/**
 * Otodom.pl Site Adapter
 * Contains Otodom-specific logic for Fixly
 */

window.fixlyAdapter_otodom = {
  // List of domains this adapter applies to
  domains: ['otodom.pl'],

  // Selectors for finding Otodom message forms
  messageFormSelectors: [
    'textarea[placeholder*="wiadomość"]',
    'textarea[placeholder*="tesst"]',
    'textarea[name*="message"]',
    'textarea.form-control',
    'div[data-testid*="message"]',
    'div[data-testid*="textarea"]',
    '.form-control',
    '.message-input',
    '.contact-form textarea',
    'textarea'
  ],

  // Form field selectors to help identify the contact form
  formFieldSelectors: [
    '[placeholder*="Email"]',
    '[placeholder*="Imię"]',
    '[placeholder*="telefonu"]'
  ],

  /**
   * Apply Otodom-specific styling to button
   * @param {HTMLElement} button - The button element to style
   * @param {HTMLElement} element - The target element
   * @param {Object} rect - Element's bounding client rect
   */
  styleButton: function(button, element, rect) {
    // For otodom.pl, use a more aggressive approach to ensure visibility
    button.style.position = "absolute";
    button.style.top = `${rect.top + window.scrollY + 10}px`;
    button.style.left = `${rect.right + window.scrollX - 40}px`;
    button.style.display = "inline-flex"; // Force display
    button.style.backgroundColor = "#fff"; // Solid background for better visibility
    button.style.zIndex = "999999"; // Higher z-index
  },

  /**
   * Process Otodom-specific elements to add fix buttons
   * @param {Function} addFixButton - Function to add fix button to element
   */
  processElements: function(addFixButton) {
    // Try each selector for message forms
    this.messageFormSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        if (!element.hasAttribute("data-fixly-button-added")) {
          console.log('Fixly: Found otodom.pl textarea element', selector);
          addFixButton(element);
          
          // Force the button to be shown
          if (element._fixlyButton) {
            element._fixlyButton.style.display = "inline-flex";
          }
        }
      });
    });
    
    // Special handling for form fields
    this.findContactFormTextarea(addFixButton);
    
    // Look for iframes that might contain forms
    this.processIframes(addFixButton);
  },
  
  /**
   * Find textarea in contact form by looking near form fields
   * @param {Function} addFixButton - Function to add fix button
   */
  findContactFormTextarea: function(addFixButton) {
    this.formFieldSelectors.forEach(selector => {
      const formFields = document.querySelectorAll(selector);
      formFields.forEach(field => {
        // Look for parent form or container
        let container = field.closest('form');
        if (!container) {
          container = field.closest('div');
        }
        
        // If container found, look for textareas inside
        if (container) {
          container.querySelectorAll('textarea').forEach(textarea => {
            if (!textarea.hasAttribute("data-fixly-button-added")) {
              console.log('Fixly: Found otodom.pl textarea in form');
              addFixButton(textarea);
              
              // Force the button to be visible
              if (textarea._fixlyButton) {
                textarea._fixlyButton.style.display = "inline-flex";
              }
            }
          });
        }
      });
    });
  },
  
  /**
   * Process iframes that might contain message forms
   * @param {Function} addFixButton - Function to add fix button
   */
  processIframes: function(addFixButton) {
    document.querySelectorAll('iframe').forEach(iframe => {
      try {
        // Try to access iframe content - will fail if cross-origin
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        // Look for textarea elements inside iframe
        iframeDoc.querySelectorAll('textarea').forEach(element => {
          if (!element.hasAttribute("data-fixly-button-added")) {
            console.log('Fixly: Found textarea in iframe');
            addFixButton(element);
          }
        });
      } catch (e) {
        // Access denied to iframe (cross-origin)
        console.log('Fixly: Cannot access iframe content due to same-origin policy');
      }
    });
  }
}; 