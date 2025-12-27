
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  Printer, 
  Users, 
  Download, 
  Plus, 
  FileText, 
  Grid, 
  Palette, 
  Type as TypeIcon,
  Info,
  Image as ImageIcon,
  Layout,
  Maximize2,
  ArrowUpDown,
  Layers,
  ZoomIn,
  X,
  RotateCcw,
  Settings2
} from 'lucide-react';
import { TagConfig, TagData, PaperSize, LayoutType, BannerPosition } from './types';
import { DEFAULT_CONFIG, FONTS, LAYOUTS, PAPER_DIMENSIONS, DEFAULT_LOGO_SVG, COLOR_PRESETS } from './constants';
import { generateNameTagPDF } from './services/pdfService';
import { TagPreview } from './components/TagPreview';

const ColorSelector: React.FC<{ label: string; value: string; onChange: (val: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <label className="text-[10px] font-bold text-slate-500 uppercase">{label}</label>
      <span className="text-[10px] font-mono font-bold text-slate-400">{value}</span>
    </div>
    <div className="flex flex-wrap gap-1.5">
      {COLOR_PRESETS.map(color => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={`w-6 h-6 rounded-md border border-white/20 transition-all active:scale-90 hover:scale-110 ${value === color ? 'ring-2 ring-blue-500 ring-offset-1 scale-110 z-10' : ''}`}
          style={{ backgroundColor: color }}
        />
      ))}
      <div className="relative w-6 h-6 rounded-md border border-slate-200 overflow-hidden shadow-sm hover:scale-110 transition-transform">
        <input 
          type="color" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
        />
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [config, setConfig] = useState<TagConfig>(DEFAULT_CONFIG);
  const [namesText, setNamesText] = useState<string>("John Doe, Speaker\nJane Smith, Attendee\nAlice Johnson, Staff\nBob Wilson, VIP\nCharlie Brown, Student\nDaisy Miller, Press\nEva Green, Speaker\nFrank Castle, Security");
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'layout'>('content');
  const cornerInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [paperScale, setPaperScale] = useState(0.5);

  const tags = useMemo(() => {
    return namesText.split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        const parts = line.split(',');
        return {
          name: parts[0].trim(),
          subtitle: parts[1]?.trim() || ''
        };
      });
  }, [namesText]);

  const layout = useMemo(() => {
    if (config.layout === LayoutType.DIY) {
      return { cols: config.diyCols, rows: config.diyRows, count: config.diyCols * config.diyRows };
    }
    return LAYOUTS[config.layout];
  }, [config.layout, config.diyCols, config.diyRows]);

  const paperDim = PAPER_DIMENSIONS[config.paperSize];
  const totalTagsPerPage = layout.cols * layout.rows;
  const totalPages = Math.ceil(tags.length / totalTagsPerPage);
  const firstPageTags = tags.slice(0, totalTagsPerPage);

  const calculateAutoFitScale = useCallback(() => {
    if (containerRef.current) {
      const { clientWidth: w, clientHeight: h } = containerRef.current;
      if (w > 0 && h > 0) {
        const mmToPx = 96 / 25.4;
        const padding = 120; 
        const paperWPx = paperDim.width * mmToPx;
        const paperHPx = paperDim.height * mmToPx;
        return Math.min((w - padding) / paperWPx, (h - padding) / paperHPx);
      }
    }
    return 0.5;
  }, [paperDim.width, paperDim.height]);

  const handleFitToWindow = useCallback(() => setPaperScale(calculateAutoFitScale()), [calculateAutoFitScale]);

  useEffect(() => {
    handleFitToWindow();
    const timer = setTimeout(handleFitToWindow, 350);
    return () => clearTimeout(timer);
  }, [config.paperSize, handleFitToWindow]);

  const handleConfigChange = (key: keyof TagConfig, value: any) => setConfig(prev => ({ ...prev, [key]: value }));

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'corner' | 'background') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataKey = type === 'corner' ? 'logoDataCorner' : 'logoDataBackground';
        handleConfigChange(dataKey, reader.result as string);
        if (!config.logoSettings[type]) {
          handleConfigChange('logoSettings', { ...config.logoSettings, [type]: true });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const resetToDefault = () => {
    if (window.confirm("Restore all settings to factory default?")) {
      setConfig(DEFAULT_CONFIG);
    }
  };

  const handleDownload = async () => {
    if (tags.length === 0) return;
    try {
      await generateNameTagPDF(tags, config);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("An error occurred while generating the PDF. Please try again.");
    }
  };

  const totalGridWidth = (layout.cols * config.tagWidth) + ((layout.cols - 1) * config.spacing);
  const totalGridHeight = (layout.rows * config.tagHeight) + ((layout.rows - 1) * config.spacing);
  const marginX = (paperDim.width - totalGridWidth) / 2;
  const marginY = (paperDim.height - totalGridHeight) / 2;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100 overflow-hidden">
      <aside className="w-full md:w-[400px] bg-white border-r border-slate-200 flex flex-col h-screen relative z-30 shadow-2xl">
        <header className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <Printer size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">TagStudio</h1>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest text-nowrap">Professional PDF Generator</p>
            </div>
          </div>
          <button 
            onClick={resetToDefault}
            className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-slate-50"
            title="Restore Defaults"
          >
            <RotateCcw size={18} />
          </button>
        </header>

        <nav className="flex px-2 border-b border-slate-100 bg-white">
          {[
            { id: 'content', icon: Users, label: 'Names' },
            { id: 'style', icon: Palette, label: 'Style' },
            { id: 'layout', icon: Layout, label: 'Sheet' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex flex-col items-center py-4 border-b-2 transition-all ${
                activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <tab.icon size={18} className="mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white scrollbar-hide">
          {activeTab === 'content' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
              <section className="space-y-3">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <FileText size={16} className="text-blue-500" /> Guest List
                </label>
                <div className="relative group">
                  <textarea
                    value={namesText}
                    onChange={(e) => setNamesText(e.target.value)}
                    placeholder="John Doe, Speaker..."
                    className="w-full h-48 p-4 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none font-mono group-hover:bg-white shadow-inner"
                  />
                  <div className="absolute bottom-3 right-3 bg-white/90 px-2 py-1 rounded-lg text-[10px] text-slate-500 border border-slate-100 shadow-sm backdrop-blur-sm">
                    {tags.length} entries
                  </div>
                </div>
              </section>

              <section className="space-y-4 pt-4 border-t border-slate-100">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <ImageIcon size={16} className="text-blue-500" /> Custom Branding
                </label>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Event Title</label>
                    <input
                      type="text"
                      value={config.eventTitle}
                      onChange={(e) => handleConfigChange('eventTitle', e.target.value)}
                      className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {/* Corner Logo Upload */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Corner Logo</span>
                      <button 
                        onClick={() => handleConfigChange('logoSettings', { ...config.logoSettings, corner: !config.logoSettings.corner })}
                        className={`w-10 h-5 rounded-full relative transition-colors ${config.logoSettings.corner ? 'bg-blue-600' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.logoSettings.corner ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-xl bg-white border border-slate-200 p-1 shadow-sm overflow-visible">
                        <img src={config.logoDataCorner || DEFAULT_LOGO_SVG} className={`w-full h-full object-contain rounded-lg ${!config.logoDataCorner ? 'opacity-30 grayscale' : ''}`} alt="" />
                        {config.logoDataCorner && (
                          <button onClick={() => handleConfigChange('logoDataCorner', null)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"><X size={12} /></button>
                        )}
                      </div>
                      <div className="flex-1">
                        <input type="file" ref={cornerInputRef} className="hidden" accept="image/*" onChange={(e) => handleLogoUpload(e, 'corner')} />
                        <button onClick={() => cornerInputRef.current?.click()} className="text-[11px] font-bold text-blue-600 hover:underline">Upload Image</button>
                      </div>
                    </div>
                  </div>

                  {/* Background Logo Upload */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Background Image</span>
                      <button 
                        onClick={() => handleConfigChange('logoSettings', { ...config.logoSettings, background: !config.logoSettings.background })}
                        className={`w-10 h-5 rounded-full relative transition-colors ${config.logoSettings.background ? 'bg-blue-600' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.logoSettings.background ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-xl bg-white border border-slate-200 p-1 shadow-sm overflow-visible">
                        <img src={config.logoDataBackground || DEFAULT_LOGO_SVG} className={`w-full h-full object-contain rounded-lg ${!config.logoDataBackground ? 'opacity-30 grayscale' : ''}`} alt="" />
                        {config.logoDataBackground && (
                          <button onClick={() => handleConfigChange('logoDataBackground', null)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"><X size={12} /></button>
                        )}
                      </div>
                      <div className="flex-1">
                        <input type="file" ref={bgInputRef} className="hidden" accept="image/*" onChange={(e) => handleLogoUpload(e, 'background')} />
                        <button onClick={() => bgInputRef.current?.click()} className="text-[11px] font-bold text-blue-600 hover:underline">Upload Image</button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'style' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Font Family First */}
              <section className="space-y-4">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <TypeIcon size={16} className="text-blue-500" /> General Typography
                </label>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Font Family</label>
                  <select value={config.fontFamily} onChange={(e) => handleConfigChange('fontFamily', e.target.value)} className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium shadow-sm">
                    {FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                  </select>
                </div>
              </section>

              {/* Banner Group */}
              <section className="space-y-4 border-t border-slate-100 pt-6">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Layers size={16} className="text-blue-500" /> Banner Styling
                </label>
                <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                   <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Location</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['none', 'top', 'bottom'] as BannerPosition[]).map(pos => (
                          <button key={pos} onClick={() => handleConfigChange('bannerPosition', pos)} className={`py-3 text-[10px] font-bold rounded-xl border transition-all uppercase ${config.bannerPosition === pos ? 'bg-blue-600 text-white shadow-lg border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'}`}>
                            {pos}
                          </button>
                        ))}
                      </div>
                   </div>

                   {config.bannerPosition !== 'none' && (
                     <>
                        <ColorSelector label="Banner Background" value={config.primaryColor} onChange={(v) => handleConfigChange('primaryColor', v)} />
                        <ColorSelector label="Banner Text Color" value={config.bannerTextColor} onChange={(v) => handleConfigChange('bannerTextColor', v)} />
                        <div className="space-y-1">
                          <div className="flex justify-between items-center"><label className="text-[10px] font-bold text-slate-500 uppercase">Banner Text Size (pt)</label><span className="text-[10px] font-bold text-blue-600">{config.eventTitleFontSize}pt</span></div>
                          <input type="range" min="6" max="24" step="1" value={config.eventTitleFontSize} onChange={(e) => handleConfigChange('eventTitleFontSize', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                        </div>
                     </>
                   )}
                </div>
              </section>

              {/* Body Group */}
              <section className="space-y-4 border-t border-slate-100 pt-6">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Users size={16} className="text-blue-500" /> Content Typography
                </label>
                <div className="space-y-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <ColorSelector label="Name & Subtitle Color" value={config.textColor} onChange={(v) => handleConfigChange('textColor', v)} />
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center"><label className="text-[10px] font-bold text-slate-500 uppercase">Name Font Size (pt)</label><span className="text-[10px] font-bold text-blue-600">{config.nameFontSize}pt</span></div>
                      <input type="range" min="12" max="72" step="1" value={config.nameFontSize} onChange={(e) => handleConfigChange('nameFontSize', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between items-center"><label className="text-[10px] font-bold text-slate-500 uppercase">Subtitle Font Size (pt)</label><span className="text-[10px] font-bold text-blue-600">{config.subtitleFontSize}pt</span></div>
                      <input type="range" min="8" max="48" step="1" value={config.subtitleFontSize} onChange={(e) => handleConfigChange('subtitleFontSize', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>

                    <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                      <div className="flex justify-between items-center"><label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><ArrowUpDown size={10} /> Vertical Text Gap</label><span className="text-[10px] font-bold text-blue-700">{config.nameSubtitleGap}pt</span></div>
                      <input type="range" min="0" max="40" step="1" value={config.nameSubtitleGap} onChange={(e) => handleConfigChange('nameSubtitleGap', parseInt(e.target.value))} className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <section className="space-y-4">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Settings2 size={16} className="text-blue-500" /> Grid Setup</label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(LAYOUTS).map(([key, data]) => {
                    if (key === LayoutType.DIY) return null;
                    return (
                      <button key={key} onClick={() => handleConfigChange('layout', key)} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${config.layout === key ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-md' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                        <div className="flex items-center gap-3">
                          <Grid size={18} className={config.layout === key ? 'text-blue-600' : 'text-slate-400'} />
                          <div className="text-left"><p className="text-sm font-bold">{key}</p><p className="text-[9px] uppercase tracking-widest">{data.cols}x{data.rows} Grid</p></div>
                        </div>
                        <span className="text-[9px] font-black px-2 py-1 rounded-full bg-blue-100 text-blue-700 uppercase">{data.count} Tags</span>
                      </button>
                    );
                  })}
                  <button onClick={() => handleConfigChange('layout', LayoutType.DIY)} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${config.layout === LayoutType.DIY ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-md' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                      <Maximize2 size={18} className={config.layout === LayoutType.DIY ? 'text-blue-600' : 'text-slate-400'} />
                      <div className="text-left"><p className="text-sm font-bold">DIY Custom</p><p className="text-[9px] uppercase tracking-widest">{config.diyCols}x{config.diyRows} Grid</p></div>
                    </div>
                    <span className="text-[9px] font-black px-2 py-1 rounded-full bg-blue-100 text-blue-700 uppercase">Custom</span>
                  </button>
                </div>
                {config.layout === LayoutType.DIY && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 animate-in slide-in-from-top-2">
                    <div className="space-y-1"><label className="text-[10px] font-bold text-blue-700 uppercase">Columns</label><input type="number" min="1" max="10" value={config.diyCols} onChange={(e) => handleConfigChange('diyCols', parseInt(e.target.value) || 1)} className="w-full p-2 text-sm rounded-lg border border-blue-200 shadow-inner" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold text-blue-700 uppercase">Rows</label><input type="number" min="1" max="20" value={config.diyRows} onChange={(e) => handleConfigChange('diyRows', parseInt(e.target.value) || 1)} className="w-full p-2 text-sm rounded-lg border border-blue-200 shadow-inner" /></div>
                  </div>
                )}
              </section>

              <section className="space-y-4 pt-4 border-t border-slate-100">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Maximize2 size={16} className="text-blue-500" /> Tag Size (mm)</label>
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Width</label><input type="number" value={config.tagWidth} onChange={(e) => handleConfigChange('tagWidth', parseFloat(e.target.value))} className="w-full p-2 text-sm rounded-lg border border-slate-200 shadow-inner" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Height</label><input type="number" value={config.tagHeight} onChange={(e) => handleConfigChange('tagHeight', parseFloat(e.target.value))} className="w-full p-2 text-sm rounded-lg border border-slate-200 shadow-inner" /></div>
                </div>
              </section>

              <section className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Tag Spread / Gap (mm)</label>
                <input type="range" min="0" max="30" step="1" value={config.spacing} onChange={(e) => handleConfigChange('spacing', parseInt(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                <div className="flex justify-between items-center px-1"><span className="text-[9px] font-bold text-slate-400">0mm</span><span className="text-[10px] font-black text-blue-600">{config.spacing}mm</span><span className="text-[9px] font-bold text-slate-400">30mm</span></div>
              </section>

              <section className="space-y-2 pt-4 border-t border-slate-100">
                <label className="text-sm font-bold text-slate-700">Paper Standard</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(PaperSize).map(size => (
                    <button key={size} onClick={() => handleConfigChange('paperSize', size)} className={`py-3 text-xs rounded-xl font-bold border-2 transition-all ${config.paperSize === size ? 'bg-white border-blue-600 text-blue-600 shadow-sm ring-4 ring-blue-50' : 'bg-white border-slate-100'}`}>{size}</button>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <button onClick={handleDownload} disabled={tags.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98]">
            <Download size={20} /> Download PDF
          </button>
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-hidden flex flex-col bg-slate-100">
        <header className="w-full p-8 pb-4 flex justify-between items-center bg-white/50 backdrop-blur-md border-b border-slate-200 shadow-sm z-20">
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">Sheet Preview <span className="text-[9px] bg-slate-800 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Live</span></h2>
            <p className="text-xs text-slate-400 font-medium">Page 1 of {totalPages} • {config.paperSize} ({paperDim.width}x{paperDim.height}mm)</p>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm min-w-[200px]">
                <ZoomIn size={14} className="text-blue-500" />
                <input type="range" min="0.1" max="1.5" step="0.01" value={paperScale} onChange={(e) => setPaperScale(parseFloat(e.target.value))} className="flex-1 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                <span className="text-[10px] font-black text-slate-600 min-w-[35px] text-right">{Math.round(paperScale * 100)}%</span>
             </div>
             <button onClick={handleFitToWindow} className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 rounded-full border border-slate-200 text-[10px] font-bold text-slate-600 uppercase shadow-sm transition-all active:scale-95 group"><Maximize2 size={12} className="text-blue-500 group-hover:scale-110 transition-transform" /> Fit to Window</button>
          </div>
        </header>

        <div ref={containerRef} className="flex-1 w-full flex overflow-auto bg-slate-100 scrollbar-hide p-12">
          {tags.length === 0 ? (
            <div className="m-auto flex flex-col items-center animate-in fade-in zoom-in-95">
              <div className="w-20 h-20 bg-white shadow-xl rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-6 border border-slate-50"><Users size={40} /></div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Add names to start designing</p>
            </div>
          ) : (
            <div 
              className="bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)] origin-center transition-transform duration-300 ease-out border border-slate-200 flex-shrink-0 m-auto"
              style={{
                width: `${paperDim.width}mm`,
                height: `${paperDim.height}mm`,
                transform: `scale(${paperScale})`,
                marginTop: `${Math.max(0, (paperDim.height * paperScale * (96/25.4) - paperDim.height * (96/25.4))/2)}px`,
                marginBottom: `${Math.max(0, (paperDim.height * paperScale * (96/25.4) - paperDim.height * (96/25.4))/2)}px`
              }}
            >
              <div 
                className="absolute"
                style={{
                  left: `${marginX}mm`,
                  top: `${marginY}mm`,
                  width: `${totalGridWidth}mm`,
                  height: `${totalGridHeight}mm`,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${layout.cols}, ${config.tagWidth}mm)`,
                  gridTemplateRows: `repeat(${layout.rows}, ${config.tagHeight}mm)`,
                  gap: `${config.spacing}mm`
                }}
              >
                {firstPageTags.map((tag, idx) => (
                  <div key={idx} style={{ width: `${config.tagWidth}mm`, height: `${config.tagHeight}mm` }}>
                    <TagPreview tag={tag} config={config} />
                  </div>
                ))}
                {firstPageTags.length < totalTagsPerPage && Array.from({ length: totalTagsPerPage - firstPageTags.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="border border-dashed border-slate-100 flex flex-col items-center justify-center bg-slate-50/20" style={{ width: `${config.tagWidth}mm`, height: `${config.tagHeight}mm` }}>
                      <Plus size={10} className="text-slate-200 opacity-30" />
                    </div>
                ))}
              </div>
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-3 left-3 text-[6px] font-black text-slate-200 uppercase tracking-[0.3em]">{config.paperSize} Sheet</div>
              </div>
            </div>
          )}
        </div>
        
        <footer className="w-full px-8 py-4 flex justify-between items-center bg-white border-t border-slate-200 shadow-sm z-20">
            <div className="flex gap-4">
                <div className="flex items-center gap-2 group cursor-default">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">Guests</span>
                  <span className="text-[11px] font-black text-slate-900 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg shadow-sm">{tags.length}</span>
                </div>
                <div className="flex items-center gap-2 group cursor-default">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">Sheets</span>
                  <span className="text-[11px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-lg shadow-sm">{totalPages}</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-slate-400"><Info size={12} className="text-blue-500" /><p className="text-[9px] font-bold uppercase tracking-tight">Standard 300 DPI • High Quality Export</p></div>
                <div className="w-px h-4 bg-slate-200"></div>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">v1.1</p>
            </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
