import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { smoothEase, staggerContainer, staggerItem } from '../utils/motion.ts';
import {
  Users,
  UserCheck,
  DoorOpen,
  Coffee,
  Calendar,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import type { Candidate, Interview, Room, PantryTask, Visitor } from '../types/index.ts';
import { useSettings } from '../context/SettingsContext.tsx';

interface OperationsCommandHeaderProps {
  candidates: Candidate[];
  interviews?: Interview[];
  rooms: Room[];
  pantryTasks?: PantryTask[];
  visitors?: Visitor[];
  userName?: string;
  userRole?: string;
  onSelectKpi?: (kpiId: string) => void;
}

// Smooth counting number component interpolating from previous value
const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const fromVal = prevValueRef.current;
    const toVal = value;
    prevValueRef.current = value;

    if (fromVal === toVal) {
      setDisplayValue(toVal);
      return;
    }

    const duration = 280; // Fast and fluid
    const stepTime = 20;
    const steps = Math.max(1, Math.ceil(duration / stepTime));
    const delta = (toVal - fromVal) / steps;
    let currentStep = 0;
    let currentVal = fromVal;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(toVal);
        clearInterval(timer);
      } else {
        currentVal += delta;
        setDisplayValue(Math.round(currentVal));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span className="tabular-nums font-mono">{displayValue}</span>;
};

export const OperationsCommandHeader: React.FC<OperationsCommandHeaderProps> = ({
  candidates,
  interviews = [],
  rooms,
  pantryTasks = [],
  visitors = [],
  userName = 'Officer',
  userRole = 'Operations',
  onSelectKpi,
}) => {
  const { t, formatTime } = useSettings();
  const [greeting, setGreeting] = useState<'Good Morning' | 'Good Afternoon' | 'Good Evening'>('Good Morning');
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      if (hours < 12) setGreeting('Good Morning');
      else if (hours < 17) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');

      setTimeString(formatTime(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [formatTime]);

  // Compute metrics from actual data
  const waitingCandidates = candidates.filter(
    (c) => c.status === 'ARRIVED' || c.status === 'WAITING' || c.status === 'With Kimmi Mam – Senior HR Interview'
  ).length;

  const inInterviewCandidates = candidates.filter((c) => c.status === 'IN_INTERVIEW').length;

  const operationalRooms = rooms.filter(
    (r) =>
      r.id !== 'room-lalit-cabin' &&
      r.id !== 'room-kimmi-cabin' &&
      r.name !== 'Lalit Sir Cabin' &&
      r.name !== 'Elegance Suite' &&
      !r.isReservedNextRound
  );
  const availableRoomsCount = operationalRooms.filter((r) => r.status === 'AVAILABLE').length;

  const pendingPantryCount = pantryTasks.filter(
    (t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS'
  ).length;

  const activeVisitorsCount = visitors.filter((v) => v.status !== 'CHECKED_OUT').length;

  const kpis = [
    {
      id: 'lobby',
      label: 'Waiting in Lobby',
      value: waitingCandidates,
      sublabel: 'Candidates awaiting escort',
      icon: Users,
      glow: 'from-amber-500/15 via-transparent to-transparent',
      accentColor: 'text-amber-400',
      dotColor: 'bg-amber-400',
    },
    {
      id: 'interviews',
      label: 'Interviews Today',
      value: interviews.length > 0 ? interviews.length : inInterviewCandidates,
      sublabel: 'Active candidate rounds',
      icon: UserCheck,
      glow: 'from-blue-500/15 via-transparent to-transparent',
      accentColor: 'text-blue-400',
      dotColor: 'bg-blue-400',
    },
    {
      id: 'rooms',
      label: 'Available Rooms',
      value: availableRoomsCount,
      sublabel: `Out of ${operationalRooms.length} operational`,
      icon: DoorOpen,
      glow: 'from-emerald-500/15 via-transparent to-transparent',
      accentColor: 'text-emerald-400',
      dotColor: 'bg-emerald-400',
    },
    {
      id: 'pantry',
      label: 'Hospitality Tasks',
      value: pendingPantryCount,
      sublabel: 'Beverages & room prep',
      icon: Coffee,
      glow: 'from-purple-500/15 via-transparent to-transparent',
      accentColor: 'text-purple-400',
      dotColor: 'bg-purple-400',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Editorial Heading Lockup with Soft Entrance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36, ease: smoothEase }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-1"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D8BF85] animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#111111]/70 font-mono">
              Live Operations Deck
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
            {greeting === 'Good Morning' ? t('greet_morning') : greeting === 'Good Afternoon' ? t('greet_afternoon') : t('greet_evening')}, <span className="text-[#111111]">{userName.split(' ')[0]}</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#111111]/75 font-medium mt-0.5">
            White Collar Realty &mdash; Office Operations
          </p>
        </div>

        {/* Live Clock */}
        <div className="flex items-center gap-3">
          <div className="bg-white/50 backdrop-blur-md text-[#111111] px-3.5 py-1.5 rounded-xl border border-[#D8BF85]/35 shadow-xs flex items-center gap-2.5">
            <Clock className="w-3.5 h-3.5 text-[#9E8243]" />
            <span className="text-xs font-mono font-medium text-[#111111] tabular-nums">
              {timeString || '--:--:--'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Staggered Animated KPI Row with 3D Elevation & Dribbble Momentum */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        {kpis.map((kpi) => {
          const Icon = kpi.icon;

          return (
            <motion.div
              key={kpi.id}
              variants={staggerItem}
              role="button"
              tabIndex={0}
              onClick={() => onSelectKpi && onSelectKpi(kpi.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (onSelectKpi) onSelectKpi(kpi.id);
                }
              }}
              className="card-dark relative group rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xs overflow-hidden cursor-pointer select-none min-w-0"
              title={`Click to view ${kpi.label} details`}
            >
              {/* Subtle Ambient Hover Glow */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${kpi.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-240 ease-out pointer-events-none`}
              />

              <div className="relative z-10 flex items-center justify-between text-xs">
                <span className="font-semibold tracking-tight text-[#111111]">
                  {kpi.label}
                </span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-240 ease-out group-hover:scale-110 bg-white/60 border border-[#D8BF85]/40 shadow-xs">
                  <Icon className={`w-3.5 h-3.5 ${kpi.accentColor}`} />
                </div>
              </div>

              <div className="relative z-10 mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-[#111111]">
                  <AnimatedNumber value={kpi.value} />
                </span>
                <span className={`w-2 h-2 rounded-full ${kpi.dotColor} shadow-xs`} />
              </div>

              <div className="relative z-10 flex items-center justify-between text-[11px] mt-1">
                <p className="truncate text-[#111111]/75">
                  {kpi.sublabel}
                </p>
                <span className="text-[10px] font-semibold text-[#9E8243] opacity-0 group-hover:opacity-100 transition-opacity duration-240 ease-out flex items-center gap-0.5 shrink-0 ml-1">
                  View &rarr;
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
