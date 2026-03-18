/**
 * Marketplace App - Main Application Logic
 */

let templateFilters;
let allTemplates = [];
let searchQuery = '';

// DOM Elements
const templatesGrid = document.getElementById('templates-grid');
const resultsCount = document.getElementById('results-count');
const noResults = document.getElementById('no-results');
const searchInput = document.getElementById('search');
const destinationFilter = document.getElementById('destination-filter');
const durationMin = document.getElementById('duration-min');
const durationMax = document.getElementById('duration-max');
const durationDisplay = document.getElementById('duration-display');
const priceMin = document.getElementById('price-min');
const priceMax = document.getElementById('price-max');
const sortBy = document.getElementById('sort-by');
const clearFiltersBtn = document.getElementById('clear-filters');
const resetFiltersBtn = document.getElementById('reset-filters');
const modal = document.getElementById('template-modal');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal');
const loading = document.getElementById('loading');

// Initialize the app
async function init() {
  showLoading();

  try {
    // Fetch templates from API
    const response = await fetch('/api/templates');
    if (!response.ok) throw new Error('Failed to fetch templates');

    allTemplates = await response.json();
    templateFilters = new TemplateFilters(allTemplates);

    // Set up event listeners
    setupEventListeners();

    // Initial render
    renderTemplates();

    hideLoading();
  } catch (error) {
    console.error('Error initializing app:', error);
    hideLoading();
    showError('Failed to load templates. Please try refreshing the page.');
  }
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // Search with debounce
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = e.target.value;
      applyFiltersAndRender();
    }, 300);
  });

  // Filter changes
  destinationFilter.addEventListener('change', applyFiltersAndRender);
  durationMin.addEventListener('input', updateDurationDisplay);
  durationMax.addEventListener('input', updateDurationDisplay);
  durationMin.addEventListener('change', applyFiltersAndRender);
  durationMax.addEventListener('change', applyFiltersAndRender);
  priceMin.addEventListener('input', applyFiltersAndRender);
  priceMax.addEventListener('input', applyFiltersAndRender);
  sortBy.addEventListener('change', applyFiltersAndRender);

  // Season checkboxes
  document.querySelectorAll('.season-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', applyFiltersAndRender);
  });

  // Price presets
  document.querySelectorAll('.btn-preset').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const min = e.target.dataset.min;
      const max = e.target.dataset.max;
      priceMin.value = min;
      priceMax.value = max;

      // Visual feedback
      document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      applyFiltersAndRender();
    });
  });

  // Clear/Reset filters
  clearFiltersBtn.addEventListener('click', clearFilters);
  resetFiltersBtn.addEventListener('click', clearFilters);

  // Modal
  closeModalBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Escape key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display !== 'none') {
      closeModal();
    }
  });
}

/**
 * Update duration display label
 */
function updateDurationDisplay() {
  const min = durationMin.value || 1;
  const max = durationMax.value || 30;
  durationDisplay.textContent = `${min}-${max} days`;
}

/**
 * Get current filter values
 */
function getCurrentFilters() {
  const selectedSeasons = Array.from(document.querySelectorAll('.season-checkbox:checked'))
    .map(cb => cb.value);

  return {
    destination: destinationFilter.value,
    durationMin: parseInt(durationMin.value) || 1,
    durationMax: parseInt(durationMax.value) || 30,
    seasons: selectedSeasons,
    priceMin: priceMin.value ? parseInt(priceMin.value) : null,
    priceMax: priceMax.value ? parseInt(priceMax.value) : null,
    sortBy: sortBy.value
  };
}

/**
 * Apply filters and re-render
 */
function applyFiltersAndRender() {
  const filters = getCurrentFilters();

  // Apply filters
  let filtered = templateFilters.applyFilters(filters);

  // Apply search
  if (searchQuery) {
    filtered = templateFilters.searchTemplates(searchQuery, filtered);
  }

  renderTemplates(filtered);
}

/**
 * Clear all filters
 */
function clearFilters() {
  searchInput.value = '';
  searchQuery = '';
  destinationFilter.value = '';
  durationMin.value = 1;
  durationMax.value = 30;
  priceMin.value = '';
  priceMax.value = '';
  sortBy.value = 'popular';
  updateDurationDisplay();

  document.querySelectorAll('.season-checkbox').forEach(cb => cb.checked = false);
  document.querySelectorAll('.btn-preset').forEach(btn => btn.classList.remove('active'));

  applyFiltersAndRender();
}

/**
 * Render template cards
 */
function renderTemplates(templates = null) {
  const toRender = templates || allTemplates;

  // Update results count
  resultsCount.textContent = `${toRender.length} ${toRender.length === 1 ? 'template' : 'templates'} found`;

  // Show/hide no results message
  if (toRender.length === 0) {
    templatesGrid.style.display = 'none';
    noResults.style.display = 'block';
    return;
  } else {
    templatesGrid.style.display = 'grid';
    noResults.style.display = 'none';
  }

  // Render cards
  templatesGrid.innerHTML = toRender.map(template => createTemplateCard(template)).join('');

  // Add click handlers
  document.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', () => {
      const templateId = card.dataset.id;
      openTemplateDetail(templateId);
    });
  });
}

/**
 * Create template card HTML
 */
function createTemplateCard(template) {
  const stars = '⭐'.repeat(Math.floor(template.rating));
  const priceDisplay = template.price === 0
    ? '<span class="price free">FREE</span>'
    : `<span class="price">$${template.price}</span>`;

  const seasonEmoji = {
    spring: '🌸',
    summer: '☀️',
    fall: '🍂',
    winter: '❄️',
    all: '🌍'
  };

  return `
    <div class="template-card" data-id="${template.id}">
      <img
        src="/api/templates/${template.id}/thumbnail.jpg"
        alt="${template.title}"
        class="card-image"
        loading="lazy"
      >
      <div class="card-content">
        <h3>${template.title}</h3>
        <p class="destination">${template.destination}, ${template.country}</p>

        <div class="card-badges">
          <span class="duration-badge">${template.duration_days} ${template.duration_days === 1 ? 'Day' : 'Days'}</span>
          <span class="season-tag">${seasonEmoji[template.season] || ''} ${capitalize(template.season)}</span>
        </div>

        <div class="card-footer">
          <div>
            <div class="rating">
              <span class="rating-stars">${stars}</span>
              <span>${template.rating}</span>
            </div>
            <div class="sales">${template.sales_count.toLocaleString()} trips</div>
          </div>
          ${priceDisplay}
        </div>

        <div class="author-info">
          <img src="${template.author.avatar}" alt="${template.author.name}" class="author-avatar">
          <span class="author-name">${template.author.name}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Open template detail modal
 */
async function openTemplateDetail(templateId) {
  showLoading();

  try {
    const response = await fetch(`/api/templates/${templateId}`);
    if (!response.ok) throw new Error('Failed to fetch template details');

    const template = await response.json();
    renderTemplateDetail(template);

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    hideLoading();
  } catch (error) {
    console.error('Error loading template details:', error);
    hideLoading();
    alert('Failed to load template details. Please try again.');
  }
}

/**
 * Render template detail in modal
 */
function renderTemplateDetail(template) {
  const stars = '⭐'.repeat(Math.floor(template.rating));
  const priceDisplay = template.price === 0 ? 'FREE' : `$${template.price}`;

  const daysHtml = template.days.map((day, index) => `
    <div class="day-preview">
      <h4 class="day-title">Day ${day.day}: ${day.title}</h4>
      <div class="activities">
        ${day.activities.map(activity => `
          <div class="activity">
            <div class="activity-header">
              <span class="activity-name">${activity.name}</span>
              <span class="activity-time">${activity.time} • ${activity.duration}</span>
            </div>
            <p class="activity-description">${activity.description}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  const reviewsHtml = template.reviews.map(review => `
    <div class="review-card">
      <div class="review-header">
        <div class="reviewer-info">
          <img src="${review.avatar}" alt="${review.author}" class="reviewer-avatar">
          <span class="reviewer-name">${review.author}</span>
        </div>
        <div class="review-rating">${'⭐'.repeat(review.rating)}</div>
      </div>
      <p class="review-text">${review.text}</p>
    </div>
  `).join('');

  modalBody.innerHTML = `
    <div class="modal-header">
      <img
        src="/api/templates/${template.id}/thumbnail.jpg"
        alt="${template.title}"
        class="modal-image"
      >
    </div>

    <div class="modal-body-content">
      <h2 class="modal-title">${template.title}</h2>
      <p class="modal-destination">📍 ${template.destination}, ${template.country}</p>

      <div class="modal-meta">
        <div class="meta-item">
          <span class="meta-label">Duration</span>
          <span class="meta-value">${template.duration_days} Days</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Season</span>
          <span class="meta-value">${capitalize(template.season)}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Rating</span>
          <span class="meta-value">${stars} ${template.rating}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Price</span>
          <span class="meta-value">${priceDisplay}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Travelers</span>
          <span class="meta-value">${template.sales_count.toLocaleString()}</span>
        </div>
      </div>

      <p class="modal-description">${template.full_description || template.description}</p>

      <div class="modal-section">
        <h3 class="section-title">Itinerary Preview</h3>
        ${daysHtml}
        ${template.duration_days > 2 ? `<p style="text-align: center; margin-top: 1rem; color: var(--text-secondary);">+ ${template.duration_days - 2} more days...</p>` : ''}
      </div>

      <div class="modal-section">
        <h3 class="section-title">Traveler Reviews</h3>
        <div class="reviews-grid">
          ${reviewsHtml}
        </div>
      </div>
    </div>

    <div class="modal-actions">
      <button class="btn-secondary" onclick="window.open('/?trip=${template.id}', '_blank')">
        👁️ Preview Trip
      </button>
      <button class="btn-primary" onclick="handleBuyNow('${template.id}', ${template.price})">
        💳 ${template.price === 0 ? 'Get Free Template' : `Buy Now - $${template.price}`}
      </button>
    </div>
  `;
}

/**
 * Handle buy now action
 */
function handleBuyNow(templateId, price) {
  // In production, this would integrate with payment gateway (Stripe, PayPal, etc.)
  if (price === 0) {
    alert('🎉 Free template downloaded! Check your email for the itinerary details.');
    // Track conversion
    console.log('Free template download:', templateId);
  } else {
    alert(`🚧 Payment integration coming soon!\n\nTemplate: ${templateId}\nPrice: $${price}\n\nThis will integrate with Stripe for secure payments.`);
    // In production: initiate Stripe checkout
    console.log('Purchase initiated:', { templateId, price });
  }
}

/**
 * Close modal
 */
function closeModal() {
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

/**
 * Show loading overlay
 */
function showLoading() {
  loading.style.display = 'flex';
}

/**
 * Hide loading overlay
 */
function hideLoading() {
  loading.style.display = 'none';
}

/**
 * Show error message
 */
function showError(message) {
  templatesGrid.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
      <p style="font-size: 1.25rem; color: var(--danger-color);">${message}</p>
    </div>
  `;
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
