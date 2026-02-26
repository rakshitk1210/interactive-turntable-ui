import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ControlDef {
  key: string;
  label: string;
  type: 'range' | 'color' | 'number';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  defaultValue: string | number;
  cssVar: string;
}

const SECTIONS: { title: string; controls: ControlDef[] }[] = [
  {
    title: 'Title',
    controls: [
      { key: 'titleSize', label: 'Font Size', type: 'range', min: 40, max: 200, step: 1, unit: 'px', defaultValue: 120, cssVar: '--ctrl-title-size' },
      { key: 'titleGradStart', label: 'Gradient Start', type: 'color', defaultValue: '#ffffff', cssVar: '--ctrl-title-grad-start' },
      { key: 'titleGradMid', label: 'Gradient Mid', type: 'color', defaultValue: '#b0b0b0', cssVar: '--ctrl-title-grad-mid' },
      { key: 'titleGradEnd', label: 'Gradient End', type: 'color', defaultValue: '#4a4a4a', cssVar: '--ctrl-title-grad-end' },
      { key: 'titleMarginBottom', label: 'Bottom Offset', type: 'range', min: -80, max: 40, step: 1, unit: 'px', defaultValue: -30, cssVar: '--ctrl-title-mb' },
    ],
  },
  {
    title: 'Background',
    controls: [
      { key: 'bgColor', label: 'Color', type: 'color', defaultValue: '#171818', cssVar: '--ctrl-bg-color' },
      { key: 'bgNoiseOpacity', label: 'Noise Opacity', type: 'range', min: 0, max: 1, step: 0.01, defaultValue: 1, cssVar: '--ctrl-bg-noise-opacity' },
    ],
  },
  {
    title: 'Turntable',
    controls: [
      { key: 'ttRadius', label: 'Border Radius', type: 'range', min: 0, max: 100, step: 1, unit: 'px', defaultValue: 48, cssVar: '--ctrl-tt-radius' },
      { key: 'ttShadowBlur', label: 'Shadow Blur', type: 'range', min: 0, max: 80, step: 1, unit: 'px', defaultValue: 25, cssVar: '--ctrl-tt-shadow-blur' },
      { key: 'ttShadowOpacity', label: 'Shadow Opacity', type: 'range', min: 0, max: 1, step: 0.01, defaultValue: 0.25, cssVar: '--ctrl-tt-shadow-opacity' },
      { key: 'ttScale', label: 'Scale', type: 'range', min: 0.5, max: 1.5, step: 0.01, defaultValue: 1, cssVar: '--ctrl-tt-scale' },
    ],
  },
  {
    title: 'Track Info',
    controls: [
      { key: 'trackTitleSize', label: 'Title Size', type: 'range', min: 12, max: 48, step: 1, unit: 'px', defaultValue: 24, cssVar: '--ctrl-track-title-size' },
      { key: 'trackSubSize', label: 'Subtitle Size', type: 'range', min: 10, max: 32, step: 1, unit: 'px', defaultValue: 16, cssVar: '--ctrl-track-sub-size' },
      { key: 'trackColor', label: 'Text Color', type: 'color', defaultValue: '#ffffff', cssVar: '--ctrl-track-color' },
      { key: 'trackSubOpacity', label: 'Subtitle Opacity', type: 'range', min: 0, max: 1, step: 0.01, defaultValue: 0.8, cssVar: '--ctrl-track-sub-opacity' },
      { key: 'trackSpacing', label: 'Top Spacing', type: 'range', min: 0, max: 80, step: 1, unit: 'px', defaultValue: 30, cssVar: '--ctrl-track-spacing' },
    ],
  },
  {
    title: 'Nav Buttons',
    controls: [
      { key: 'navSize', label: 'Size', type: 'range', min: 32, max: 120, step: 1, unit: 'px', defaultValue: 72, cssVar: '--ctrl-nav-size' },
      { key: 'navBorderColor', label: 'Border Color', type: 'color', defaultValue: '#e7e8e9', cssVar: '--ctrl-nav-border-color' },
      { key: 'navBorderWidth', label: 'Border Width', type: 'range', min: 0, max: 5, step: 0.5, unit: 'px', defaultValue: 1.5, cssVar: '--ctrl-nav-border-width' },
      { key: 'navGap', label: 'Gap', type: 'range', min: 0, max: 60, step: 1, unit: 'px', defaultValue: 32, cssVar: '--ctrl-nav-gap' },
    ],
  },
  {
    title: 'Footer',
    controls: [
      { key: 'footerSize', label: 'Font Size', type: 'range', min: 10, max: 28, step: 1, unit: 'px', defaultValue: 16, cssVar: '--ctrl-footer-size' },
      { key: 'footerOpacity', label: 'Opacity', type: 'range', min: 0, max: 1, step: 0.01, defaultValue: 0.5, cssVar: '--ctrl-footer-opacity' },
      { key: 'footerSpacing', label: 'Top Spacing', type: 'range', min: 0, max: 120, step: 1, unit: 'px', defaultValue: 64, cssVar: '--ctrl-footer-spacing' },
    ],
  },
  {
    title: 'Layout',
    controls: [
      { key: 'ttNavGap', label: 'Turntable-Nav Gap', type: 'range', min: 0, max: 100, step: 1, unit: 'px', defaultValue: 40, cssVar: '--ctrl-tt-nav-gap' },
    ],
  },
];

function getAllDefaults(): Record<string, string | number> {
  const defaults: Record<string, string | number> = {};
  for (const section of SECTIONS) {
    for (const c of section.controls) {
      defaults[c.key] = c.defaultValue;
    }
  }
  return defaults;
}

function buildCssVarMap(values: Record<string, string | number>): Record<string, string> {
  const map: Record<string, string> = {};
  for (const section of SECTIONS) {
    for (const c of section.controls) {
      const val = values[c.key];
      map[c.cssVar] = c.unit ? `${val}${c.unit}` : String(val);
    }
  }
  return map;
}

export function useDesignControls() {
  const [values, setValues] = useState<Record<string, string | number>>(getAllDefaults);
  const cssVars = buildCssVarMap(values);
  return { values, setValues, cssVars };
}

export const DesignControlPanel: React.FC<{
  values: Record<string, string | number>;
  onChange: React.Dispatch<React.SetStateAction<Record<string, string | number>>>;
  visible: boolean;
}> = ({ values, onChange, visible }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [pos, setPos] = useState({ x: 16, y: 16 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('input, button, label')) return;
    dragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  }, [pos]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const handleChange = (key: string, val: string | number) => {
    onChange(prev => ({ ...prev, [key]: val }));
  };

  const handleReset = () => {
    onChange(getAllDefaults());
  };

  const handleCopy = () => {
    const vars = buildCssVarMap(values);
    const lines = Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`);
    const text = `:root {\n${lines.join('\n')}\n}`;
    navigator.clipboard.writeText(text).catch(() => {});
  };

  if (!visible) return null;

  return (
    <div
      ref={panelRef}
      onMouseDown={onMouseDown}
      style={{ left: pos.x, top: pos.y }}
      className="fixed z-[9999] w-[300px] max-h-[85vh] overflow-y-auto rounded-2xl bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 shadow-2xl text-white text-[13px] select-none"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#1a1a1a]/95 backdrop-blur-xl px-4 py-3 border-b border-white/10 flex items-center justify-between rounded-t-2xl cursor-grab active:cursor-grabbing">
        <span className="font-semibold text-[14px] tracking-wide">Design Controls</span>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[11px] transition-colors" title="Copy CSS vars">
            Copy
          </button>
          <button onClick={handleReset} className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[11px] transition-colors" title="Reset all">
            Reset
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="px-4 py-2 space-y-1">
        {SECTIONS.map(section => {
          const isCollapsed = collapsed[section.title] ?? false;
          return (
            <div key={section.title}>
              <button
                onClick={() => setCollapsed(prev => ({ ...prev, [section.title]: !isCollapsed }))}
                className="w-full flex items-center justify-between py-1.5 text-[12px] font-semibold uppercase tracking-wider text-white/60 hover:text-white/90 transition-colors"
              >
                {section.title}
                <span className="text-[10px]">{isCollapsed ? '▸' : '▾'}</span>
              </button>

              {!isCollapsed && (
                <div className="space-y-2 pb-2">
                  {section.controls.map(ctrl => (
                    <ControlRow
                      key={ctrl.key}
                      ctrl={ctrl}
                      value={values[ctrl.key]}
                      onChange={val => handleChange(ctrl.key, val)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hint */}
      <div className="px-4 py-2 border-t border-white/10 text-[11px] text-white/30 text-center">
        Drag header to move &middot; Press <kbd className="px-1 py-0.5 rounded bg-white/10 text-white/50">D</kbd> to toggle
      </div>
    </div>
  );
};

const ControlRow: React.FC<{
  ctrl: ControlDef;
  value: string | number;
  onChange: (val: string | number) => void;
}> = ({ ctrl, value, onChange }) => {
  if (ctrl.type === 'color') {
    return (
      <label className="flex items-center justify-between gap-2">
        <span className="text-white/70 truncate">{ctrl.label}</span>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={String(value)}
            onChange={e => onChange(e.target.value)}
            className="w-6 h-6 rounded border border-white/20 bg-transparent cursor-pointer [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-none"
          />
          <input
            type="text"
            value={String(value)}
            onChange={e => onChange(e.target.value)}
            className="w-[68px] px-1.5 py-0.5 rounded bg-white/10 text-white text-[11px] font-mono border border-white/10 focus:border-white/30 outline-none"
          />
        </div>
      </label>
    );
  }

  const numVal = Number(value);
  const displayVal = ctrl.step && ctrl.step < 1 ? numVal.toFixed(2) : String(numVal);

  return (
    <label className="block">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-white/70">{ctrl.label}</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={displayVal}
            min={ctrl.min}
            max={ctrl.max}
            step={ctrl.step}
            onChange={e => onChange(Number(e.target.value))}
            className="w-[52px] px-1 py-0 rounded bg-white/10 text-white text-[11px] font-mono border border-white/10 focus:border-white/30 outline-none text-right"
          />
          {ctrl.unit && <span className="text-[10px] text-white/40 w-[16px]">{ctrl.unit}</span>}
        </div>
      </div>
      <input
        type="range"
        min={ctrl.min}
        max={ctrl.max}
        step={ctrl.step}
        value={numVal}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-full appearance-none bg-white/15 cursor-pointer accent-blue-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:shadow-md"
      />
    </label>
  );
};
