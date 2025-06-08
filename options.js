const servicesForm = document.getElementById('servicesForm');
const addServiceBtn = document.getElementById('addService');
const saveServicesBtn = document.getElementById('saveServices');

const importExportBox = document.getElementById('importExportBox');
const importExportSummary = document.getElementById('importExportSummary');
const importExportTextarea = document.getElementById('importExportTextarea');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const confirmImportBtn = document.getElementById('confirmImportBtn');

function createServiceInput(key = '', value = '') {
  const wrapper = document.createElement('div');
  wrapper.style.marginBottom = '10px';

  const keyInput = document.createElement('input');
  keyInput.type = 'text';
  keyInput.placeholder = 'Name';
  keyInput.value = key;
  keyInput.style.display = 'block';
  keyInput.style.width = '100%';
  keyInput.style.marginBottom = '6px';

  const valueInput = document.createElement('input');
  valueInput.type = 'text';
  valueInput.placeholder = 'example: https://google.com/search?q=$TEXT';
  valueInput.value = value;
  valueInput.style.display = 'block';
  valueInput.style.width = '100%';
  valueInput.style.marginBottom = '6px';

  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'Remove';
  removeBtn.style.marginBottom = '10px';
  removeBtn.addEventListener('click', () => {
    servicesForm.removeChild(wrapper);
    // If no services left, add one empty input
    if (servicesForm.children.length === 0) {
      createServiceInput();
    }
  });

  wrapper.appendChild(keyInput);
  wrapper.appendChild(valueInput);
  wrapper.appendChild(removeBtn);
  servicesForm.appendChild(wrapper);
}

// Load stored services
chrome.storage.sync.get('services', (data) => {
  const services = data.services || {};
  const keys = Object.keys(services);
  if (keys.length === 0) {
    createServiceInput();
  } else {
    for (const key of keys) {
      createServiceInput(key, services[key]);
    }
  }
});

// Add service button click event
addServiceBtn.addEventListener('click', () => {
  createServiceInput();
});

// Save services button click event
saveServicesBtn.addEventListener('click', () => {
  const services = {};

  for (const wrapper of servicesForm.children) {
    const keyInput = wrapper.children[0];
    const valueInput = wrapper.children[1];

    if (keyInput.value && valueInput.value) {
      services[keyInput.value] = valueInput.value;
    }
  }

  chrome.storage.sync.set({ services }, () => {
    alert('Quick Search Items saved!');
  });
});

// Export button click event
exportBtn.addEventListener('click', () => {
  chrome.storage.sync.get('services', (data) => {
    const services = data.services || {};
    const lines = Object.entries(services).map(([key, value]) => `${key}=${value}`);
    importExportTextarea.value = lines.join('\n');
    importExportSummary.textContent = 'Export Quick Search Items';
    importExportBox.style.display = 'block';
    importExportBox.open = true;
    importExportTextarea.focus();
    importExportTextarea.select();

    confirmImportBtn.style.display = 'none'; // hide confirm button for export
  });
});

// Import button click event
importBtn.addEventListener('click', () => {
  importExportTextarea.value = '';
  importExportSummary.textContent = 'Import Quick Search Items';
  importExportBox.style.display = 'block';
  importExportBox.open = true;
  importExportTextarea.focus();

  confirmImportBtn.style.display = 'inline-block'; // show confirm button for import
});

// Confirm Import button click event
confirmImportBtn.addEventListener('click', () => {
  const inputText = importExportTextarea.value.trim();
  if (!inputText) {
    if (!confirm('The import text area is empty. Are you sure you want to proceed with importing an empty list? This will erase all your saved quick search items.')) {
      return;
    }
  }

  const lines = inputText.split('\n');
  const services = {};

  for (const line of lines) {
    const idx = line.indexOf('=');
    if (idx === -1) {
      alert('Invalid format in one or more lines. Please use key=value per line.');
      return;
    }
    const key = line.substring(0, idx).trim();
    const value = line.substring(idx + 1).trim();
    if (!key || !value) {
      alert('Invalid format in one or more lines. Keys and values cannot be empty.');
      return;
    }
    services[key] = value;
  }

  chrome.storage.sync.set({ services }, () => {
    alert('Imported and saved successfully!');
    location.reload(); // Refresh to show new values
  });
});
