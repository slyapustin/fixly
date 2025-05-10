// W3Schools site adapter
window.fixlyAdapter_w3schools = {
  // Domain identifiers for this adapter
  domains: ['w3schools.com'],
  
  // Custom element processor for W3Schools
  processElements: function(addFixButton) {
    // Only run on tryit pages
    if (!window.location.href.includes('tryit.asp')) return;
    
    // Special handling for W3Schools CodeMirror editor
    // First, find the result frame which contains the editor iframe
    const resultFrame = document.getElementById('iframeResult');
    if (!resultFrame) {
      // If we're inside the result frame already, look for textareas
      const textareas = document.querySelectorAll('textarea');
      textareas.forEach(el => {
        // Force the button to be visible since W3Schools textareas might not trigger normal detection
        addFixButton(el);
        if (el._fixlyButton) {
          el._fixlyButton.style.display = 'inline-flex';
        }
      });
      return;
    }
    
    // If we found the result frame, it means we're in the parent page
    // We need to find the editor element (usually a textarea with CodeMirror)
    const editorElement = document.querySelector('.CodeMirror textarea') || 
                          document.querySelector('#textareaCode') ||
                          document.querySelector('textarea');
    
    if (editorElement) {
      addFixButton(editorElement);
      if (editorElement._fixlyButton) {
        // Force the button to be visible and positioned properly
        editorElement._fixlyButton.style.display = 'inline-flex';
        editorElement._fixlyButton.style.position = 'absolute';
        editorElement._fixlyButton.style.zIndex = '999999';
        
        // Position at the top right of the editor
        const editorRect = editorElement.getBoundingClientRect();
        editorElement._fixlyButton.style.top = `${editorRect.top + window.scrollY + 10}px`;
        editorElement._fixlyButton.style.left = `${editorRect.right + window.scrollX - 40}px`;
      }
    }
  },
  
  // Custom button styling for W3Schools
  styleButton: function(button, element, rect) {
    button.style.position = "absolute";
    button.style.top = `${rect.top + window.scrollY + 5}px`;
    button.style.left = `${rect.right + window.scrollX - 35}px`;
    button.style.zIndex = "999999"; // Higher z-index to ensure visibility
    button.style.display = "inline-flex"; // Force display
    
    // Make the button more visible
    button.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
    button.style.boxShadow = "0 2px 5px rgba(0,0,0,0.4)"; // Stronger shadow
  }
}; 