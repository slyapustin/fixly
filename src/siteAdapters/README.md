# Fixly Site Adapters

This directory contains site-specific adapters for the Fixly extension. Each adapter handles the unique requirements and nuances of a specific website to ensure Fixly functions correctly.

## Adding Support for a New Website

To add support for a new website:

1. Create a new file named `[siteName]Adapter.js` in this directory
2. Copy the template from `baseAdapter.js` as a starting point
3. Implement the required methods for your website
4. Register your adapter in `index.js`

## Adapter Structure

Each adapter must conform to this structure:

```javascript
const mySiteAdapter = {
  // List of domains this adapter applies to (without www.)
  domains: ['example.com'],

  // Apply site-specific styling to button
  styleButton: function(button, element, rect) {
    // Custom styling for your site
  },

  // Process site-specific elements to add fix buttons
  processElements: function(addFixButton) {
    // Find and process elements specific to your site
  },
  
  // Optional - Handle text fixing for site elements
  applyFixedText: function(element, fixedText) {
    // Special handling for applying fixed text if needed
  }
};

export default mySiteAdapter;
```

## Example Implementation

Here's a simplified example for adding support for a new website:

```javascript
const exampleAdapter = {
  domains: ['example.com'],
  
  styleButton: function(button, element, rect) {
    button.style.fontSize = "22px";
    button.style.position = "absolute";
    button.style.top = `${rect.top + window.scrollY + 10}px`;
    button.style.left = `${rect.right + window.scrollX - 40}px`;
  },
  
  processElements: function(addFixButton) {
    // Find message composer using site-specific selectors
    const messageEditors = [
      '.site-message-editor',
      '[data-role="editor"]'
    ];
    
    messageEditors.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        if (!element.hasAttribute("data-fixly-button-added")) {
          addFixButton(element);
        }
      });
    });
  }
};

export default exampleAdapter;
```

## Testing Your Adapter

Before submitting a pull request:

1. Test your adapter on the target website in different scenarios
2. Ensure buttons appear correctly and text fixing works
3. Check for any conflicts with existing functionality
4. Verify that the site loads properly with your adapter enabled

## Contributing

Please submit your site adapters as pull requests to the main repository. Make sure to include:

1. A clear description of the website you're adding support for
2. Any special considerations or limitations of your implementation
3. Screenshots demonstrating the functionality if possible 