import React, { useState, useMemo } from 'react';
import { ShieldCheck, Plus, Trash2, Edit3, Building, Layers, Clock, AlertTriangle, Download, Upload, RotateCcw, Sparkles, CheckCircle2 } from 'lucide-react';
import {
  parseExcelOrCsvWorkbook,
  downloadMasterExcelTemplate,
  downloadRoomsExcelTemplate,
  downloadTimingsExcelTemplate,
  downloadTimetableExcelTemplate
} from '../utils/dataHelpers';

export default function AdminPanel({
  roomsList,
  timingsList,
  timetableList,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
  onAddTimetableEntry,
  onUpdateTimetableEntry,
  onDeleteTimetableEntry,
  onAddTimingSlot,
  onDeleteTimingSlot,
  onResetAllData,
  onUpdateRoomsList,
  onUpdateTimingsList,
  onUpdateTimetableList
}) {
  const [adminTab, setAdminTab] = useState('rooms');
  const [uploadNotification, setUploadNotification] = useState(null);

  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [editingRoomNo, setEditingRoomNo] = useState(null);
  const [roomFormData, setRoomFormData] = useState({
    roomNumber: '',
    roomName: '',
    block: 'Ramanujan Academic Block',
    floor: '3rd Floor',
    type: 'Classroom',
    capacity: 60
  });

  const [isAddingTimetable, setIsAddingTimetable] = useState(false);
  const [editingTimetableId, setEditingTimetableId] = useState(null);
  const [timetableFormData, setTimetableFormData] = useState({
    section: 'CSE-3A',
    day: 'Monday',
    timeSlot: '09:00–09:50',
    roomNumber: 'CR-301',
    subjectName: '',
    facultyName: ''
  });

  const [isAddingTiming, setIsAddingTiming] = useState(false);
  const [timingFormData, setTimingFormData] = useState({
    slot: '',
    label: ''
  });

  const showNotification = (msg) => {
    setUploadNotification(msg);
    setTimeout(() => setUploadNotification(null), 4000);
  };

  const handleSectionFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const json = JSON.parse(text);
        if (!Array.isArray(json)) throw new Error('JSON file must contain an array of objects.');

        if (type === 'rooms' && onUpdateRoomsList) {
          onUpdateRoomsList(json);
          showNotification(`Successfully imported ${json.length} rooms from JSON!`);
        } else if (type === 'timings' && onUpdateTimingsList) {
          onUpdateTimingsList(json);
          showNotification(`Successfully imported ${json.length} period timings from JSON!`);
        } else if (type === 'timetable' && onUpdateTimetableList) {
          onUpdateTimetableList(json);
          showNotification(`Successfully imported ${json.length} timetable entries from JSON!`);
        }
      } else {
        const result = await parseExcelOrCsvWorkbook(file);
        if (type === 'rooms' && onUpdateRoomsList) {
          const data = result.rooms || result.rawRows;
          if (data && data.length > 0) {
            onUpdateRoomsList(data);
            showNotification(`Successfully imported ${data.length} rooms from Excel spreadsheet!`);
          } else {
            throw new Error('No room records found in Excel sheet.');
          }
        } else if (type === 'timings' && onUpdateTimingsList) {
          const data = result.timings || result.rawRows;
          if (data && data.length > 0) {
            onUpdateTimingsList(data);
            showNotification(`Successfully imported ${data.length} period timing slots from Excel!`);
          } else {
            throw new Error('No timing slots found in Excel sheet.');
          }
        } else if (type === 'timetable' && onUpdateTimetableList) {
          const data = result.timetable || result.rawRows;
          if (data && data.length > 0) {
            onUpdateTimetableList(data);
            showNotification(`Successfully imported ${data.length} timetable entries from Excel!`);
          } else {
            throw new Error('No timetable entries found in Excel sheet.');
          }
        }
      }
    } catch (err) {
      alert(err.message || 'Error parsing Excel file.');
    }
    // Reset file input
    e.target.value = '';
  };

  const uniqueBlocks = useMemo(() => {
    const set = new Set(roomsList.map((r) => r.block));
    return Array.from(set);
  }, [roomsList]);

  const uniqueRoomNumbers = useMemo(() => {
    return roomsList.map((r) => r.roomNumber).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [roomsList]);

  const collisionAlert = useMemo(() => {
    if (!isAddingTimetable && !editingTimetableId) return null;
    const { roomNumber, day, timeSlot, facultyName } = timetableFormData;

    const roomConflict = timetableList.find(
      (entry) =>
        entry.roomNumber.toLowerCase() === roomNumber.toLowerCase() &&
        entry.day.toLowerCase() === day.toLowerCase() &&
        entry.timeSlot === timeSlot &&
        entry.id !== editingTimetableId
    );

    if (roomConflict) {
      return {
        type: 'ROOM_CONFLICT',
        message: `Collision Warning! Room ${roomNumber} is ALREADY occupied by ${roomConflict.section} (${roomConflict.subjectName}) at ${day} (${timeSlot}).`
      };
    }

    if (facultyName.trim()) {
      const facultyConflict = timetableList.find(
        (entry) =>
          entry.facultyName.toLowerCase() === facultyName.trim().toLowerCase() &&
          entry.day.toLowerCase() === day.toLowerCase() &&
          entry.timeSlot === timeSlot &&
          entry.id !== editingTimetableId
      );
      if (facultyConflict) {
        return {
          type: 'FACULTY_CONFLICT',
          message: `Faculty Collision! ${facultyName} is ALREADY assigned to teach ${facultyConflict.section} in Room ${facultyConflict.roomNumber} at ${day} (${timeSlot}).`
        };
      }
    }

    return null;
  }, [timetableFormData, timetableList, isAddingTimetable, editingTimetableId]);

  const handleRoomSubmit = (e) => {
    e.preventDefault();
    if (!roomFormData.roomNumber.trim()) return;

    if (editingRoomNo) {
      onUpdateRoom(editingRoomNo, roomFormData);
      setEditingRoomNo(null);
    } else {
      onAddRoom(roomFormData);
    }

    setRoomFormData({
      roomNumber: '',
      roomName: '',
      block: 'Ramanujan Academic Block',
      floor: '3rd Floor',
      type: 'Classroom',
      capacity: 60
    });
    setIsAddingRoom(false);
  };

  const handleStartEditRoom = (room) => {
    setEditingRoomNo(room.roomNumber);
    setRoomFormData({
      roomNumber: room.roomNumber,
      roomName: room.roomName || `Room ${room.roomNumber}`,
      block: room.block || 'Ramanujan Academic Block',
      floor: room.floor || '3rd Floor',
      type: room.type || 'Classroom',
      capacity: room.capacity || 60
    });
    setIsAddingRoom(true);
  };

  const handleTimetableSubmit = (e) => {
    e.preventDefault();
    if (!timetableFormData.subjectName.trim() || !timetableFormData.facultyName.trim()) return;

    if (editingTimetableId) {
      onUpdateTimetableEntry(editingTimetableId, timetableFormData);
      setEditingTimetableId(null);
    } else {
      onAddTimetableEntry(timetableFormData);
    }

    setTimetableFormData({
      section: 'CSE-3A',
      day: 'Monday',
      timeSlot: timingsList[0]?.slot || '09:00–09:50',
      roomNumber: uniqueRoomNumbers[0] || 'CR-301',
      subjectName: '',
      facultyName: ''
    });
    setIsAddingTimetable(false);
  };

  const handleStartEditTimetable = (entry) => {
    setEditingTimetableId(entry.id);
    setTimetableFormData({
      section: entry.section,
      day: entry.day,
      timeSlot: entry.timeSlot,
      roomNumber: entry.roomNumber,
      subjectName: entry.subjectName,
      facultyName: entry.facultyName
    });
    setIsAddingTimetable(true);
  };

  const handleTimingSubmit = (e) => {
    e.preventDefault();
    if (!timingFormData.slot.trim()) return;
    onAddTimingSlot({
      id: timingsList.length + 1,
      slot: timingFormData.slot.trim(),
      label: timingFormData.label.trim() || `Period (${timingFormData.slot.trim()})`
    });
    setTimingFormData({ slot: '', label: '' });
    setIsAddingTiming(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Admin Header */}
      <div className="glass-panel p-6 rounded-2xl border border-red-200 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-[#a51c30] text-white shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-red-100 text-[#a51c30] border border-red-200 px-2 py-0.5 rounded">
                  ABES EC Product Suite
                </span>
                <span className="text-xs text-slate-500 font-medium">Institutional Administration</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                ABES EC Admin & Infrastructure Control Portal
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={downloadMasterExcelTemplate}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-extrabold text-white bg-[#a51c30] hover:bg-[#8b152b] rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>Download Excel Template</span>
            </button>

            <button
              onClick={onResetAllData}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Predefined Template Quick Bar */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#a51c30] shrink-0" />
            <span>Download pre-formatted Excel template with predefined columns (`Rooms`, `Timings`, `Timetable`), fill it in, and upload!</span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={downloadRoomsExcelTemplate}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-[#a51c30] border border-slate-200 text-[11px] font-bold rounded-lg shadow-xs"
            >
              Rooms Template
            </button>
            <button
              onClick={downloadTimetableExcelTemplate}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-[#a51c30] border border-slate-200 text-[11px] font-bold rounded-lg shadow-xs"
            >
              Timetable Template
            </button>
          </div>
        </div>

        {/* Admin KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-bold">Master Rooms Inventory</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">{roomsList.length} Rooms</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-bold">Academic Blocks</span>
            <p className="text-xl font-black text-blue-700 mt-0.5">{uniqueBlocks.length} Blocks</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-bold">Scheduled Classes</span>
            <p className="text-xl font-black text-[#a51c30] mt-0.5">{timetableList.length} Periods</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-bold">Period Timings</span>
            <p className="text-xl font-black text-emerald-700 mt-0.5">{timingsList.length} Slots</p>
          </div>
        </div>
      </div>

      {/* Admin Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setAdminTab('rooms')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            adminTab === 'rooms'
              ? 'bg-[#a51c30] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>1. Manage Rooms & Inventory</span>
        </button>

        <button
          onClick={() => setAdminTab('timetable')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            adminTab === 'timetable'
              ? 'bg-[#a51c30] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>2. Manage Timetable Allocations</span>
        </button>

        <button
          onClick={() => setAdminTab('blocks')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            adminTab === 'blocks'
              ? 'bg-[#a51c30] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>3. Academic Blocks & Floors</span>
        </button>

        <button
          onClick={() => setAdminTab('timings')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            adminTab === 'timings'
              ? 'bg-[#a51c30] text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>4. Period Timings & Slots</span>
        </button>
      </div>

      {/* Toast Upload Notification */}
      {uploadNotification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-900 flex items-center space-x-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{uploadNotification}</span>
        </div>
      )}

      {/* --- TAB 1: MANAGE ROOMS --- */}
      {adminTab === 'rooms' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Master Rooms Inventory</h3>
              <p className="text-xs text-slate-600">Add, edit, or upload rooms list spreadsheet (.xlsx, .csv, .json)</p>
            </div>

            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <button
                onClick={downloadRoomsExcelTemplate}
                className="flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                title="Download pre-formatted Rooms template"
              >
                <Download className="w-3.5 h-3.5 text-[#a51c30]" />
                <span>Rooms Template</span>
              </button>

              <label className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer">
                <Upload className="w-4 h-4 text-slate-950" />
                <span>Upload Rooms Excel</span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv, .json"
                  className="hidden"
                  onChange={(e) => handleSectionFileUpload(e, 'rooms')}
                />
              </label>

              <button
                onClick={() => {
                  setEditingRoomNo(null);
                  setRoomFormData({
                    roomNumber: '',
                    roomName: '',
                    block: uniqueBlocks[0] || 'Ramanujan Academic Block',
                    floor: '3rd Floor',
                    type: 'Classroom',
                    capacity: 60
                  });
                  setIsAddingRoom(!isAddingRoom);
                }}
                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddingRoom ? 'Cancel' : 'Add Room Manually'}</span>
              </button>
            </div>
          </div>

          {/* Add / Edit Room Form */}
          {isAddingRoom && (
            <form onSubmit={handleRoomSubmit} className="glass-panel p-5 rounded-2xl border border-red-200 bg-white space-y-4 shadow-md">
              <h4 className="text-sm font-extrabold text-[#a51c30] flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span>{editingRoomNo ? `Edit Room ${editingRoomNo}` : 'Add New College Room'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Room Number *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingRoomNo}
                    value={roomFormData.roomNumber}
                    onChange={(e) => setRoomFormData({ ...roomFormData, roomNumber: e.target.value })}
                    placeholder="e.g. CR-401 or Lab-6"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#a51c30]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Room Name / Title</label>
                  <input
                    type="text"
                    value={roomFormData.roomName}
                    onChange={(e) => setRoomFormData({ ...roomFormData, roomName: e.target.value })}
                    placeholder="e.g. AI Smart Lab 6"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#a51c30]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Academic Block *</label>
                  <input
                    type="text"
                    required
                    value={roomFormData.block}
                    onChange={(e) => setRoomFormData({ ...roomFormData, block: e.target.value })}
                    placeholder="e.g. Ramanujan Academic Block"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#a51c30]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Floor Level</label>
                  <select
                    value={roomFormData.floor}
                    onChange={(e) => setRoomFormData({ ...roomFormData, floor: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#a51c30]"
                  >
                    <option value="Ground Floor">Ground Floor</option>
                    <option value="1st Floor">1st Floor</option>
                    <option value="2nd Floor">2nd Floor</option>
                    <option value="3rd Floor">3rd Floor</option>
                    <option value="4th Floor">4th Floor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Room Type</label>
                  <select
                    value={roomFormData.type}
                    onChange={(e) => setRoomFormData({ ...roomFormData, type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#a51c30]"
                  >
                    <option value="Classroom">Classroom</option>
                    <option value="Computer Lab">Computer Lab</option>
                    <option value="Electronics Lab">Electronics Lab</option>
                    <option value="Lecture Theatre">Lecture Theatre</option>
                    <option value="Auditorium">Auditorium / Seminar Hall</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Seating Capacity</label>
                  <input
                    type="number"
                    value={roomFormData.capacity}
                    onChange={(e) => setRoomFormData({ ...roomFormData, capacity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#a51c30]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingRoom(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#a51c30] hover:bg-[#8b152b] text-xs font-bold text-white rounded-xl shadow-md"
                >
                  {editingRoomNo ? 'Save Changes' : 'Add Room'}
                </button>
              </div>
            </form>
          )}

          {/* Rooms List Table */}
          <div className="glass-panel rounded-2xl p-4 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 bg-slate-100">
                  <th className="p-3">Room Number</th>
                  <th className="p-3">Room Name</th>
                  <th className="p-3">Block</th>
                  <th className="p-3">Floor</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Capacity</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {roomsList.map((room) => (
                  <tr key={room.roomNumber} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-black text-slate-900 text-sm">{room.roomNumber}</td>
                    <td className="p-3 text-slate-800 font-semibold">{room.roomName}</td>
                    <td className="p-3 text-slate-600">{room.block}</td>
                    <td className="p-3 text-slate-600">{room.floor}</td>
                    <td className="p-3">
                      <span className="bg-red-50 text-[#a51c30] border border-red-200 px-2 py-0.5 rounded font-bold">
                        {room.type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 font-bold">{room.capacity} seats</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleStartEditRoom(room)}
                          className="p-1.5 text-slate-500 hover:text-[#a51c30] hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Room Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteRoom(room.roomNumber)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Delete Room"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 2: MANAGE TIMETABLE & ALLOCATIONS --- */}
      {adminTab === 'timetable' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Section Timetable Allocations</h3>
              <p className="text-xs text-slate-600">Assign section classes to rooms & period slots or bulk upload (.xlsx, .csv, .json)</p>
            </div>

            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <button
                onClick={downloadTimetableExcelTemplate}
                className="flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                title="Download pre-formatted Timetable template"
              >
                <Download className="w-3.5 h-3.5 text-[#a51c30]" />
                <span>Timetable Template</span>
              </button>

              <label className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer">
                <Upload className="w-4 h-4 text-slate-950" />
                <span>Upload Timetable Excel</span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv, .json"
                  className="hidden"
                  onChange={(e) => handleSectionFileUpload(e, 'timetable')}
                />
              </label>

              <button
                onClick={() => {
                  setEditingTimetableId(null);
                  setTimetableFormData({
                    section: 'CSE-3A',
                    day: 'Monday',
                    timeSlot: timingsList[0]?.slot || '09:00–09:50',
                    roomNumber: uniqueRoomNumbers[0] || 'CR-301',
                    subjectName: '',
                    facultyName: ''
                  });
                  setIsAddingTimetable(!isAddingTimetable);
                }}
                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddingTimetable ? 'Cancel' : 'Add Slot Manually'}</span>
              </button>
            </div>
          </div>

          {/* Add / Edit Timetable Entry Form */}
          {isAddingTimetable && (
            <form onSubmit={handleTimetableSubmit} className="glass-panel p-5 rounded-2xl border border-red-200 bg-white space-y-4 shadow-md">
              <h4 className="text-sm font-extrabold text-[#a51c30] flex items-center space-x-2">
                <Layers className="w-4 h-4" />
                <span>{editingTimetableId ? 'Edit Timetable Entry' : 'Add New Class Allocation'}</span>
              </h4>

              {/* Collision Warning Alert */}
              {collisionAlert && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start space-x-2.5">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block text-red-900">Schedule Collision Detected</span>
                    <span>{collisionAlert.message}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Section / Branch *</label>
                  <input
                    type="text"
                    required
                    value={timetableFormData.section}
                    onChange={(e) => setTimetableFormData({ ...timetableFormData, section: e.target.value })}
                    placeholder="e.g. CSE-3A or AIML-2B"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#a51c30]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Day of Week *</label>
                  <select
                    value={timetableFormData.day}
                    onChange={(e) => setTimetableFormData({ ...timetableFormData, day: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#a51c30]"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Period Time Slot *</label>
                  <select
                    value={timetableFormData.timeSlot}
                    onChange={(e) => setTimetableFormData({ ...timetableFormData, timeSlot: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#a51c30]"
                  >
                    {timingsList.map((t) => (
                      <option key={t.slot} value={t.slot}>
                        {t.slot} ({t.label})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Room *</label>
                  <select
                    value={timetableFormData.roomNumber}
                    onChange={(e) => setTimetableFormData({ ...timetableFormData, roomNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#a51c30]"
                  >
                    {uniqueRoomNumbers.map((rNo) => (
                      <option key={rNo} value={rNo}>
                        Room {rNo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject Name *</label>
                  <input
                    type="text"
                    required
                    value={timetableFormData.subjectName}
                    onChange={(e) => setTimetableFormData({ ...timetableFormData, subjectName: e.target.value })}
                    placeholder="e.g. Data Structures & Algorithms"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#a51c30]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Faculty Name *</label>
                  <input
                    type="text"
                    required
                    value={timetableFormData.facultyName}
                    onChange={(e) => setTimetableFormData({ ...timetableFormData, facultyName: e.target.value })}
                    placeholder="e.g. Dr. A. K. Sharma"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#a51c30]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTimetable(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!!collisionAlert}
                  className={`px-5 py-2 text-xs font-bold rounded-xl shadow-md transition-all ${
                    collisionAlert
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-[#a51c30] hover:bg-[#8b152b] text-white cursor-pointer'
                  }`}
                >
                  {editingTimetableId ? 'Save Entry' : 'Add Entry'}
                </button>
              </div>
            </form>
          )}

          {/* Timetable List Table */}
          <div className="glass-panel rounded-2xl p-4 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 bg-slate-100">
                  <th className="p-3">Section</th>
                  <th className="p-3">Day</th>
                  <th className="p-3">Time Slot</th>
                  <th className="p-3">Assigned Room</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Faculty</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {timetableList.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-black text-[#a51c30]">{entry.section}</td>
                    <td className="p-3 font-bold text-slate-900">{entry.day}</td>
                    <td className="p-3 text-slate-700 font-semibold">{entry.timeSlot}</td>
                    <td className="p-3 font-bold text-blue-700">Room {entry.roomNumber}</td>
                    <td className="p-3 text-slate-800 font-bold">{entry.subjectName}</td>
                    <td className="p-3 text-slate-600">{entry.facultyName}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleStartEditTimetable(entry)}
                          className="p-1.5 text-slate-500 hover:text-[#a51c30] hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Entry"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTimetableEntry(entry.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 3: ACADEMIC BLOCKS & FLOORS --- */}
      {adminTab === 'blocks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Academic Blocks & Infrastructure</h3>
              <p className="text-xs text-slate-600">Inventory breakdown by college building and floor level</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uniqueBlocks.map((blockName) => {
              const roomsInBlock = roomsList.filter((r) => r.block === blockName);

              return (
                <div key={blockName} className="glass-panel p-5 rounded-2xl border border-slate-200 space-y-3 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-red-50 text-[#a51c30] border border-red-200">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">{blockName}</h4>
                        <span className="text-[11px] text-slate-500 font-semibold">{roomsInBlock.length} Total Rooms</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                      Rooms in this Block:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {roomsInBlock.map((r) => (
                        <span
                          key={r.roomNumber}
                          className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                        >
                          {r.roomNumber} ({r.type})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 4: PERIOD TIMINGS & SLOTS --- */}
      {adminTab === 'timings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Period Timings & Slot Definitions</h3>
              <p className="text-xs text-slate-600">Define official bell timings or bulk upload (.xlsx, .csv, .json)</p>
            </div>

            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <button
                onClick={downloadTimingsExcelTemplate}
                className="flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                title="Download pre-formatted Timings template"
              >
                <Download className="w-3.5 h-3.5 text-[#a51c30]" />
                <span>Timings Template</span>
              </button>

              <label className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer">
                <Upload className="w-4 h-4 text-slate-950" />
                <span>Upload Timings Excel</span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv, .json"
                  className="hidden"
                  onChange={(e) => handleSectionFileUpload(e, 'timings')}
                />
              </label>

              <button
                onClick={() => setIsAddingTiming(!isAddingTiming)}
                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddingTiming ? 'Cancel' : 'Add Slot Manually'}</span>
              </button>
            </div>
          </div>

          {/* Add Timing Form */}
          {isAddingTiming && (
            <form onSubmit={handleTimingSubmit} className="glass-panel p-5 rounded-2xl border border-red-200 bg-white space-y-4 shadow-md">
              <h4 className="text-sm font-extrabold text-[#a51c30] flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Add New Period Timing Slot</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot Range *</label>
                  <input
                    type="text"
                    required
                    value={timingFormData.slot}
                    onChange={(e) => setTimingFormData({ ...timingFormData, slot: e.target.value })}
                    placeholder="e.g. 09:00–09:50 or 04:30–05:20"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#a51c30]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Period Label</label>
                  <input
                    type="text"
                    value={timingFormData.label}
                    onChange={(e) => setTimingFormData({ ...timingFormData, label: e.target.value })}
                    placeholder="e.g. Period 9 (04:30 PM - 05:20 PM)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-[#a51c30]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTiming(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#a51c30] hover:bg-[#8b152b] text-xs font-bold text-white rounded-xl shadow-md"
                >
                  Save Timing Slot
                </button>
              </div>
            </form>
          )}

          {/* Timings List */}
          <div className="glass-panel rounded-2xl p-4 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 bg-slate-100">
                  <th className="p-3">Period ID</th>
                  <th className="p-3">Time Slot</th>
                  <th className="p-3">Period Description</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {timingsList.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-extrabold text-slate-900">#{t.id}</td>
                    <td className="p-3 font-extrabold text-[#a51c30]">{t.slot}</td>
                    <td className="p-3 text-slate-700 font-semibold">{t.label}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onDeleteTimingSlot(t.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Delete Timing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
