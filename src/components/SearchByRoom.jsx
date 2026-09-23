import React, { useMemo } from 'react';
import { CalendarDays, Building, CheckCircle2, XCircle, User, BookOpen, Layers, Clock, Sparkles } from 'lucide-react';
import { buildRoomWeeklyMatrix } from '../utils/dataHelpers';
import EmptyState from './EmptyState';

export default function SearchByRoom({
  roomNumbers,
  selectedRoom,
  setSelectedRoom,
  normalizedData,
  days,
  timeSlots,
  roomDetailsMap
}) {
  const roomDetails = useMemo(() => {
    return roomDetailsMap[selectedRoom] || {
      roomNumber: selectedRoom,
      block: 'ABES EC Academic Block',
      type: selectedRoom?.toLowerCase().includes('lab') ? 'Lab' : 'Classroom',
      floor: 'Main Floor'
    };
  }, [selectedRoom, roomDetailsMap]);

  const { scheduleMatrix, occupiedCount, vacantSlotsCount, totalSlots, occupancyRate } = useMemo(() => {
    return buildRoomWeeklyMatrix(normalizedData, selectedRoom, days, timeSlots);
  }, [normalizedData, selectedRoom, days, timeSlots]);

  if (!selectedRoom || !roomNumbers.includes(selectedRoom)) {
    return (
      <EmptyState
        title="Invalid or Missing Room Number"
        message="Please select a valid room number from the dropdown or search bar above."
      />
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Control Header & Room Info */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#a51c30] flex items-center space-x-2">
              <CalendarDays className="w-5 h-5 text-[#a51c30]" />
              <span>Room Schedule & Weekly Timetable</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Select any classroom or lab to view its full weekly occupancy matrix (Day × Period Slot).
            </p>
          </div>

          {/* Room Selector Dropdown */}
          <div className="w-full md:w-72">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Room Number
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-extrabold focus:outline-none focus:border-[#a51c30] focus:ring-2 focus:ring-red-100"
            >
              {roomNumbers.map((room) => (
                <option key={room} value={room}>
                  Room {room}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Room Stats Badge Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-bold">Location</span>
              <p className="text-sm font-extrabold text-slate-900 truncate">{roomDetails.block}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-bold">Vacant Slots</span>
              <p className="text-sm font-extrabold text-emerald-700">{vacantSlotsCount} of {totalSlots} Hours</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-red-100 text-red-700">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-bold">Occupied Hours</span>
              <p className="text-sm font-extrabold text-red-700">{occupiedCount} Hours Busy</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-bold">Occupancy Rate</span>
              <p className="text-sm font-extrabold text-[#a51c30]">{occupancyRate}% Utilized</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Matrix Table */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
            <span>Weekly Schedule Matrix — Room {selectedRoom}</span>
          </h3>

          <div className="flex items-center space-x-4 text-xs font-bold">
            <span className="flex items-center space-x-1.5 text-emerald-700">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              <span>VACANT</span>
            </span>
            <span className="flex items-center space-x-1.5 text-red-700">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
              <span>OCCUPIED</span>
            </span>
          </div>
        </div>

        {/* Scrollable Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100">
                <th className="py-3 px-4 text-xs font-bold text-slate-700 uppercase tracking-wider sticky left-0 z-10 bg-slate-100 w-32 border-r border-slate-200">
                  Day / Time
                </th>
                {timeSlots.map((slot) => (
                  <th key={slot} className="py-3 px-3 text-xs font-bold text-slate-700 uppercase tracking-wider text-center min-w-[130px]">
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
                    const isOccupied = !!entry;

                    return (
                      <td key={slot} className="p-2 text-center align-top">
                        {isOccupied ? (
                          <div className="h-full p-2.5 rounded-xl bg-red-50 border border-red-200 text-left space-y-1 shadow-sm hover:border-red-400 transition-all">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold text-red-700 uppercase tracking-wider bg-red-100 px-1.5 py-0.5 rounded">
                                OCCUPIED
                              </span>
                            </div>

                            <p className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                              {entry.subjectName}
                            </p>

                            <p className="text-[11px] text-slate-600 flex items-center space-x-1 truncate pt-0.5">
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{entry.facultyName}</span>
                            </p>

                            {entry.section && (
                              <p className="text-[10px] font-extrabold text-[#a51c30] flex items-center space-x-1">
                                <Layers className="w-3 h-3 text-[#a51c30] shrink-0" />
                                <span>{entry.section}</span>
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="h-full min-h-[85px] p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 hover:bg-emerald-100/60 transition-all flex flex-col items-center justify-center space-y-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span className="text-[11px] font-extrabold text-emerald-800">VACANT</span>
                            <span className="text-[10px] text-emerald-600 font-semibold">Free Hour</span>
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
