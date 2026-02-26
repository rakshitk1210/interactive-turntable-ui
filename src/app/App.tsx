import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Turntable } from './components/turntable/Turntable';
import { Footer } from './components/turntable/Footer';
import { TRACKS, Track } from './data/tracks';
import bgNoise from '../assets/bg-noise.png';
import { DesignControlPanel, useDesignControls } from './components/DesignControlPanel';
import { parseId3 } from './utils/parseId3';

const DEFAULT_TRACK = TRACKS[0];

export default function App() {
  const [track, setTrack] = useState<Track>(DEFAULT_TRACK);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const { values, setValues } = useDesignControls();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const prevCoverUrlRef = useRef<string | null>(null);
  const prevCustomCoverUrlRef = useRef<string | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    if (prevCoverUrlRef.current) {
      URL.revokeObjectURL(prevCoverUrlRef.current);
      prevCoverUrlRef.current = null;
    }

    const audioUrl = URL.createObjectURL(file);
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    setFileName(baseName);

    try {
      const tags = await parseId3(file);
      let coverUrl = DEFAULT_TRACK.cover;

      if (tags.coverUrl) {
        coverUrl = tags.coverUrl;
        prevCoverUrlRef.current = coverUrl;
      }

      setTrack({
        title: tags.title || baseName,
        artist: tags.artist || 'Unknown Artist',
        cover: coverUrl,
        url: audioUrl,
      });
    } catch {
      setTrack({
        title: baseName,
        artist: 'Unknown Artist',
        cover: DEFAULT_TRACK.cover,
        url: audioUrl,
      });
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = '';
  };

  const handleCoverUpload = useCallback((file: File) => {
    if (prevCustomCoverUrlRef.current) {
      URL.revokeObjectURL(prevCustomCoverUrlRef.current);
      prevCustomCoverUrlRef.current = null;
    }
    const coverUrl = URL.createObjectURL(file);
    prevCustomCoverUrlRef.current = coverUrl;
    setTrack(prev => ({ ...prev, cover: coverUrl }));
  }, []);

  const handleCoverInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleCoverUpload(file);
    e.target.value = '';
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'd' && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement)) {
        setShowControls(v => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    return () => {
      if (prevCoverUrlRef.current) URL.revokeObjectURL(prevCoverUrlRef.current);
      if (prevCustomCoverUrlRef.current) URL.revokeObjectURL(prevCustomCoverUrlRef.current);
    };
  }, []);

  const v = values;
  const isCustomTrack = fileName !== null;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center overflow-x-clip font-sans selection:bg-neutral-700"
      style={{
        backgroundColor: String(v.bgColor),
        backgroundImage: `url(${bgNoise})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Background noise opacity overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url(${bgNoise})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: Number(v.bgNoiseOpacity),
          mixBlendMode: 'multiply',
        }}
      />

      {/* Title */}
      <h1
        className="font-['Alfa_Slab_One',sans-serif] text-transparent bg-clip-text leading-none z-0 select-none pointer-events-none"
        style={{
          fontSize: `${v.titleSize}px`,
          marginBottom: `${v.titleMarginBottom}px`,
          backgroundImage: `linear-gradient(180deg, ${v.titleGradStart} 0%, ${v.titleGradMid} 30%, ${v.titleGradEnd} 55%, ${v.bgColor} 76%)`,
        }}
      >
        SL-1200MK2
      </h1>

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center">
        <div style={{ transform: `scale(${v.ttScale})`, transformOrigin: 'center center' }}>
          <Turntable
            track={track}
            borderRadius={Number(v.ttRadius)}
            shadowBlur={Number(v.ttShadowBlur)}
            shadowOpacity={Number(v.ttShadowOpacity)}
          />
        </div>

        {/* Upload area */}
        <div className="flex flex-col items-center gap-3" style={{ marginTop: `${v.trackSpacing}px` }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mpeg,audio/mp3,.mp3"
            className="hidden"
            onChange={handleInputChange}
          />
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverInputChange}
          />

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="group flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-200 cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50 group-hover:text-white/80 transition-colors">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className="text-[13px] font-['Inter',sans-serif] text-white/50 group-hover:text-white/80 transition-colors">
                Upload MP3
              </span>
            </button>

            <button
              onClick={() => coverInputRef.current?.click()}
              className="group flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-200 cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50 group-hover:text-white/80 transition-colors">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-[13px] font-['Inter',sans-serif] text-white/50 group-hover:text-white/80 transition-colors">
                Upload Cover
              </span>
            </button>
          </div>

          {isCustomTrack && (
            <p className="text-[13px] font-['Inter',sans-serif] text-white/40 leading-none">
              {track.title} — {track.artist}
            </p>
          )}

          <p
            className="font-['Inter',sans-serif] leading-normal text-white/30"
            style={{ fontSize: `${v.trackSubSize}px` }}
          >
            Move the tone arm over the vinyl to listen to music.
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer
        fontSize={Number(v.footerSize)}
        opacity={Number(v.footerOpacity)}
        marginTop={Number(v.footerSpacing)}
      />

      {/* Design Controls Toggle */}
      <button
        onClick={() => setShowControls(v => !v)}
        className="fixed bottom-4 right-4 z-[9999] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 flex items-center justify-center transition-all duration-200"
        title="Toggle Design Controls (D)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {/* Design Control Panel — remove this + import + useDesignControls to clean up */}
      <DesignControlPanel values={values} onChange={setValues} visible={showControls} />
    </div>
  );
}
