/**
 * Site Adapters Registry - Manages website-specific implementations
 */

// Create a global object for Fixly adapters
window.fixlyAdapters = {};

// Registry of all site adapters
const siteAdapters = [];

// Initialize adapters from global objects
function initializeAdapters() {
  // LinkedIn adapter
  if (window.fixlyAdapter_linkedIn && !siteAdapters.includes(window.fixlyAdapter_linkedIn)) {
    siteAdapters.push(window.fixlyAdapter_linkedIn);
  }
  
  // Otodom adapter
  if (window.fixlyAdapter_otodom && !siteAdapters.includes(window.fixlyAdapter_otodom)) {
    siteAdapters.push(window.fixlyAdapter_otodom);
  }
  
  // W3Schools adapter
  if (window.fixlyAdapter_w3schools && !siteAdapters.includes(window.fixlyAdapter_w3schools)) {
    siteAdapters.push(window.fixlyAdapter_w3schools);
  }
}

// Run initialization immediately
initializeAdapters();

// And also periodically check for newly loaded adapters
setInterval(initializeAdapters, 1000);

/**
 * Get adapter for the current site if one exists
 * @param {string} domain - Current domain (without www prefix)
 * @returns {Object|null} The matching site adapter or null if none matches
 */
window.fixlyAdapters.getAdapterForSite = function(domain) {
  return siteAdapters.find(adapter => 
    adapter && adapter.domains && adapter.domains.some(adapterDomain => domain.includes(adapterDomain))
  ) || null;
};

/**
 * Register a new site adapter
 * @param {Object} adapter - Site adapter implementation
 */
window.fixlyAdapters.registerSiteAdapter = function(adapter) {
  if (!adapter || !adapter.domains || !Array.isArray(adapter.domains)) {
    console.error('Invalid site adapter format');
    return;
  }
  
  siteAdapters.push(adapter);
};

/**
 * Check if there is a site adapter for the given domain
 * @param {string} domain - Domain to check
 * @returns {boolean} True if a site adapter exists
 */
window.fixlyAdapters.hasSiteAdapter = function(domain) {
  return siteAdapters.some(adapter => 
    adapter && adapter.domains && adapter.domains.some(adapterDomain => domain.includes(adapterDomain))
  );
}; 