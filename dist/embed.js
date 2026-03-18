/**
 * TripCompanion Embeddable Widget
 *
 * Usage:
 * <script src="https://tripcompanion.app/embed.js"
 *         data-trip="japan-cherry-blossom"
 *         data-affiliate="YOURAFFILIATECODE"></script>
 *
 * This script will automatically create an iframe widget showing a trip preview
 * with a call-to-action to view the full trip. Clicks are tracked for affiliate commission.
 */
(function() {
  'use strict';

  // Get the current script element
  var script = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  // Get configuration from data attributes
  var tripId = script.getAttribute('data-trip') || 'japan-cherry-blossom';
  var affiliateId = script.getAttribute('data-affiliate') || '';
  var width = script.getAttribute('data-width') || '100%';
  var height = script.getAttribute('data-height') || '400';
  var theme = script.getAttribute('data-theme') || 'light'; // light or dark

  // Base URL (production or development)
  var baseUrl = script.getAttribute('data-base-url') || 'https://tripcompanion.app';

  // Validate affiliate ID
  if (!affiliateId) {
    console.error('TripCompanion Widget: Missing data-affiliate attribute');
    return;
  }

  // Create container div
  var container = document.createElement('div');
  container.id = 'tripcompanion-widget-' + Date.now();
  container.className = 'tripcompanion-widget';
  container.style.cssText = 'width: ' + width + '; max-width: 100%; margin: 20px 0;';

  // Track impression
  trackEvent('impression');

  // Create iframe
  var iframe = document.createElement('iframe');
  iframe.src = baseUrl + '/embed/' + tripId + '?aff=' + encodeURIComponent(affiliateId) + '&theme=' + theme;
  iframe.style.cssText = 'width: 100%; height: ' + height + 'px; border: none; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.1);';
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('allow', 'clipboard-write');

  // Allow iframe to resize itself
  window.addEventListener('message', function(event) {
    if (event.origin !== baseUrl) return;

    if (event.data.type === 'tripcompanion-resize') {
      iframe.style.height = event.data.height + 'px';
    }

    if (event.data.type === 'tripcompanion-click') {
      trackEvent('click');
    }
  });

  // Append iframe to container
  container.appendChild(iframe);

  // Insert container after the script tag
  script.parentNode.insertBefore(container, script.nextSibling);

  /**
   * Track events (impression, click) to affiliate system
   */
  function trackEvent(actionType) {
    if (!affiliateId) return;

    // Send tracking pixel
    var img = new Image(1, 1);
    img.src = baseUrl + '/api/affiliate/track?' +
      'affiliate=' + encodeURIComponent(affiliateId) +
      '&trip=' + encodeURIComponent(tripId) +
      '&action=' + encodeURIComponent(actionType) +
      '&ref=' + encodeURIComponent(document.referrer || window.location.href) +
      '&t=' + Date.now();
    img.style.display = 'none';
    document.body.appendChild(img);

    // Remove pixel after load to clean up DOM
    img.onload = img.onerror = function() {
      setTimeout(function() {
        if (img.parentNode) {
          img.parentNode.removeChild(img);
        }
      }, 100);
    };
  }
})();
