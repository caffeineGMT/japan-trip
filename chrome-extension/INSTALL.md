# Installation Guide - Save to Japan Trip Extension

## Quick Start (5 minutes)

### Step 1: Download the Extension

Download the extension folder from GitHub or navigate to the `chrome-extension` directory in your local clone.

### Step 2: Open Chrome Extensions

1. Open Google Chrome
2. Type `chrome://extensions/` in the address bar and press Enter
3. You should see the Chrome Extensions management page

### Step 3: Enable Developer Mode

1. Look for the "Developer mode" toggle in the **top-right** corner
2. Click it to turn it **ON** (it should be blue/enabled)
3. New buttons will appear: "Load unpacked", "Pack extension", "Update"

### Step 4: Load the Extension

1. Click the **"Load unpacked"** button
2. Navigate to the `chrome-extension` folder
3. Select the folder (not individual files)
4. Click **"Select"** or **"Open"**

### Step 5: Verify Installation

You should now see "Save to Japan Trip" in your extensions list with:
- ✅ Green checkmark icon
- Version 1.0.0
- "Enabled" status

### Step 6: Pin the Extension (Optional but Recommended)

1. Look for the **puzzle piece icon** (🧩) in your Chrome toolbar (top-right)
2. Click it to open the extensions menu
3. Find "Save to Japan Trip"
4. Click the **pin icon** next to it
5. The extension icon should now appear in your toolbar

## Testing the Extension

### Test on Google Maps

1. Go to [Google Maps](https://www.google.com/maps)
2. Search for any place (e.g., "Senso-ji Temple Tokyo")
3. Click on the place to open details
4. Wait 1-2 seconds for the page to load
5. Look for the **"Save to Japan Trip"** button (gradient red-orange button with icon)
6. Click the button
7. You should see a success notification: "Saved to your Japan trip!"

### Test on TripAdvisor

1. Go to [TripAdvisor](https://www.tripadvisor.com)
2. Search for a place in Japan
3. Click on any attraction/restaurant
4. Look for the "Save to Japan Trip" button
5. Click to save

### Test on Airbnb

1. Go to [Airbnb](https://www.airbnb.com)
2. Search for accommodations in Japan
3. Click on any listing
4. Look for the "Save to Japan Trip" button
5. Click to save

### View Your Saved Places

1. Click the extension icon in your toolbar (or puzzle menu)
2. Click **"Open My Trip Planner"** button
3. Or directly visit: `https://japan-trip-companion.vercel.app/saved-places`
4. You should see all places you've saved!

## Troubleshooting

### Issue: "Load unpacked" button is grayed out

**Solution**: Make sure Developer Mode is enabled (toggle in top-right should be ON/blue)

### Issue: Extension loads but shows errors

**Solution**:
1. Make sure all files are present in the folder
2. Check that `manifest.json` exists
3. Try clicking the "Refresh" icon on the extension card
4. Check the errors tab for specific issues

### Issue: Button doesn't appear on websites

**Solution**:
1. Refresh the page after installing the extension
2. Wait 2-3 seconds for the page to fully load
3. Make sure you're on the detail/listing page (not search results)
4. Check browser console (F12) for errors

### Issue: "Failed to save" error

**Solution**:
1. Make sure you have internet connection
2. Check that the app server is running (if testing locally)
3. For production, verify `https://japan-trip-companion.vercel.app` is accessible

### Issue: No saved places showing up

**Solution**:
1. Make sure the save was successful (green notification appeared)
2. Refresh the saved-places page
3. Check browser console for API errors

## Updating the Extension

When a new version is released:

1. Go to `chrome://extensions/`
2. Find "Save to Japan Trip"
3. Click the **refresh icon** (circular arrow)
4. Or download the new version and repeat the installation steps

## Uninstalling

1. Go to `chrome://extensions/`
2. Find "Save to Japan Trip"
3. Click **"Remove"**
4. Confirm removal
5. Your saved data in the app will remain intact

## Local Development Setup

If you're a developer working on the extension:

1. **Install dependencies** (for icon generation):
   ```bash
   cd chrome-extension
   npm install sharp
   ```

2. **Generate icons** (if needed):
   ```bash
   node generate-icons.js
   ```

3. **Start the backend server** (required for testing):
   ```bash
   cd ..
   npm start
   # Server runs on http://localhost:3000
   ```

4. **Update API URL** for local testing:
   - Open `background.js`
   - Change API_URL to `http://localhost:3000/api/extension/save-poi`

5. **Load the extension** in Chrome (steps above)

6. **Test and iterate**:
   - Make changes to code
   - Click refresh icon on extension card in `chrome://extensions/`
   - Test on supported websites

## Publishing to Chrome Web Store

### Prerequisites

- Google Developer account ($5 one-time fee)
- High-quality promotional images
- Privacy policy URL
- Support email address

### Steps

1. **Prepare the package**:
   ```bash
   cd chrome-extension
   zip -r save-to-japan-trip.zip . -x "*.git*" -x "node_modules/*" -x "generate-icons.js" -x "*.md"
   ```

2. **Create store listing**:
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Click "New Item"
   - Upload ZIP file
   - Fill in all required fields

3. **Listing Details**:
   - **Name**: Save to Japan Trip
   - **Summary**: Save places from Google Maps, TripAdvisor & Airbnb to your Japan trip with 1 click
   - **Description**: (Use the detailed description from README)
   - **Category**: Productivity
   - **Language**: English

4. **Screenshots** (required):
   - Take 5 screenshots showing the extension in action
   - Size: 1280x800 or 640x400
   - Show the button on different platforms

5. **Promotional Images**:
   - Small tile: 440x280
   - Marquee: 1400x560

6. **Privacy**:
   - Single purpose description
   - Permission justifications
   - Privacy policy URL

7. **Submit for Review**:
   - Review can take 1-3 days
   - Address any feedback from Google
   - Once approved, it's live!

## Support

Need help?

- **GitHub Issues**: [Report a bug](https://github.com/caffeineGMT/japan-trip/issues)
- **Email**: support@japan-trip-companion.com
- **Documentation**: [Full README](./README.md)

## Success Checklist

- [ ] Extension loaded in Chrome
- [ ] Developer mode enabled
- [ ] Extension icon visible in toolbar
- [ ] Tested on Google Maps - button appears ✓
- [ ] Tested on TripAdvisor - button appears ✓
- [ ] Tested on Airbnb - button appears ✓
- [ ] Successfully saved a place
- [ ] Viewed saved places on dashboard
- [ ] Extension popup shows statistics

If all checkboxes are checked, you're good to go! 🎉

Enjoy planning your Japan trip! 🗾✨
