// Background service worker for Save to Japan Trip extension

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'savePOI') {
    savePOIToApp(request.data)
      .then(result => {
        sendResponse({ success: true, data: result });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  }

  if (request.action === 'getStats') {
    chrome.storage.local.get(['savedCount', 'lastSaved'], (result) => {
      sendResponse({
        savedCount: result.savedCount || 0,
        lastSaved: result.lastSaved || null
      });
    });
    return true;
  }
});

// Save POI to the Japan Trip app
async function savePOIToApp(poiData) {
  const API_URL = 'https://japan-trip-companion.vercel.app/api/save-poi';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(poiData)
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const result = await response.json();

    // Update stats
    chrome.storage.local.get(['savedCount'], (data) => {
      const newCount = (data.savedCount || 0) + 1;
      chrome.storage.local.set({
        savedCount: newCount,
        lastSaved: new Date().toISOString()
      });
    });

    return result;
  } catch (error) {
    console.error('Error saving POI:', error);
    throw error;
  }
}

// Show badge when extension is active
chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
