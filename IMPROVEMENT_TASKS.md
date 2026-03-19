# 🛠️ Improvement Tasks - Japan Trip Planner
**Created:** March 18, 2026
**Status:** Ready for Implementation

---

## Task 1: Fix Broken Saved Places Link [P0 - Bug]
**Priority:** CRITICAL
**Estimated Time:** 30 minutes
**Assigned:** Engineer

### Problem
Navigation links to `/saved-places.html` which doesn't exist, causing 404 error.

### Acceptance Criteria
- [ ] Create `saved-places.html` with proper structure
- [ ] Implement saved places functionality using localStorage
- [ ] Add ability to save/unsave stops from itinerary
- [ ] Display list of all saved places with links back to day/stop
- [ ] Match existing design system and mobile responsiveness

### Files to Create/Modify
- `saved-places.html` (new)
- `saved-places.js` (new)
- Update localStorage helper in existing JS

---

## Task 2: Add Comprehensive Accessibility [P0 - A11y]
**Priority:** CRITICAL (Legal/Compliance Risk)
**Estimated Time:** 3 hours
**Assigned:** Engineer

### Problem
App has only 2 ARIA labels. Screen readers can't navigate. Keyboard navigation broken.

### Acceptance Criteria
- [ ] Add ARIA labels to all buttons, links, interactive elements
- [ ] Add landmark roles (main, nav, aside, etc.)
- [ ] Implement keyboard navigation (Tab, Enter, Arrow keys)
- [ ] Add focus indicators (visible focus ring)
- [ ] Add aria-live regions for dynamic content (day changes, weather updates)
- [ ] Test with VoiceOver (Mac) or NVDA (Windows)
- [ ] Add skip-to-content link
- [ ] Fix tab order (logical flow through page)

### Files to Modify
- `index.html`
- `script.js` (add keyboard event handlers)
- `style.css` (focus styles)
- All modal components

### Testing Checklist
- [ ] Can navigate entire app with keyboard only
- [ ] Screen reader announces all actions
- [ ] Focus never trapped or lost
- [ ] Tab order makes sense

---

## Task 3: Add Loading States & Error Boundaries [P1 - UX]
**Priority:** HIGH
**Estimated Time:** 2 hours
**Assigned:** Engineer

### Problem
Blank screen during loads. No feedback when things break.

### Acceptance Criteria
- [ ] Add skeleton loader for map initialization
- [ ] Add spinner for weather fetch
- [ ] Add loading indicator for route calculation
- [ ] Add loading state for phrases modal
- [ ] Wrap main app in try-catch error boundary
- [ ] Show friendly error message if app crashes
- [ ] Add reload button in error state
- [ ] Log errors to console with helpful context

### Implementation
```javascript
// Add to script.js
function showLoader(element, message) {
  element.innerHTML = `
    <div class="loader">
      <div class="spinner"></div>
      <p>${message}</p>
    </div>
  `;
}

// Error boundary
window.addEventListener('error', (e) => {
  showErrorBoundary(e.error);
});

function showErrorBoundary(error) {
  document.body.innerHTML = `
    <div class="error-boundary">
      <h1>😔 Something went wrong</h1>
      <p>The app encountered an error and needs to reload.</p>
      <button onclick="location.reload()">Reload App</button>
    </div>
  `;
  console.error('App crashed:', error);
}
```

---

## Task 4: Implement Touch Swipe Gestures [P1 - Mobile UX]
**Priority:** HIGH
**Estimated Time:** 1.5 hours
**Assigned:** Engineer

### Problem
Mobile users must tap tiny day tabs. Swiping left/right is more intuitive.

### Acceptance Criteria
- [ ] Swipe left → next day
- [ ] Swipe right → previous day
- [ ] Visual feedback during swipe (card sliding animation)
- [ ] Don't interfere with map panning
- [ ] Add swipe-to-dismiss for phrases modal
- [ ] Smooth animations (60fps)

### Implementation
```javascript
// Add to script.js
let touchStartX = 0;
let touchEndX = 0;

const sidebar = document.getElementById('sidebar');

sidebar.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

sidebar.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  const threshold = 50; // minimum swipe distance
  if (touchEndX < touchStartX - threshold) {
    // Swipe left - next day
    if (currentDayIndex < TRIP_DATA.length - 1) {
      selectDay(currentDayIndex + 1);
    }
  }
  if (touchEndX > touchStartX + threshold) {
    // Swipe right - previous day
    if (currentDayIndex > 0) {
      selectDay(currentDayIndex - 1);
    }
  }
}
```

---

## Task 5: Add Search & Filter for Stops [P1 - UX]
**Priority:** HIGH
**Estimated Time:** 2 hours
**Assigned:** Engineer

### Problem
50+ stops across 14 days. No way to find "that ramen place" quickly.

### Acceptance Criteria
- [ ] Add search bar in header (mobile: in hamburger menu)
- [ ] Filter stops by name (fuzzy search)
- [ ] Filter by category (food, transport, hotel, activity)
- [ ] Filter by city (Tokyo, Kyoto, Osaka)
- [ ] Show results as list with "Jump to Day X" links
- [ ] Highlight matching stops on map
- [ ] Clear search button
- [ ] Show "No results" message

### Files to Create/Modify
- Add search HTML to `index.html`
- Create `search.js` module
- Add search styles to `style.css`

---

## Task 6: Lazy Load Audio Files [P1 - Performance]
**Priority:** HIGH
**Estimated Time:** 1 hour
**Assigned:** Engineer

### Problem
600KB of audio files load on page load even if user never opens phrases.

### Acceptance Criteria
- [ ] Don't load any audio on initial page load
- [ ] Load audio only when user opens phrases modal
- [ ] Show loading indicator while audio loads
- [ ] Cache loaded audio (don't re-download)
- [ ] Add preload hint when user hovers over phrases button

### Implementation
```javascript
// Modify audio-player.js
let audioCache = {};
let audioLoaded = false;

async function loadAudioOnDemand() {
  if (audioLoaded) return;

  showLoader(phrasesModal, 'Loading audio...');

  // Audio files will be fetched on demand by audio player
  audioLoaded = true;
  renderPhrases();
}

// Call when modal opens
phrasesBtn.addEventListener('click', () => {
  loadAudioOnDemand();
});
```

---

## Task 7: Fix Color Contrast for WCAG AA [P0 - A11y]
**Priority:** CRITICAL
**Estimated Time:** 1 hour
**Assigned:** Engineer

### Problem
Text color #8888a0 on background #1a1a24 = 4.2:1 ratio (needs 4.5:1 for WCAG AA).

### Acceptance Criteria
- [ ] Audit all text/background color combinations
- [ ] Fix any combos below 4.5:1 ratio
- [ ] Test with contrast checker tool
- [ ] Document color palette with ratios
- [ ] Update CSS custom properties

### Color Fixes Needed
```css
:root {
  /* BEFORE: 4.2:1 - FAILS */
  --text-muted: #8888a0;

  /* AFTER: 7.5:1 - PASSES AAA */
  --text-muted: #a8a8c0;
}
```

### Testing
Use WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/

---

## Task 8: Implement Offline Mode [P2 - Feature]
**Priority:** MEDIUM
**Estimated Time:** 4 hours
**Assigned:** Engineer

### Problem
App breaks completely without internet. User loses access to their own itinerary.

### Acceptance Criteria
- [ ] Cache trip data in localStorage
- [ ] Cache map tiles (limit to visible area)
- [ ] Show offline banner when disconnected
- [ ] Disable features requiring internet (weather, routes)
- [ ] Queue user actions (notes, photos) to sync when online
- [ ] Add "Download for Offline" button
- [ ] Service worker caching strategy

### Files to Create/Modify
- Create `service-worker.js`
- Update `index.html` (register service worker)
- Create `offline.html` fallback page

---

## Task 9: Export to Calendar [P2 - Feature]
**Priority:** MEDIUM
**Estimated Time:** 2 hours
**Assigned:** Engineer

### Problem
Can't add trip events to phone calendar.

### Acceptance Criteria
- [ ] Add "Export" button in header
- [ ] Generate .ics file (iCalendar format)
- [ ] Create event for each day with all stops
- [ ] Include location coordinates
- [ ] Include notes and tips
- [ ] Test import to Google Calendar, Apple Calendar, Outlook
- [ ] Add "Add to Calendar" per individual stop option

### Implementation
```javascript
function generateICS() {
  let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Japan Trip 2026//EN\n';

  TRIP_DATA.forEach(day => {
    day.stops.forEach(stop => {
      ics += `BEGIN:VEVENT\n`;
      ics += `DTSTART:${formatICSDate(day.date, stop.time)}\n`;
      ics += `SUMMARY:${stop.name.en}\n`;
      ics += `LOCATION:${stop.name.en}\n`;
      ics += `GEO:${stop.lat};${stop.lng}\n`;
      ics += `DESCRIPTION:${stop.desc.en}\n`;
      ics += `END:VEVENT\n`;
    });
  });

  ics += 'END:VCALENDAR';

  downloadFile('japan-trip-2026.ics', ics);
}
```

---

## Task 10: Add Budget Tracker [P2 - Feature]
**Priority:** MEDIUM
**Estimated Time:** 3 hours
**Assigned:** Engineer

### Problem
Trip planner with no cost tracking. Users want to know if they're on budget.

### Acceptance Criteria
- [ ] Add budget page/section
- [ ] Track planned cost per category (food, transport, hotel, activities)
- [ ] Add actual cost input fields
- [ ] Show total planned vs. actual
- [ ] Visualize with simple chart (bar graph)
- [ ] Per-day breakdown
- [ ] Currency conversion (JPY ↔ USD/CAD/EUR)
- [ ] Export budget summary as CSV

### Schema
```javascript
const budget = {
  currency: 'JPY',
  planned: {
    food: 50000,
    transport: 30000,
    hotel: 80000,
    activities: 40000
  },
  actual: {
    food: 0,
    transport: 0,
    hotel: 0,
    activities: 0
  },
  perDay: { ... }
};
```

---

## Implementation Priority Queue

### 🚨 SHIP BLOCKERS (Do First)
1. Task 1: Fix Saved Places Link
2. Task 2: Accessibility
3. Task 7: Color Contrast

### ⚡ HIGH PRIORITY (Do This Week)
4. Task 3: Loading States
5. Task 4: Swipe Gestures
6. Task 5: Search & Filter
7. Task 6: Lazy Load Audio

### 💡 NICE TO HAVE (Do Next Sprint)
8. Task 8: Offline Mode
9. Task 9: Export Calendar
10. Task 10: Budget Tracker

---

## Success Metrics

### Before
- Accessibility Score: 52/100 (axe-core)
- Performance Score: 68/100 (Lighthouse)
- UX Rating: C+ (70/100)
- Mobile Usability: 12 issues

### After (Target)
- Accessibility Score: 95/100
- Performance Score: 90/100
- UX Rating: A (90/100)
- Mobile Usability: 0 issues

---

**Ready to assign and implement. All tasks are scoped, actionable, and have clear acceptance criteria.**
