# Quick Test Guide - Chrome Extension

## 5-Minute Local Test

### 1. Start the Server (Terminal 1)

```bash
cd /Users/michaelguo/japan-trip
npm start
```

Server should start on `http://localhost:3000`

### 2. Load Extension in Chrome

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (top-right toggle)
4. Click "Load unpacked"
5. Select folder: `/Users/michaelguo/japan-trip/chrome-extension`
6. Extension should appear with green checkmark

### 3. Test on Google Maps

1. Go to [Google Maps](https://www.google.com/maps)
2. Search: "Senso-ji Temple Tokyo"
3. Click on the place
4. Wait 2 seconds for page to load
5. **Look for "Save to Japan Trip" button** (gradient red-orange)
6. Click the button
7. Should see: "Saved to your Japan trip!" notification

### 4. Verify Save Worked

1. Open new tab
2. Go to `http://localhost:3000/saved-places`
3. You should see:
   - Stats: "1" in Total Saved
   - Place card for "Senso-ji Temple"
   - Source badge: "Google Maps"

### 5. Test Dashboard Features

On the saved-places page:

1. **Filter**: Click "Pending" tab - place should still show
2. **Mark as Added**: Click "Mark as Added" button
3. **Check Stats**: "Added to Trip" count should increase to 1
4. **Delete**: Click "Delete" button, confirm
5. Stats should update to 0

### 6. Test Extension Popup

1. Click extension icon in toolbar (or puzzle menu)
2. Should see:
   - "Places Saved: 0" (or 1 if you didn't delete)
   - "Last Saved: Just now" (or time ago)
3. Click "Open My Trip Planner" - should open in new tab

## What to Test

### Google Maps
- [ ] Button appears after place loads
- [ ] Button has gradient background
- [ ] Click shows loading state
- [ ] Success notification appears
- [ ] Data saved to /saved-places

### TripAdvisor
- [ ] Go to tripadvisor.com
- [ ] Search "Fushimi Inari Shrine Kyoto"
- [ ] Click on listing
- [ ] Button appears
- [ ] Save works

### Airbnb
- [ ] Go to airbnb.com
- [ ] Search "Tokyo"
- [ ] Click on any listing
- [ ] Button appears
- [ ] Save works

### API Endpoints
- [ ] POST /api/extension/save-poi - saves data
- [ ] GET /api/extension/saved-pois - returns list
- [ ] PATCH /api/extension/poi/:id - updates status
- [ ] DELETE /api/extension/poi/:id - deletes place

## Common Issues

### Button Doesn't Appear
- Refresh the page
- Check browser console (F12) for errors
- Make sure you're on detail page (not search results)
- Wait 3-5 seconds for page to fully load

### Save Fails
- Check server is running (`npm start`)
- Check browser console for error
- Verify API endpoint: `http://localhost:3000/api/extension/save-poi`
- Check server logs for errors

### No Data in Dashboard
- Check `/Users/michaelguo/japan-trip/data/saved-pois.json` exists
- Should be an array (even if empty: `[]`)
- Check server logs when loading saved-places page

## Quick Debug

### Check Extension Console
1. Go to `chrome://extensions/`
2. Find "Save to Japan Trip"
3. Click "service worker" link (under "Inspect views")
4. See background script logs

### Check Content Script Console
1. On Google Maps/TripAdvisor/Airbnb
2. Press F12
3. Go to Console tab
4. Look for `[Save to Japan Trip]` logs

### Check Network Requests
1. F12 → Network tab
2. Click save button
3. Look for POST to `/api/extension/save-poi`
4. Check response status (should be 200)

## Success Criteria

✅ **Extension works if:**
1. Button appears on all 3 platforms
2. Save successfully adds to saved-pois.json
3. Dashboard displays saved places
4. Stats update correctly
5. Mark as added works
6. Delete works
7. No console errors

## Next Steps After Testing

1. ✅ Test locally (you are here)
2. ⏳ Deploy to Vercel (when rate limit resets)
3. 📦 Package for Chrome Web Store
4. 🚀 Submit for review
5. 📣 Marketing launch

## Need Help?

- Check browser console (F12)
- Check server logs in terminal
- See `/chrome-extension/INSTALL.md` for detailed troubleshooting
- GitHub Issues: https://github.com/caffeineGMT/japan-trip/issues
