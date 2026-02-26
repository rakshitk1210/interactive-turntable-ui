import React from 'react';

interface FooterProps {
  fontSize?: number;
  opacity?: number;
  marginTop?: number;
}

export const Footer: React.FC<FooterProps> = ({ fontSize = 16, opacity = 0.5, marginTop = 64 }) => {
  return (
    <div
      className="w-full max-w-[1561px] flex justify-between items-center text-white font-medium font-['Inter',sans-serif] px-8"
      style={{ fontSize, opacity, marginTop }}
    >
      <div className="w-[300px]">Designed and built by Rakshit</div>
      <div className="text-center">Built with Figma and cursor</div>
      <div className="w-[300px] text-right">rakshit.design</div>
    </div>
  );
};
