import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wifi, WifiOff, RefreshCw, UserCheck, Cpu, Plus, ListFilter } from 'lucide-react';
import { SupervisorProfile } from '../types';

interface HeaderProps {
  isOnline: boolean;
  offlineCount: number;
  onSyncOffline: () => void;
  isSyncing: boolean;
  supervisor: SupervisorProfile;
  onOpenLogin: () => void;
  onOpenSapModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  offlineCount,
  onSyncOffline,
  isSyncing,
  supervisor,
  onOpenLogin,
  onOpenSapModal,
}) => {
  const location = useLocation();
  const isCreateRoute = location.pathname === '/new';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Corporate Branding Bar */}
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Arvind Official Wordmark & App Identity */}
        <Link to="/" className="flex items-center space-x-3 group">
          {/* Arvind Heritage Crimson Monogram Icon */}
          <div className="w-9 h-9 rounded-lg bg-arvind-700 flex items-center justify-center text-white font-extrabold text-lg tracking-wider shadow-sm group-hover:bg-arvind-800 transition-colors">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-arvind-700 transition-colors">
                Arvind
              </span>
              <span className="text-slate-300 font-light">|</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-arvind-700">
                Quality Tracker
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium tracking-tight">
              Fabric Manufacturing · Naroda & Santej Plants
            </p>
          </div>
        </Link>

        {/* Header Right Actions */}
        <div className="flex items-center space-x-2">
          {/* Desktop Navigation Links */}
          <nav className="hidden sm:flex items-center space-x-1 mr-2">
            <Link
              to="/"
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                !isCreateRoute
                  ? 'bg-arvind-50 text-arvind-700 font-bold border border-arvind-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Inspections</span>
            </Link>
            <Link
              to="/new"
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                isCreateRoute
                  ? 'bg-arvind-700 text-white font-bold shadow-xs'
                  : 'text-arvind-700 hover:bg-arvind-50'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Defect</span>
            </Link>
          </nav>

          {/* SAP Integration Tester Trigger */}
          <button
            onClick={onOpenSapModal}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            title="Simulate SAP QM Webhook"
          >
            <Cpu className="w-3.5 h-3.5 text-arvind-700" />
            <span className="hidden xs:inline">SAP Webhook</span>
          </button>

          {/* Supervisor Switcher */}
          <button
            onClick={onOpenLogin}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
            title="Active Supervisor"
          >
            <UserCheck className="w-3.5 h-3.5 text-arvind-700" />
            <span className="truncate max-w-[90px] text-xs font-semibold text-slate-800">
              {supervisor.name.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>

      {/* Network & Offline Status Banner */}
      {(!isOnline || offlineCount > 0) && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-semibold flex items-center justify-between transition-all border-t border-amber-600/30">
          <div className="flex items-center space-x-2">
            {!isOnline ? (
              <>
                <WifiOff className="w-4 h-4 text-amber-950 animate-pulse" />
                <span>Offline Mode (Inspections saved locally)</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 text-emerald-950" />
                <span>Online · {offlineCount} pending local defect{offlineCount > 1 ? 's' : ''}</span>
              </>
            )}
          </div>
          {offlineCount > 0 && (
            <button
              onClick={onSyncOffline}
              disabled={!isOnline || isSyncing}
              className="ml-2 px-3 py-1 rounded-md bg-amber-950 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-black disabled:opacity-50 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : `Sync Now (${offlineCount})`}</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
