
import React from 'react';
import { TagConfig, TagData } from '../types';
import { DEFAULT_LOGO_SVG } from '../constants';

interface TagPreviewProps {
  tag: TagData;
  config: TagConfig;
}

export const TagPreview: React.FC<TagPreviewProps> = ({ tag, config }) => {
  const bannerRatio = 0.18;
  const bannerHeightPercent = bannerRatio * 100;
  
  const cornerLogo = config.logoDataCorner || DEFAULT_LOGO_SVG;
  const backgroundLogo = config.logoDataBackground || DEFAULT_LOGO_SVG;

  return (
    <div 
      className={`relative flex flex-col items-center justify-center overflow-hidden w-full h-full bg-white transition-shadow ${config.showBorders ? 'border border-dashed border-slate-200' : ''}`}
      style={{ 
        backgroundColor: '#ffffff', // Badge background is now fixed to white as requested
        fontFamily: config.fontFamily 
      }}
    >
      {/* Background Logo - Now fits the whole badge */}
      {config.logoSettings.background && (
        <div className="absolute inset-0 pointer-events-none opacity-[0.12]">
          <img src={backgroundLogo} className="w-full h-full object-cover" alt="" />
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
          {tag.name || 'Your Name'}
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
            width: '15%',
            height: '15%',
            top: config.bannerPosition === 'bottom' ? '3mm' : 'auto',
            bottom: config.bannerPosition === 'bottom' ? 'auto' : '3mm'
          }}
        >
          <img src={cornerLogo} className="w-full h-full object-contain" alt="" />
        </div>
      )}
    </div>
  );
};
