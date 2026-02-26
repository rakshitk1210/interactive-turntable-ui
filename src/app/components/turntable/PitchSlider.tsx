import React, { useRef, useState } from 'react';
import pitchLine from '../../../assets/pitch-line.svg';

interface PitchSliderProps {
    value: number;
    onChange: (value: number) => void;
}

export const PitchSlider: React.FC<PitchSliderProps> = ({ value, onChange }) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [draftValue, setDraftValue] = useState<number | null>(null);

    const GROOVE_HEIGHT = 223;
    const GROOVE_TOP_OFFSET = 12.5;

    const valueToY = (v: number) => {
        const clamped = Math.max(0.92, Math.min(1.08, v));
        const pct = (1.08 - clamped) / (1.08 - 0.92);
        return pct * GROOVE_HEIGHT;
    };

    const yToValue = (y: number) => {
        const pct = y / GROOVE_HEIGHT;
        return 1.08 - (pct * 0.16);
    };

    const getValueFromEvent = (e: React.PointerEvent) => {
        if (!trackRef.current) return null;
        const rect = trackRef.current.getBoundingClientRect();
        const relativeY = e.clientY - (rect.top + GROOVE_TOP_OFFSET);
        const clampedY = Math.max(0, Math.min(GROOVE_HEIGHT, relativeY));
        return yToValue(clampedY);
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
        const v = getValueFromEvent(e);
        if (v !== null) setDraftValue(v);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        const v = getValueFromEvent(e);
        if (v !== null) setDraftValue(v);
    };

    const commitDraft = (e: React.PointerEvent) => {
        if (!isDragging) return;
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
        const committed = draftValue ?? value;
        const snapped = Math.abs(committed - 1.0) < 0.005 ? 1.0 : committed;
        setDraftValue(null);
        onChange(snapped);
    };

    const displayValue = isDragging && draftValue !== null ? draftValue : value;
    const currentY = valueToY(displayValue);
    const isCenter = Math.abs(displayValue - 1.0) < 0.002;

    return (
        <div className="absolute left-[607px] top-[245.8px] w-[60.5px] h-[264px] select-none z-30 font-['Bree_Serif',serif]">

            {/* Number labels */}
            <div className="absolute left-0 top-[12px] w-[7px] h-[223px] flex flex-col justify-between items-end text-[8px] text-[#b7b7b7] leading-none pointer-events-none">
                <div className="h-[4px] flex items-center"><span>+8</span></div>
                <div className="h-[4px] flex items-center"><span>6</span></div>
                <div className="h-[4px] flex items-center"><span>4</span></div>
                <div className="h-[4px] flex items-center"><span>2</span></div>
                <div className="h-[4px] flex items-center opacity-0"><span>0</span></div>
                <div className="h-[4px] flex items-center"><span>2</span></div>
                <div className="h-[4px] flex items-center"><span>4</span></div>
                <div className="h-[4px] flex items-center"><span>6</span></div>
                <div className="h-[4px] flex items-center"><span>-8</span></div>
            </div>

            {/* Tick marks */}
            <div className="absolute left-[9px] top-[12px] w-[4px] h-[223px] flex flex-col justify-between pointer-events-none">
                 {[...Array(9)].map((_, i) => (
                     <div key={i} className="w-full h-[4px] bg-[#b7b7b7] shrink-0" />
                 ))}
            </div>

            {/* Vertical reference line */}
            <div className="absolute left-[13px] top-[12px] h-[223px] w-[1px] pointer-events-none">
                <img alt="" className="block w-full h-full" src={pitchLine} draggable={false} />
            </div>

            {/* Slider body */}
            <div className="absolute left-[21px] top-0 w-[40px] h-[264px]">

                {/* Track container */}
                <div
                    ref={trackRef}
                    className="relative w-[40px] h-[248px] cursor-grab active:cursor-grabbing"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={commitDraft}
                    onPointerLeave={commitDraft}
                    style={{ touchAction: 'none' }}
                >
                    {/* Track background */}
                    <div className="absolute inset-0 bg-[#f4f4f4] rounded-[8px] shadow-[inset_0px_0px_7px_2px_rgba(0,0,0,0.03)] pointer-events-none" />

                    {/* Groove */}
                    <div className="absolute left-[17px] top-[12.5px] w-[6px] h-[223px] bg-[#dadada] rounded-[99px] pointer-events-none">
                        <div className="absolute inset-0 rounded-[99px] shadow-[inset_-2px_0px_6px_1px_rgba(215,215,215,0.3)]" />
                    </div>

                    {/* Knob */}
                    <div
                        className="absolute left-[3.8px] w-[32px] h-[40px] pointer-events-none"
                        style={{ top: `calc(${GROOVE_TOP_OFFSET}px + ${currentY}px - 18.5px)` }}
                    >
                        <div className="absolute inset-0 bg-[#333] rounded-[9px] shadow-[0px_1px_12px_4px_rgba(0,0,0,0.1)]" />
                        <div className="absolute top-[18.5px] left-0 w-full h-[3px] bg-[#fcdf92] shadow-[0px_2px_3px_0px_rgba(0,0,0,0.04)]" />
                        {isCenter && (
                            <div className="absolute top-[19px] left-1/2 -translate-x-1/2 w-[4px] h-[2px] bg-[#adff2f] shadow-[0_0_8px_2px_#adff2f] rounded-full opacity-60" />
                        )}
                    </div>
                </div>

                {/* PITCH label */}
                <div className="absolute bottom-0 w-full text-center">
                    <p className="text-[8px] text-[#b7b7b7] font-serif leading-none">PITCH</p>
                </div>
            </div>

        </div>
    );
};
