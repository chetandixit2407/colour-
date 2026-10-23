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
 * Ambient background for the Nixtio Crextio design system with White Collar Realty branding.
 * - Warm cream #F4F0E8 canvas blended with light white, mist-grey and subtle gold #F5EB78 gradients
 * - Centered, elegant, low-opacity White Collar Realty logo watermark
 * - Non-distracting, non-stretching (object-contain), fully responsive cover blend
 * - Guaranteed readability with strong contrast for overlying cards and text
 */
export const CinematicBackground: React.FC<CinematicBackgroundProps> = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#F4F0E8]"
    >
      {/* Ambient gradient meshes */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_12%,rgba(245,235,120,0.16)_0%,transparent_45%),radial-gradient(circle_at_90%_15%,rgba(255,255,255,0.75)_0%,transparent_50%),radial-gradient(circle_at_50%_90%,rgba(235,230,220,0.40)_0%,transparent_60%)]" />

      {/* Centered White Collar Realty Logo Brand Watermark */}
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <img
          src="/wcr-logo-watermark.svg"
          alt=""
          className="w-[280px] sm:w-[360px] md:w-[440px] lg:w-[520px] max-w-[85vw] max-h-[75vh] object-contain opacity-[0.045] text-[#121316] filter drop-shadow-xs"
        />
      </div>

      {/* Subtle mist-grey vignette blend */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#EFEAE0]/30" />
    </div>
  );
};

export default CinematicBackground;
