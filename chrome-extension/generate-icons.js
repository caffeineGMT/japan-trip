// Generate extension icons
const fs = require('fs');
const sharp = require('sharp');

const sizes = [16, 48, 128];

async function generateIcons() {
  // Create SVG content
  const svg = `
    <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ef4444;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="28" fill="url(#bg)"/>
      <g transform="translate(24, 32)">
        <path d="M40 0L0 20L40 40L80 20L40 0Z" fill="white" opacity="0.9"/>
        <path d="M0 50L40 70L80 50" fill="white" opacity="0.8"/>
        <path d="M0 35L40 55L80 35" fill="white" opacity="0.85"/>
      </g>
      <text x="64" y="110" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle">JAPAN</text>
    </svg>
  `;

  // Generate icons in different sizes
  for (const size of sizes) {
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(`icons/icon-${size}.png`);

    console.log(`Generated icon-${size}.png`);
  }

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
