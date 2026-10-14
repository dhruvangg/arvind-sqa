import React, { useState } from 'react';
import {
  DefectType,
  Severity,
  InspectionCreatePayload,
  SupervisorProfile,
} from '../types';
import { PlusCircle, Calendar, Hash, AlertOctagon, FileText, Send, Check } from 'lucide-react';

interface InspectionFormProps {
  onSubmit: (payload: InspectionCreatePayload) => Promise<boolean>;
  supervisor: SupervisorProfile;
  isSubmitting: boolean;
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
    color: 'border-rose-300 text-rose-700 bg-rose-50/50 hover:bg-rose-100/50',
    activeColor: 'bg-rose-600 text-white border-rose-600 shadow-sm',
  },
  {
    label: 'Major',
    color: 'border-amber-300 text-amber-800 bg-amber-50/50 hover:bg-amber-100/50',
    activeColor: 'bg-amber-600 text-white border-amber-600 shadow-sm',
  },
  {
    label: 'Minor',
    color: 'border-sky-300 text-sky-800 bg-sky-50/50 hover:bg-sky-100/50',
    activeColor: 'bg-sky-600 text-white border-sky-600 shadow-sm',
  },
];

const QUICK_MACHINE_SUGGESTIONS = [
  'Loom #14',
  'Loom #07',
  'Dyeing Jet #03',
  'Finishing Stenter-02',
  'Spinning Frame #08',
];

export const InspectionForm: React.FC<InspectionFormProps> = ({
  onSubmit,
  supervisor,
  isSubmitting,
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
      setErrorMsg('Please specify a Machine / Line ID.');
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
      setTimeout(() => setSuccessNotice(false), 3000);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-50 text-arvind-600 rounded-lg">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Log Quality Defect</h3>
            <p className="text-[11px] text-slate-500">Record on-the-spot shop-floor findings</p>
          </div>
        </div>
        <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          Shift: {supervisor.plant.includes('Naroda') ? 'Naroda' : 'Santej'}
        </span>
      </div>

      {successNotice && (
        <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Inspection logged successfully!</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Date & Line ID Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Date Picker */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Inspection Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-arvind-500 focus:outline-none bg-slate-50/50"
              />
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Machine / Line ID */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Machine / Line ID <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Loom #14, Stenter-02"
                value={lineId}
                onChange={(e) => setLineId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-arvind-500 focus:outline-none placeholder-slate-400"
              />
              <Hash className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>

            {/* Quick Suggestions Chips */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {QUICK_MACHINE_SUGGESTIONS.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setLineId(item)}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded transition-colors"
                >
                  +{item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Defect Type Dropdown */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Defect Classification <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              value={defectType}
              onChange={(e) => setDefectType(e.target.value as DefectType)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-arvind-500 focus:outline-none bg-white text-slate-800"
            >
              {DEFECT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Severity Selection Chips */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Severity Level <span className="text-rose-500">*</span></span>
            <span className="text-[10px] font-normal text-slate-400 lowercase">
              tap to select
            </span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SEVERITIES.map((sev) => {
              const isSelected = severity === sev.label;
              return (
                <button
                  type="button"
                  key={sev.label}
                  onClick={() => setSeverity(sev.label)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center flex items-center justify-center gap-1 ${
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

        {/* Remarks (Optional) */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Remarks <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </label>
          <div className="relative">
            <textarea
              rows={2}
              placeholder="Describe warp tension, meters affected, batch number, or root cause..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-arvind-500 focus:outline-none placeholder-slate-400 text-slate-800 resize-none"
            />
            <FileText className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-xl bg-arvind-700 hover:bg-arvind-800 active:scale-[0.99] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 touch-target"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Log Defect Inspection</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
