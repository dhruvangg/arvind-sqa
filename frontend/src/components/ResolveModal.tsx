import React, { useState } from 'react';
import { Inspection, InspectionResolvePayload, SupervisorProfile } from '../types';
import { CheckCircle2, X, AlertTriangle } from 'lucide-react';

interface ResolveModalProps {
  inspection: Inspection | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (id: number, payload: InspectionResolvePayload) => Promise<boolean>;
  supervisor: SupervisorProfile;
}

export const ResolveModal: React.FC<ResolveModalProps> = ({
  inspection,
  isOpen,
  onClose,
  onResolve,
  supervisor,
}) => {
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !inspection) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!resolutionNote.trim()) {
      setErrorMsg('Mandatory: Please provide a detailed resolution note.');
      return;
    }

    if (resolutionNote.trim().length < 5) {
      setErrorMsg('Please describe corrective action in at least 5 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await onResolve(inspection.id, {
        resolution_note: resolutionNote.trim(),
        resolved_by: supervisor.name,
      });
      if (ok) {
        setResolutionNote('');
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to mark as resolved');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fadeIn">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-slate-200 transform transition-all animate-slideUp">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Resolve Defect Record</h3>
              <p className="text-[11px] text-slate-500">ID #{inspection.id} · {inspection.line_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Defect Snapshot */}
        <div className="my-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
          <div className="flex justify-between font-bold text-slate-800 mb-1">
            <span>{inspection.defect_type}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] ${
                inspection.severity === 'Critical'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {inspection.severity}
            </span>
          </div>
          {inspection.remarks && (
            <p className="text-slate-600 italic">"{inspection.remarks}"</p>
          )}
        </div>

        {errorMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Corrective Action Taken <span className="text-rose-500">* (Mandatory)</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Replaced worn shuttle picker, tuned warp tension, or segregated 25m off-shade lot..."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder-slate-400 text-slate-800"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Sign-off: <strong>{supervisor.name}</strong></span>
            <span>Shop-floor Quality</span>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Resolution</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
