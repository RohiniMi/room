import React from 'react';
import { Building2, Search, Clock, Database, Sparkles, CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react';

export default function Navbar({
  roomsCount,
  timingsCount,
  timetableCount,
  isCustomData,
  isAdminMode,
  onToggleAdminMode,
  onResetData,
  onOpenDataManagerModal,
  onQuickSearch,
  quickSearchQuery,
  onUseCurrentTime
}) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#a51c30] text-white shadow-lg border-b border-red-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* ABES EC Logo Badge & College Title */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-white p-0.5 shadow-md">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Building2 className="w-7 h-7 text-[#a51c30]" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#a51c30] bg-amber-300 px-2 py-0.5 rounded shadow-sm">
                  ABES EC
                </span>
                <span className="text-xs text-amber-100 font-medium">Engineering College, Ghaziabad</span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Smart Room Allocation Finder
              </h1>
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={quickSearchQuery}
                onChange={(e) => onQuickSearch(e.target.value)}
                placeholder="Search Room (CR-301, Lab-1), Section, Faculty..."
                className="w-full bg-white text-slate-900 placeholder-slate-400 border border-red-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner"
              />
              {quickSearchQuery && (
                <button
                  onClick={() => onQuickSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Admin Portal Toggle Button */}
            <button
              onClick={onToggleAdminMode}
              className={`flex items-center space-x-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer border ${
                isAdminMode
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                  : 'bg-[#772823] hover:bg-[#8b1c2b] text-white border-red-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">{isAdminMode ? 'Exit Admin Mode' : 'Admin Portal'}</span>
              <span className="sm:hidden">{isAdminMode ? 'Exit' : 'Admin'}</span>
            </button>

            {/* Live Time Preset */}
            <button
              onClick={onUseCurrentTime}
              title="Set to Current Day & Period Slot"
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-white bg-red-900/40 hover:bg-red-900/70 border border-red-400/40 rounded-xl transition-all"
            >
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Current Slot</span>
            </button>

            {/* Data Manager Button */}
            <button
              onClick={onOpenDataManagerModal}
              title="Upload or manage JSON/Excel datasets"
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-white bg-red-950/50 hover:bg-red-900/80 border border-red-700/60 rounded-xl transition-all cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden lg:inline">Datasets</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="md:hidden pb-4 pt-1">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={quickSearchQuery}
              onChange={(e) => onQuickSearch(e.target.value)}
              placeholder="Search Room, Section, Faculty..."
              className="w-full bg-white text-slate-900 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

      </div>
    </header>
  );
}
