// Popup script for Save to Japan Trip extension

document.addEventListener('DOMContentLoaded', () => {
  loadStats();

  // Open app button
  document.getElementById('openApp').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://japan-trip-companion.vercel.app' });
  });

  // Help link
  document.getElementById('helpLink').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://github.com/caffeineGMT/japan-trip#chrome-extension' });
  });
});

// Load and display stats
async function loadStats() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getStats' });

    // Update saved count
    document.getElementById('savedCount').textContent = response.savedCount || 0;

    // Update last saved time
    if (response.lastSaved) {
      const lastSavedDate = new Date(response.lastSaved);
      const now = new Date();
      const diffMs = now - lastSavedDate;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      let timeAgo;
      if (diffMins < 1) {
        timeAgo = 'Just now';
      } else if (diffMins < 60) {
        timeAgo = `${diffMins}m ago`;
      } else if (diffHours < 24) {
        timeAgo = `${diffHours}h ago`;
      } else if (diffDays < 7) {
        timeAgo = `${diffDays}d ago`;
      } else {
        timeAgo = lastSavedDate.toLocaleDateString();
      }

      document.getElementById('lastSaved').textContent = timeAgo;
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}
