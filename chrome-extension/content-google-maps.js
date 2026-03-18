// Content script for Google Maps
(function() {
  'use strict';

  let saveButton = null;
  let currentPOI = null;

  // Initialize the extension
  function init() {
    console.log('[Save to Japan Trip] Initializing on Google Maps...');

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

  // Extract place data from Google Maps
  function extractPlaceData() {
    try {
      // Try to get place name from various selectors
      const nameElement = document.querySelector('h1.DUwDvf, h1[class*="fontHeadline"], h2.qBF1Pd');
      const name = nameElement ? nameElement.textContent.trim() : null;

      if (!name) return null;

      // Get coordinates from URL
      const urlMatch = window.location.href.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      const lat = urlMatch ? parseFloat(urlMatch[1]) : null;
      const lng = urlMatch ? parseFloat(urlMatch[2]) : null;

      // Get description/category
      const categoryElement = document.querySelector('button[jsaction*="category"]');
      const category = categoryElement ? categoryElement.textContent.trim() : '';

      // Get address
      const addressElement = document.querySelector('[data-item-id="address"] .Io6YTe');
      const address = addressElement ? addressElement.textContent.trim() : '';

      // Get rating
      const ratingElement = document.querySelector('div.F7nice span[aria-label*="star"]');
      const rating = ratingElement ? ratingElement.parentElement.textContent.trim() : '';

      return {
        name,
        lat,
        lng,
        category,
        address,
        rating,
        url: window.location.href,
        source: 'google_maps'
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

    // Find the actions container
    const actionButtons = document.querySelector('div[role="main"] button[aria-label*="Save"]');
    const container = actionButtons ? actionButtons.parentElement : null;

    if (!container) {
      console.log('[Save to Japan Trip] Could not find button container, retrying...');
      setTimeout(insertSaveButton, 1000);
      return;
    }

    // Create our custom button
    saveButton = document.createElement('button');
    saveButton.className = 'japan-trip-save-btn';
    saveButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Save to Japan Trip</span>
    `;

    saveButton.addEventListener('click', handleSaveClick);

    // Insert button after the Google Save button
    container.appendChild(saveButton);
    console.log('[Save to Japan Trip] Button inserted');
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
      // Send message to background script
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

        // Reset button after 2 seconds
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
