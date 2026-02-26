import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import armSvg from '../../../assets/arm-updated.svg';
import pickupSfx from '../../../assets/tonearm-pickup.mp3';
import dropSfx from '../../../assets/tonearm-drop.mp3';

interface ToneArmProps {
  angle: number;
  onAngleChange: (angle: number) => void;
  onDragEnd: () => void;
}

export const ToneArm: React.FC<ToneArmProps> = ({ angle, onAngleChange, onDragEnd }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const pickupAudio = useRef(new Audio(pickupSfx));
  const dropAudio   = useRef(new Audio(dropSfx));

  const playSfx = (audio: HTMLAudioElement) => {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  // Angle from cursor→pivot captured at pointer-down, used for delta-based drag
  const dragStartCursorAngle = useRef<number>(0);
  // Arm angle captured at pointer-down
  const dragStartArmAngle = useRef<number>(0);

  // Container is positioned so that PIVOT_X/Y lands exactly on the arm holder circle
  // center in turntable-space: (475 + 97.28, 30 + 97.28) = (572.28, 127.28)
  const POS_LEFT = 501.8; // 572.28 - 70.49
  const POS_TOP  = 52.4;  // 127.28 - 74.90

  // Bearing-pin circle center in the new SVG's coordinate system (viewBox 0 0 121 434)
  const PIVOT_X = 70.49;
  const PIVOT_Y = 74.90;

  // The SVG arm is drawn at this angle — used to offset state angle to a CSS rotation
  const ASSET_ROTATION = -27.46;
  const MIN_ANGLE = -35;
  const MAX_ANGLE = 30;

  const getPivotScreenCoords = () => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    // Compensate for any CSS scale on an ancestor (e.g. App.tsx ttScale)
    const scale = rect.width / 121;
    return {
      x: rect.left + PIVOT_X * scale,
      y: rect.top  + PIVOT_Y * scale,
    };
  };

  const cursorAngleFromPivot = (clientX: number, clientY: number) => {
    const pivot = getPivotScreenCoords();
    if (!pivot) return 0;
    return Math.atan2(clientY - pivot.y, clientX - pivot.x) * (180 / Math.PI) - 90;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartCursorAngle.current = cursorAngleFromPivot(e.clientX, e.clientY);
    dragStartArmAngle.current = angle;
    setIsDragging(true);
    playSfx(pickupAudio.current);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const currentCursorAngle = cursorAngleFromPivot(e.clientX, e.clientY);
    let delta = currentCursorAngle - dragStartCursorAngle.current;

    // Normalise to [-180, 180] to prevent wrap-around jumps
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    const newAngle = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, dragStartArmAngle.current + delta));
    onAngleChange(newAngle);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    playSfx(dropAudio.current);
    onDragEnd();
  };

  const rotationOffset = angle - ASSET_ROTATION;

  return (
    <div
      ref={containerRef}
      className="absolute w-[121px] h-[434px] pointer-events-none z-[35] select-none"
      style={{ left: POS_LEFT, top: POS_TOP }}
    >
      {/* Single rotating layer — arm image + hit area both rotate together,
          so the grabbable zone always tracks the visual arm. */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: rotationOffset }}
        style={{ originX: `${PIVOT_X}px`, originY: `${PIVOT_Y}px` }}
        transition={
          isDragging
            ? { duration: 0 }  // zero latency during drag = true 1:1 arc tracking
            : { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }  // spring on release
        }
      >
        <img
          src={armSvg}
          alt=""
          className="absolute block w-full h-full pointer-events-none"
          draggable={false}
        />

        {/* Hit area covers the arm tube + needle — rotates with the arm automatically.
            onPointerLeave intentionally omitted: setPointerCapture keeps events flowing
            even when the cursor moves outside this element. */}
        <div
          className="absolute top-[80px] left-[5px] w-[100px] h-[330px] cursor-grab active:cursor-grabbing pointer-events-auto"
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      </motion.div>
    </div>
  );
};
