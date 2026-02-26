import React from 'react';

export const Chassis: React.FC<{ borderRadius?: number }> = ({ borderRadius = 48 }) => {
  return (
    <div
      className="absolute inset-0 w-[720px] h-[540px] overflow-hidden bg-white shadow-[inset_0px_0px_11px_11px_rgba(152,152,152,0.26)] pointer-events-none"
      style={{ borderRadius: `${borderRadius}px` }}
    />
  );
};
