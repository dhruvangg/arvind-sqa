import React, { useState } from 'react';
import { SupervisorProfile } from '../types';
import { loginSupervisor } from '../services/api';
import { UserCheck, X, ShieldCheck } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSupervisor: SupervisorProfile;
  onSelectSupervisor: (profile: SupervisorProfile) => void;
}

const PRESET_SUPERVISORS = [
  {
    key: 'ramesh',
    name: 'Ramesh Patel',
    role: 'Weaving Shift Supervisor',
    plant: 'Naroda Weaving Unit',
  },
  {
    key: 'pooja',
    name: 'Pooja Shah',
    role: 'Plant Quality Lead',
    plant: 'Santej Processing Plant',
  },
  {
    key: 'guest',
    name: 'Shop-floor Supervisor',
    role: 'General Shift Supervisor',
    plant: 'Arvind Fabric Plants',
  },
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentSupervisor,
  onSelectSupervisor,
}) => {
  const [customName, setCustomName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectPreset = async (key: string) => {
    setIsLoading(true);
    try {
      const profile = await loginSupervisor(key);
      onSelectSupervisor(profile);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    setIsLoading(true);
    try {
      const profile = await loginSupervisor(customName.trim());
      onSelectSupervisor(profile);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fadeIn">
      <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 text-arvind-700 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Supervisor Profile</h3>
              <p className="text-[11px] text-slate-500">Sign in for shop-floor attribution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-3 space-y-2">
          <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Select Active Supervisor:
          </span>
          <div className="space-y-2">
            {PRESET_SUPERVISORS.map((sup) => {
              const isActive = currentSupervisor.name === sup.name;
              return (
                <button
                  key={sup.key}
                  disabled={isLoading}
                  onClick={() => handleSelectPreset(sup.key)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isActive
                      ? 'border-arvind-600 bg-blue-50/50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-slate-800">{sup.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {sup.role} · {sup.plant}
                    </div>
                  </div>
                  {isActive && (
                    <ShieldCheck className="w-4 h-4 text-arvind-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <form onSubmit={handleCustomSubmit} className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase">
                Or enter your name:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Anand Joshi"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-arvind-500"
                />
                <button
                  type="submit"
                  disabled={isLoading || !customName.trim()}
                  className="px-3 py-1.5 rounded-xl bg-arvind-700 text-white text-xs font-bold disabled:opacity-50"
                >
                  Set
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
