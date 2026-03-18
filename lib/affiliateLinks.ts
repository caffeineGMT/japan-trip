/**
 * Affiliate Link Builders
 * Constructs deep links with affiliate params and UTM tracking
 */

export interface AffiliateLink {
  url: string;
  provider: string;
  commission_rate: number;
}

// Get affiliate IDs from environment
const BOOKING_AFFILIATE_ID = process.env.NEXT_PUBLIC_BOOKING_AFFILIATE_ID || 'demo_booking_2891748';
const AGODA_PARTNER_ID = process.env.NEXT_PUBLIC_AGODA_PARTNER_ID || 'demo_agoda_1234';
const KLOOK_AID = process.env.NEXT_PUBLIC_KLOOK_AID || 'demo_klook_5678';
const JRPASS_AFFILIATE_CODE = process.env.NEXT_PUBLIC_JRPASS_AFFILIATE_CODE || 'demo_jrpass_abc';

/**
 * Build Booking.com hotel link with affiliate tracking
 */
export function getBookingLink(
  locationName: string,
  city: string,
  checkIn?: string,
  checkOut?: string
): AffiliateLink {
  const baseUrl = 'https://www.booking.com/searchresults.html';

  const params = new URLSearchParams({
    aid: BOOKING_AFFILIATE_ID,
    ss: `${city}, ${locationName}`,
    checkin: checkIn || '',
    checkout: checkOut || '',
    utm_source: 'japan_trip',
    utm_medium: 'affiliate',
    utm_campaign: locationName.toLowerCase().replace(/\s+/g, '_'),
  });

  // Remove empty params
  if (!checkIn) params.delete('checkin');
  if (!checkOut) params.delete('checkout');

  return {
    url: `${baseUrl}?${params.toString()}`,
    provider: 'booking.com',
    commission_rate: 0.04, // 4% commission
  };
}

/**
 * Build Agoda hotel link with affiliate tracking
 */
export function getAgodaLink(
  locationName: string,
  city: string,
  checkIn?: string,
  checkOut?: string
): AffiliateLink {
  const baseUrl = 'https://www.agoda.com/search';

  const params = new URLSearchParams({
    cid: AGODA_PARTNER_ID,
    city: city,
    checkIn: checkIn || '',
    checkOut: checkOut || '',
    utm_source: 'japan_trip',
    utm_medium: 'affiliate',
    utm_campaign: locationName.toLowerCase().replace(/\s+/g, '_'),
  });

  if (!checkIn) params.delete('checkIn');
  if (!checkOut) params.delete('checkOut');

  return {
    url: `${baseUrl}?${params.toString()}`,
    provider: 'agoda',
    commission_rate: 0.05, // 5% commission
  };
}

/**
 * Build Klook activity link with affiliate tracking
 */
export function getKlookLink(activityId: string, locationName: string): AffiliateLink {
  const baseUrl = `https://www.klook.com/activity/${activityId}`;

  const params = new URLSearchParams({
    aid: KLOOK_AID,
    utm_source: 'japan_trip',
    utm_medium: 'affiliate',
    utm_campaign: locationName.toLowerCase().replace(/\s+/g, '_'),
  });

  return {
    url: `${baseUrl}?${params.toString()}`,
    provider: 'klook',
    commission_rate: 0.08, // 8% commission
  };
}

/**
 * Build JR Pass link with affiliate tracking
 */
export function getJRPassLink(passType: string = '7-day'): AffiliateLink {
  const baseUrl = 'https://www.jrpass.com/buy';

  const params = new URLSearchParams({
    affiliate: JRPASS_AFFILIATE_CODE,
    pass: passType,
    utm_source: 'japan_trip',
    utm_medium: 'affiliate',
    utm_campaign: 'jr_pass',
  });

  return {
    url: `${baseUrl}?${params.toString()}`,
    provider: 'jrpass',
    commission_rate: 0.05, // 5% commission
  };
}

/**
 * Get all affiliate links for a location
 */
export function getAllLinksForLocation(
  locationName: string,
  city: string,
  checkIn?: string,
  checkOut?: string
) {
  return {
    booking: getBookingLink(locationName, city, checkIn, checkOut),
    agoda: getAgodaLink(locationName, city, checkIn, checkOut),
  };
}
