// Map Smoke Test - Verify Leaflet map initialization and functionality
// Run this in browser console after page loads

console.log('=== MAP SMOKE TEST START ===');

const tests = {
  passed: [],
  failed: [],
  warnings: []
};

function pass(testName) {
  tests.passed.push(testName);
  console.log(`✓ ${testName}`);
}

function fail(testName, error) {
  tests.failed.push({ name: testName, error });
  console.error(`✗ ${testName}:`, error);
}

function warn(testName, message) {
  tests.warnings.push({ name: testName, message });
  console.warn(`⚠ ${testName}:`, message);
}

// Test 1: Leaflet.js loaded
function testLeafletLoaded() {
  const testName = 'Leaflet.js Library Loaded';
  try {
    if (typeof L !== 'undefined' && L.version) {
      pass(`${testName} (v${L.version})`);
      return true;
    } else {
      fail(testName, 'L is undefined');
      return false;
    }
  } catch (error) {
    fail(testName, error.message);
    return false;
  }
}

// Test 2: Map container exists
function testMapContainerExists() {
  const testName = 'Map Container Exists';
  try {
    const container = document.getElementById('map');
    if (container) {
      const rect = container.getBoundingClientRect();
      pass(`${testName} (${rect.width}px × ${rect.height}px)`);

      if (rect.height === 0) {
        warn('Map Container Height', 'Container has zero height - map may not be visible');
        return false;
      }
      return true;
    } else {
      fail(testName, 'Container #map not found in DOM');
      return false;
    }
  } catch (error) {
    fail(testName, error.message);
    return false;
  }
}

// Test 3: Map object initialized
function testMapInitialized() {
  const testName = 'Map Object Initialized';
  try {
    if (typeof map !== 'undefined' && map !== null) {
      pass(`${testName} (Leaflet v${L.version})`);
      return true;
    } else {
      fail(testName, 'Global map variable is null or undefined');
      return false;
    }
  } catch (error) {
    fail(testName, error.message);
    return false;
  }
}

// Test 4: Map has tile layer
function testTileLayer() {
  const testName = 'Tile Layer Present';
  try {
    if (map && map._layers) {
      const layerCount = Object.keys(map._layers).length;
      if (layerCount > 0) {
        pass(`${testName} (${layerCount} layers)`);
        return true;
      } else {
        fail(testName, 'No layers found on map');
        return false;
      }
    } else {
      fail(testName, 'Cannot access map layers');
      return false;
    }
  } catch (error) {
    fail(testName, error.message);
    return false;
  }
}

// Test 5: Map view is set
function testMapView() {
  const testName = 'Map View Set';
  try {
    if (map) {
      const center = map.getCenter();
      const zoom = map.getZoom();

      if (center.lat !== 0 || center.lng !== 0) {
        pass(`${testName} (center: [${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}], zoom: ${zoom})`);
        return true;
      } else {
        warn(testName, 'Map still at initial [0,0] coordinates - template may not have loaded');
        return false;
      }
    } else {
      fail(testName, 'Map not initialized');
      return false;
    }
  } catch (error) {
    fail(testName, error.message);
    return false;
  }
}

// Test 6: Markers present
function testMarkersPresent() {
  const testName = 'Markers Present';
  try {
    if (typeof markers !== 'undefined' && Array.isArray(markers)) {
      if (markers.length > 0) {
        pass(`${testName} (${markers.length} markers)`);
        return true;
      } else {
        warn(testName, 'No markers on map - template may not have loaded or no stops for current day');
        return false;
      }
    } else {
      fail(testName, 'markers array not found');
      return false;
    }
  } catch (error) {
    fail(testName, error.message);
    return false;
  }
}

// Test 7: Template data loaded
function testTemplateDataLoaded() {
  const testName = 'Template Data Loaded';
  try {
    if (typeof TRIP_DATA !== 'undefined' && Array.isArray(TRIP_DATA) && TRIP_DATA.length > 0) {
      pass(`${testName} (${TRIP_DATA.length} days)`);
      return true;
    } else {
      fail(testName, 'TRIP_DATA not loaded or empty');
      return false;
    }
  } catch (error) {
    fail(testName, error.message);
    return false;
  }
}

// Test 8: Map is visible (not blank)
function testMapVisible() {
  const testName = 'Map Tiles Visible';
  try {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      fail(testName, 'Map container not found');
      return false;
    }

    // Check if there are any tile images loaded
    const tiles = mapContainer.querySelectorAll('.leaflet-tile');

    if (tiles.length > 0) {
      // Count loaded tiles
      let loadedTiles = 0;
      tiles.forEach(tile => {
        if (tile.complete && tile.naturalWidth > 0) {
          loadedTiles++;
        }
      });

      if (loadedTiles > 0) {
        pass(`${testName} (${loadedTiles}/${tiles.length} tiles loaded)`);
        return true;
      } else {
        warn(testName, `${tiles.length} tiles found but none loaded yet - may still be loading`);
        return false;
      }
    } else {
      warn(testName, 'No tiles found - map may be blank or still loading');
      return false;
    }
  } catch (error) {
    fail(testName, error.message);
    return false;
  }
}

// Test 9: Map interactive (zoom/pan controls)
function testMapInteractive() {
  const testName = 'Map Interactive';
  try {
    if (map) {
      const zoomControl = map.zoomControl;
      const dragging = map.dragging;

      if (zoomControl && dragging) {
        pass(`${testName} (zoom and drag enabled)`);
        return true;
      } else {
        warn(testName, 'Some map interactions may be disabled');
        return false;
      }
    } else {
      fail(testName, 'Map not initialized');
      return false;
    }
  } catch (error) {
    fail(testName, error.message);
    return false;
  }
}

// Test 10: Console errors check
function testConsoleErrors() {
  const testName = 'Console Errors Check';
  // This is informational - we can't actually catch all console errors
  // But we can log that the user should check
  console.log(`ℹ️ ${testName}: Check browser console (F12) for any red errors`);
  return true;
}

// Run all tests
async function runTests() {
  console.log('\n📋 Running Map Smoke Tests...\n');

  testLeafletLoaded();
  testMapContainerExists();
  testMapInitialized();
  testTileLayer();
  testMapView();
  testMarkersPresent();
  testTemplateDataLoaded();

  // Wait a bit for tiles to load
  await new Promise(resolve => setTimeout(resolve, 1000));

  testMapVisible();
  testMapInteractive();
  testConsoleErrors();

  // Summary
  console.log('\n=== TEST SUMMARY ===');
  console.log(`✓ Passed: ${tests.passed.length}`);
  console.log(`✗ Failed: ${tests.failed.length}`);
  console.log(`⚠ Warnings: ${tests.warnings.length}`);

  if (tests.failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    tests.failed.forEach(({ name, error }) => {
      console.log(`  - ${name}: ${error}`);
    });
  }

  if (tests.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    tests.warnings.forEach(({ name, message }) => {
      console.log(`  - ${name}: ${message}`);
    });
  }

  if (tests.failed.length === 0) {
    console.log('\n✅ ALL CRITICAL TESTS PASSED!');
    console.log('🗺️  Map should be visible and working correctly.');
  } else {
    console.log('\n❌ SOME TESTS FAILED');
    console.log('🔍 Check failed tests above and browser console for errors.');
  }

  console.log('\n=== MAP SMOKE TEST END ===');

  return {
    passed: tests.passed.length,
    failed: tests.failed.length,
    warnings: tests.warnings.length,
    success: tests.failed.length === 0
  };
}

// Auto-run tests
runTests().then(results => {
  window.mapTestResults = results;
  console.log('Results saved to window.mapTestResults');
});
