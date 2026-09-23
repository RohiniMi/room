import React, { useState } from 'react';
import { X, Database, FileSpreadsheet, CheckCircle2, RotateCcw, Upload, Building, Clock, Layers, Download, Sparkles } from 'lucide-react';
import { parseExcelOrCsvWorkbook, downloadMasterExcelTemplate, downloadRoomsExcelTemplate, downloadTimetableExcelTemplate } from '../utils/dataHelpers';

export default function DataManagerModal({
  isOpen,
  onClose,
  roomsList,
  timingsList,
  timetableList,
  onUpdateRoomsList,
  onUpdateTimingsList,
  onUpdateTimetableList,
  onResetAllData
}) {
  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' | 'timings' | 'timetable'
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setSuccessMsg(null);

    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const json = JSON.parse(text);
        if (!Array.isArray(json)) throw new Error('JSON file must contain an array of objects.');

        if (type === 'rooms') {
          onUpdateRoomsList(json);
          setSuccessMsg(`Successfully updated ${json.length} room inventory records!`);
        } else if (type === 'timings') {
          onUpdateTimingsList(json);
          setSuccessMsg(`Successfully updated ${json.length} period timing slots!`);
        } else if (type === 'timetable') {
          onUpdateTimetableList(json);
          setSuccessMsg(`Successfully updated ${json.length} section timetable entries!`);
        }
      } else {
        const result = await parseExcelOrCsvWorkbook(file);

        if (type === 'rooms' && result.rooms) {
          onUpdateRoomsList(result.rooms);
          setSuccessMsg(`Uploaded ${result.rooms.length} rooms from Excel!`);
        } else if (type === 'timings' && result.timings) {
          onUpdateTimingsList(result.timings);
          setSuccessMsg(`Uploaded ${result.timings.length} period timings from Excel!`);
        } else if (type === 'timetable' && result.timetable) {
          onUpdateTimetableList(result.timetable);
          setSuccessMsg(`Uploaded ${result.timetable.length} timetable entries from Excel!`);
        } else if (result.rawRows && result.rawRows.length > 0) {
          if (type === 'rooms') onUpdateRoomsList(result.rawRows);
          else if (type === 'timings') onUpdateTimingsList(result.rawRows);
          else if (type === 'timetable') onUpdateTimetableList(result.rawRows);
          setSuccessMsg(`Uploaded ${result.rawRows.length} rows from Excel!`);
        } else {
          throw new Error('Could not parse valid data from uploaded Excel file.');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to process file.');
    }
  };

  const handleExportJSON = (data, filename) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-4xl rounded-2xl p-6 border border-slate-700 shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Data & Timetable Manager</h3>
              <p className="text-xs text-slate-400">Download formatted Excel templates or upload custom datasets</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Download Predefined Excel Template Banner */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/80 to-slate-900 border border-blue-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-white block">Download Predefined Excel Template</span>
              <span className="text-slate-300">Pre-formatted columns for Rooms, Timings, and Section Timetables</span>
            </div>
          </div>

          <button
            onClick={downloadMasterExcelTemplate}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs rounded-lg shadow-md flex items-center space-x-1.5 shrink-0 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-950" />
            <span>Download Master Template (.xlsx)</span>
          </button>
        </div>

        {/* Dataset Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'rooms'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Rooms Inventory ({roomsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('timings')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'timings'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Period Timings ({timingsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('timetable')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'timetable'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Section Timetable ({timetableList.length})</span>
          </button>
        </div>

        {/* Status Alerts */}
        {successMsg && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-950/70 border border-red-800 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Tab Contents & Table Preview */}
        <div className="flex-1 overflow-y-auto my-4 border border-slate-800 rounded-xl bg-slate-950/50 p-4">
          {activeTab === 'rooms' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white">Master Rooms List (`rooms_list.json`)</h4>
                  <p className="text-xs text-slate-400">Columns: Room Number, Room Name, Block, Floor, Type, Capacity</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={downloadRoomsExcelTemplate}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-lg flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Template</span>
                  </button>
                  <label className="cursor-pointer px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Rooms Excel</span>
                    <input
                      type="file"
                      accept=".json, .xlsx, .xls, .csv"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'rooms')}
                    />
                  </label>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="p-2">Room No</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Block</th>
                      <th className="p-2">Floor</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">Capacity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {roomsList.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-900/60">
                        <td className="p-2 font-bold text-white">{r.roomNumber}</td>
                        <td className="p-2 text-slate-300">{r.roomName}</td>
                        <td className="p-2 text-slate-400">{r.block}</td>
                        <td className="p-2 text-slate-400">{r.floor}</td>
                        <td className="p-2 text-amber-400">{r.type}</td>
                        <td className="p-2 text-slate-300">{r.capacity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'timings' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white">College Period Timings (`timings.json`)</h4>
                  <p className="text-xs text-slate-400">Columns: Period ID, Time Slot, Period Description</p>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="cursor-pointer px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Timings Excel</span>
                    <input
                      type="file"
                      accept=".json, .xlsx, .xls, .csv"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'timings')}
                    />
                  </label>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="p-2">Period ID</th>
                      <th className="p-2">Time Slot</th>
                      <th className="p-2">Period Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {timingsList.map((t, i) => (
                      <tr key={i} className="hover:bg-slate-900/60">
                        <td className="p-2 font-bold text-white">#{t.id}</td>
                        <td className="p-2 text-amber-400 font-semibold">{t.slot}</td>
                        <td className="p-2 text-slate-300">{t.label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'timetable' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white">Section Timetable Records (`timetable.json`)</h4>
                  <p className="text-xs text-slate-400">Columns: Section / Branch, Day of Week, Time Slot, Assigned Room, Subject Name, Faculty Name</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={downloadTimetableExcelTemplate}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-lg flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Template</span>
                  </button>
                  <label className="cursor-pointer px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Timetable Excel</span>
                    <input
                      type="file"
                      accept=".json, .xlsx, .xls, .csv"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'timetable')}
                    />
                  </label>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="p-2">Section</th>
                      <th className="p-2">Day</th>
                      <th className="p-2">Time Slot</th>
                      <th className="p-2">Room</th>
                      <th className="p-2">Subject</th>
                      <th className="p-2">Faculty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {timetableList.map((s, i) => (
                      <tr key={i} className="hover:bg-slate-900/60">
                        <td className="p-2 font-bold text-amber-400">{s.section}</td>
                        <td className="p-2 text-white">{s.day}</td>
                        <td className="p-2 text-slate-300">{s.timeSlot}</td>
                        <td className="p-2 font-bold text-blue-400">{s.roomNumber}</td>
                        <td className="p-2 text-slate-200">{s.subjectName}</td>
                        <td className="p-2 text-slate-400">{s.facultyName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs">
          <button
            onClick={onResetAllData}
            className="flex items-center space-x-1.5 text-amber-400 hover:text-amber-300 font-semibold"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restore Institutional Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
