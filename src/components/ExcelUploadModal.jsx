import React, { useState } from 'react';
import { X, FileSpreadsheet, Upload, CheckCircle2, AlertCircle, FileText, Download, Sparkles } from 'lucide-react';
import { parseExcelOrCsvWorkbook, downloadMasterExcelTemplate, downloadRoomsExcelTemplate, downloadTimetableExcelTemplate } from '../utils/dataHelpers';

export default function ExcelUploadModal({ isOpen, onClose, onDataUploaded, isCustomData, onResetData }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successCount, setSuccessCount] = useState(null);

  if (!isOpen) return null;

  const processFile = async (selectedFile) => {
    setError(null);
    setFile(selectedFile);
    setIsUploading(true);

    try {
      const result = await parseExcelOrCsvWorkbook(selectedFile);
      
      let rowsToUse = [];
      if (result.timetable && result.timetable.length > 0) {
        rowsToUse = result.timetable;
      } else if (result.rawRows && result.rawRows.length > 0) {
        rowsToUse = result.rawRows;
      }

      if (rowsToUse.length === 0) {
        throw new Error('No timetable schedule rows were found in the uploaded Excel spreadsheet.');
      }

      setSuccessCount(rowsToUse.length);
      onDataUploaded(rowsToUse);

      setTimeout(() => {
        setIsUploading(false);
      }, 500);
    } catch (err) {
      setError(err.message || 'Error processing Excel file');
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) processFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-xl rounded-2xl p-6 border border-slate-700 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Excel Timetable Upload & Template</h3>
              <p className="text-xs text-slate-400">Download formatted Excel templates or upload your filled file</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: PREDEFINED EXCEL TEMPLATES DOWNLOAD BAR */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/80 to-slate-900 border border-blue-800/80 space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Step 1: Download Predefined Template</span>
            </div>
            <span className="text-[10px] text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded font-medium">Pre-Formatted Headers</span>
          </div>

          <p className="text-xs text-slate-300">
            Download our standard Excel template with pre-configured column headers. Fill in your room allocation details and upload below!
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={downloadMasterExcelTemplate}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Download Master Template (.xlsx)</span>
            </button>

            <button
              onClick={downloadRoomsExcelTemplate}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center space-x-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Rooms Template</span>
            </button>

            <button
              onClick={downloadTimetableExcelTemplate}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center space-x-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Section Schedule Template</span>
            </button>
          </div>
        </div>

        {/* STEP 2: UPLOAD FILLED EXCEL FILE */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider block">Step 2: Upload Filled Excel Spreadsheet</span>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-xl p-6 text-center bg-slate-900/60 hover:bg-slate-900/90 transition-all cursor-pointer group"
          >
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
              id="excel-file-input"
            />
            <label htmlFor="excel-file-input" className="cursor-pointer space-y-3 block">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>

              <div>
                <p className="text-sm font-bold text-white">
                  Click to select or drag & drop your filled Excel file
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Expected Columns: <code className="text-amber-300">Room Number</code>, <code className="text-amber-300">Day of Week</code>, <code className="text-amber-300">Time Slot</code>, <code className="text-amber-300">Section / Branch</code>, <code className="text-amber-300">Subject Name</code>, <code className="text-amber-300">Faculty Name</code>
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Upload Feedback */}
        {isUploading && (
          <div className="mt-4 p-3 rounded-xl bg-blue-950/60 border border-blue-800 text-xs text-blue-300 flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin"></div>
            <span>Parsing Excel columns & timetable rows...</span>
          </div>
        )}

        {successCount !== null && !error && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Successfully loaded <strong>{successCount} schedule entries</strong> from your Excel spreadsheet!</span>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs"
            >
              Done
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Auto-matches column names regardless of capitalization</span>
          </div>

          {isCustomData && (
            <button
              onClick={() => {
                onResetData();
                setSuccessCount(null);
                setFile(null);
              }}
              className="text-amber-400 hover:text-amber-300 underline font-semibold"
            >
              Restore Institutional Defaults
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
