import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, animate } from 'motion/react';
import { Track } from '../../data/tracks';
import platterBase from '../../../assets/platter-base.png';
import diskOuter from '../../../assets/disk-outer.svg';
import diskMain from '../../../assets/disk-main.svg';
import diskGroove1 from '../../../assets/disk-groove-1.svg';
import diskGroove2 from '../../../assets/disk-groove-2.svg';
import diskCenterHub from '../../../assets/disk-center-hub.svg';
import centerPin from '../../../assets/center-pin.svg';
import albumCoverDefault from '../../../assets/album-cover-default.jpg';
import diskLightEffect from '../../../assets/disk-light-effect.svg';


const SECONDS_PER_REVOLUTION = 1.8;

interface PlatterProps {
  isPlaying: boolean;
  playbackRate: number;
  onScrub: (deltaTime: number) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
  track?: Track;
}

export const Platter: React.FC<PlatterProps> = ({
  isPlaying,
  playbackRate,
  onScrub,
  onScrubStart,
  onScrubEnd,
  track,
}) => {
  const safeRate = playbackRate > 0 ? playbackRate : 1;
  const duration = SECONDS_PER_REVOLUTION / safeRate;

  const rotate = useMotionValue(0);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);

  // Refs for drag state — kept as refs so they never trigger re-renders
  const isDragging = useRef(false);
  const platterRef = useRef<HTMLDivElement>(null);
  const lastPointerAngleRef = useRef(0);

  // Store spin function in a ref so the recursive onComplete always calls
  // the latest version (captures up-to-date duration on each render).
  const startSpinRef = useRef<() => void>(() => {});
  startSpinRef.current = () => {
    animationRef.current = animate(rotate, rotate.get() + 360, {
      duration,
      ease: 'linear',
      onComplete: () => startSpinRef.current(),
    });
  };

  const stopSpin = () => {
    animationRef.current?.stop();
    animationRef.current = null;
  };

  useEffect(() => {
    if (isPlaying && !isDragging.current) {
      startSpinRef.current();
    } else {
      stopSpin();
    }
    return stopSpin;
  }, [isPlaying, duration]);

  const getCenter = () => {
    const rect = platterRef.current!.getBoundingClientRect();
    return { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    stopSpin(); // stop immediately, don't wait for state propagation
    const { cx, cy } = getCenter();
    lastPointerAngleRef.current = Math.atan2(e.clientY - cy, e.clientX - cx);
    onScrubStart();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const { cx, cy } = getCenter();
    const angle = Math.atan2(e.clientY - cy, e.clientX - cx);

    let delta = angle - lastPointerAngleRef.current;
    // Normalise to [-π, π] to prevent wrap-around jumps
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;
    lastPointerAngleRef.current = angle;

    rotate.set(rotate.get() + delta * (180 / Math.PI));
    onScrub((delta / (2 * Math.PI)) * SECONDS_PER_REVOLUTION);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    onScrubEnd();
    if (isPlaying) {
      startSpinRef.current();
    }
  };

  return (
    <div ref={platterRef} className="absolute top-[30px] left-[38px] w-[480px] h-[480px]">
      {/* Static platter base — never rotates */}
      <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none select-none" style={{ isolation: 'isolate' }}>
        <img
          src={platterBase}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        {/* Wood-grain texture overlay — same technique as the chassis */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/wood-texture.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            mixBlendMode: 'overlay',
            opacity: 0.28,
          }}
        />
      </div>

      {/* Rotating vinyl group */}
      <motion.div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{ rotate, transformOrigin: 'center center', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Outer disk — dark base ring */}
        <div className="absolute left-[19.82px] top-[19.81px] w-[440.37px] h-[440.37px]">
          <img alt="" className="absolute block w-full h-full" src={diskOuter} draggable={false} />
        </div>

        {/* Main vinyl body */}
        <div className="absolute left-[25.57px] top-[25.57px] w-[428.868px] h-[428.868px]">
          <img alt="" className="absolute block w-full h-full" src={diskMain} draggable={false} />
        </div>

        {/* Groove ring 1 */}
        <div className="absolute left-[63.36px] top-[63.36px] w-[353.282px] h-[353.282px]">
          <img alt="" className="absolute block w-full h-full" src={diskGroove1} draggable={false} />
        </div>

        {/* Groove ring 2 */}
        <div className="absolute left-[95.41px] top-[95.4px] w-[289.198px] h-[289.198px]">
          <img alt="" className="absolute block w-full h-full" src={diskGroove2} draggable={false} />
        </div>

        {/* Vinyl grain/noise texture overlay — screen blend composites white speckles onto the dark vinyl */}
        <svg
          className="absolute pointer-events-none"
          style={{ left: 0, top: 0, width: '480px', height: '480px', opacity: 0.15 }}
          viewBox="0 0 480 480"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="vinylGrainFilter" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency="2 2" stitchTiles="stitch" numOctaves="3" seed="7586" result="noise" />
              <feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise" />
              <feComponentTransfer in="alphaNoise" result="thresholded">
                <feFuncA type="discrete" tableValues="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0" />
              </feComponentTransfer>
              <feFlood floodColor="white" floodOpacity="0.9" result="whiteFill" />
              <feComposite operator="in" in="whiteFill" in2="thresholded" />
            </filter>
            <clipPath id="vinylDiscClip">
              <circle cx="240" cy="240" r="214.43" />
            </clipPath>
          </defs>
          <rect x="0" y="0" width="480" height="480" fill="black" filter="url(#vinylGrainFilter)" clipPath="url(#vinylDiscClip)" />
        </svg>

        {/* Album cover */}
        <div className="absolute left-[134.02px] top-[134.02px] w-[211.969px] h-[211.969px] rounded-full overflow-hidden">
          <img
            src={track?.cover || albumCoverDefault}
            alt="Album Cover"
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = albumCoverDefault; }}
          />
        </div>

        {/* Center hub disk */}
        <div className="absolute left-[211.25px] top-[211.25px] w-[57.511px] h-[57.511px]">
          <img alt="" className="absolute block w-full h-full" src={diskCenterHub} draggable={false} />
        </div>

        {/* Center pin */}
        <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '21.3612px', height: '21.3612px' }}>
          <img alt="" className="block w-full h-full" src={centerPin} draggable={false} />
        </div>

        {/* Light effect overlay — rotates with the vinyl */}
        <div
          className="absolute pointer-events-none"
          style={{ left: '-52.93px', top: '-52.92px', width: '585.849px', height: '585.846px', opacity: 0.6 }}
        >
          <img alt="" className="block w-full h-full" src={diskLightEffect} draggable={false} />
        </div>
      </motion.div>
    </div>
  );
};
