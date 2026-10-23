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
 * Ambient background for the Nixtio Crextio design system.
 * Warm cream #F4F0E8 with subtle pale yellow #F5EB78 & warm ivory soft diffusion.
 */
export const CinematicBackground: React.FC<CinematicBackgroundProps> = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#F4F0E8]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_10%,rgba(245,235,120,0.18)_0%,transparent_42%),radial-gradient(circle_at_92%_15%,rgba(255,255,255,0.70)_0%,transparent_48%),radial-gradient(circle_at_50%_90%,rgba(235,230,220,0.35)_0%,transparent_60%)]" />
    </div>
  );
};

export default CinematicBackground;
