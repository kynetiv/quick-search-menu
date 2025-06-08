const servicesForm = document.getElementById('servicesForm');
const addServiceBtn = document.getElementById('addService');
const saveServicesBtn = document.getElementById('saveServices');

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
  removeBtn.addEventListener('click', () => {
    servicesForm.removeChild(wrapper);
  });

  wrapper.appendChild(keyInput);
  wrapper.appendChild(valueInput);
  wrapper.appendChild(removeBtn);
  servicesForm.appendChild(wrapper);
}

// Load stored services
chrome.storage.sync.get('services', (data) => {
  const services = data.services || {};
  for (const key in services) {
    createServiceInput(key, services[key]);
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

const importExportDetails = document.getElementById('importExportDetails');
const importExportTextarea = document.getElementById('importExportTextarea');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');

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
    importExportDetails.style.display = 'block';
    importExportDetails.open = true;

    // Select text ready to copy
    importExportTextarea.focus();
    importExportTextarea.select();
  });
});

// Import from textarea and save
importBtn.addEventListener('click', () => {
  // Show textarea before user pastes
  importExportDetails.style.display = 'block';
  importExportDetails.open = true;
  importExportTextarea.focus();

  const lines = importExportTextarea.value.split('\n');
  const services = {};

  for (const line of lines) {
    const [key, value] = line.split('=');
    if (key && value) {
      services[key.trim()] = value.trim();
    } else {
      alert('Invalid format in one or more lines. Please use key=value per line.');
      return;
    }
  }

  chrome.storage.sync.set({ services }, () => {
    alert('Imported and saved successfully!');
    location.reload(); // Refresh to show new values
  });
});