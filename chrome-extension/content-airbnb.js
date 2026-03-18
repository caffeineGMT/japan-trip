// Content script for Airbnb
(function() {
  'use strict';

  let saveButton = null;
  let currentPOI = null;

  // Initialize the extension
  function init() {
    console.log('[Save to Japan Trip] Initializing on Airbnb...');

    // Watch for listing details to load
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

  // Extract place data from Airbnb
  function extractPlaceData() {
    try {
      // Try to get listing name
      const nameElement = document.querySelector('h1._fecoyn4, h1[data-section-id="TITLE_DEFAULT"]');
      const name = nameElement ? nameElement.textContent.trim() : null;

      if (!name) return null;

      // Get location from subtitle
      const locationElement = document.querySelector('span._1tqyb3y, h2._14i3z6h');
      const location = locationElement ? locationElement.textContent.trim() : '';

      // Try to extract coordinates from map if available
      const mapElement = document.querySelector('[data-section-id="LOCATION_DEFAULT"] img[src*="maps"]');
      let lat = null;
      let lng = null;

      if (mapElement) {
        const mapSrc = mapElement.src;
        const coordMatch = mapSrc.match(/center=([-\d.]+),([-\d.]+)/);
        if (coordMatch) {
          lat = parseFloat(coordMatch[1]);
          lng = parseFloat(coordMatch[2]);
        }
      }

      // Get listing type
      const typeElement = document.querySelector('h2._14i3z6h span');
      const category = typeElement ? typeElement.textContent.trim() : 'Accommodation';

      // Get rating
      const ratingElement = document.querySelector('span._12si43g, button[aria-label*="rating"]');
      const rating = ratingElement ? ratingElement.textContent.trim() : '';

      // Get description
      const descElement = document.querySelector('span._1l2ow94, div[data-section-id="DESCRIPTION_DEFAULT"]');
      const description = descElement ? descElement.textContent.trim().substring(0, 200) : '';

      return {
        name,
        lat,
        lng,
        category,
        address: location,
        rating,
        description,
        url: window.location.href,
        source: 'airbnb'
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

    // Find the share/save buttons container
    const shareBtn = document.querySelector('button[aria-label*="Share"], button[data-testid*="share"]');
    const container = shareBtn ? shareBtn.parentElement : null;

    if (!container) {
      // Try alternate location - sticky header
      const stickyHeader = document.querySelector('div._1h5uiygl, div._88xxct');
      if (stickyHeader) {
        createAndInsertButton(stickyHeader);
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
    saveButton.className = 'japan-trip-save-btn airbnb-style';
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
    console.log('[Save to Japan Trip] Button inserted on Airbnb');
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
