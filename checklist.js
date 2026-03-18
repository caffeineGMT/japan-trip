// localStorage keys
const STORAGE_KEY = 'japan-trip-checklist';
const CUSTOM_ITEMS_KEY = 'japan-trip-custom-items';

let checklistData = {};
let checkedItems = {};
let customItems = {};

// Load checklist on page load
async function loadChecklist() {
  try {
    const response = await fetch('/data/checklist.json');
    checklistData = await response.json();

    // Load checked state from localStorage
    const savedChecks = localStorage.getItem(STORAGE_KEY);
    if (savedChecks) {
      checkedItems = JSON.parse(savedChecks);
    }

    // Load custom items from localStorage
    const savedCustom = localStorage.getItem(CUSTOM_ITEMS_KEY);
    if (savedCustom) {
      customItems = JSON.parse(savedCustom);
      // Merge custom items into checklist data
      Object.keys(customItems).forEach(category => {
        if (checklistData[category]) {
          checklistData[category] = checklistData[category].concat(customItems[category]);
        } else {
          checklistData[category] = customItems[category];
        }
      });
    }

    renderChecklist();
    updateProgress();
  } catch (error) {
    console.error('Failed to load checklist:', error);
    document.getElementById('checklist-container').innerHTML =
      '<p style="text-align: center; padding: 20px; color: var(--text-muted);">Failed to load checklist</p>';
  }
}

function renderChecklist() {
  const container = document.getElementById('checklist-container');
  container.innerHTML = '';

  Object.keys(checklistData).forEach(category => {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'checklist-category';

    // Category header with collapsible details
    const details = document.createElement('details');
    details.open = true;

    const summary = document.createElement('summary');
    summary.className = 'category-header';

    const categoryCount = checklistData[category].length;
    const checkedCount = checklistData[category].filter(item => {
      const itemId = generateItemId(category, item);
      return checkedItems[itemId];
    }).length;

    summary.innerHTML = `
      <span class="category-name">${getCategoryIcon(category)} ${category}</span>
      <span class="category-count">${checkedCount}/${categoryCount}</span>
    `;

    details.appendChild(summary);

    // Items list
    const itemsList = document.createElement('div');
    itemsList.className = 'category-items';

    checklistData[category].forEach(item => {
      const itemId = generateItemId(category, item);
      const isChecked = checkedItems[itemId] || false;

      const itemDiv = document.createElement('div');
      itemDiv.className = `checklist-item${isChecked ? ' checked' : ''}`;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = itemId;
      checkbox.checked = isChecked;
      checkbox.addEventListener('change', (e) => handleCheckboxChange(itemId, e.target.checked));

      const label = document.createElement('label');
      label.htmlFor = itemId;
      label.textContent = item;

      itemDiv.appendChild(checkbox);
      itemDiv.appendChild(label);
      itemsList.appendChild(itemDiv);
    });

    details.appendChild(itemsList);

    // Add custom item button
    const addBtn = document.createElement('button');
    addBtn.className = 'add-item-btn';
    addBtn.textContent = '+ Add Item';
    addBtn.onclick = () => addCustomItem(category);
    details.appendChild(addBtn);

    categoryDiv.appendChild(details);
    container.appendChild(categoryDiv);
  });
}

function generateItemId(category, item) {
  return `${category.toLowerCase().replace(/\s+/g, '-')}-${item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function handleCheckboxChange(itemId, isChecked) {
  checkedItems[itemId] = isChecked;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedItems));

  // Update visual state
  const itemDiv = document.getElementById(itemId).closest('.checklist-item');
  if (isChecked) {
    itemDiv.classList.add('checked');
  } else {
    itemDiv.classList.remove('checked');
  }

  updateProgress();
}

function updateProgress() {
  const totalItems = Object.values(checklistData).reduce((sum, items) => sum + items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  const progressText = document.querySelector('.progress-text');
  const progressFill = document.getElementById('progress-fill');

  progressText.textContent = `${checkedCount}/${totalItems} packed`;
  const percentage = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;
  progressFill.style.width = `${percentage}%`;
}

function addCustomItem(category) {
  const itemName = prompt(`Add item to ${category}:`);
  if (!itemName || itemName.trim() === '') return;

  const trimmedName = itemName.trim();

  // Initialize category in custom items if it doesn't exist
  if (!customItems[category]) {
    customItems[category] = [];
  }

  // Check if item already exists
  if (checklistData[category].includes(trimmedName)) {
    alert('This item already exists in the list');
    return;
  }

  // Add to custom items
  customItems[category].push(trimmedName);
  localStorage.setItem(CUSTOM_ITEMS_KEY, JSON.stringify(customItems));

  // Add to checklist data
  checklistData[category].push(trimmedName);

  // Re-render checklist
  renderChecklist();
  updateProgress();
}

function getCategoryIcon(category) {
  const icons = {
    'Clothing': '👕',
    'Electronics': '🔌',
    'Documents': '📄',
    'Toiletries': '🧴',
    'Medicine': '💊',
    'Misc': '🎒'
  };
  return icons[category] || '📦';
}

// Load checklist on page load
document.addEventListener('DOMContentLoaded', loadChecklist);
