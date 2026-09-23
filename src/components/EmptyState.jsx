import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function EmptyState({ title, message, onReset }) {
  return (
    <div className="glass-panel rounded-2xl p-8 sm:p-12 text-center border border-slate-800 space-y-4 my-4">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/20">
        <AlertCircle className="w-7 h-7" />
      </div>

      <div className="max-w-md mx-auto space-y-1">
        <h3 className="text-base sm:text-lg font-bold text-white">{title || 'No Records Found'}</h3>
        <p className="text-xs sm:text-sm text-slate-400">
          {message || 'No matching room schedule data found for your selected filters.'}
        </p>
      </div>

      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );
}
