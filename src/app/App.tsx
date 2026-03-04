import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Turntable } from './components/turntable/Turntable';
import { TRACKS, Track } from './data/tracks';
import bgNoise from '../assets/bg-noise.png';
import { parseId3 } from './utils/parseId3';
import { Toaster, toast } from 'sonner';

const DEFAULT_TRACK = TRACKS[0];

// The Turntable component is built at 720×540 px; we scale it down to 600×450.
const TT_SCALE = 5 / 6;
const TT_W = 720;
const TT_H = 540;
const TT_SCALED_W = TT_W * TT_SCALE; // 600
const TT_SCALED_H = TT_H * TT_SCALE; // 450

export default function App() {
  const [track, setTrack] = useState<Track>(DEFAULT_TRACK);
  const [fileName, setFileName] = useState<string | null>(null);
  const [bgImage, setBgImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const prevCoverUrlRef = useRef<string | null>(null);
  const prevCustomCoverUrlRef = useRef<string | null>(null);
  const prevBgUrlRef = useRef<string | null>(null);

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

  const handleBgInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (prevBgUrlRef.current) URL.revokeObjectURL(prevBgUrlRef.current);
    const url = URL.createObjectURL(file);
    prevBgUrlRef.current = url;
    setBgImage(url);
    e.target.value = '';
  };

  useEffect(() => {
    return () => {
      if (prevCoverUrlRef.current) URL.revokeObjectURL(prevCoverUrlRef.current);
      if (prevCustomCoverUrlRef.current) URL.revokeObjectURL(prevCustomCoverUrlRef.current);
      if (prevBgUrlRef.current) URL.revokeObjectURL(prevBgUrlRef.current);
    };
  }, []);

  const isCustomTrack = fileName !== null;

  return (
    <div
      className="min-h-screen flex flex-col items-center font-['Inter',sans-serif] selection:bg-neutral-700"
      style={{
        backgroundColor: '#020302',
        backgroundImage: bgImage
          ? `url(${bgImage})`
          : `url(${bgNoise})`,
        backgroundSize: bgImage ? 'cover' : 'auto',
        backgroundPosition: 'center',
        backgroundRepeat: bgImage ? 'no-repeat' : 'repeat',
      }}
    >
      <Toaster position="bottom-center" richColors />

      {/* Hidden file inputs */}
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
      <input
        ref={bgInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBgInputChange}
      />

      {/* Radial vignette overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 60% 55% at 50% 45%, transparent 28%, #020302 100%)',
        }}
      />

      {/* Title */}
      <h1
        className="font-['Alfa_Slab_One',sans-serif] text-transparent bg-clip-text select-none pointer-events-none z-10 leading-none"
        style={{
          fontSize: 112,
          marginTop: 96,
          marginBottom: -24,
          backgroundImage: 'linear-gradient(180deg,rgb(231, 231, 231) 28.6%, rgba(0, 0, 0, 0) 80.6%)',
        }}
      >
        SL-1200MK2
      </h1>

      {/* Main 600px content column */}
      <div className="relative z-10 flex flex-col gap-8 w-[600px]">

        {/* Turntable scaled down to 600×450 */}
        <div
          style={{
            width: TT_SCALED_W,
            height: TT_SCALED_H,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              transform: `scale(${TT_SCALE})`,
              transformOrigin: 'top left',
              width: TT_W,
              height: TT_H,
            }}
          >
            <Turntable track={track} />
          </div>
        </div>

        {/* Track name when custom music loaded */}
        {isCustomTrack && (
          <p className="text-[13px] text-white/40 leading-none -mt-4">
            {track.title} — {track.artist}
          </p>
        )}

        {/* Action buttons row */}
        <div className={`flex items-center justify-between ${isCustomTrack ? '-mt-4' : ''}`}>
          <div className="flex items-center gap-3">
            {/* Upload your music */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-0 h-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80 text-sm transition-all cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload your music
            </button>

            {/* Upload cover */}
            <button
              onClick={() => coverInputRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-0 h-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80 text-sm transition-all cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              Upload cover
            </button>
          </div>

          {/* Remix on Framer — shows toast */}
          <button
            onClick={() =>
              toast('Work in progress', {
                description: 'Rakshit is working on it',
              })
            }
            className="flex items-center gap-2 px-4 py-0 h-10 rounded-lg bg-white/[0.04] text-white/25 text-sm cursor-pointer hover:bg-white/[0.07] transition-all"
          >
            <svg width="12" height="18" viewBox="0 0 15 22" fill="currentColor">
              <path d="M0 0h15v7.333H7.5L0 0zM0 7.333h7.5L15 14.667H7.5V22L0 14.667V7.333z" />
            </svg>
            Remix on framer
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Two-column info section */}
        <div className="grid grid-cols-2 gap-6 pb-24 text-[14px] text-[#f2f5f7]">
          <div className="flex flex-col gap-2">
            <p className="font-['Inter_Tight',sans-serif] font-semibold">Elegance</p>
            <p className="font-['Inter_Tight',sans-serif] font-light opacity-90">
              Technics SL 1200MK2, released in 1979, is arguably the most iconic turntable ever made. Its design is inspiring because everything about it comes from genuine engineering honesty.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-['Inter_Tight',sans-serif] font-semibold">Why?</p>
            <p className="font-['Inter_Tight',sans-serif] font-light opacity-90">
              I fell in love with its design and saw it as a perfect example of function meeting form. Turning that experience into an interactive React component using Figma and Claude code helped me capture some of its essence in this project.
            </p>
          </div>
        </div>

      </div>

      {/* Background image import — fixed bottom-left */}
      {/* <button
        onClick={() => bgInputRef.current?.click()}
        title="Import background image (replaces current background)"
        className="fixed bottom-4 left-4 z-[9999] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 flex items-center justify-center transition-all duration-200"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </button> */}
    </div>
  );
}
