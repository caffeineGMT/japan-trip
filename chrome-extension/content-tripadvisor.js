// Content script for TripAdvisor
(function() {
  'use strict';

  let saveButton = null;
  let currentPOI = null;

  // Initialize the extension
  function init() {
    console.log('[Save to Japan Trip] Initializing on TripAdvisor...');

    // Watch for place details to load
    const observer = new MutationObserver(() => {
      const placeData = extractPlaceData();
      if (placeData && placeData.name) {
        if (!saveButton || !document.contains(saveButton)) {
          insertSaveButton();
        }
        currentPOI = placeData;
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Initial check
    setTimeout(() => {
      const placeData = extractPlaceData();
      if (placeData && placeData.name) {
        insertSaveButton();
        currentPOI = placeData;
      }
    }, 2000);
  }

  // Extract place data from TripAdvisor
  function extractPlaceData() {
    try {
      // Try to get place name
      const nameElement = document.querySelector('h1[data-automation*="name"], h1.HjBfq');
      const name = nameElement ? nameElement.textContent.trim() : null;

      if (!name) return null;

      // Get coordinates from meta tags or page data
      const latMeta = document.querySelector('meta[property="place:location:latitude"]');
      const lngMeta = document.querySelector('meta[property="place:location:longitude"]');

      const lat = latMeta ? parseFloat(latMeta.content) : null;
      const lng = lngMeta ? parseFloat(lngMeta.content) : null;

      // Get category/type
      const categoryElement = document.querySelector('[data-automation*="category"]');
      const category = categoryElement ? categoryElement.textContent.trim() : '';

      // Get address
      const addressElement = document.querySelector('a[href*="maps"], span.AYHFM');
      const address = addressElement ? addressElement.textContent.trim() : '';

      // Get rating
      const ratingElement = document.querySelector('svg[aria-label*="rating"], .ZDEqb');
      const rating = ratingElement ? ratingElement.getAttribute('aria-label') || '' : '';

      // Get description
      const descElement = document.querySelector('[data-automation*="about"], .fIrGe');
      const description = descElement ? descElement.textContent.trim().substring(0, 200) : '';

      return {
        name,
        lat,
        lng,
        category,
        address,
        rating,
        description,
        url: window.location.href,
        source: 'tripadvisor'
      };
    } catch (error) {
      console.error('[Save to Japan Trip] Error extracting place data:', error);
      return null;
    }
  }

  // Insert the Save button
  function insertSaveButton() {
    if (saveButton && document.contains(saveButton)) {
      return; // Button already exists
    }

    // Find the save/share buttons container
    const saveBtn = document.querySelector('button[aria-label*="Save"], button[data-automation*="save"]');
    const container = saveBtn ? saveBtn.parentElement : null;

    if (!container) {
      // Try alternate location - header actions
      const header = document.querySelector('div[data-automation*="actions"], .ui_columns');
      if (header) {
        createAndInsertButton(header);
      } else {
        console.log('[Save to Japan Trip] Could not find button container, retrying...');
        setTimeout(insertSaveButton, 1000);
      }
      return;
    }

    createAndInsertButton(container);
  }

  function createAndInsertButton(container) {
    saveButton = document.createElement('button');
    saveButton.className = 'japan-trip-save-btn tripadvisor-style';
    saveButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Save to Japan Trip</span>
    `;

    saveButton.addEventListener('click', handleSaveClick);
    container.appendChild(saveButton);
    console.log('[Save to Japan Trip] Button inserted on TripAdvisor');
  }

  // Handle save button click
  async function handleSaveClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!currentPOI) {
      showNotification('No place data found', 'error');
      return;
    }

    // Show loading state
    const originalHTML = saveButton.innerHTML;
    saveButton.disabled = true;
    saveButton.innerHTML = `
      <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.25"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/>
      </svg>
      <span>Saving...</span>
    `;

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'savePOI',
        data: currentPOI
      });

      if (response.success) {
        showNotification('Saved to your Japan trip!', 'success');
        saveButton.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Saved!</span>
        `;

        setTimeout(() => {
          saveButton.innerHTML = originalHTML;
          saveButton.disabled = false;
        }, 2000);
      } else {
        throw new Error(response.error || 'Failed to save');
      }
    } catch (error) {
      console.error('[Save to Japan Trip] Error:', error);
      showNotification('Failed to save. Please try again.', 'error');
      saveButton.innerHTML = originalHTML;
      saveButton.disabled = false;
    }
  }

  // Show notification
  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `japan-trip-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Start the extension
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
