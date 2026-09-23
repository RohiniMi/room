import React, { useMemo } from 'react';
import { Layers, Building, User, BookOpen, Clock, CalendarDays, CheckCircle2 } from 'lucide-react';
import { buildSectionWeeklyMatrix } from '../utils/dataHelpers';
import EmptyState from './EmptyState';

export default function SearchBySection({
  sections,
  selectedSection,
  setSelectedSection,
  timetableList,
  days,
  timeSlots,
  onSelectRoomForSchedule
}) {
  const { scheduleMatrix, scheduledCount, freeCount, totalSlots } = useMemo(() => {
    return buildSectionWeeklyMatrix(timetableList, selectedSection, days, timeSlots);
  }, [timetableList, selectedSection, days, timeSlots]);

  if (!selectedSection || !sections.includes(selectedSection)) {
    return (
      <EmptyState
        title="Invalid or Missing Section"
        message="Please select a valid section (e.g. CSE-3A, AIML-3A) from the dropdown."
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Section Selector */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#a51c30] flex items-center space-x-2">
              <Layers className="w-5 h-5 text-[#a51c30]" />
              <span>Section-Wise Class Timetable</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              View complete weekly schedule, assigned rooms, subjects, and faculty for any branch section.
            </p>
          </div>

          {/* Section Selector Dropdown */}
          <div className="w-full md:w-72">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Branch / Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-extrabold focus:outline-none focus:border-[#a51c30] focus:ring-2 focus:ring-red-100"
            >
              {sections.map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-bold">Selected Section</span>
              <p className="text-sm font-extrabold text-slate-900">{selectedSection}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-800">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-bold">Weekly Lectures</span>
              <p className="text-sm font-extrabold text-[#a51c30]">{scheduledCount} Periods Scheduled</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-bold">Free Periods</span>
              <p className="text-sm font-extrabold text-emerald-700">{freeCount} Hours Off</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Matrix Table for Section */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
            <span>Weekly Class Schedule — Section {selectedSection}</span>
          </h3>
        </div>

        {/* Scrollable Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100">
                <th className="py-3 px-4 text-xs font-bold text-slate-700 uppercase tracking-wider sticky left-0 z-10 bg-slate-100 w-32 border-r border-slate-200">
                  Day / Time
                </th>
                {timeSlots.map((slot) => (
                  <th key={slot} className="py-3 px-3 text-xs font-bold text-slate-700 uppercase tracking-wider text-center min-w-[140px]">
                    {slot}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {days.map((day) => (
                <tr key={day} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 text-sm font-extrabold text-slate-900 sticky left-0 z-10 bg-white border-r border-slate-200 shadow-sm">
                    {day}
                  </td>

                  {timeSlots.map((slot) => {
                    const entry = scheduleMatrix[day] ? scheduleMatrix[day][slot] : null;

                    return (
                      <td key={slot} className="p-2 text-center align-top">
                        {entry ? (
                          <div className="h-full p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-left space-y-1.5 hover:border-[#a51c30] transition-all shadow-sm">
                            <p className="text-xs font-extrabold text-slate-900 line-clamp-2 leading-tight">
                              {entry.subjectName}
                            </p>

                            <p className="text-[11px] text-slate-600 flex items-center space-x-1 truncate">
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{entry.facultyName}</span>
                            </p>

                            <button
                              onClick={() => onSelectRoomForSchedule(entry.roomNumber)}
                              className="text-[10px] font-extrabold text-[#a51c30] hover:text-[#8b152b] bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded flex items-center space-x-1 border border-red-200 transition-colors"
                            >
                              <Building className="w-3 h-3 shrink-0" />
                              <span>Room {entry.roomNumber}</span>
                            </button>
                          </div>
                        ) : (
                          <div className="h-full min-h-[85px] p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center space-y-1 text-slate-400">
                            <span className="text-[11px] font-bold text-slate-500">No Class</span>
                            <span className="text-[10px] text-slate-400">Free Period</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
