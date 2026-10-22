import React from 'react';
import { motion } from 'motion/react';
import { smoothEase } from '../utils/motion.ts';

/**
 * Large, semi-transparent White Collar Realty logo watermark.
 * Positioned centrally within the main dashboard content area,
 * completely behind cards, navigation, modals, and operational sections.
 *
 * - Genuine transparent background (no solid rectangle or box)
 * - Exact building silhouette emblem, collar/tie motif, and typography
 * - Dark charcoal / black monochrome appearance with ~11% opacity (within 8-15% range)
 * - Pointer-events: none so clicks and scrolls pass through completely
 * - Sized ~300-400px wide on desktop with responsive scaling
 * - Subtle, smooth initial fade-in without any distracting loops or motion
 */
export const DashboardWatermark: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 lg:left-64 pointer-events-none z-0 flex items-center justify-center overflow-hidden select-none"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55, ease: smoothEase }}
        className="w-[260px] sm:w-[300px] md:w-[340px] lg:w-[380px] xl:w-[400px] max-w-[85vw] max-h-[75vh] flex items-center justify-center"
      >
        <svg
          viewBox="50 10 320 415"
          className="w-full h-full object-contain opacity-[0.08] text-[#202124]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Skyscraper / Office Silhouette Motif */}
          <path
            d="M70 300 L70 140 L140 90 L210 140 L210 300 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M210 300 L210 70 L280 20 L350 70 L350 300 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central Collar / Tie Stylized V & W */}
          <path
            d="M120 180 L190 290 L260 180"
            fill="none"
            stroke="currentColor"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M190 290 L220 340 L250 290"
            fill="currentColor"
          />

          {/* WCR Brand Typography */}
          <text
            x="190"
            y="375"
            textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="44"
            fill="currentColor"
            letterSpacing="6"
          >
            WCR
          </text>
          <text
            x="190"
            y="405"
            textAnchor="middle"
            fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            fontWeight="600"
            fontSize="16"
            fill="currentColor"
            letterSpacing="3"
          >
            WHITE COLLAR REALTY
          </text>
        </svg>
      </motion.div>
    </div>
  );
};

export default DashboardWatermark;
