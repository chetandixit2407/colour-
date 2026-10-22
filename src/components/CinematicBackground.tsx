import React from 'react';

export type CinematicVariant =
  | 'dashboard'
  | 'reception'
  | 'visitor'
  | 'interview'
  | 'room'
  | 'candidate'
  | 'settings';

interface CinematicBackgroundProps {
  variant?: CinematicVariant;
  intensity?: 'normal' | 'subdued' | 'minimal';
}

/**
 * Ambient background for the warm luxury design system.
 * Warm white #FAF9F6 with soft champagne gold #D8BF85 & soft beige #F0E5CC diffusion.
 * Allows translucent glass cards (rgba(255,255,255,0.55-0.72) with blur(14px))
 * to visibly reveal the background and watermark while keeping text readable.
 */
export const CinematicBackground: React.FC<CinematicBackgroundProps> = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#FAF9F6]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(216,191,133,0.18)_0%,transparent_45%),radial-gradient(circle_at_88%_80%,rgba(240,229,204,0.40)_0%,transparent_50%),radial-gradient(circle_at_50%_50%,rgba(216,191,133,0.08)_0%,transparent_60%)]" />
    </div>
  );
};

export default CinematicBackground;
