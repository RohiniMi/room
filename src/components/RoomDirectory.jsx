import React, { useState, useMemo } from 'react';
import { Building2, Search, Filter, CheckCircle2, XCircle, ArrowRight, Layers } from 'lucide-react';

export default function RoomDirectory({
  roomNumbers,
  roomDetailsMap,
  normalizedData,
  days,
  timeSlots,
  selectedDay,
  selectedTimeSlot,
  onSelectRoomForSchedule
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('ALL');

  const blocks = useMemo(() => {
    const set = new Set();
    Object.values(roomDetailsMap).forEach((r) => {
      if (r.block) set.add(r.block);
    });
    return ['ALL', ...Array.from(set)];
  }, [roomDetailsMap]);

  const roomStatusList = useMemo(() => {
    const occupiedSet = new Map();
    normalizedData.forEach((item) => {
      if (item.day.toLowerCase() === selectedDay.toLowerCase() && item.timeSlot === selectedTimeSlot) {
        occupiedSet.set(item.roomNumber, item);
      }
    });

    return roomNumbers.map((rNum) => {
      const details = roomDetailsMap[rNum] || {
        roomNumber: rNum,
        block: 'ABES EC Academic Block',
        type: 'Classroom',
        floor: 'Main Floor'
      };

      const occupied = occupiedSet.get(rNum);
      return {
        ...details,
        isVacant: !occupied,
        occupiedBy: occupied
          ? {
              subjectName: occupied.subjectName,
              facultyName: occupied.facultyName,
              section: occupied.section
            }
          : null
      };
    });
  }, [roomNumbers, roomDetailsMap, normalizedData, selectedDay, selectedTimeSlot]);

  const filteredRooms = useMemo(() => {
    return roomStatusList.filter((room) => {
      const matchesSearch =
        room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.block.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBlock = selectedBlock === 'ALL' || room.block === selectedBlock;

      return matchesSearch && matchesBlock;
    });
  }, [roomStatusList, searchTerm, selectedBlock]);

  return (
    <div className="space-y-6">
      
      {/* Search and Filters */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#a51c30] flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-[#a51c30]" />
              <span>ABES EC Rooms Directory & Real-Time Status</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Complete inventory of classrooms, computer labs, and lecture halls. Status showing for {selectedDay} ({selectedTimeSlot}).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Room Number (CR-301, Lab-1) or Block..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#a51c30]"
            />
          </div>

          <div>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#a51c30]"
            >
              {blocks.map((b) => (
                <option key={b} value={b}>
                  {b === 'ALL' ? 'All Academic & Lab Blocks' : b}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid of All Rooms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map((room) => (
          <div
            key={room.roomNumber}
            className={`glass-panel p-4 rounded-xl border transition-all ${
              room.isVacant ? 'border-emerald-300 bg-white hover:border-emerald-500' : 'border-red-200 bg-red-50/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-extrabold text-slate-900">{room.roomNumber}</h4>
              <span
                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                  room.isVacant
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-red-100 text-red-800 border-red-200'
                }`}
              >
                {room.isVacant ? 'VACANT' : 'OCCUPIED'}
              </span>
            </div>

            <p className="text-xs text-slate-600 font-semibold">{room.block}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{room.floor} • {room.type}</p>

            {!room.isVacant && room.occupiedBy && (
              <div className="mt-3 p-2 rounded-lg bg-white border border-red-100 text-[11px] text-slate-800 shadow-sm">
                <p className="font-bold truncate">{room.occupiedBy.subjectName}</p>
                <p className="text-slate-500 text-[10px]">{room.occupiedBy.facultyName}</p>
              </div>
            )}

            <button
              onClick={() => onSelectRoomForSchedule(room.roomNumber)}
              className="mt-4 w-full py-2 bg-slate-100 hover:bg-[#a51c30] text-slate-800 hover:text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all"
            >
              <span>View Weekly Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
