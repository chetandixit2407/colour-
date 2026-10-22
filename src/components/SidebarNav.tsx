import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { smoothEase } from '../utils/motion.ts';
import {
  LayoutDashboard,
  Building2,
  Users2,
  CalendarClock,
  UserCheck,
  DoorOpen,
  Coffee,
  Bell,
  Settings,
  Shield,
  Award,
  ChevronDown,
  LogOut,
  QrCode,
  UserPlus,
  Sparkles,
  Layers,
  MoreHorizontal,
} from 'lucide-react';
import type { UserRole, User } from '../types/index.ts';
import { useSettings } from '../context/SettingsContext.tsx';

export type NavSection =
  | 'dashboard'
  | 'reception'
  | 'visitors'
  | 'interviews'
  | 'candidates'
  | 'rooms'
  | 'hospitality'
  | 'notifications'
  | 'settings'
  | 'more'
  | 'hr-nisha'
  | 'hr-shriyanshi';

interface SidebarNavProps {
  currentRole: UserRole;
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  onSelectRole: (role: UserRole) => void;
  currentUser?: User | null;
  unreadCount: number;
  unreadChatCount?: number;
  isRealtimeConnected: boolean;
  connectionStatus?: 'connected' | 'reconnecting' | 'disconnected' | 'connecting';
  onReconnectRealtime?: () => void;
  onOpenNotifications: () => void;
  onOpenQRPasses: () => void;
  onOpenWalkIn?: () => void;
  onOpenBlankRegister: () => void;
  onLogout?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentRole,
  activeSection,
  onSelectSection,
  onSelectRole,
  currentUser,
  unreadCount,
  unreadChatCount = 0,
  isRealtimeConnected,
  connectionStatus,
  onReconnectRealtime,
  onOpenNotifications,
  onOpenQRPasses,
  onOpenWalkIn,
  onOpenBlankRegister,
  onLogout,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const { t } = useSettings();

  const effectiveStatus = connectionStatus || (isRealtimeConnected ? 'connected' : 'reconnecting');

  // Close More menu on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMoreMenuOpen(false);
        setRoleDropdownOpen(false);
      }
    };
    if (isMoreMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMoreMenuOpen]);

  const isPantry = currentRole === 'PANTRY';

  // Primary navigation items (always visible, filtered for Pantry)
  const primaryNavItems: {
    id: NavSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = isPantry
    ? [{ id: 'dashboard', label: 'Pantry Tasks', icon: Coffee }]
    : [
        { id: 'dashboard', label: t('nav_dashboard'), icon: LayoutDashboard },
        { id: 'reception', label: t('nav_reception'), icon: Building2 },
        { id: 'candidates', label: t('nav_candidates'), icon: UserCheck },
        { id: 'interviews', label: t('nav_interviews'), icon: CalendarClock },
      ];

  // Secondary items housed under "More" (hidden for Pantry)
  const secondaryNavItems: {
    id: NavSection;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = isPantry
    ? []
    : [
        {
          id: 'more',
          label: 'Secondary Sections',
          description: 'Lounge, Active Meetings & Check-Out',
          icon: Layers,
        },
        {
          id: 'visitors',
          label: t('nav_visitors'),
          description: 'Client & vendor logs',
          icon: Users2,
        },
        {
          id: 'rooms',
          label: t('nav_rooms'),
          description: 'Facility & room monitor',
          icon: DoorOpen,
        },
        {
          id: 'hospitality',
          label: t('nav_hospitality'),
          description: 'Pantry beverage steward',
          icon: Coffee,
        },
        {
          id: 'notifications',
          label: t('nav_notifications'),
          description: 'System & intake alerts',
          icon: Bell,
          badge: unreadCount,
        },
      ];

  const isSecondaryActive = secondaryNavItems.some((item) => item.id === activeSection);
  const activeSecondaryItem = secondaryNavItems.find((item) => item.id === activeSection);

  const allRoles: { role: UserRole; label: string; icon: any; color: string }[] = [
    { role: 'HR', label: 'HR Lead', icon: Users2, color: 'text-amber-400' },
    { role: 'SENIOR_HR', label: 'Senior HR', icon: Award, color: 'text-amber-300' },
    { role: 'ADMIN', label: 'Admin Ops', icon: Shield, color: 'text-purple-400' },
    { role: 'CEO', label: 'CEO Suite', icon: Award, color: 'text-emerald-400' },
    { role: 'INTERVIEWER', label: 'Interviewer', icon: UserCheck, color: 'text-blue-400' },
    { role: 'RECEPTION', label: 'Front Desk', icon: Building2, color: 'text-cyan-400' },
    { role: 'PANTRY', label: 'Pantry Steward', icon: Coffee, color: 'text-amber-300' },
  ];

  const canSwitchViews =
    !currentUser ||
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'CEO' ||
    currentUser.role === 'CO_FOUNDER';

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-[100dvh] fixed top-0 left-0 z-30 bg-white/72 backdrop-blur-[16px] border-r border-[#E5D2A0]/50 select-none text-[#111111]">
      <div className="flex-1 flex flex-col p-3.5 bg-transparent relative overflow-hidden">
        {/* Subtle Top Inner Highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E5D2A0]/45 to-transparent pointer-events-none" />

        {/* Brand Block */}
        <div className="px-2.5 py-3 border-b border-[#E5D2A0]/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FAF6ED] via-[#E5D2A0] to-[#C9AB68] flex items-center justify-center text-[#111111] font-black text-xs shadow-xs tracking-wider border border-[#E5D2A0]">
                WCR
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#FAF9F6]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#111111] text-xs tracking-tight">
                  White Collar Realty
                </span>
              </div>
              <span className="text-[10px] text-[#9E8243] font-mono tracking-wider uppercase block">
                {t('app_subbrand')}
              </span>
            </div>
          </div>

          {/* Real-time Status Light */}
          <button
            type="button"
            onClick={effectiveStatus === 'disconnected' ? onReconnectRealtime : undefined}
            disabled={effectiveStatus !== 'disconnected'}
            aria-label="Real-time Connection Status"
            className={`w-2.5 h-2.5 rounded-full transition ${
              effectiveStatus === 'connected'
                ? 'bg-emerald-500 animate-pulse cursor-default'
                : effectiveStatus === 'reconnecting' || effectiveStatus === 'connecting'
                ? 'bg-[#E5D2A0] animate-ping cursor-wait'
                : 'bg-rose-500 cursor-pointer hover:scale-125 ring-2 ring-rose-400/40'
            }`}
            title={
              effectiveStatus === 'connected'
                ? t('app_live_synced')
                : effectiveStatus === 'reconnecting' || effectiveStatus === 'connecting'
                ? t('app_reconnecting')
                : `${t('app_disconnected')} (Click to retry)`
            }
          />
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 py-3.5 space-y-1 overflow-y-auto">
          {/* Primary Nav Items */}
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                className={`relative w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-[#F0E5CC]/80 text-[#202124] font-semibold shadow-xs'
                    : 'text-[#5F6368] hover:text-[#202124] hover:bg-[#F0E5CC]/40'
                }`}
              >
                {/* Active Indicator Accent Line */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute inset-0 border-l-2 border-[#E5D2A0] rounded-xl pointer-events-none"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                <div className="flex items-center gap-2.5 relative z-10">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#9E8243]' : 'text-[#70757A] group-hover:text-[#202124]'
                    }`}
                  />
                  <span className="tracking-tight">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="relative z-10 px-1.5 py-0.5 rounded-full bg-[#E5D2A0] text-[#202124] font-bold text-[10px] tabular-nums">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* More Menu Dropdown Anchor (hidden for Pantry) */}
          {!isPantry && secondaryNavItems.length > 0 && (
            <div className="relative pt-1" ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen((prev) => !prev)}
              aria-expanded={isMoreMenuOpen}
              aria-haspopup="true"
              className={`relative w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isSecondaryActive
                  ? 'bg-[#F0E5CC]/80 text-[#202124] font-semibold'
                  : isMoreMenuOpen
                  ? 'bg-[#F0E5CC]/60 text-[#202124]'
                  : 'text-[#5F6368] hover:text-[#202124] hover:bg-[#F0E5CC]/40'
              }`}
            >
              {isSecondaryActive && (
                <div className="absolute inset-0 border-l-2 border-[#E5D2A0] rounded-xl pointer-events-none" />
              )}

              <div className="flex items-center gap-2.5 relative z-10">
                <MoreHorizontal
                  className={`w-4 h-4 transition-colors ${
                    isSecondaryActive ? 'text-[#9E8243]' : 'text-[#70757A]'
                  }`}
                />
                <span className="tracking-tight">
                  {isSecondaryActive && activeSecondaryItem
                    ? `${t('btn_more')}: ${activeSecondaryItem.label}`
                    : t('btn_more')}
                </span>
              </div>

              <div className="flex items-center gap-1.5 relative z-10">
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#E5D2A0] text-[#202124] font-bold text-[10px] tabular-nums">
                    {unreadCount}
                  </span>
                )}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#70757A] transition-transform duration-200 ${
                    isMoreMenuOpen ? 'rotate-180 text-[#9E8243]' : ''
                  }`}
                />
              </div>
            </button>

            {/* Expandable More Dropdown Panel */}
            <AnimatePresence>
              {isMoreMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: smoothEase }}
                  role="menu"
                  className="absolute left-0 right-0 top-full mt-1 bg-[#FAF9F6]/95 backdrop-blur-xl border border-[#E5D2A0]/40 rounded-2xl shadow-xl p-1.5 z-50 space-y-1 text-[#202124]"
                >
                  <div className="text-[10px] font-bold text-[#70757A] px-2.5 py-1 uppercase tracking-wider">
                    Additional Tabs & Sections
                  </div>

                  {secondaryNavItems.map((sec) => {
                    const SecIcon = sec.icon;
                    const isSecActive = activeSection === sec.id;
                    return (
                      <button
                        key={sec.id}
                        role="menuitem"
                        onClick={() => {
                          if (sec.id === 'notifications') {
                            onOpenNotifications();
                          } else {
                            onSelectSection(sec.id);
                          }
                          setIsMoreMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition cursor-pointer text-left ${
                          isSecActive
                            ? 'bg-[#F0E5CC] text-[#202124] font-bold border-l-2 border-[#E5D2A0]'
                            : 'text-[#5F6368] hover:text-[#202124] hover:bg-[#F0E5CC]/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <SecIcon
                            className={`w-3.5 h-3.5 ${
                              isSecActive ? 'text-[#9E8243]' : 'text-[#70757A]'
                            }`}
                          />
                          <div>
                            <div className="leading-tight">{sec.label}</div>
                            <div className="text-[10px] text-[#70757A]">{sec.description}</div>
                          </div>
                        </div>

                        {sec.badge !== undefined && sec.badge > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#E5D2A0] text-[#202124] font-bold text-[10px]">
                            {sec.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          )}

          {/* HR Sub-Profiles Section (Strictly hidden for Pantry) */}
          {!isPantry && (
            <div className="pt-2 border-t border-[#E5D2A0]/25 my-1 space-y-1">
            <div className="px-3 py-1 flex items-center justify-between text-[10px] font-bold text-[#9E8243] font-mono tracking-wider uppercase">
              <span>HR Profiles</span>
              <span className="text-[9px] text-[#70757A] font-normal">Dedicated</span>
            </div>

            {/* Profile 1: Nisha */}
            <button
              onClick={() => onSelectSection('hr-nisha')}
              className={`relative w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                activeSection === 'hr-nisha'
                  ? 'bg-[#F0E5CC]/80 text-[#202124] font-bold border-l-2 border-[#E5D2A0]'
                  : 'text-[#5F6368] hover:text-[#202124] hover:bg-[#F0E5CC]/40'
              }`}
            >
              {activeSection === 'hr-nisha' && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-0 border-l-2 border-[#E5D2A0] rounded-xl pointer-events-none"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <div className="flex items-center gap-2.5 relative z-10">
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black ${
                  activeSection === 'hr-nisha' ? 'bg-[#E5D2A0] text-[#202124]' : 'bg-[#F0E5CC]/60 text-[#3C4043]'
                }`}>
                  N
                </div>
                <div className="text-left">
                  <div className="tracking-tight leading-tight">Nisha</div>
                  <div className="text-[10px] text-[#9E8243]">Sr. HR Manager</div>
                </div>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#E5D2A0]/20 text-[#7E6532] border border-[#E5D2A0]/40 font-mono">
                Active
              </span>
            </button>

            {/* Profile 2: Shriyanshi */}
            <button
              onClick={() => onSelectSection('hr-shriyanshi')}
              className={`relative w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                activeSection === 'hr-shriyanshi'
                  ? 'bg-[#F0E5CC]/80 text-[#202124] font-bold border-l-2 border-[#E5D2A0]'
                  : 'text-[#5F6368] hover:text-[#202124] hover:bg-[#F0E5CC]/40'
              }`}
            >
              {activeSection === 'hr-shriyanshi' && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-0 border-l-2 border-[#E5D2A0] rounded-xl pointer-events-none"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <div className="flex items-center gap-2.5 relative z-10">
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black ${
                  activeSection === 'hr-shriyanshi' ? 'bg-[#E5D2A0] text-[#202124]' : 'bg-[#F0E5CC]/60 text-[#3C4043]'
                }`}>
                  S
                </div>
                <div className="text-left">
                  <div className="tracking-tight leading-tight">Shriyanshi</div>
                  <div className="text-[10px] text-[#9E8243]">HR Executive</div>
                </div>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#E5D2A0]/20 text-[#7E6532] border border-[#E5D2A0]/40 font-mono">
                Active
              </span>
            </button>
          </div>
          )}

          {/* Settings Section (Functional Application Settings) */}
          <div className="pt-1">
            <button
              onClick={() => onSelectSection('settings')}
              className={`relative w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                activeSection === 'settings'
                  ? 'bg-[#F0E5CC]/80 text-[#202124] font-semibold border-l-2 border-[#E5D2A0]'
                  : 'text-[#5F6368] hover:text-[#202124] hover:bg-[#F0E5CC]/40'
              }`}
            >
              {activeSection === 'settings' && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-0 border-l-2 border-[#E5D2A0] rounded-xl pointer-events-none"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              <div className="flex items-center gap-2.5 relative z-10">
                <Settings
                  className={`w-4 h-4 transition-colors ${
                    activeSection === 'settings'
                      ? 'text-[#9E8243]'
                      : 'text-[#70757A] group-hover:text-[#202124]'
                  }`}
                />
                <span className="tracking-tight">{t('nav_settings')}</span>
              </div>
            </button>
          </div>
        </nav>

        {/* Quick Launch Terminals (Hidden for Pantry) */}
        {!isPantry && (
          <div className="py-2.5 border-t border-[#E5D2A0]/25 space-y-1.5">
            <button
              onClick={onOpenQRPasses}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 hover:bg-[#F0E5CC]/50 border border-[#E5D2A0]/35 text-[#202124] text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              <QrCode className="w-3.5 h-3.5 text-[#9E8243]" />
              <span className="truncate">{t('btn_qr_standee')}</span>
            </button>

            <button
              onClick={onOpenBlankRegister}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F0E5CC]/60 hover:bg-[#F0E5CC]/90 border border-[#E5D2A0]/40 text-[#202124] text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate">{t('btn_blank_register')}</span>
            </button>
          </div>
        )}

        {/* Role Switcher & User Profile */}
        <div className="pt-3 border-t border-[#E5D2A0]/25 relative">
          {canSwitchViews && (
            <div className="mb-2 relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/70 hover:bg-[#F0E5CC]/50 border border-[#E5D2A0]/35 text-[11px] font-semibold text-[#202124] transition cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Shield className="w-3 h-3 text-[#9E8243] shrink-0" />
                  <span className="truncate">Role: {currentRole}</span>
                </div>
                <ChevronDown className="w-3 h-3 text-[#70757A] shrink-0" />
              </button>

              <AnimatePresence>
                {roleDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: smoothEase }}
                    className="absolute bottom-full left-0 right-0 mb-1 bg-[#FAF9F6]/95 backdrop-blur-xl rounded-2xl p-1.5 z-50 border border-[#E5D2A0]/40 shadow-2xl max-h-56 overflow-y-auto text-[#202124]"
                  >
                    <div className="text-[10px] font-bold text-[#70757A] px-2 py-1 uppercase tracking-wider">
                      {t('btn_switch_role')}
                    </div>
                    {allRoles.map((r) => (
                      <button
                        key={r.role}
                        onClick={() => {
                          onSelectRole(r.role);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition text-left cursor-pointer ${
                          currentRole === r.role
                            ? 'bg-[#F0E5CC] text-[#202124] font-bold border-l-2 border-[#E5D2A0]'
                            : 'text-[#5F6368] hover:text-[#202124] hover:bg-[#F0E5CC]/40'
                        }`}
                      >
                        <r.icon className={`w-3.5 h-3.5 ${r.color}`} />
                        <span>{r.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* User Profile Block */}
          {currentUser && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/60 border border-[#E5D2A0]/35 shadow-xs">
              <div className="min-w-0 pr-2">
                <p className="text-xs font-bold text-[#202124] truncate">{currentUser.name}</p>
                <p className="text-[10px] text-[#70757A] font-mono truncate">{currentUser.role}</p>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-[#70757A] hover:text-rose-600 hover:bg-rose-500/10 transition cursor-pointer"
                  title={t('btn_sign_out')}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
