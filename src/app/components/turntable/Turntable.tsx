import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PitchShifter } from 'soundtouchjs';
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
  const [pitch, setPitch] = useState(0); // semitones, -6 to +6
  const [armAngle, setArmAngle] = useState(-27);

  // Audio engine refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const shifterRef = useRef<PitchShifter | null>(null);
  const isConnectedRef = useRef(false);

  // Tracks playback position during scrubbing (0-100 percentage)
  const scrubPositionPctRef = useRef(0);

  // Stable refs — avoids stale closures inside async callbacks
  const isMotorRunningRef = useRef(false);
  const isScrubbingRef = useRef(false);
  const armAngleRef = useRef(-27);
  const pitchRef = useRef(0);

  isMotorRunningRef.current = isMotorRunning;
  isScrubbingRef.current = isScrubbing;
  armAngleRef.current = armAngle;
  pitchRef.current = pitch;

  const getOrCreateCtx = useCallback((): AudioContext => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  }, []);

  const disconnectShifter = useCallback(() => {
    if (shifterRef.current && isConnectedRef.current) {
      try { shifterRef.current.disconnect(); } catch { /* already disconnected */ }
      isConnectedRef.current = false;
    }
  }, []);

  const connectShifter = useCallback(() => {
    const ctx = audioCtxRef.current;
    const shifter = shifterRef.current;
    if (!ctx || !shifter || isConnectedRef.current) return;
    if (ctx.state === 'suspended') ctx.resume();
    shifter.connect(ctx.destination);
    isConnectedRef.current = true;
  }, []);

  /**
   * Creates a fresh PitchShifter with a loop-guarded onEnd.
   * The guard prevents a false "end of track" trigger that SoundTouch can emit
   * when its internal processing buffer drains after a pitch change or seek.
   */
  const makeShifter = useCallback((ctx: AudioContext, buffer: AudioBuffer): PitchShifter => {
    const shifter = new PitchShifter(ctx, buffer, 4096, () => {
      console.log('[ON END] timePlayed:', shifter.timePlayed.toFixed(2), '/ duration:', shifter.duration.toFixed(2), '| guard passes:', shifter.timePlayed > shifter.duration * 0.85);
      if (shifterRef.current === shifter && shifter.timePlayed > shifter.duration * 0.85) {
        shifter.percentagePlayed = 0;
      }
    });
    shifter.pitchSemitones = pitchRef.current;
    return shifter;
  // pitchRef and shifterRef are stable refs — no deps needed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load + decode audio whenever the track URL changes
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      disconnectShifter();
      shifterRef.current = null;
      audioBufferRef.current = null;

      const ctx = getOrCreateCtx();

      try {
        const response = await fetch(track.url);
        const arrayBuffer = await response.arrayBuffer();
        if (cancelled) return;

        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        if (cancelled) return;

        audioBufferRef.current = audioBuffer;
        const shifter = makeShifter(ctx, audioBuffer);
        shifterRef.current = shifter;
        isConnectedRef.current = false;

        // Resume playback if the motor was already running when track loaded
        const isArmOnRecord = armAngleRef.current > -10 && armAngleRef.current < 30;
        if (isMotorRunningRef.current && isArmOnRecord && !isScrubbingRef.current) {
          if (ctx.state === 'suspended') ctx.resume();
          shifter.connect(ctx.destination);
          isConnectedRef.current = true;
        }
      } catch (err) {
        if (!cancelled) console.error('Failed to load audio:', err);
      }
    };

    load();

    return () => {
      cancelled = true;
      disconnectShifter();
      shifterRef.current = null;
      audioBufferRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.url]);

  // Play / pause based on motor, arm position, and scrub state
  useEffect(() => {
    if (!shifterRef.current || !audioCtxRef.current) return;

    const isArmOnRecord = armAngle > -10 && armAngle < 30;
    const shouldPlay = isMotorRunning && isArmOnRecord && !isScrubbing;

    if (shouldPlay) {
      connectShifter();
    } else {
      disconnectShifter();
    }
  }, [isMotorRunning, isScrubbing, armAngle, connectShifter, disconnectShifter]);

  // Pitch change — update pitchSemitones live, no restart required
  useEffect(() => {
    if (shifterRef.current) {
      shifterRef.current.pitchSemitones = pitch;
    }
  }, [pitch]);

  // Cleanup AudioContext on unmount
  useEffect(() => {
    return () => {
      disconnectShifter();
      shifterRef.current = null;
      audioBufferRef.current = null;
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMotor = () => {
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    setIsMotorRunning(prev => !prev);
  };

  // Save the current playback position at scrub start
  const handleScrubStart = () => {
    console.log('[SCRUB START] percentagePlayed:', shifterRef.current?.percentagePlayed?.toFixed(2), '| timePlayed:', shifterRef.current?.timePlayed?.toFixed(2), '| shifter exists:', !!shifterRef.current);
    if (shifterRef.current) {
      scrubPositionPctRef.current = shifterRef.current.percentagePlayed;
    }
    setIsScrubbing(true);
  };

  // Accumulate position delta without touching the SoundTouch node
  const handleScrub = (deltaTime: number) => {
    const buffer = audioBufferRef.current;
    if (!buffer) return;
    const duration = buffer.duration;
    const currentTime = (scrubPositionPctRef.current / 100) * duration;
    const newTime = ((currentTime + deltaTime) % duration + duration) % duration;
    scrubPositionPctRef.current = (newTime / duration) * 100;
  };

  /**
   * On scrub end, rebuild the PitchShifter from scratch at the target position.
   * This flushes SoundTouch's internal buffer so playback resumes cleanly from
   * exactly the scrubbed-to position, without any stale audio data.
   */
  const handleScrubEnd = useCallback(() => {
    const ctx = audioCtxRef.current;
    const buffer = audioBufferRef.current;
    if (ctx && buffer) {
      disconnectShifter();
      const newShifter = makeShifter(ctx, buffer);
      newShifter.percentagePlayed = scrubPositionPctRef.current / 100;
      console.log('[SCRUB END] target:', scrubPositionPctRef.current.toFixed(2), '% | reads back as:', newShifter.percentagePlayed.toFixed(2), '%');
      shifterRef.current = newShifter;
      isConnectedRef.current = false;
    }
    setIsScrubbing(false);
    // The play/pause effect will reconnect on the next render if motor is running
  }, [disconnectShifter, makeShifter]);

  const handleDragEnd = () => {
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
          playbackRate={1}
          onScrub={handleScrub}
          onScrubStart={handleScrubStart}
          onScrubEnd={handleScrubEnd}
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
