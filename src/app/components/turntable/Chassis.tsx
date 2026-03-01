import React from 'react';

export const Chassis: React.FC<{ borderRadius?: number }> = ({ borderRadius = 48 }) => {
  return (
    <div
      className="absolute inset-0 w-[720px] h-[540px] overflow-hidden pointer-events-none"
      style={{ borderRadius: `${borderRadius}px`, backgroundColor: '#F8f8f8' }}
    >
      {/* Wood grain texture at 40% opacity, matching reference design */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/wood-texture.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.4,
          borderRadius: `${borderRadius}px`,
        }}
      />
    </div>
  );
};
