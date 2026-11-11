
import { jsPDF } from 'jspdf';
import { TagConfig, TagData, LayoutType } from '../types';
import { LAYOUTS, PAPER_DIMENSIONS, DEFAULT_LOGO_SVG, FONT_STACKS, CMYK_COLORS } from '../constants';

const PT_TO_MM = 0.3527;
const TEXT_PX_PER_MM = 600 / 25.4; // 600 DPI

// jsPDF's built-in fonts only cover Latin text; anything else would print as garbage
const NON_LATIN = /[^\u0000-ÿ]/;

// Text images already rendered during the current export (sizes in mm)
const textImages = new Map<string, { data: string; advance: number; left: number; ascent: number; width: number; height: number }>();

// Draws text centered on centerX, with its baseline at baselineY. Non-Latin text is rendered
// with the system's fonts into a high-resolution image, so Chinese, Japanese, Korean etc. print correctly.
const drawText = (
  doc: jsPDF,
  text: string,
  centerX: number,
  baselineY: number,
  fontSize: number,
  fontStyle: 'normal' | 'bold',
  color: string,
  fontFamily: string
) => {
  if (!NON_LATIN.test(text)) {
    doc.setFont(fontFamily, fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color);
    doc.text(text, centerX, baselineY, { align: 'center' });
    return;
  }

  // Same alias reuses one embedded image, e.g. for the event title repeated on every tag
  const alias = `text|${text}|${fontSize}|${fontStyle}|${color}|${fontFamily}`;
  let image = textImages.get(alias);
  if (!image) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const font = `${fontStyle} ${fontSize * PT_TO_MM * TEXT_PX_PER_MM}px ${FONT_STACKS[fontFamily] || 'sans-serif'}`;
    ctx.font = font;
    const metrics = ctx.measureText(text);
    const padding = 4;
    const left = Math.ceil(metrics.actualBoundingBoxLeft) + padding;
    const ascent = Math.ceil(metrics.actualBoundingBoxAscent) + padding;
    canvas.width = left + Math.ceil(metrics.actualBoundingBoxRight) + padding;
    canvas.height = ascent + Math.ceil(metrics.actualBoundingBoxDescent) + padding;
    // Resizing the canvas resets its state
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(text, left, ascent);
    image = {
      data: canvas.toDataURL('image/png'),
      advance: metrics.width / TEXT_PX_PER_MM,
      left: left / TEXT_PX_PER_MM,
      ascent: ascent / TEXT_PX_PER_MM,
      width: canvas.width / TEXT_PX_PER_MM,
      height: canvas.height / TEXT_PX_PER_MM
    };
    textImages.set(alias, image);
  }

  doc.addImage(
    image.data,
    'PNG',
    centerX - image.advance / 2 - image.left,
    baselineY - image.ascent,
    image.width,
    image.height,
    alias,
    'FAST'
  );
};

interface LoadedImage {
  data: string;
  w: number;
  h: number;
}

// Reads the image's natural size for aspect-correct placement. SVGs are rasterized to PNG,
// since jsPDF cannot embed SVG.
const loadImage = (src: string) => new Promise<LoadedImage>((resolve, reject) => {
  const img = new Image();
  img.onload = () => {
    const w = img.naturalWidth || 100;
    const h = img.naturalHeight || 100;
    if (!src.startsWith('data:image/svg')) {
      resolve({ data: src, w, h });
      return;
    }
    const scale = Math.max(1, 1200 / Math.max(w, h));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    resolve({ data: canvas.toDataURL('image/png'), w, h });
  };
  img.onerror = reject;
  img.src = src;
});

export const generateNameTagPDF = async (tags: TagData[], config: TagConfig) => {
  textImages.clear();
  const bgImage = config.logoSettings.background
    ? await loadImage(config.logoDataBackground || DEFAULT_LOGO_SVG)
    : null;
  const cornerImage = config.logoSettings.corner
    ? await loadImage(config.logoDataCorner || DEFAULT_LOGO_SVG)
    : null;

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

    // 1. Background Logo - centered, 100% size covers the whole badge, clipped to the badge
    if (bgImage) {
      const k = Math.max(tagWidth / bgImage.w, tagHeight / bgImage.h) * config.backgroundImageSize / 100;
      const bgW = bgImage.w * k;
      const bgH = bgImage.h * k;
      doc.saveGraphicsState();
      doc.rect(x, y, tagWidth, tagHeight, null);
      doc.clip();
      doc.discardPath();
      // @ts-ignore
      const gState = new (doc as any).GState({ opacity: config.backgroundImageOpacity / 100 });
      doc.setGState(gState);
      const bgShift = tagHeight * config.backgroundImageOffsetY / 100;
      doc.addImage(bgImage.data, 'PNG', x + (tagWidth - bgW) / 2, y + (tagHeight - bgH) / 2 + bgShift, bgW, bgH, 'bgImage', 'FAST');
      doc.restoreGraphicsState();
    }

    // 2. Banner
    if (config.bannerPosition !== 'none') {
      const bannerY = config.bannerPosition === 'top' ? y : (y + tagHeight - bannerHeight);
      const bannerCmyk = CMYK_COLORS[config.primaryColor.toLowerCase()];
      if (bannerCmyk) {
        doc.setFillColor(bannerCmyk[0], bannerCmyk[1], bannerCmyk[2], bannerCmyk[3]);
      } else {
        doc.setFillColor(config.primaryColor);
      }
      doc.rect(x, bannerY, tagWidth, bannerHeight, 'F');
      drawText(doc, config.eventTitle, x + tagWidth / 2, bannerY + bannerHeight * 0.65, config.eventTitleFontSize, 'normal', config.bannerTextColor, config.fontFamily);
    }

    // 3. Content Area
    const contentAreaHeight = config.bannerPosition === 'none' ? tagHeight : (tagHeight - bannerHeight);
    const contentAreaY = config.bannerPosition === 'top' ? (y + bannerHeight) : y;
    const nameHeight = config.nameFontSize * PT_TO_MM;
    const subtitleHeight = tag.subtitle ? (config.subtitleFontSize * PT_TO_MM) : 0;
    const gapHeight = tag.subtitle ? (config.nameSubtitleGap * PT_TO_MM) : 0;
    const totalContentHeight = nameHeight + subtitleHeight + gapHeight;
    const contentCenterY = contentAreaY + (contentAreaHeight / 2);
    const nameY = contentCenterY - (totalContentHeight / 2) + nameHeight * 0.8;
    drawText(doc, tag.name, x + tagWidth / 2, nameY, config.nameFontSize, 'bold', config.textColor, config.fontFamily);

    if (tag.subtitle) {
      // Same stacking as the preview: name line, gap, subtitle line
      const subtitleY = nameY + nameHeight * 0.2 + gapHeight + (subtitleHeight * 0.85);
      drawText(doc, tag.subtitle, x + tagWidth / 2, subtitleY, config.subtitleFontSize, 'normal', config.textColor, config.fontFamily);
    }

    // 4. Corner Logo
    if (cornerImage) {
      // Fit inside a square box, keeping aspect ratio, pushed into the corner
      const boxSize = tagHeight * config.cornerLogoSize / 100;
      const k = Math.min(boxSize / cornerImage.w, boxSize / cornerImage.h);
      const logoW = cornerImage.w * k;
      const logoH = cornerImage.h * k;
      const logoOffset = 3;
      const logoX = x + tagWidth - logoW - logoOffset;
      const logoY = config.bannerPosition === 'bottom'
        ? (y + logoOffset)
        : (y + tagHeight - logoH - logoOffset);
      doc.saveGraphicsState();
      // @ts-ignore
      doc.setGState(new (doc as any).GState({ opacity: config.cornerLogoOpacity / 100 }));
      doc.addImage(cornerImage.data, 'PNG', logoX, logoY, logoW, logoH, 'cornerImage', 'FAST');
      doc.restoreGraphicsState();
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
