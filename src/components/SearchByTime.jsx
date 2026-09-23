import React, { useState, useMemo } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, Copy, Check, Filter, Building, Sparkles, User, BookOpen, Layers } from 'lucide-react';
import EmptyState from './EmptyState';

export default function SearchByTime({
  days,
  timeSlots,
  selectedDay,
  setSelectedDay,
  selectedTimeSlot,
  setSelectedTimeSlot,
  availabilityData,
  onSelectRoomForSchedule,
  onUseCurrentTime
}) {
  const [roomTypeFilter, setRoomTypeFilter] = useState('ALL');
  const [copiedRoom, setCopiedRoom] = useState(null);

  const { vacantRooms, busyRooms, vacantCount, busyCount, totalCount } = availabilityData;

  const roomTypes = useMemo(() => {
    const types = new Set();
    [...vacantRooms, ...busyRooms].forEach((r) => {
      if (r.type) types.add(r.type);
    });
    return ['ALL', ...Array.from(types)];
  }, [vacantRooms, busyRooms]);

  const filteredVacant = useMemo(() => {
    if (roomTypeFilter === 'ALL') return vacantRooms;
    return vacantRooms.filter((r) => r.type === roomTypeFilter);
  }, [vacantRooms, roomTypeFilter]);

  const filteredBusy = useMemo(() => {
    if (roomTypeFilter === 'ALL') return busyRooms;
    return busyRooms.filter((r) => r.type === roomTypeFilter);
  }, [busyRooms, roomTypeFilter]);

  const handleCopy = (roomNumber) => {
    const text = `Room ${roomNumber} is VACANT on ${selectedDay} (${selectedTimeSlot}) at ABES Engineering College!`;
    navigator.clipboard.writeText(text);
    setCopiedRoom(roomNumber);
    setTimeout(() => setCopiedRoom(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Search Filter Controls Bar */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#a51c30] flex items-center space-x-2">
              <Clock className="w-5 h-5 text-[#a51c30]" />
              <span>Time-Based Room Lookup</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Select day and period slot to view real-time room availability across ABES EC academic blocks.
            </p>
          </div>

          <button
            onClick={onUseCurrentTime}
            className="self-start md:self-auto flex items-center space-x-2 px-3.5 py-2 text-xs font-bold text-white bg-[#a51c30] hover:bg-[#8b152b] rounded-xl transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Set Current Day & Time Slot</span>
          </button>
        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {/* Day Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-[#a51c30]" />
              <span>Select Day</span>
            </label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#a51c30] focus:ring-2 focus:ring-red-100 transition-all"
            >
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Time Slot Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-[#a51c30]" />
              <span>Select Period Time Slot</span>
            </label>
            <select
              value={selectedTimeSlot}
              onChange={(e) => setSelectedTimeSlot(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#a51c30] focus:ring-2 focus:ring-red-100 transition-all"
            >
              {timeSlots.map((ts) => (
                <option key={ts} value={ts}>
                  {ts}
                </option>
              ))}
            </select>
          </div>

          {/* Room Type Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Filter className="w-4 h-4 text-[#a51c30]" />
              <span>Filter Room Type</span>
            </label>
            <select
              value={roomTypeFilter}
              onChange={(e) => setRoomTypeFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#a51c30] focus:ring-2 focus:ring-red-100 transition-all"
            >
              {roomTypes.map((t) => (
                <option key={t} value={t}>
                  {t === 'ALL' ? 'All Types (Classrooms, Labs & LTs)' : t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Time Slot Pills */}
        <div className="pt-2 border-t border-slate-200 flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 shrink-0 mr-1">Quick Slots:</span>
          {timeSlots.map((ts) => (
            <button
              key={ts}
              onClick={() => setSelectedTimeSlot(ts)}
              className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 transition-all ${
                selectedTimeSlot === ts
                  ? 'bg-[#a51c30] text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {ts}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header & Summary Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
            <span>Occupancy Overview for {selectedDay} ({selectedTimeSlot})</span>
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Showing status for {totalCount} total rooms in database
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-300 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-extrabold text-emerald-800">
              {vacantCount} Vacant ({Math.round((vacantCount / (totalCount || 1)) * 100)}%)
            </span>
          </div>

          <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-red-50 border border-red-300 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="text-xs font-extrabold text-red-800">
              {busyCount} Occupied ({Math.round((busyCount / (totalCount || 1)) * 100)}%)
            </span>
          </div>
        </div>
      </div>

      {/* VACANT ROOMS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h4 className="text-base font-extrabold text-emerald-800">
              Vacant Rooms ({filteredVacant.length})
            </h4>
          </div>
          <span className="text-xs text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full font-extrabold border border-emerald-300">
            Available Now
          </span>
        </div>

        {filteredVacant.length === 0 ? (
          <EmptyState
            title="No Vacant Rooms Found"
            message={`All rooms are occupied during ${selectedTimeSlot} on ${selectedDay}. Try selecting another time slot.`}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVacant.map((room) => (
              <div
                key={room.roomNumber}
                className="glass-panel glass-panel-hover p-4 rounded-xl border border-emerald-300 bg-white relative group"
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-1 rounded-full border border-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>VACANT</span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {room.type}
                  </span>
                </div>

                {/* Room Number */}
                <div className="mb-2">
                  <h5 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-[#a51c30] transition-colors">
                    {room.roomNumber}
                  </h5>
                  <p className="text-xs text-slate-600 flex items-center space-x-1 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{room.block} • {room.floor}</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectRoomForSchedule(room.roomNumber)}
                    className="text-xs font-bold text-[#a51c30] hover:underline flex items-center space-x-1"
                  >
                    <span>View Matrix</span>
                  </button>

                  <button
                    onClick={() => handleCopy(room.roomNumber)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Copy vacancy details"
                  >
                    {copiedRoom === room.roomNumber ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BUSY ROOMS SECTION */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <h4 className="text-base font-extrabold text-red-800">
              Occupied Rooms ({filteredBusy.length})
            </h4>
          </div>
          <span className="text-xs text-red-800 bg-red-100 px-3 py-1 rounded-full font-bold border border-red-200">
            Currently Engaged
          </span>
        </div>

        {filteredBusy.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-600 font-medium">
            No occupied rooms for this slot. All rooms are vacant!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBusy.map((room) => (
              <div
                key={room.roomNumber}
                className="glass-panel p-4 rounded-xl border border-red-200 bg-red-50/40 relative hover:border-red-300 transition-all"
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center space-x-1.5 bg-red-100 text-red-800 text-xs font-extrabold px-2.5 py-1 rounded-full border border-red-200">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span>OCCUPIED</span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {room.type}
                  </span>
                </div>

                {/* Room Number */}
                <div className="mb-3">
                  <h5 className="text-lg font-bold text-slate-900 tracking-tight">
                    {room.roomNumber}
                  </h5>
                  <p className="text-xs text-slate-600 flex items-center space-x-1 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{room.block}</span>
                  </p>
                </div>

                {/* Busy Tag details */}
                <div className="p-3 rounded-lg bg-white border border-red-100 space-y-1.5 shadow-sm">
                  <div className="flex items-start space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-extrabold text-slate-900 line-clamp-1">
                      {room.occupiedBy.subjectName}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{room.occupiedBy.facultyName}</span>
                  </div>

                  {room.occupiedBy.section && (
                    <div className="flex items-center space-x-1.5 text-[11px] text-[#a51c30] font-bold pt-0.5">
                      <Layers className="w-3.5 h-3.5 text-[#a51c30] shrink-0" />
                      <span>{room.occupiedBy.section}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 text-right">
                  <button
                    onClick={() => onSelectRoomForSchedule(room.roomNumber)}
                    className="text-[11px] font-bold text-slate-600 hover:text-[#a51c30] hover:underline"
                  >
                    View Room Matrix →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
