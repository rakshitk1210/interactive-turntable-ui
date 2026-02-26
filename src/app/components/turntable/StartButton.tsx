import React, { useRef } from 'react';
import svgPaths from '../../../imports/svg-dhnz5e8pee';
import playIcon from '../../../assets/play-icon.svg';
import clickSfx from '../../../assets/button-click.mp3';

interface StartButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export const StartButton: React.FC<StartButtonProps> = ({ isPlaying, onToggle }) => {
  const clickAudio = useRef(new Audio(clickSfx));

  const handleClick = () => {
    clickAudio.current.currentTime = 0;
    clickAudio.current.play().catch(() => {});
    onToggle();
  };

  return (
    <div
        className="absolute w-[72px] h-[72px] rounded-[47px] cursor-pointer touch-none select-none z-30 active:scale-95 transition-transform border-4 border-[#6a6a6a] overflow-hidden"
        style={{
            left: 38,
            bottom: 30,
            background: "linear-gradient(119.36deg, rgba(81, 83, 86, 0.3) 0%, rgba(0, 0, 0, 0.3) 100%), linear-gradient(90deg, #28292B 0%, #28292B 100%)",
        }}
        onClick={handleClick}
        aria-label={isPlaying ? "Stop" : "Start"}
    >
        {/* Inner circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[56px] h-[56px]">
            <svg className="absolute block w-full h-full" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="28" fill="#252527" />
            </svg>
        </div>

        {/* Icon */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[24px] h-[24px] flex items-center justify-center">
            {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d={svgPaths.p1f46df00} fill="#4CC35B" />
                </svg>
            ) : (
                <img alt="Play" className="block w-[15.5px] h-[16.5px]" src={playIcon} draggable={false} />
            )}
        </div>
    </div>
  );
};
