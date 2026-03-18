'use client';

import React from 'react';
import { getBookingLink, getKlookLink } from '@/lib/affiliateLinks';

interface BookingCTAProps {
  location: string;
  city?: string;
  type: 'hotel' | 'activity';
  activityId?: string;
  checkIn?: string;
  checkOut?: string;
  className?: string;
}

export default function BookingCTA({
  location,
  city = 'Tokyo',
  type,
  activityId,
  checkIn,
  checkOut,
  className = '',
}: BookingCTAProps) {
  const handleAffiliateClick = async (provider: string, url: string) => {
    try {
      // Track click event
      await fetch('/api/track-affiliate-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          location,
          city,
          url,
          timestamp: new Date().toISOString(),
        }),
      });

      // Open link in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to track affiliate click:', error);
      // Still open the link even if tracking fails
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (type === 'hotel') {
    const bookingLink = getBookingLink(location, city, checkIn, checkOut);

    return (
      <div className={`booking-cta ${className}`}>
        <button
          onClick={() => handleAffiliateClick(bookingLink.provider, bookingLink.url)}
          className="booking-btn booking-btn-primary"
          aria-label={`Book hotel on ${bookingLink.provider}`}
        >
          <img
            src="/icons/booking-logo.svg"
            alt="Booking.com"
            className="provider-logo"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span>Book Hotel on Booking.com</span>
        </button>
        <p className="disclosure">We may earn a commission from bookings at no extra cost to you</p>

        <style jsx>{`
          .booking-cta {
            margin: 1rem 0;
          }
          .booking-btn {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.875rem 1.5rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.2s ease;
            width: 100%;
            justify-content: center;
          }
          .booking-btn-primary {
            background: linear-gradient(135deg, #003580 0%, #0057B8 100%);
            color: white;
          }
          .booking-btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 53, 128, 0.3);
          }
          .provider-logo {
            height: 20px;
            width: auto;
          }
          .disclosure {
            font-size: 0.75rem;
            color: #666;
            margin-top: 0.5rem;
            text-align: center;
          }
        `}</style>
      </div>
    );
  }

  if (type === 'activity' && activityId) {
    const klookLink = getKlookLink(activityId, location);

    return (
      <div className={`booking-cta ${className}`}>
        <button
          onClick={() => handleAffiliateClick(klookLink.provider, klookLink.url)}
          className="booking-btn booking-btn-activity"
          aria-label={`Book activity on ${klookLink.provider}`}
        >
          <img
            src="/icons/klook-logo.svg"
            alt="Klook"
            className="provider-logo"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span>Book Activity on Klook</span>
        </button>
        <p className="disclosure">We may earn a commission from bookings at no extra cost to you</p>

        <style jsx>{`
          .booking-cta {
            margin: 1rem 0;
          }
          .booking-btn {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.875rem 1.5rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.2s ease;
            width: 100%;
            justify-content: center;
          }
          .booking-btn-activity {
            background: linear-gradient(135deg, #FF5722 0%, #FF6F00 100%);
            color: white;
          }
          .booking-btn-activity:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 87, 34, 0.3);
          }
          .provider-logo {
            height: 20px;
            width: auto;
          }
          .disclosure {
            font-size: 0.75rem;
            color: #666;
            margin-top: 0.5rem;
            text-align: center;
          }
        `}</style>
      </div>
    );
  }

  return null;
}
