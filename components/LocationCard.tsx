'use client';

import React, { useState } from 'react';
import type { Location } from '@/lib/locationSchema';

interface LocationCardProps {
  location: Location;
  lang?: 'en' | 'ja' | 'zh';
}

const categoryColors: Record<Location['category'], string> = {
  food: '#e74c3c',
  culture: '#8e44ad',
  nature: '#27ae60',
  nightlife: '#2c3e50',
};

const seasonLabels: Record<string, Record<string, string>> = {
  spring: { en: 'Spring', ja: '春', zh: '春季' },
  summer: { en: 'Summer', ja: '夏', zh: '夏季' },
  fall: { en: 'Fall', ja: '秋', zh: '秋季' },
  winter: { en: 'Winter', ja: '冬', zh: '冬季' },
};

function getName(location: Location, lang: string): string {
  if (lang === 'ja') return location.name_ja;
  if (lang === 'zh') return location.name_zh;
  return location.name_en;
}

function getDescription(location: Location, lang: string): string {
  if (lang === 'ja') return location.description.ja;
  if (lang === 'zh') return location.description.zh;
  return location.description.en;
}

function formatCost(cost: number): string {
  if (cost === 0) return 'Free';
  return `¥${cost.toLocaleString()}`;
}

function getBestSeason(rating: Location['seasonalRating']): string {
  const entries = Object.entries(rating) as [string, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

export default function LocationCard({ location, lang = 'en' }: LocationCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [imgError, setImgError] = useState(false);

  const name = getName(location, lang);
  const description = getDescription(location, lang);
  const bestSeason = getBestSeason(location.seasonalRating);
  const catColor = categoryColors[location.category];
  const hasPhotos = location.photos.length > 0 && !imgError;

  return (
    <div className="location-card-v2">
      {/* Photo area */}
      <div className="lc-photo-container">
        {hasPhotos ? (
          <img
            src={location.photos[photoIndex]}
            alt={name}
            className="lc-photo"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="lc-photo-placeholder"
            style={{ backgroundColor: catColor + '22' }}
          >
            <span className="lc-placeholder-text">{location.subcategory}</span>
          </div>
        )}

        {hasPhotos && location.photos.length > 1 && (
          <div className="lc-photo-nav">
            <button
              onClick={() =>
                setPhotoIndex((i) => (i > 0 ? i - 1 : location.photos.length - 1))
              }
              className="lc-photo-nav-btn"
              aria-label="Previous photo"
            >
              ‹
            </button>
            <span className="lc-photo-counter">
              {photoIndex + 1}/{location.photos.length}
            </span>
            <button
              onClick={() =>
                setPhotoIndex((i) => (i < location.photos.length - 1 ? i + 1 : 0))
              }
              className="lc-photo-nav-btn"
              aria-label="Next photo"
            >
              ›
            </button>
          </div>
        )}

        <span
          className="lc-category-badge"
          style={{ backgroundColor: catColor }}
        >
          {location.subcategory}
        </span>
      </div>

      {/* Content */}
      <div className="lc-content">
        <h3 className="lc-name">{name}</h3>
        {lang !== 'ja' && <p className="lc-sub-name">{location.name_ja}</p>}

        <p className="lc-description">{description}</p>

        <div className="lc-meta-row">
          <span className="lc-cost">{formatCost(location.averageCost)}</span>
          <span className="lc-season-badge">
            {seasonLabels[bestSeason]?.[lang] || bestSeason}
          </span>
          {location.cherryBlossomRating !== null && location.cherryBlossomRating >= 3 && (
            <span
              className="lc-sakura"
              title={`Cherry blossom rating: ${location.cherryBlossomRating}/5`}
            >
              {'🌸'.repeat(Math.min(location.cherryBlossomRating, 5))}
            </span>
          )}
        </div>

        <div className="lc-season-bar">
          {(['spring', 'summer', 'fall', 'winter'] as const).map((season) => (
            <div key={season} className="lc-season-item">
              <span className="lc-season-label">
                {seasonLabels[season]?.[lang]?.[0] || season[0]}
              </span>
              <div className="lc-rating-bar">
                <div
                  className="lc-rating-fill"
                  style={{
                    width: `${(location.seasonalRating[season] / 5) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .location-card-v2 {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          background: #fff;
          width: 100%;
          max-width: 360px;
          transition: box-shadow 0.2s;
        }
        .location-card-v2:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }
        .lc-photo-container {
          position: relative;
          width: 100%;
          height: 200px;
          overflow: hidden;
        }
        .lc-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .lc-photo-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lc-placeholder-text {
          font-size: 1.2rem;
          color: #666;
          text-transform: capitalize;
        }
        .lc-photo-nav {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 16px;
          padding: 2px 8px;
        }
        .lc-photo-nav-btn {
          background: none;
          border: none;
          color: #fff;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 2px 6px;
        }
        .lc-photo-counter {
          color: #fff;
          font-size: 0.75rem;
        }
        .lc-category-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          color: #fff;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 4px;
          text-transform: capitalize;
        }
        .lc-content {
          padding: 12px 16px 16px;
        }
        .lc-name {
          margin: 0 0 2px;
          font-size: 1.1rem;
          font-weight: 700;
          color: #1a1a1a;
        }
        .lc-sub-name {
          margin: 0 0 8px;
          font-size: 0.8rem;
          color: #888;
        }
        .lc-description {
          margin: 0 0 12px;
          font-size: 0.85rem;
          color: #555;
          line-height: 1.4;
        }
        .lc-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }
        .lc-cost {
          font-weight: 700;
          font-size: 0.95rem;
          color: #e74c3c;
        }
        .lc-season-badge {
          font-size: 0.7rem;
          background: #f0f0f0;
          padding: 2px 8px;
          border-radius: 10px;
          color: #555;
        }
        .lc-sakura {
          font-size: 0.85rem;
        }
        .lc-season-bar {
          display: flex;
          gap: 4px;
        }
        .lc-season-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .lc-season-label {
          font-size: 0.6rem;
          color: #999;
          text-transform: uppercase;
        }
        .lc-rating-bar {
          width: 100%;
          height: 4px;
          background: #eee;
          border-radius: 2px;
          overflow: hidden;
        }
        .lc-rating-fill {
          height: 100%;
          background: #f0a4b8;
          border-radius: 2px;
          transition: width 0.3s;
        }
        @media (max-width: 360px) {
          .location-card-v2 {
            max-width: 100%;
            border-radius: 8px;
          }
          .lc-photo-container {
            height: 160px;
          }
          .lc-name {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
