import React, { useState } from 'react';
import {
  DefectType,
  Severity,
  InspectionCreatePayload,
  SupervisorProfile,
} from '../types';
import { Calendar, Hash, AlertOctagon, FileText, Send, Check, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface InspectionFormProps {
  onSubmit: (payload: InspectionCreatePayload) => Promise<boolean>;
  supervisor: SupervisorProfile;
  isSubmitting: boolean;
  onSuccessNavigate?: () => void;
}

const DEFECT_TYPES: DefectType[] = [
  'Weave Defect',
  'Shade Variation',
  'Hole/Tear',
  'Count Deviation',
  'Other',
];

const SEVERITIES: { label: Severity; color: string; activeColor: string }[] = [
  {
    label: 'Critical',
    color: 'border-arvind-200 text-arvind-700 bg-arvind-50/40 hover:bg-arvind-50',
    activeColor: 'bg-arvind-700 text-white border-arvind-700 shadow-xs',
  },
  {
    label: 'Major',
    color: 'border-amber-200 text-amber-800 bg-amber-50/40 hover:bg-amber-50',
    activeColor: 'bg-amber-600 text-white border-amber-600 shadow-xs',
  },
  {
    label: 'Minor',
    color: 'border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100',
    activeColor: 'bg-slate-800 text-white border-slate-800 shadow-xs',
  },
];

const QUICK_MACHINE_SUGGESTIONS = [
  'Loom #14',
  'Loom #07',
  'Dyeing Jet #03',
  'Finishing Stenter-02',
  'Spinning Ring Frame #08',
];

export const InspectionForm: React.FC<InspectionFormProps> = ({
  onSubmit,
  supervisor,
  isSubmitting,
  onSuccessNavigate,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(todayStr);
  const [lineId, setLineId] = useState<string>('');
  const [defectType, setDefectType] = useState<DefectType>('Weave Defect');
  const [severity, setSeverity] = useState<Severity>('Major');
  const [remarks, setRemarks] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!lineId.trim()) {
      setErrorMsg('Please specify a Machine or Production Line ID.');
      return;
    }

    const payload: InspectionCreatePayload = {
      date,
      line_id: lineId.trim(),
      defect_type: defectType,
      severity,
      remarks: remarks.trim() ? remarks.trim() : undefined,
      supervisor_name: supervisor.name,
    };

    const ok = await onSubmit(payload);
    if (ok) {
      setSuccessNotice(true);
      setLineId('');
      setRemarks('');
      if (onSuccessNavigate) {
        setTimeout(onSuccessNavigate, 600);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
      {/* Form Header with Breadcrumb */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <Link
            to="/"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
            title="Back to Inspection Feed"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 leading-tight">
              Log Quality Inspection Defect
            </h2>
            <p className="text-xs text-slate-500">
              Immediate shop-floor record entry for plant supervisors
            </p>
          </div>
        </div>
      </div>

      {successNotice && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Defect record registered successfully. Redirecting to feed...</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-arvind-50 border border-arvind-200 text-arvind-800 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Date & Machine Line */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Inspection Date <span className="text-arvind-700">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-arvind-700 focus:outline-none bg-slate-50/50"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Machine / Line ID <span className="text-arvind-700">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Loom #14, Stenter-02, Dyeing Jet #03"
                value={lineId}
                onChange={(e) => setLineId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-arvind-700 focus:outline-none placeholder-slate-400"
              />
              <Hash className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>

            {/* Quick machine suggestion tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_MACHINE_SUGGESTIONS.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setLineId(item)}
                  className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md transition-colors"
                >
                  +{item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Defect Classification */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Defect Classification <span className="text-arvind-700">*</span>
          </label>
          <select
            value={defectType}
            onChange={(e) => setDefectType(e.target.value as DefectType)}
            className="w-full px-3.5 py-2.5 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-arvind-700 focus:outline-none bg-white text-slate-800"
          >
            {DEFECT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Row 3: Severity Selector Chips */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Severity Level <span className="text-arvind-700">*</span></span>
            <span className="text-[10px] font-normal text-slate-400 lowercase">
              select urgency
            </span>
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {SEVERITIES.map((sev) => {
              const isSelected = severity === sev.label;
              return (
                <button
                  type="button"
                  key={sev.label}
                  onClick={() => setSeverity(sev.label)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition-all text-center flex items-center justify-center gap-1.5 ${
                    isSelected ? sev.activeColor : sev.color
                  }`}
                >
                  <AlertOctagon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : ''}`} />
                  {sev.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 4: Remarks */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Remarks & Root Cause Observation <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <div className="relative">
            <textarea
              rows={3}
              placeholder="Detail observations: e.g. Warp breakage across 20m roll, pin-plate damage, or yarn count mismatch..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-arvind-700 focus:outline-none placeholder-slate-400 text-slate-800 resize-none"
            />
            <FileText className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Supervisor Attribution */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
          <span className="text-slate-500 font-medium">
            Signing Supervisor: <strong className="text-slate-800 font-bold">{supervisor.name}</strong>
          </span>
          <span className="text-slate-400 text-[11px]">{supervisor.role}</span>
        </div>

        {/* Submit Action Button */}
        <div className="pt-2 flex items-center gap-3">
          <Link
            to="/"
            className="w-1/3 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold text-center transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-2/3 py-3 px-4 rounded-xl bg-arvind-700 hover:bg-arvind-800 active:scale-[0.99] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 touch-target"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Defect Log</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
