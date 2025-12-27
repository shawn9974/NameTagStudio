
import { PaperSize, LayoutType, TagConfig } from './types';

export const DEFAULT_LOGO_SVG = `data:image/svg+xml;base64,${btoa(`
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="20" fill="#2563eb" />
  <circle cx="50" cy="40" r="15" fill="white" fill-opacity="0.8" />
  <rect x="25" y="65" width="50" height="10" rx="5" fill="white" fill-opacity="0.8" />
</svg>
`)}`;

export const COLOR_PRESETS = [
  '#2563eb', // Blue
  '#dc2626', // Red
  '#16a34a', // Green
  '#ca8a04', // Yellow
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#1e293b', // Slate
  '#000000', // Black
];

export const DEFAULT_CONFIG: TagConfig = {
  paperSize: PaperSize.A4,
  layout: LayoutType.GRID_2X4,
  diyCols: 2,
  diyRows: 4,
  primaryColor: '#2563eb',
  textColor: '#1e293b',
  bannerTextColor: '#ffffff',
  backgroundColor: '#ffffff',
  nameFontSize: 28,
  subtitleFontSize: 14,
  eventTitleFontSize: 9,
  fontFamily: 'Helvetica',
  showBorders: true,
  eventTitle: 'Main Conference 2024',
  spacing: 5,
  tagWidth: 90,
  tagHeight: 60,
  nameSubtitleGap: 8,
  bannerPosition: 'top',
  logoSettings: {
    corner: false,
    background: false
  },
  logoDataCorner: null,
  logoDataBackground: null
};

export const FONTS = [
  { name: 'Helvetica', value: 'Helvetica' },
  { name: 'Times New Roman', value: 'Times' },
  { name: 'Courier', value: 'Courier' }
];

export const LAYOUTS = {
  [LayoutType.GRID_2X4]: { cols: 2, rows: 4, count: 8 },
  [LayoutType.GRID_2X5]: { cols: 2, rows: 5, count: 10 },
  [LayoutType.GRID_3X6]: { cols: 3, rows: 6, count: 18 },
  [LayoutType.DIY]: { cols: 2, rows: 4, count: 8 } // Default DIY
};

export const PAPER_DIMENSIONS = {
  [PaperSize.A4]: { width: 210, height: 297 },
  [PaperSize.LETTER]: { width: 215.9, height: 279.4 }
};
