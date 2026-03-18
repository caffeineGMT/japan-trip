// ===== WHAT'S NEXT MODE =====
let whatsNextEnabled = false;
let whatsNextInterval = null;

// Parse time string to comparable format (HH:mm)
function parseTimeString(timeStr) {
  // Handle various time formats: "9:30 AM", "Morning", "Evening", "All Day", etc.
  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);

  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const period = timeMatch[3];

    // Convert to 24-hour format
    if (period) {
      if (period.toUpperCase() === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
      }
    }

    return { hours, minutes, valid: true };
  }

  // Handle relative times
  const lowerTime = timeStr.toLowerCase();
  if (lowerTime.includes('morning') || lowerTime.includes('early am')) {
    return { hours: 9, minutes: 0, valid: true };
  } else if (lowerTime.includes('late morning')) {
    return { hours: 11, minutes: 0, valid: true };
  } else if (lowerTime.includes('midday') || lowerTime.includes('afternoon')) {
    return { hours: 14, minutes: 0, valid: true };
  } else if (lowerTime.includes('late afternoon')) {
    return { hours: 16, minutes: 0, valid: true };
  } else if (lowerTime.includes('evening') || lowerTime.includes('sunset')) {
    return { hours: 18, minutes: 0, valid: true };
  } else if (lowerTime.includes('night')) {
    return { hours: 20, minutes: 0, valid: true };
  } else if (lowerTime.includes('all day')) {
    return { hours: 9, minutes: 0, valid: true };
  }

  return { hours: 0, minutes: 0, valid: false };
}

// Get time-based emoji
function getTimeEmoji(hours) {
  if (hours >= 5 && hours < 12) {
    return '☀️'; // Morning
  } else if (hours >= 12 && hours < 17) {
    return '🌆'; // Afternoon
  } else if (hours >= 17 && hours < 21) {
    return '🌆'; // Evening
  } else {
    return '🌙'; // Night
  }
}

// Get current activity for the day
function getCurrentActivity(day) {
  const now = dayjs();
  const currentHour = now.hour();
  const currentMinute = now.minute();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  let currentStop = null;
  let nextStop = null;
  let currentIndex = -1;
  let nextIndex = -1;

  // Find valid stops with parseable times
  const validStops = day.stops.map((stop, index) => ({
    ...stop,
    index,
    parsedTime: parseTimeString(stop.time)
  })).filter(stop => stop.parsedTime.valid);

  for (let i = 0; i < validStops.length; i++) {
    const stop = validStops[i];
    const stopTimeInMinutes = stop.parsedTime.hours * 60 + stop.parsedTime.minutes;

    // Check if this is the current activity (within 2 hours)
    const timeDiff = currentTimeInMinutes - stopTimeInMinutes;
    if (timeDiff >= 0 && timeDiff < 120) {
      currentStop = stop;
      currentIndex = stop.index;

      // Find next stop
      if (i + 1 < validStops.length) {
        nextStop = validStops[i + 1];
        nextIndex = nextStop.index;
      }
      break;
    }

    // If we haven't reached this stop yet, it's the next one
    if (stopTimeInMinutes > currentTimeInMinutes && nextStop === null) {
      nextStop = stop;
      nextIndex = stop.index;
    }
  }

  return {
    current: currentStop,
    currentIndex,
    next: nextStop,
    nextIndex,
    status: currentStop ? 'now' : (nextStop ? 'upcoming' : 'past')
  };
}

// Update What's Next highlighting
function updateWhatsNext() {
  if (!whatsNextEnabled) return;

  const day = TRIP_DATA[currentDayIndex];
  const activity = getCurrentActivity(day);
  const now = dayjs();

  // Clear all activity states
  document.querySelectorAll('.stop-card').forEach(card => {
    card.classList.remove('activity-current', 'activity-upcoming', 'activity-past');

    // Remove any existing countdown badges
    const existingBadge = card.querySelector('.countdown-badge');
    if (existingBadge) {
      existingBadge.remove();
    }
  });

  // Apply states to all cards
  document.querySelectorAll('.stop-card').forEach((card, index) => {
    if (activity.currentIndex === index) {
      card.classList.add('activity-current');

      // Add "Happening Now" badge
      const badge = document.createElement('div');
      badge.className = 'countdown-badge';
      badge.innerHTML = `<span class="status-indicator now"></span>Happening Now ${getTimeEmoji(now.hour())}`;
      card.querySelector('.stop-info').appendChild(badge);

      // Scroll to current activity
      setTimeout(() => {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

    } else if (activity.nextIndex === index && activity.status === 'upcoming') {
      card.classList.add('activity-upcoming');

      // Calculate time until next activity
      const nextTime = parseTimeString(day.stops[index].time);
      if (nextTime.valid) {
        const nextDateTime = dayjs()
          .hour(nextTime.hours)
          .minute(nextTime.minutes)
          .second(0);
        const minutesUntil = nextDateTime.diff(now, 'minute');

        if (minutesUntil > 0) {
          const badge = document.createElement('div');
          badge.className = 'countdown-badge';
          badge.innerHTML = `<span class="status-indicator soon"></span>In ${minutesUntil} min ${getTimeEmoji(nextTime.hours)}`;
          card.querySelector('.stop-info').appendChild(badge);
        }
      }

    } else if (index < activity.currentIndex || (activity.status === 'past' && index < activity.nextIndex)) {
      card.classList.add('activity-past');
    }
  });

  // Trigger haptic feedback on mobile (if supported)
  if (navigator.vibrate && activity.status === 'now') {
    navigator.vibrate(50);
  }
}

// Toggle What's Next mode
function toggleWhatsNext() {
  whatsNextEnabled = !whatsNextEnabled;
  const toggleBtn = document.getElementById('whatsNextToggle');

  if (whatsNextEnabled) {
    toggleBtn.classList.add('active');
    updateWhatsNext();

    // Update every minute
    whatsNextInterval = setInterval(updateWhatsNext, 60000);

    // Also check if we should auto-switch to today's day
    const today = dayjs();
    const todayDate = today.format('MMM D');

    TRIP_DATA.forEach((day, index) => {
      if (day.date.includes(todayDate)) {
        selectDay(index);
      }
    });

  } else {
    toggleBtn.classList.remove('active');

    // Clear interval
    if (whatsNextInterval) {
      clearInterval(whatsNextInterval);
      whatsNextInterval = null;
    }

    // Clear all activity states
    document.querySelectorAll('.stop-card').forEach(card => {
      card.classList.remove('activity-current', 'activity-upcoming', 'activity-past');
      const badge = card.querySelector('.countdown-badge');
      if (badge) badge.remove();
    });
  }
}

// Auto-disable What's Next mode after midnight
function checkAutoDisable() {
  const now = dayjs();
  if (whatsNextEnabled && now.hour() === 0 && now.minute() === 0) {
    toggleWhatsNext();
  }
}

// Initialize What's Next mode
document.addEventListener('DOMContentLoaded', () => {
  // What's Next toggle button
  const whatsNextToggle = document.getElementById('whatsNextToggle');
  if (whatsNextToggle) {
    whatsNextToggle.addEventListener('click', toggleWhatsNext);
  }

  // Check auto-disable every minute
  setInterval(checkAutoDisable, 60000);
});
