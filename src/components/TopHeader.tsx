import React from 'react';
import {
  Bell,
  MessageSquare,
  QrCode,
  UserCheck,
  Building,
  Menu,
  Shield,
  Search,
  Wifi,
  Sparkles,
  Smartphone,
  X,
  MoreHorizontal,
  Coffee,
  Clock,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { UserRole } from '../types/index.ts';
import { PWAInstallButton } from './PWAInstallButton.tsx';
import { useSettings } from '../context/SettingsContext.tsx';
import { unlockSpeechSynthesis } from '../utils/voiceAlertService.ts';

export interface OpenPanelItem {
  id: string;
  label: string;
  onClose: () => void;
}

interface TopHeaderProps {
  pageTitle?: string;
  currentRole: UserRole;
  unreadCount: number;
  unreadChatCount?: number;
  isRealtimeConnected: boolean;
  connectionStatus?: 'connected' | 'reconnecting' | 'disconnected' | 'connecting';
  onReconnectRealtime?: () => void;
  openPanels?: OpenPanelItem[];
  onOpenNotifications: () => void;
  onOpenChat: () => void;
  onOpenQRPasses: () => void;
  onOpenCheckIn: () => void;
  onOpenWalkIn?: () => void;
  onToggleMobileMenu?: () => void;
  onOpenMore?: () => void;
  isMoreActive?: boolean;
  onOpenCreatePantryTask?: () => void;
  onOpenPantryMonitor?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  pageTitle = 'Operations Command Center',
  currentRole,
  unreadCount,
  unreadChatCount = 0,
  isRealtimeConnected,
  connectionStatus,
  onReconnectRealtime,
  openPanels = [],
  onOpenNotifications,
  onOpenChat,
  onOpenQRPasses,
  onOpenCheckIn,
  onOpenWalkIn,
  onToggleMobileMenu,
  onOpenMore,
  isMoreActive = false,
  onOpenCreatePantryTask,
  onOpenPantryMonitor,
}) => {
  const { t, settings, updateSettings } = useSettings();

  const effectiveStatus = connectionStatus || (isRealtimeConnected ? 'connected' : 'reconnecting');

  return (
    <header className="sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 border-b border-slate-200/80 bg-white/70 backdrop-blur-md transition-all shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-6">
        {/* Left: Mobile trigger & Page Context */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl bg-white/80 border border-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer shadow-xs shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="space-y-0.5 min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 tracking-tight leading-snug truncate">
              {pageTitle}
            </h1>
            <p className="text-xs text-slate-500 hidden md:block truncate">
              White Collar Realty Operations &middot; Role: <strong className="text-slate-800 font-bold">{currentRole}</strong>
            </p>
          </div>
        </div>

        {/* Right: Quick Terminals & Communications */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Real-time Connection Capsule */}
          <button
            type="button"
            onClick={effectiveStatus === 'disconnected' ? onReconnectRealtime : undefined}
            disabled={effectiveStatus !== 'disconnected'}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition select-none ${
              effectiveStatus === 'connected'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                : effectiveStatus === 'reconnecting' || effectiveStatus === 'connecting'
                ? 'bg-amber-50 text-amber-700 border-amber-200 cursor-wait'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 cursor-pointer'
            }`}
            title={
              effectiveStatus === 'connected'
                ? 'Realtime stream connected and confirmed active'
                : effectiveStatus === 'reconnecting' || effectiveStatus === 'connecting'
                ? 'Attempting to establish realtime connection...'
                : 'Realtime stream disconnected. Click to reconnect.'
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                effectiveStatus === 'connected'
                  ? 'bg-emerald-500 animate-pulse'
                  : effectiveStatus === 'reconnecting' || effectiveStatus === 'connecting'
                  ? 'bg-amber-500 animate-ping'
                  : 'bg-rose-500'
              }`}
            />
            <span>
              {effectiveStatus === 'connected'
                ? t('app_live_realtime')
                : effectiveStatus === 'reconnecting' || effectiveStatus === 'connecting'
                ? t('app_reconnecting')
                : `${t('app_disconnected')} ↻`}
            </span>
          </button>

          {/* Explicit Voice Alerts Control (Spoken arrivals for intended host only) */}
          <button
            type="button"
            onClick={() => {
              const nextState = !settings.voiceAlerts;
              updateSettings({ voiceAlerts: nextState });
              if (nextState) {
                unlockSpeechSynthesis();
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer select-none ${
              settings.voiceAlerts
                ? 'bg-amber-500/15 text-amber-800 border-amber-300 hover:bg-amber-500/25 shadow-xs'
                : 'bg-white/70 text-slate-500 border-slate-200/80 hover:bg-white hover:text-slate-800'
            }`}
            title={
              settings.voiceAlerts
                ? 'Voice Alerts: ACTIVE. Spoken alerts will play exclusively on your device when a visitor or candidate arrives to meet you. Click to mute.'
                : 'Voice Alerts: MUTED. Click to enable spoken arrival alerts for your account.'
            }
          >
            {settings.voiceAlerts ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span className="hidden sm:inline font-medium">Voice: On</span>
                <span className="sm:hidden font-medium">Voice</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline font-medium">Voice: Muted</span>
                <span className="sm:hidden font-medium">Muted</span>
              </>
            )}
          </button>

          {/* Quick Intake Button (Hidden for Pantry) */}
          {currentRole !== 'PANTRY' && (
            <button
              onClick={onOpenCheckIn}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/70 hover:bg-white border border-slate-200/80 text-amber-700 font-semibold text-xs sm:text-[13px] transition cursor-pointer shadow-xs"
              title="Candidate Self Check-In Form"
            >
              <Smartphone className="w-4 h-4 text-amber-600" />
              <span>Check-In</span>
            </button>
          )}

          {/* QR Station (Hidden for Pantry) */}
          {currentRole !== 'PANTRY' && (
            <button
              onClick={onOpenQRPasses}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/70 hover:bg-white border border-slate-200/80 text-slate-700 hover:text-slate-900 font-medium text-xs sm:text-[13px] transition cursor-pointer shadow-xs"
              title="WCR QR Codes & Passes"
            >
              <QrCode className="w-4 h-4 text-amber-600" />
              <span>QR Station</span>
            </button>
          )}

          {/* Create Pantry Task for All Authorised Users */}
          {onOpenCreatePantryTask && currentRole !== 'PANTRY' && (
            <button
              onClick={onOpenCreatePantryTask}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-300 text-amber-800 font-semibold text-xs sm:text-[13px] transition cursor-pointer shadow-xs"
              title="Create Pantry or Hospitality Task"
            >
              <Coffee className="w-4 h-4 text-amber-600" />
              <span>+ Pantry Task</span>
            </button>
          )}

          {/* Pantry Realtime Monitor for Supervisors */}
          {onOpenPantryMonitor && (currentRole === 'ADMIN' || currentRole === 'CEO' || currentRole === 'HR' || currentRole === 'SENIOR_HR') && (
            <button
              onClick={onOpenPantryMonitor}
              className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/70 hover:bg-white border border-slate-200/80 text-slate-700 hover:text-slate-900 font-medium text-xs sm:text-[13px] transition cursor-pointer shadow-xs"
              title="Pantry Live Progress Monitor"
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Pantry Monitor</span>
            </button>
          )}

          {/* More Navigation Button for Laptop, Desktop & Tablet (Hidden for Pantry) */}
          {onOpenMore && currentRole !== 'PANTRY' && (
            <button
              onClick={onOpenMore}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs sm:text-[13px] font-semibold transition cursor-pointer shadow-xs ${
                isMoreActive
                  ? 'bg-amber-500 text-white border-amber-600 font-bold shadow-xs'
                  : 'bg-white/70 hover:bg-white border-slate-200/80 text-slate-700 hover:text-slate-900'
              }`}
              title="Secondary Dashboard Sections (Lounge, Active Meetings, Physical Check-Out)"
            >
              <MoreHorizontal className="w-4 h-4 text-amber-600" />
              <span>More</span>
            </button>
          )}

          {/* Office Internal Chat */}
          <button
            onClick={onOpenChat}
            className="relative p-2 rounded-xl bg-white/70 hover:bg-white border border-slate-200/80 text-slate-700 hover:text-amber-600 transition cursor-pointer flex items-center gap-2 shadow-xs"
            title="Internal Office Chat"
          >
            <MessageSquare className="w-4.5 h-4.5 text-amber-600" />
            <span className="hidden xl:inline text-xs sm:text-[13px] font-semibold">Office Chat</span>
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                {unreadChatCount > 9 ? '9+' : unreadChatCount}
              </span>
            )}
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-white/70 hover:bg-white border border-slate-200/80 text-slate-700 hover:text-slate-900 transition cursor-pointer shadow-xs"
            title="Alert Feed"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* PWA Install */}
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
