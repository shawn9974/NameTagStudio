
export enum PaperSize {
  A4 = 'A4',
  LETTER = 'LETTER'
}

export enum LayoutType {
  GRID_2X4 = '2x4', // 8 tags
  GRID_2X5 = '2x5', // 10 tags
  GRID_3X6 = '3x6', // 18 tags
  DIY = 'DIY'      // Custom grid
}

export type BannerPosition = 'top' | 'bottom' | 'none';

export interface LogoSettings {
  corner: boolean;
  background: boolean;
}

export interface TagConfig {
  paperSize: PaperSize;
  layout: LayoutType;
  diyCols: number;
  diyRows: number;
  primaryColor: string;
  textColor: string;
  bannerTextColor: string;
  backgroundColor: string;
  nameFontSize: number;
  subtitleFontSize: number;
  eventTitleFontSize: number;
  fontFamily: string;
  showBorders: boolean;
  eventTitle: string;
  spacing: number;
  tagWidth: number;
  tagHeight: number;
  nameSubtitleGap: number;
  bannerPosition: BannerPosition;
  logoSettings: LogoSettings;
  logoDataCorner: string | null;
  logoDataBackground: string | null;
}

export interface TagData {
  name: string;
  subtitle?: string;
}
