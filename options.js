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
