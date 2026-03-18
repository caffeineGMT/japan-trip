/**
 * Custom Marker Icons for Japan Trip Map
 * Defines Leaflet icons for different location categories
 */

import L from 'leaflet';

// Fix for default marker icon issue in webpack/bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Create custom icons using emoji or colored markers
const createCustomIcon = (emoji: string, color: string) => {
  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    ">
      <span style="
        transform: rotate(45deg);
        font-size: 18px;
      ">${emoji}</span>
    </div>`,
    className: 'custom-marker-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Category-specific icons
export const markerIcons = {
  restaurant: createCustomIcon('🍜', '#FF6B6B'),
  temple: createCustomIcon('⛩️', '#FFD93D'),
  sakura: createCustomIcon('🌸', '#FFB3D9'),
  hotel: createCustomIcon('🏨', '#6C5CE7'),
  attraction: createCustomIcon('🗼', '#00B4D8'),
  station: createCustomIcon('🚇', '#4ECDC4'),
  default: createCustomIcon('📍', '#95E1D3'),
  visited: createCustomIcon('✓', '#51CF66'),
};

// Create a highlighted version of any icon (for selected/hovered markers)
export const createHighlightedIcon = (emoji: string, color: string) => {
  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: 40px;
      height: 40px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid #FFD700;
      box-shadow: 0 4px 10px rgba(0,0,0,0.4);
      animation: pulse 1.5s infinite;
    ">
      <span style="
        transform: rotate(45deg);
        font-size: 22px;
      ">${emoji}</span>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { transform: scale(1) rotate(-45deg); }
        50% { transform: scale(1.1) rotate(-45deg); }
      }
    </style>`,
    className: 'custom-marker-icon highlighted',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// Get icon by category
export const getIconByCategory = (category: string, isVisited: boolean = false) => {
  if (isVisited) {
    return markerIcons.visited;
  }

  const iconKey = category as keyof typeof markerIcons;
  return markerIcons[iconKey] || markerIcons.default;
};

// Cluster icon creation function
export const createClusterIcon = (cluster: any) => {
  const childCount = cluster.getChildCount();
  let c = ' marker-cluster-';

  if (childCount < 10) {
    c += 'small';
  } else if (childCount < 100) {
    c += 'medium';
  } else {
    c += 'large';
  }

  return L.divIcon({
    html: `<div style="
      background-color: rgba(110, 204, 57, 0.6);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid rgba(110, 204, 57, 1);
      color: white;
      font-weight: bold;
      font-size: 14px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    ">${childCount}</div>`,
    className: 'marker-cluster' + c,
    iconSize: L.point(40, 40),
  });
};
