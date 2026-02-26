import React from 'react';

interface NavigationButtonsProps {
  onNext: () => void;
  onPrev: () => void;
  size?: number;
  borderColor?: string;
  borderWidth?: number;
  gap?: number;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onNext,
  onPrev,
  size = 72,
  borderColor = '#e7e8e9',
  borderWidth = 1.5,
  gap = 32,
}) => {
  const btnStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderColor,
    borderWidth,
    borderStyle: 'solid',
  };

  return (
    <div className="flex flex-col" style={{ gap }}>
      <button
        onClick={onPrev}
        className="rounded-full flex items-center justify-center hover:bg-neutral-800 transition-colors group"
        style={btnStyle}
        aria-label="Previous Track"
      >
        <div className="w-9 h-9 relative flex items-center justify-center">
             <svg className="w-4 h-2.5 text-[#F2F5F7] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 17 10">
                <path d="M8.3625 3.5625L2.5125 9.4125C2.2375 9.6875 1.8875 9.825 1.4625 9.825C1.0375 9.825 0.6875 9.6875 0.4125 9.4125C0.1375 9.1375 0 8.7875 0 8.3625C0 7.9375 0.1375 7.5875 0.4125 7.3125L7.3125 0.4125C7.4625 0.2625 7.625 0.15625 7.8 0.09375C7.975 0.03125 8.1625 0 8.3625 0C8.5625 0 8.75 0.03125 8.925 0.09375C9.1 0.15625 9.2625 0.2625 9.4125 0.4125L16.3125 7.3125C16.5875 7.5875 16.725 7.9375 16.725 8.3625C16.725 8.7875 16.5875 9.1375 16.3125 9.4125C16.0375 9.6875 15.6875 9.825 15.2625 9.825C14.8375 9.825 14.4875 9.6875 14.2125 9.4125L8.3625 3.5625Z" />
             </svg>
        </div>
      </button>

      <button
        onClick={onNext}
        className="rounded-full flex items-center justify-center hover:bg-neutral-800 transition-colors group"
        style={btnStyle}
        aria-label="Next Track"
      >
        <div className="w-9 h-9 relative flex items-center justify-center">
             <svg className="w-4 h-2.5 text-[#F2F5F7] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 17 10">
                <path d="M8.3625 9.825C8.1625 9.825 7.975 9.79375 7.8 9.73125C7.625 9.66875 7.4625 9.5625 7.3125 9.4125L0.4125 2.5125C0.1375 2.2375 0 1.8875 0 1.4625C0 1.0375 0.1375 0.6875 0.4125 0.4125C0.6875 0.1375 1.0375 0 1.4625 0C1.8875 0 2.2375 0.1375 2.5125 0.4125L8.3625 6.2625L14.2125 0.4125C14.4875 0.1375 14.8375 0 15.2625 0C15.6875 0 16.0375 0.1375 16.3125 0.4125C16.5875 0.6875 16.725 1.0375 16.725 1.4625C16.725 1.8875 16.5875 2.2375 16.3125 2.5125L9.4125 9.4125C9.2625 9.5625 9.1 9.66875 8.925 9.73125C8.75 9.79375 8.5625 9.825 8.3625 9.825Z" />
             </svg>
        </div>
      </button>
    </div>
  );
};
