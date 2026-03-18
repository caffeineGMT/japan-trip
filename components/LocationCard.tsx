'use client';

import React from 'react';
import BookingCTA from './BookingCTA';

interface Location {
  name: string;
  city: string;
  description?: string;
  lat?: number;
  lng?: number;
  imageUrl?: string;
}

interface LocationCardProps {
  location: Location;
  checkIn?: string;
  checkOut?: string;
  className?: string;
}

export default function LocationCard({
  location,
  checkIn,
  checkOut,
  className = '',
}: LocationCardProps) {
  return (
    <div className={`location-card ${className}`}>
      {location.imageUrl && (
        <div className="location-image">
          <img src={location.imageUrl} alt={location.name} />
        </div>
      )}

      <div className="location-content">
        <h3 className="location-name">{location.name}</h3>
        <p className="location-city">{location.city}</p>

        {location.description && (
          <p className="location-description">{location.description}</p>
        )}

        {location.lat && location.lng && (
          <p className="location-coords">
            📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </p>
        )}

        <div className="location-actions">
          <BookingCTA
            location={location.name}
            city={location.city}
            type="hotel"
            checkIn={checkIn}
            checkOut={checkOut}
          />
        </div>
      </div>

      <style jsx>{`
        .location-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: box-shadow 0.2s ease;
        }
        .location-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }
        .location-image {
          width: 100%;
          height: 200px;
          overflow: hidden;
        }
        .location-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .location-content {
          padding: 1.5rem;
        }
        .location-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          margin: 0 0 0.5rem 0;
        }
        .location-city {
          font-size: 1rem;
          color: #FF6B9D;
          font-weight: 600;
          margin: 0 0 1rem 0;
        }
        .location-description {
          font-size: 0.95rem;
          color: #666;
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        .location-coords {
          font-size: 0.85rem;
          color: #999;
          margin-bottom: 1rem;
        }
        .location-actions {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #eee;
        }
      `}</style>
    </div>
  );
}
