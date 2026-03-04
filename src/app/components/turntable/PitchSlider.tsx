import React, { useRef, useState } from 'react';
import pitchLine from '../../../assets/pitch-line.svg';
import goldTexture from '../../../assets/gold-texture-tile.jpg';

interface PitchSliderProps {
    value: number;        // semitones, -6 to +6
    onChange: (value: number) => void;
}

export const PitchSlider: React.FC<PitchSliderProps> = ({ value, onChange }) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [draftValue, setDraftValue] = useState<number | null>(null);

    const GROOVE_HEIGHT = 223;
    const GROOVE_TOP_OFFSET = 12.5;
    const MAX = 6;
    const MIN = -6;
    const RANGE = MAX - MIN; // 12

    // top of groove = +6 semitones, bottom = -6 semitones
    const valueToY = (v: number) => {
        const clamped = Math.max(MIN, Math.min(MAX, v));
        const pct = (MAX - clamped) / RANGE;
        return pct * GROOVE_HEIGHT;
    };

    const yToValue = (y: number) => {
        const pct = y / GROOVE_HEIGHT;
        return MAX - pct * RANGE;
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
        // Snap to 0 if within 0.15 semitones of centre
        const snapped = Math.abs(committed) < 0.15 ? 0 : committed;
        setDraftValue(null);
        onChange(snapped);
    };

    const displayValue = isDragging && draftValue !== null ? draftValue : value;
    const currentY = valueToY(displayValue);

    return (
        // Increased height (280px) to give the PITCH label clear space below the knob's
        // maximum travel position (~257px from top), preventing overlap.
        <div className="absolute left-[607px] top-[245.8px] w-[60.5px] h-[268px] select-none z-30 font-['Bree_Serif',serif]">

            {/* Number labels */}
            <div className="absolute left-0 top-[12px] w-[7px] h-[223px] flex flex-col justify-between items-end text-[8px] text-[#b7b7b7] leading-none pointer-events-none opacity-100">
                <div className="h-[4px] flex items-center"><span>+6</span></div>
                <div className="h-[4px] flex items-center"><span>4</span></div>
                <div className="h-[4px] flex items-center"><span>2</span></div>
                <div className="h-[4px] flex items-center"><span>0</span></div>
                <div className="h-[4px] flex items-center"><span>2</span></div>
                <div className="h-[4px] flex items-center"><span>4</span></div>
                <div className="h-[4px] flex items-center"><span>-6</span></div>
            </div>

            {/* Tick marks */}
            <div className="absolute left-[9px] top-[12px] w-[4px] h-[223px] flex flex-col justify-between pointer-events-none opacity-100">
                 {[...Array(7)].map((_, i) => (
                     <div key={i} className="w-full h-[4px] bg-[#b7b7b7] shrink-0" />
                 ))}
            </div>

            {/* Vertical reference line */}
            <div className="absolute left-[13px] top-[12px] h-[223px] w-[1px] pointer-events-none opacity-100">
                <img alt="" className="block w-full h-full" src={pitchLine} draggable={false} />
            </div>

            {/* Slider body */}
            <div className="absolute left-[21px] top-0 w-[40px] h-[268px]">

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
                    <div className="absolute inset-0 bg-[#f4f4f4] rounded-[8px] shadow-[inset_0px_0px_7px_2px_rgba(0,0,0,0.03)] pointer-events-none opacity-100" />

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
                        {/* Gold center stripe with metallic texture */}
                        <div
                          className="absolute top-[18.5px] left-0 w-full h-[3px] shadow-[0px_2px_3px_0px_rgba(0,0,0,0.04)] overflow-hidden"
                          style={{ backgroundColor: '#fcdf92', isolation: 'isolate' }}
                        >
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundImage: `url(${goldTexture})`,
                              backgroundSize: 'cover',
                              backgroundRepeat: 'no-repeat',
                              mixBlendMode: 'multiply',
                              opacity: 0.35,
                            }}
                          />
                        </div>
                    </div>
                </div>

                {/* PITCH label — sits below the knob's maximum travel at z-10 to stay on top */}
                <div className="absolute bottom-0 w-full text-center z-10">
                    <p className="text-[8px] text-[#b7b7b7] font-serif leading-none opacity-100">PITCH</p>
                </div>
            </div>

        </div>
    );
};
