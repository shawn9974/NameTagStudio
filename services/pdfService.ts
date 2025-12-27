
import { jsPDF } from 'jspdf';
import { TagConfig, TagData, LayoutType } from '../types';
import { LAYOUTS, PAPER_DIMENSIONS, DEFAULT_LOGO_SVG } from '../constants';

export const generateNameTagPDF = async (tags: TagData[], config: TagConfig) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: config.paperSize.toLowerCase()
  });

  const layout = config.layout === LayoutType.DIY 
    ? { cols: config.diyCols, rows: config.diyRows, count: config.diyCols * config.diyRows }
    : LAYOUTS[config.layout];
    
  const paper = PAPER_DIMENSIONS[config.paperSize];
  
  const tagWidth = config.tagWidth;
  const tagHeight = config.tagHeight;
  const spacing = config.spacing;
  const bannerRatio = 0.18;
  const bannerHeight = tagHeight * bannerRatio;
  
  const totalGridWidth = (layout.cols * tagWidth) + ((layout.cols - 1) * spacing);
  const totalGridHeight = (layout.rows * tagHeight) + ((layout.rows - 1) * spacing);
  
  const marginX = (paper.width - totalGridWidth) / 2;
  const marginY = (paper.height - totalGridHeight) / 2;

  let currentTagIndex = 0;

  while (currentTagIndex < tags.length) {
    if (currentTagIndex > 0 && currentTagIndex % (layout.cols * layout.rows) === 0) {
      doc.addPage();
    }

    const tag = tags[currentTagIndex];
    const pageTagIndex = currentTagIndex % (layout.cols * layout.rows);
    const col = pageTagIndex % layout.cols;
    const row = Math.floor(pageTagIndex / layout.cols);

    const x = marginX + col * (tagWidth + spacing);
    const y = marginY + row * (tagHeight + spacing);

    doc.setFillColor(255, 255, 255); // Default background is white
    doc.rect(x, y, tagWidth, tagHeight, 'F');

    // 1. Background Logo - Fits whole badge
    if (config.logoSettings.background) {
      const bgLogo = config.logoDataBackground || DEFAULT_LOGO_SVG;
      doc.saveGraphicsState();
      // @ts-ignore
      const gState = new (doc as any).GState({ opacity: 0.12 });
      doc.setGState(gState);
      // Drawing to fill the entire tag
      doc.addImage(bgLogo, 'PNG', x, y, tagWidth, tagHeight, undefined, 'FAST');
      doc.restoreGraphicsState();
    }

    // 2. Banner
    if (config.bannerPosition !== 'none') {
      const bannerY = config.bannerPosition === 'top' ? y : (y + tagHeight - bannerHeight);
      doc.setFillColor(config.primaryColor);
      doc.rect(x, bannerY, tagWidth, bannerHeight, 'F');
      
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
      };
      const textColor = hexToRgb(config.bannerTextColor);
      doc.setTextColor(textColor.r, textColor.g, textColor.b);
      doc.setFontSize(config.eventTitleFontSize);
      doc.setFont(config.fontFamily, 'normal');
      doc.text(config.eventTitle, x + tagWidth / 2, bannerY + bannerHeight * 0.65, { align: 'center' });
    }

    // 3. Content Area
    doc.setTextColor(config.textColor);
    doc.setFont(config.fontFamily, 'bold');
    const contentAreaHeight = config.bannerPosition === 'none' ? tagHeight : (tagHeight - bannerHeight);
    const contentAreaY = config.bannerPosition === 'top' ? (y + bannerHeight) : y;
    const nameHeight = config.nameFontSize * 0.3527;
    const subtitleHeight = tag.subtitle ? (config.subtitleFontSize * 0.3527) : 0;
    const gapHeight = tag.subtitle ? (config.nameSubtitleGap * 0.3527) : 0;
    const totalContentHeight = nameHeight + subtitleHeight + gapHeight;
    const contentCenterY = contentAreaY + (contentAreaHeight / 2);
    const nameY = contentCenterY - (totalContentHeight / 2) + nameHeight * 0.8;
    doc.setFontSize(config.nameFontSize);
    doc.text(tag.name, x + tagWidth / 2, nameY, { align: 'center' });

    if (tag.subtitle) {
      doc.setFont(config.fontFamily, 'normal');
      doc.setFontSize(config.subtitleFontSize);
      const subtitleY = nameY + gapHeight + (subtitleHeight * 0.5); 
      doc.text(tag.subtitle, x + tagWidth / 2, subtitleY, { align: 'center' });
    }

    // 4. Corner Logo
    if (config.logoSettings.corner) {
      const cornerLogo = config.logoDataCorner || DEFAULT_LOGO_SVG;
      const logoSize = tagHeight * 0.15;
      const logoOffset = 3;
      const logoX = x + tagWidth - logoSize - logoOffset;
      const logoY = config.bannerPosition === 'bottom' 
        ? (y + logoOffset) 
        : (y + tagHeight - logoSize - logoOffset);
      doc.addImage(cornerLogo, 'PNG', logoX, logoY, logoSize, logoSize);
    }

    if (config.showBorders) {
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.1);
      doc.setLineDashPattern([1, 1], 0);
      doc.rect(x, y, tagWidth, tagHeight, 'S');
      doc.setLineDashPattern([], 0);
    }
    currentTagIndex++;
  }
  doc.save(`TagStudio_${config.eventTitle.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};
