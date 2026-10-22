import React, { useState, useEffect } from 'react';
import {
  X,
  DoorOpen,
  CheckCircle2,
  Users,
  Zap,
  Sparkles,
  RefreshCw,
  Bell,
  Coffee,
  UserCheck,
} from 'lucide-react';
import type { Room } from '../types/index.ts';

interface AssignRoomModalProps {
  candidateId: string;
  candidateName?: string;
  interviewId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignRoomModal: React.FC<AssignRoomModalProps> = ({
  candidateId,
  candidateName = 'Candidate',
  interviewId,
  onClose,
  onSuccess,
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(true);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [roomCategory, setRoomCategory] = useState<'operational' | 'next_round'>('operational');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (data.success) {
        setRooms(data.rooms);
        // Pre-select first available operational room
        const firstAvail = data.rooms.find(
          (r: Room) =>
            r.status === 'AVAILABLE' &&
            r.id !== 'room-lalit-cabin' &&
            r.id !== 'room-kimmi-cabin' &&
            r.name !== 'Lalit Sir Cabin' &&
            r.name !== 'Elegance Suite' &&
            !r.isReservedNextRound
        ) || data.rooms.find((r: Room) => r.status === 'AVAILABLE');
        if (firstAvail) setSelectedRoomId(firstAvail.id);
      }
    } catch (err) {
      console.error('Failed to load rooms', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedRoomId) {
      setError('Please select an available room.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/rooms/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hrUserId: 'usr-hr-1',
          hrName: 'Sneha Patel (HR Lead)',
          candidateId,
          interviewId,
          roomId: selectedRoomId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to assign room');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Room assignment failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAF9F6]/75 backdrop-blur-[16px] p-2.5 sm:p-4 overflow-y-auto">
      <div className="glass-panel-elevated bg-white/60 backdrop-blur-[16px] border border-white/80 rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl text-[#111111] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#E5D2A0]/40 flex items-center justify-between bg-white/40 shrink-0">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E8243] block truncate font-mono">
              HR Human Decision Required
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#111111] mt-0.5 truncate">Assign Interview Room</h2>
            <p className="text-xs text-[#3C4043] mt-0.5 truncate">
              Candidate: <strong className="text-[#111111]">{candidateName}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#3C4043] hover:text-[#111111] hover:bg-white/80 border border-[#E5D2A0]/40 transition shrink-0 cursor-pointer shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-800 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="block text-xs font-semibold text-[#111111]">
                Select Room for Candidate Allocation:
              </label>
              <div className="flex items-center gap-1 bg-white/70 p-1 rounded-xl border border-[#E5D2A0]/50 shrink-0 shadow-xs">
                <button
                  type="button"
                  onClick={() => setRoomCategory('operational')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    roomCategory === 'operational'
                      ? 'bg-[#E5D2A0] text-[#111111] shadow-xs'
                      : 'text-[#5F6368] hover:text-[#111111]'
                  }`}
                >
                  Operational Rooms
                </button>
                <button
                  type="button"
                  onClick={() => setRoomCategory('next_round')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                    roomCategory === 'next_round'
                      ? 'bg-[#E5D2A0] text-[#111111] shadow-xs'
                      : 'text-[#9E8243] hover:text-[#111111]'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-[#9E8243]" />
                  <span>Next Round Cabins</span>
                </button>
              </div>
            </div>

            {roomCategory === 'next_round' && (
              <div className="p-2.5 bg-[#FAF6ED] border border-[#E5D2A0]/60 rounded-xl text-[11px] text-[#7E6532] flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-[#9E8243]" />
                <span>
                  <strong>Reserved for Senior & Next Round Interviews:</strong> Lalit Sir Cabin and Elegance Suite.
                </span>
              </div>
            )}

            {loadingRooms ? (
              <div className="p-8 text-center text-xs text-[#5F6368]">Loading room availability...</div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {rooms
                  .filter((room) => {
                    const isReserved =
                      room.id === 'room-lalit-cabin' ||
                      room.id === 'room-kimmi-cabin' ||
                      room.roomId === 'room-lalit-cabin' ||
                      room.roomId === 'room-kimmi-cabin' ||
                      room.name === 'Lalit Sir Cabin' ||
                      room.name === 'Elegance Suite' ||
                      room.isReservedNextRound;
                    return roomCategory === 'next_round' ? isReserved : !isReserved;
                  })
                  .map((room) => {
                  const isAvail = room.status === 'AVAILABLE';
                  const isSelected = selectedRoomId === room.id;

                  return (
                    <div
                      key={room.id}
                      onClick={() => isAvail && setSelectedRoomId(room.id)}
                      className={`p-3 sm:p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        !isAvail
                          ? 'opacity-50 bg-white/30 border-white/60 cursor-not-allowed text-[#70757A]'
                          : isSelected
                          ? 'bg-[#FAF6ED] border-[#E5D2A0] shadow-md ring-1 ring-[#E5D2A0] cursor-pointer'
                          : 'bg-white/70 border-white/80 hover:bg-white hover:border-[#E5D2A0]/60 cursor-pointer shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'bg-[#E5D2A0] text-[#111111] border-[#D8BF85]'
                              : 'bg-white text-[#70757A] border-[#E5D2A0]/40'
                          }`}
                        >
                          <DoorOpen className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs font-bold text-[#111111] truncate">{room.name}</h4>
                            {(room.id === 'room-lalit-cabin' || room.id === 'room-kimmi-cabin' || room.name === 'Elegance Suite' || room.name === 'Lalit Sir Cabin') && (
                              <span className="px-1.5 py-0.2 bg-[#FAF6ED] border border-[#E5D2A0] text-[#7E6532] rounded-sm text-[9px] font-bold shrink-0">
                                Next Round Reserved
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-[#5F6368] mt-0.5 flex-wrap">
                            <span>Type: {room.type?.replace('_', ' ') || 'Meeting Room'}</span>
                            {room.preferredFor && (
                              <span className="truncate max-w-[140px] sm:max-w-[200px]">({room.preferredFor})</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <span className="w-5 h-5 rounded-full bg-[#E5D2A0] text-[#111111] flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                        ) : isAvail ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                            Available
                          </span>
                        ) : room.status === 'CLEANING' || room.status === 'NEEDS_CLEANING' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAF6ED] text-[#7E6532] border border-[#E5D2A0]">
                            Under Cleaning
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-300">
                            {room.status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-[#E5D2A0]/40 bg-white/40 flex flex-wrap items-center justify-end gap-2.5 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/80 hover:bg-white text-[#111111] text-xs font-semibold border border-[#E5D2A0]/50 transition cursor-pointer shadow-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={submitting || !selectedRoomId}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-white via-[#FAF6ED] to-[#E5D2A0] hover:to-[#D8BF85] text-[#111111] text-xs font-bold border border-[#E5D2A0] shadow-md transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Confirm Room Assignment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
