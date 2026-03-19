// Fetch and render restaurant reservations
async function loadReservations() {
  try {
    const response = await fetch('data/reservations.json');
    const reservations = await response.json();

    // Sort by date ascending
    reservations.sort((a, b) => new Date(a.date) - new Date(b.date));

    renderReservations(reservations);
  } catch (error) {
    console.error('Failed to load reservations:', error);
    document.getElementById('reservations-list').innerHTML =
      '<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--text-muted);">Failed to load reservations</td></tr>';
  }
}

function renderReservations(reservations) {
  const tbody = document.getElementById('reservations-list');
  tbody.innerHTML = '';

  reservations.forEach(res => {
    const row = document.createElement('tr');
    row.className = 'reservation-row';

    // Format date as "Apr 3"
    const dateObj = new Date(res.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Google Maps link
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${res.lat},${res.lng}`;

    row.innerHTML = `
      <td class="res-date">${formattedDate}</td>
      <td class="res-restaurant">
        <div class="res-name">${res.restaurant}</div>
        ${res.notes ? `<div class="res-notes">${res.notes}</div>` : ''}
      </td>
      <td class="res-time">${res.time}</td>
      <td class="res-confirmation">
        <button class="copy-btn" onclick="copyToClipboard('${res.confirmation}', this)" title="Click to copy">
          ${res.confirmation}
        </button>
      </td>
      <td class="res-phone">
        <a href="tel:${res.phone}" class="phone-link">${res.phone}</a>
      </td>
      <td class="res-map">
        <a href="${mapUrl}" target="_blank" rel="noopener noreferrer" class="map-btn" title="Open in Google Maps">
          📍
        </a>
      </td>
    `;

    tbody.appendChild(row);
  });
}

// Copy confirmation code to clipboard
function copyToClipboard(text, button) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = button.textContent;
    button.textContent = '✓ Copied!';
    button.classList.add('copied');

    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('copied');
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Failed to copy to clipboard');
  });
}

// Load reservations on page load
document.addEventListener('DOMContentLoaded', loadReservations);
