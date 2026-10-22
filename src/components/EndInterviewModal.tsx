import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  UserCheck,
  RefreshCw,
  Sparkles,
  Award,
  DoorOpen,
} from 'lucide-react';
import type { User, InterviewOutcome, Room } from '../types/index.ts';

interface EndInterviewModalProps {
  interviewId: string;
  candidateName: string;
  interviewerName: string;
  currentRound: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const EndInterviewModal: React.FC<EndInterviewModalProps> = ({
  interviewId,
  candidateName,
  interviewerName,
  currentRound,
  onClose,
  onSuccess,
}) => {
  const [outcome, setOutcome] = useState<InterviewOutcome>('NEXT_INTERVIEW');
  const [notes, setNotes] = useState<string>('Strong commercial acumen, domain knowledge of luxury residential market.');
  const [nextInterviewerId, setNextInterviewerId] = useState<string>('usr-int-2');
  const [nextRoundName, setNextRoundName] = useState<string>('Round 2 - HR & Culture Fit');
  const [nextRoomId, setNextRoomId] = useState<string>('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bootRes, roomsRes] = await Promise.all([
        fetch('/api/bootstrap'),
        fetch('/api/rooms'),
      ]);
      const data = await bootRes.json();
      if (data.success) {
        // Find other interviewers & HR & CO_FOUNDER (Kimmi Mam)
        const potential = data.users.filter(
          (u: User) => u.role === 'INTERVIEWER' || u.role === 'HR' || u.role === 'CEO' || u.role === 'CO_FOUNDER'
        );
        // Ensure Kimmi Mam has Senior HR Interview label
        potential.forEach((u: User) => {
          if (u.id === 'usr-cofounder-kimmi' || u.name.includes('Kimmi')) {
            u.name = 'Kimmi Mam – Senior HR Interview';
          }
        });
        setStaffUsers(potential);
      }

      const roomsData = await roomsRes.json();
      if (roomsData.success && Array.isArray(roomsData.rooms)) {
        setRooms(roomsData.rooms);
      }
    } catch (err) {
      console.error('Failed to load data for Next Round setup', err);
    }
  };

  const handleInterviewerChange = (userId: string) => {
    setNextInterviewerId(userId);
    const user = staffUsers.find((u) => u.id === userId);
    if (userId === 'usr-cofounder-kimmi' || user?.name?.includes('Kimmi')) {
      setNextRoundName('Senior HR Interview');
      setNextRoomId('room-kimmi-cabin'); // Elegance Suite
    } else if (userId === 'usr-ceo-lalit' || user?.name?.includes('Lalit')) {
      setNextRoundName('CEO Leadership Round');
      setNextRoomId('room-lalit-cabin'); // Lalit Sir Cabin
    }
  };

  const handleEnd = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/interviews/${interviewId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewerName,
          outcome,
          notes,
          nextInterviewerId: outcome === 'NEXT_INTERVIEW' ? nextInterviewerId : undefined,
          nextRoundName: outcome === 'NEXT_INTERVIEW' ? nextRoundName : undefined,
          nextRoomId: outcome === 'NEXT_INTERVIEW' && nextRoomId ? nextRoomId : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete interview');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Action failed');
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
              Interviewer Evaluation & Outcome
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#111111] mt-0.5 truncate">Conclude Interview Round</h2>
            <p className="text-xs text-[#3C4043] mt-0.5 truncate">
              Candidate: <strong className="text-[#111111]">{candidateName}</strong> • {currentRound}
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
        <div className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300">
              {error}
            </div>
          )}

          {/* Outcome Choice */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-[#111111]">
              Select Human Business Decision: <span className="text-[#9E8243]">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOutcome('NEXT_INTERVIEW')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                  outcome === 'NEXT_INTERVIEW'
                    ? 'bg-[#FAF6ED] border-[#E5D2A0] text-[#111111] shadow-md ring-1 ring-[#E5D2A0]'
                    : 'bg-white/70 border-white/80 text-[#111111] hover:bg-white'
                }`}
              >
                <ArrowRight className="w-4 h-4 text-[#9E8243] shrink-0" />
                <div>
                  <strong className="block font-bold">Advance to Next Round</strong>
                  <span className="text-[10px] text-[#5F6368]">Choose next interviewer</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOutcome('SELECTED')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                  outcome === 'SELECTED'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-md ring-1 ring-emerald-400'
                    : 'bg-white/70 border-white/80 text-[#111111] hover:bg-white'
                }`}
              >
                <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <strong className="block font-bold">Selected / Offer</strong>
                  <span className="text-[10px] text-[#5F6368]">Final hiring recommendation</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOutcome('HOLD')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                  outcome === 'HOLD'
                    ? 'bg-sky-50 border-sky-400 text-sky-900 shadow-md ring-1 ring-sky-400'
                    : 'bg-white/70 border-white/80 text-[#111111] hover:bg-white'
                }`}
              >
                <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <strong className="block font-bold">Keep on Hold</strong>
                  <span className="text-[10px] text-[#5F6368]">Awaiting candidate pool</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOutcome('REJECTED')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                  outcome === 'REJECTED'
                    ? 'bg-rose-50 border-rose-400 text-rose-900 shadow-md ring-1 ring-rose-400'
                    : 'bg-white/70 border-white/80 text-[#111111] hover:bg-white'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <div>
                  <strong className="block font-bold">Reject / Exit</strong>
                  <span className="text-[10px] text-[#5F6368]">Route to checkout</span>
                </div>
              </button>
            </div>
          </div>

          {/* Conditional Next Round details */}
          {outcome === 'NEXT_INTERVIEW' && (
            <div className="p-3.5 bg-white/70 border border-[#E5D2A0]/50 rounded-2xl space-y-3 animate-in fade-in duration-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9E8243] block font-mono">
                Next Evaluation Setup
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                    Assign Next Interviewer:
                  </label>
                  <select
                    value={nextInterviewerId}
                    onChange={(e) => handleInterviewerChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E5D2A0]/60 rounded-xl text-[#111111] text-xs focus:outline-hidden focus:border-[#E5D2A0] shadow-xs"
                  >
                    {staffUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role} - {u.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#111111] mb-1">
                    Next Round Title:
                  </label>
                  <input
                    type="text"
                    value={nextRoundName}
                    onChange={(e) => setNextRoundName(e.target.value)}
                    placeholder="e.g. Round 2 - Leadership"
                    className="w-full px-3 py-2 bg-white border border-[#E5D2A0]/60 rounded-xl text-[#111111] text-xs focus:outline-hidden focus:border-[#E5D2A0] shadow-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-[#111111]">
                      Next Round Room (Optional / Direct Allocation):
                    </label>
                    <span className="text-[10px] text-[#9E8243] font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#9E8243]" />
                      Next Round Reserved Cabins Available
                    </span>
                  </div>
                  <select
                    value={nextRoomId}
                    onChange={(e) => setNextRoomId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E5D2A0]/60 rounded-xl text-[#111111] text-xs focus:outline-hidden focus:border-[#E5D2A0] shadow-xs"
                  >
                    <option value="">— Assign later from Lobby (Default) —</option>
                    <optgroup label="👑 Reserved Senior Leadership Cabins">
                      {rooms
                        .filter(
                          (r) =>
                            r.id === 'room-kimmi-cabin' ||
                            r.id === 'room-lalit-cabin' ||
                            r.name === 'Elegance Suite' ||
                            r.name === 'Lalit Sir Cabin' ||
                            r.isReservedNextRound
                        )
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            ★ {r.name} ({r.status === 'AVAILABLE' ? 'Available' : r.status}) — {r.preferredFor || 'Senior Round'}
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="🏢 Standard Operational Rooms">
                      {rooms
                        .filter(
                          (r) =>
                            r.id !== 'room-kimmi-cabin' &&
                            r.id !== 'room-lalit-cabin' &&
                            r.name !== 'Elegance Suite' &&
                            r.name !== 'Lalit Sir Cabin' &&
                            !r.isReservedNextRound
                        )
                        .map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({r.status === 'AVAILABLE' ? 'Available' : r.status})
                          </option>
                        ))}
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Evaluation Notes */}
          <div>
            <label className="block font-semibold text-[#111111] mb-1">
              Interviewer Evaluation Notes & Private HR Feedback:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Candidate strengths, communication, culture fit, compensation remarks..."
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5D2A0]/60 rounded-xl text-[#111111] text-xs focus:outline-hidden focus:border-[#E5D2A0] shadow-xs"
            />
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
            onClick={handleEnd}
            disabled={submitting}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-white via-[#FAF6ED] to-[#E5D2A0] hover:to-[#D8BF85] text-[#111111] text-xs font-bold border border-[#E5D2A0] shadow-md transition cursor-pointer flex items-center gap-1.5"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Submitting Decision...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Finalize Decision & Conclude
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
