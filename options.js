const servicesForm = document.getElementById('servicesForm');
const addServiceBtn = document.getElementById('addService');
const saveServicesBtn = document.getElementById('saveServices');

const importExportBox = document.getElementById('importExportBox');
const importExportTextarea = document.getElementById('importExportTextarea');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const confirmImportBtn = document.getElementById('confirmImportBtn');

function createServiceInput(key = '', value = '') {
  const wrapper = document.createElement('div');

  const keyInput = document.createElement('input');
  keyInput.type = 'text';
  keyInput.placeholder = 'Name';
  keyInput.value = key;

  const valueInput = document.createElement('input');
  valueInput.type = 'text';
  valueInput.placeholder = 'example: https://google.com/search?q=$TEXT';
  valueInput.value = value;

  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'Remove';
  removeBtn.type = 'button';
  removeBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent form submit or page jump
    servicesForm.removeChild(wrapper);
    ensureAtLeastOneService();
  });

  wrapper.appendChild(keyInput);
  wrapper.appendChild(valueInput);
  wrapper.appendChild(removeBtn);
  servicesForm.appendChild(wrapper);
}

// Load stored services on page load
chrome.storage.sync.get('services', (data) => {
  const services = data.services || {};
  let count = 0;
  for (const key in services) {
    createServiceInput(key, services[key]);
    count++;
  }
  if (count === 0) {
    createServiceInput(); // show one empty input if none saved
  }
});

// Add new service input row
addServiceBtn.addEventListener('click', () => {
  createServiceInput();
});

// Save services to chrome storage
saveServicesBtn.addEventListener('click', () => {
  const services = {};

  for (const wrapper of servicesForm.children) {
    const keyInput = wrapper.children[0];
    const valueInput = wrapper.children[1];

    if (keyInput.value && valueInput.value) {
      services[keyInput.value.trim()] = valueInput.value.trim();
    }
  }

  chrome.storage.sync.set({ services }, () => {
    alert('Quick Search Items saved!');
  });
});

// Export current services to textarea
exportBtn.addEventListener('click', () => {
  chrome.storage.sync.get('services', (data) => {
    const services = data.services || {};
    let exportText = '';
    for (const key in services) {
      exportText += `${key}=${services[key]}\n`;
    }

    importExportTextarea.value = exportText.trim();

    // Show the export/import box
    importExportBox.style.display = 'block';
    importExportBox.open = true;

    // Select text ready to copy
    importExportTextarea.focus();
    importExportTextarea.select();
  });
});

// Import: Prepare textarea for user input
importBtn.addEventListener('click', () => {
  importExportTextarea.value = '';
  importExportBox.style.display = 'block';
  importExportBox.open = true;
  importExportTextarea.focus();

  confirmImportBtn.style.display = 'inline-block';
});

// Confirm Import: Parse textarea and save
// Import from textarea and save
confirmImportBtn.addEventListener('click', () => {
  const text = importExportTextarea.value.trim();

  if (text === '') {
    if (!confirm('Your import text is empty. Are you sure you want to clear all saved services?')) {
      return;
    }
  }

  const lines = text.split('\n');
  const services = {};

  for (const line of lines) {
    // Split only on the first '=' so URLs with '=' aren't cut
    const equalIndex = line.indexOf('=');
    if (equalIndex === -1) {
      alert('Invalid format in one or more lines. Please use key=value per line.');
      return;
    }
    const key = line.slice(0, equalIndex).trim();
    const value = line.slice(equalIndex + 1).trim();

    if (!key || !value) {
      alert('Invalid format in one or more lines. Please ensure both key and value are present.');
      return;
    }

    // Ensure $TEXT is present in the value, warn user if missing
    if (!value.includes('$TEXT')) {
      const proceed = confirm(`The URL for "${key}" does not contain the $TEXT substitution keyword. Continue?`);
      if (!proceed) {
        return;
      }
    }

    services[key] = value;
  }

  chrome.storage.sync.set({ services }, () => {
    alert('Imported and saved successfully!');
    location.reload(); // Refresh UI to show updated services
  });
});

function ensureAtLeastOneService() {
  if (servicesForm.children.length === 0) {
    createServiceInput(); // create one empty input set
  }
}
