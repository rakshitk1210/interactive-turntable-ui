import React, { useState, useEffect, useRef } from 'react';
import { Chassis } from './Chassis';
import { Platter } from './Platter';
import { ToneArm } from './ToneArm';
import { StartButton } from './StartButton';
import { PitchSlider } from './PitchSlider';
import { Track } from '../../data/tracks';

interface TurntableProps {
    track: Track;
    borderRadius?: number;
    shadowBlur?: number;
    shadowOpacity?: number;
}

export const Turntable: React.FC<TurntableProps> = ({ track, borderRadius = 48, shadowBlur = 25, shadowOpacity = 0.25 }) => {
  const [isMotorRunning, setIsMotorRunning] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [pitch, setPitch] = useState(1.0); // 0.92 to 1.08
  const [armAngle, setArmAngle] = useState(-27); // Default Rest Position from Figma (-27.46)
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio
  useEffect(() => {
    if (!audioRef.current) {
        audioRef.current = new Audio(track.url);
        audioRef.current.loop = true;
        if (!track.url.startsWith('blob:')) {
          audioRef.current.crossOrigin = "anonymous";
        }
        audioRef.current.volume = 0.8;
    } else {
        const wasPlaying = !audioRef.current.paused;
        audioRef.current.src = track.url;
        audioRef.current.load();
        if (wasPlaying && isMotorRunning) {
             audioRef.current.play().catch(console.error);
        }
    }
    
    if (audioRef.current) {
        audioRef.current.onerror = (e) => {
            console.error("Audio Error:", e, audioRef.current?.error);
        };
    }
    
    return () => {
       if (audioRef.current) {
         audioRef.current.pause();
         audioRef.current.src = '';
         audioRef.current = null;
       }
    };
  }, [track.url]);

  const handleScrub = (deltaTime: number) => {
      if (audioRef.current) {
          audioRef.current.currentTime = (audioRef.current.currentTime + deltaTime + audioRef.current.duration) % audioRef.current.duration;
      }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const isArmOnRecord = armAngle > -10 && armAngle < 30;

    if (isMotorRunning && isArmOnRecord && !isScrubbing) {
        audio.playbackRate = pitch;
        if (audio.paused) {
            audio.play().catch(e => console.error("Autoplay prevented:", e));
        }
    } else {
        if (!audio.paused) {
            audio.pause();
        }
    }

    if (!audio.paused) {
        audio.playbackRate = pitch;
    }
  }, [isMotorRunning, isScrubbing, armAngle, pitch, track]);

  const toggleMotor = () => {
    setIsMotorRunning(!isMotorRunning);
  };

  const handleDragEnd = () => {
      // Snap to rest if close
      if (armAngle < -20) {
          setArmAngle(-27);
      }
  };

  return (
    <div
      className="relative w-[720px] h-[540px] overflow-hidden bg-white select-none"
      style={{
        borderRadius: `${borderRadius}px`,
        boxShadow: `0 25px ${shadowBlur}px -5px rgba(0,0,0,${shadowOpacity})`,
      }}
    >
      <Chassis borderRadius={borderRadius} />

      {/* Content layer */}
      <div className="absolute inset-0">

        {/* Tone arm base plate — rendered below the platter so it tucks behind the record */}
        <svg
          className="absolute pointer-events-none"
          style={{ left: 475, top: 30 }}
          width="195"
          height="195"
          viewBox="0 0 194.562 194.562"
          fill="none"
          overflow="visible"
        >
          <defs>
            <filter id="filter0_i_armBase" x="0" y="0" width="194.562" height="194.562" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix"/>
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
              <feMorphology radius="9.98177" operator="erode" in="SourceAlpha" result="effect1_innerShadow"/>
              <feOffset/>
              <feGaussianBlur stdDeviation="4.99089"/>
              <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
              <feColorMatrix type="matrix" values="0 0 0 0 0.332791 0 0 0 0 0.332791 0 0 0 0 0.332791 0 0 0 0.05 0"/>
              <feBlend mode="normal" in2="shape" result="effect1_innerShadow"/>
            </filter>
          </defs>
          <g filter="url(#filter0_i_armBase)">
            <circle cx="97.2812" cy="97.2812" r="97.2812" fill="#F8F8F8" fillOpacity={0.6} paintOrder="stroke fill" />
          </g>
        </svg>

        <Platter
          isPlaying={isMotorRunning}
          playbackRate={pitch}
          onScrub={handleScrub}
          onScrubStart={() => setIsScrubbing(true)}
          onScrubEnd={() => setIsScrubbing(false)}
          track={track}
        />

        <ToneArm
          angle={armAngle}
          onAngleChange={setArmAngle}
          onDragEnd={handleDragEnd}
        />

        <StartButton isPlaying={isMotorRunning} onToggle={toggleMotor} />

        <PitchSlider value={pitch} onChange={setPitch} />
      </div>

      {/* Inner shadow overlay for uplifted chassis feel */}
      <div
        className="absolute inset-0 shadow-[inset_0px_0px_11px_11px_rgba(152,152,152,0.26)] pointer-events-none z-[200]"
        style={{ borderRadius: `${borderRadius}px` }}
      />
    </div>
  );
};
