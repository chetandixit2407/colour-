import React, { useState } from 'react';
import {
  Camera,
  X,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Clock,
  Calendar,
} from 'lucide-react';
import type { Candidate } from '../types/index.ts';
import { CameraCapture } from './CameraCapture.tsx';
import { authenticatedFetch } from '../utils/apiClient.ts';

interface ReceptionPhotoModalProps {
  candidate: Candidate;
  receptionistId: string;
  receptionistName: string;
  onClose: () => void;
  onSuccess: (updatedCandidate: Candidate) => void;
}

export const ReceptionPhotoModal: React.FC<ReceptionPhotoModalProps> = ({
  candidate,
  receptionistId,
  receptionistName,
  onClose,
  onSuccess,
}) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleCaptureConfirmed = async (photoDataUrl: string, _source?: any, capturedAtIso?: string) => {
    setUploading(true);
    setUploadError(null);

    const actualCaptureTimestamp = capturedAtIso || new Date().toISOString();

    try {
      const res = await authenticatedFetch(`/api/candidates/${candidate.id}/reception-photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photo: photoDataUrl,
          capturedAt: actualCaptureTimestamp,
          receptionistId: receptionistId || 'usr-rec-1',
          receptionistName: receptionistName || 'Ananya Sen (Reception)',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save reception live photo to database.');
      }

      const updatedCandidate = data.candidate || {
        ...candidate,
        receptionPhotoUrl: photoDataUrl,
        receptionPhotoCapturedAt: actualCaptureTimestamp,
        photoUrl: photoDataUrl,
        livePhoto: photoDataUrl,
        livePhotoCapturedAt: actualCaptureTimestamp,
        arrivalPhoto: photoDataUrl,
        arrivalPhotoCapturedAt: actualCaptureTimestamp,
        photoUploadStatus: 'SUCCESS',
        photoUploadedAt: data.uploadedAt || new Date().toISOString(),
      };

      onSuccess(updatedCandidate);
    } catch (err: any) {
      setUploadError(err.message || 'Photo upload failed. Please retry.');
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAF9F6]/75 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="w-full max-w-md space-y-3">
        {uploadError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{uploadError}</span>
          </div>
        )}

        {uploading ? (
          <div className="glass-panel-elevated bg-white/75 border border-white/80 rounded-3xl p-8 text-center space-y-4 shadow-[0_24px_60px_rgba(0,0,0,0.08)] text-[#111111]">
            <RefreshCw className="w-8 h-8 text-[#9E8243] animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#111111]">Saving Verified Photo to Database...</h3>
              <p className="text-xs text-[#5F6368]">Recording authoritative server timestamp & reception audit trail</p>
            </div>
          </div>
        ) : (
          <CameraCapture
            title={`Front Desk Live Photo Verification`}
            subtitle={`Candidate: ${candidate.fullName} • Position: ${candidate.position}`}
            preferredFacingMode="user"
            onCapture={handleCaptureConfirmed}
            onCancel={onClose}
          />
        )}
      </div>
    </div>
  );
};
