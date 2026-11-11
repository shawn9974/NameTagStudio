
import React, { useEffect, useState } from 'react';
import { TagConfig, TagData } from '../types';
import { DEFAULT_LOGO_SVG, FONT_STACKS } from '../constants';

interface TagPreviewProps {
  tag: TagData;
  config: TagConfig;
}

// Natural pixel size of an image, needed to scale the background image the same way the PDF does.
const useImageSize = (src: string | null) => {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.onload = () => setSize({ w: img.naturalWidth || 1, h: img.naturalHeight || 1 });
    img.src = src;
    return () => { img.onload = null; };
  }, [src]);
  return size;
};

export const TagPreview: React.FC<TagPreviewProps> = ({ tag, config }) => {
  const bannerRatio = 0.18;
  const bannerHeightPercent = bannerRatio * 100;

  const cornerLogo = config.logoDataCorner || DEFAULT_LOGO_SVG;
  const backgroundLogo = config.logoDataBackground || DEFAULT_LOGO_SVG;

  // At 100% the background image covers the whole tag; smaller values shrink it around the center
  const bgSize = useImageSize(config.logoSettings.background ? backgroundLogo : null);
  const bgScale = bgSize
    ? Math.max(config.tagWidth / bgSize.w, config.tagHeight / bgSize.h) * config.backgroundImageSize / 100
    : 0;
  const cornerLogoSize = config.tagHeight * config.cornerLogoSize / 100;

  return (
    <div 
      className={`relative flex flex-col items-center justify-center overflow-hidden w-full h-full bg-white transition-shadow ${config.showBorders ? 'border border-dashed border-slate-200' : ''}`}
      style={{ 
        backgroundColor: '#ffffff', // Badge background is now fixed to white as requested
        fontFamily: FONT_STACKS[config.fontFamily] || config.fontFamily
      }}
    >
      {/* Background Logo - centered, scaled relative to covering the whole badge */}
      {config.logoSettings.background && bgSize && (
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: config.backgroundImageOpacity / 100 }}>
          <img
            src={backgroundLogo}
            className="absolute max-w-none"
            style={{
              width: `${bgSize.w * bgScale}mm`,
              height: `${bgSize.h * bgScale}mm`,
              left: '50%',
              top: `calc(50% + ${config.tagHeight * config.backgroundImageOffsetY / 100}mm)`,
              transform: 'translate(-50%, -50%)'
            }}
            alt=""
          />
        </div>
      )}

      {/* Banner */}
      {config.bannerPosition !== 'none' && (
        <div 
          className={`absolute left-0 right-0 flex items-center justify-center px-2 z-10 ${config.bannerPosition === 'top' ? 'top-0' : 'bottom-0'}`}
          style={{ 
            backgroundColor: config.primaryColor,
            height: `${bannerHeightPercent}%` 
          }}
        >
          <div 
            className="font-medium uppercase tracking-wider truncate w-full text-center leading-none"
            style={{ 
              color: config.bannerTextColor,
              fontSize: `${config.eventTitleFontSize * 0.3527}mm`
            }}
          >
            {config.eventTitle || 'Event Title'}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div 
        className="flex flex-col items-center justify-center w-full px-[5%] z-10"
        style={{
          height: config.bannerPosition === 'none' ? '100%' : `${100 - bannerHeightPercent}%`,
          marginTop: config.bannerPosition === 'top' ? `${bannerHeightPercent}%` : '0',
          marginBottom: config.bannerPosition === 'bottom' ? `${bannerHeightPercent}%` : '0',
        }}
      >
        <h2 
          className="font-bold leading-none break-words w-full text-center"
          style={{ 
            color: config.textColor, 
            fontSize: `${config.nameFontSize * 0.3527}mm`,
            marginBottom: tag.subtitle ? `${config.nameSubtitleGap * 0.3527}mm` : '0'
          }}
        >
          {tag.name}
        </h2>
        
        {tag.subtitle && (
          <p 
            className="opacity-70 font-normal w-full text-center leading-none"
            style={{ 
              color: config.textColor,
              fontSize: `${config.subtitleFontSize * 0.3527}mm`
            }}
          >
            {tag.subtitle}
          </p>
        )}
      </div>

      {/* Corner Logo */}
      {config.logoSettings.corner && (
        <div 
          className={`absolute right-[3mm] pointer-events-none z-10`}
          style={{
            width: `${cornerLogoSize}mm`,
            height: `${cornerLogoSize}mm`,
            top: config.bannerPosition === 'bottom' ? '3mm' : 'auto',
            bottom: config.bannerPosition === 'bottom' ? 'auto' : '3mm',
            opacity: config.cornerLogoOpacity / 100
          }}
        >
          <img
            src={cornerLogo}
            className="w-full h-full object-contain"
            style={{ objectPosition: config.bannerPosition === 'bottom' ? 'right top' : 'right bottom' }}
            alt=""
          />
        </div>
      )}
    </div>
  );
};
