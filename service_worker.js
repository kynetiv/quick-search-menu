// Load configured services and create context menu items
function loadServices() {
  chrome.contextMenus.removeAll(() => {
    // Create a parent context menu item
    chrome.contextMenus.create({
      id: 'highlightedText',
      title: 'Quick Search Menu',
      contexts: ['selection']
    });

    // Load services from storage and create submenu items
    chrome.storage.sync.get('services', (data) => {
      const services = data.services || {};

      for (const key in services) {
        chrome.contextMenus.create({
          id: key,
          parentId: 'highlightedText',
          title: `Search on ${key}`,
          contexts: ['selection']
        });
      }
    });
  });
}

// Initialize context menu items
loadServices();

// Add a click event listener for the context menu items
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // Get the selected text
  const selectedText = info.selectionText;

  // Load services from storage
  chrome.storage.sync.get('services', (data) => {
    const services = data.services || {};

    // Check if the clicked item ID matches a service key
    if (services.hasOwnProperty(info.menuItemId)) {
      const serviceUrlTemplate = services[info.menuItemId];
      const url = serviceUrlTemplate.replace('$TEXT', encodeURIComponent(selectedText));

      // Open the URL in a new tab
      chrome.tabs.create({ url });
    }
  });
});

// Listen for changes in storage and reload services if necessary
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.hasOwnProperty('services')) {
    loadServices();
  }
});

