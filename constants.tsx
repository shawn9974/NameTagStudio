
import { PaperSize, LayoutType, TagConfig } from './types';

export const DEFAULT_LOGO_SVG = `data:image/svg+xml;base64,${btoa(`
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="20" fill="#2563eb" />
  <circle cx="50" cy="40" r="15" fill="white" fill-opacity="0.8" />
  <rect x="25" y="65" width="50" height="10" rx="5" fill="white" fill-opacity="0.8" />
</svg>
`)}`;

export const COLOR_PRESETS = [
  '#002b60', // Brand Blue (RGB 0/43/96, CMYK 100/60/0/60, PANTONE P108-16C)
  '#2563eb', // Blue
  '#dc2626', // Red
  '#16a34a', // Green
  '#ca8a04', // Yellow
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#1e293b', // Slate
  '#000000', // Black
];

// Exact print values (C, M, Y, K from 0 to 1) used in the PDF instead of converting from RGB
export const CMYK_COLORS: Record<string, [number, number, number, number]> = {
  '#002b60': [1, 0.6, 0, 0.6]
};

export const DEFAULT_CONFIG: TagConfig = {
  paperSize: PaperSize.A4,
  layout: LayoutType.GRID_2X4,
  diyCols: 2,
  diyRows: 4,
  primaryColor: '#002b60',
  textColor: '#000000',
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
  logoDataBackground: null,
  cornerLogoSize: 15,
  cornerLogoOpacity: 100,
  backgroundImageSize: 100,
  backgroundImageOpacity: 12,
  backgroundImageOffsetY: 0
};

export const FONTS = [
  { name: 'Helvetica', value: 'Helvetica' },
  { name: 'Times New Roman', value: 'Times' },
  { name: 'Courier', value: 'Courier' }
];

// CSS font lists, with system fonts that cover Chinese, Japanese and Korean
export const FONT_STACKS: Record<string, string> = {
  Helvetica: 'Helvetica, Arial, "Microsoft YaHei", "Microsoft JhengHei", "PingFang SC", "Noto Sans CJK SC", "Malgun Gothic", sans-serif',
  Times: 'Times, "Times New Roman", SimSun, PMingLiU, "Songti SC", "Noto Serif CJK SC", "Batang", serif',
  Courier: 'Courier, "Courier New", "Microsoft YaHei", "Microsoft JhengHei", "PingFang SC", "Noto Sans CJK SC", "Malgun Gothic", monospace'
};

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
