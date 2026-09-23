import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import TabNavigation from './components/TabNavigation';
import SearchByTime from './components/SearchByTime';
import SearchByRoom from './components/SearchByRoom';
import SearchBySection from './components/SearchBySection';
import RoomDirectory from './components/RoomDirectory';
import AdminPanel from './components/AdminPanel';
import DataManagerModal from './components/DataManagerModal';

import {
  processAllData,
  calculateAvailabilityByTime,
  getCurrentDayAndTimeSlot
} from './utils/dataHelpers';

import defaultRoomsList from './data/rooms_list.json';
import defaultTimingsList from './data/timings.json';
import defaultTimetableList from './data/timetable.json';

const LOCAL_STORAGE_KEY_ROOMS = 'abes_ec_rooms_list';
const LOCAL_STORAGE_KEY_TIMINGS = 'abes_ec_timings_list';
const LOCAL_STORAGE_KEY_TIMETABLE = 'abes_ec_timetable_list';

export default function App() {
  const [roomsList, setRoomsList] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ROOMS);
      return saved ? JSON.parse(saved) : defaultRoomsList;
    } catch {
      return defaultRoomsList;
    }
  });

  const [timingsList, setTimingsList] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TIMINGS);
      return saved ? JSON.parse(saved) : defaultTimingsList;
    } catch {
      return defaultTimingsList;
    }
  });

  const [timetableList, setTimetableList] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TIMETABLE);
      return saved ? JSON.parse(saved) : defaultTimetableList;
    } catch {
      return defaultTimetableList;
    }
  });

  const [isCustomData, setIsCustomData] = useState(false);
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('time');

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_ROOMS, JSON.stringify(roomsList));
      localStorage.setItem(LOCAL_STORAGE_KEY_TIMINGS, JSON.stringify(timingsList));
      localStorage.setItem(LOCAL_STORAGE_KEY_TIMETABLE, JSON.stringify(timetableList));
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }
  }, [roomsList, timingsList, timetableList]);

  const {
    roomsList: processedRooms,
    timingsList: processedTimings,
    timetableList: processedTimetable,
    days,
    timeSlots,
    roomNumbers,
    roomDetailsMap,
    sections
  } = useMemo(() => {
    return processAllData(roomsList, timingsList, timetableList);
  }, [roomsList, timingsList, timetableList]);

  const [selectedDay, setSelectedDay] = useState(days[0] || 'Monday');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(timeSlots[0] || '09:00–09:50');
  const [selectedRoom, setSelectedRoom] = useState(roomNumbers[0] || 'CR-301');
  const [selectedSection, setSelectedSection] = useState(sections[0] || 'CSE-3A');
  const [quickSearchQuery, setQuickSearchQuery] = useState('');

  useEffect(() => {
    if (days.length > 0 && !days.includes(selectedDay)) setSelectedDay(days[0]);
    if (timeSlots.length > 0 && !timeSlots.includes(selectedTimeSlot)) setSelectedTimeSlot(timeSlots[0]);
    if (roomNumbers.length > 0 && !roomNumbers.includes(selectedRoom)) setSelectedRoom(roomNumbers[0]);
    if (sections.length > 0 && !sections.includes(selectedSection)) setSelectedSection(sections[0]);
  }, [days, timeSlots, roomNumbers, sections]);

  useEffect(() => {
    const { day, timeSlot } = getCurrentDayAndTimeSlot(days, timeSlots);
    if (days.includes(day)) setSelectedDay(day);
    if (timeSlots.includes(timeSlot)) setSelectedTimeSlot(timeSlot);
  }, []);

  const handleUseCurrentTime = () => {
    const { day, timeSlot } = getCurrentDayAndTimeSlot(days, timeSlots);
    setSelectedDay(day);
    setSelectedTimeSlot(timeSlot);
    setActiveTab('time');
  };

  const timeAvailability = useMemo(() => {
    return calculateAvailabilityByTime(
      processedRooms,
      roomDetailsMap,
      processedTimetable,
      selectedDay,
      selectedTimeSlot
    );
  }, [processedRooms, roomDetailsMap, processedTimetable, selectedDay, selectedTimeSlot]);

  const handleSelectRoomForSchedule = (roomNum) => {
    setSelectedRoom(roomNum);
    setActiveTab('room');
  };

  const handleQuickSearch = (query) => {
    setQuickSearchQuery(query);
    if (query.trim()) {
      const q = query.toLowerCase();
      const matchedRoom = roomNumbers.find((r) => r.toLowerCase().includes(q));
      if (matchedRoom) {
        setSelectedRoom(matchedRoom);
        return;
      }
      const matchedSec = sections.find((s) => s.toLowerCase().includes(q));
      if (matchedSec) {
        setSelectedSection(matchedSec);
        setActiveTab('section');
      }
    }
  };

  const handleAddRoom = (newRoom) => {
    setRoomsList((prev) => [...prev, newRoom]);
    setIsCustomData(true);
  };

  const handleUpdateRoom = (roomNumber, updatedRoom) => {
    setRoomsList((prev) =>
      prev.map((r) => (r.roomNumber.toLowerCase() === roomNumber.toLowerCase() ? updatedRoom : r))
    );
    setIsCustomData(true);
  };

  const handleDeleteRoom = (roomNumber) => {
    setRoomsList((prev) => prev.filter((r) => r.roomNumber.toLowerCase() !== roomNumber.toLowerCase()));
    setTimetableList((prev) => prev.filter((t) => t.roomNumber.toLowerCase() !== roomNumber.toLowerCase()));
    setIsCustomData(true);
  };

  const handleAddTimetableEntry = (newEntry) => {
    const entryWithId = { ...newEntry, id: Date.now() };
    setTimetableList((prev) => [...prev, entryWithId]);
    setIsCustomData(true);
  };

  const handleUpdateTimetableEntry = (id, updatedEntry) => {
    setTimetableList((prev) => prev.map((t) => (t.id === id ? { ...updatedEntry, id } : t)));
    setIsCustomData(true);
  };

  const handleDeleteTimetableEntry = (id) => {
    setTimetableList((prev) => prev.filter((t) => t.id !== id));
    setIsCustomData(true);
  };

  const handleAddTimingSlot = (newTiming) => {
    setTimingsList((prev) => [...prev, newTiming]);
    setIsCustomData(true);
  };

  const handleDeleteTimingSlot = (id) => {
    setTimingsList((prev) => prev.filter((t) => t.id !== id));
    setIsCustomData(true);
  };

  const handleResetAllData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_ROOMS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_TIMINGS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_TIMETABLE);
    setRoomsList(defaultRoomsList);
    setTimingsList(defaultTimingsList);
    setTimetableList(defaultTimetableList);
    setIsCustomData(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* ABES EC Navbar */}
      <Navbar
        roomsCount={roomNumbers.length}
        timingsCount={timeSlots.length}
        timetableCount={processedTimetable.length}
        isCustomData={isCustomData}
        isAdminMode={activeTab === 'admin'}
        onToggleAdminMode={() => setActiveTab(activeTab === 'admin' ? 'time' : 'admin')}
        onResetData={handleResetAllData}
        onOpenDataManagerModal={() => setIsDataManagerOpen(true)}
        onQuickSearch={handleQuickSearch}
        quickSearchQuery={quickSearchQuery}
        onUseCurrentTime={handleUseCurrentTime}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        
        {/* Navigation Tabs */}
        <TabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          vacantRoomsCount={timeAvailability.vacantCount}
          totalRoomsCount={roomNumbers.length}
          sectionsCount={sections.length}
        />

        {/* Content Area */}
        <div className="mt-8">
          {activeTab === 'time' && (
            <SearchByTime
              days={days}
              timeSlots={timeSlots}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              selectedTimeSlot={selectedTimeSlot}
              setSelectedTimeSlot={setSelectedTimeSlot}
              availabilityData={timeAvailability}
              onSelectRoomForSchedule={handleSelectRoomForSchedule}
              onUseCurrentTime={handleUseCurrentTime}
            />
          )}

          {activeTab === 'room' && (
            <SearchByRoom
              roomNumbers={roomNumbers}
              selectedRoom={selectedRoom}
              setSelectedRoom={setSelectedRoom}
              normalizedData={processedTimetable}
              days={days}
              timeSlots={timeSlots}
              roomDetailsMap={roomDetailsMap}
            />
          )}

          {activeTab === 'section' && (
            <SearchBySection
              sections={sections}
              selectedSection={selectedSection}
              setSelectedSection={setSelectedSection}
              timetableList={processedTimetable}
              days={days}
              timeSlots={timeSlots}
              onSelectRoomForSchedule={handleSelectRoomForSchedule}
            />
          )}

          {activeTab === 'directory' && (
            <RoomDirectory
              roomNumbers={roomNumbers}
              roomDetailsMap={roomDetailsMap}
              normalizedData={processedTimetable}
              days={days}
              timeSlots={timeSlots}
              selectedDay={selectedDay}
              selectedTimeSlot={selectedTimeSlot}
              onSelectRoomForSchedule={handleSelectRoomForSchedule}
            />
          )}

          {activeTab === 'admin' && (
            <AdminPanel
              roomsList={processedRooms}
              timingsList={processedTimings}
              timetableList={processedTimetable}
              onAddRoom={handleAddRoom}
              onUpdateRoom={handleUpdateRoom}
              onDeleteRoom={handleDeleteRoom}
              onAddTimetableEntry={handleAddTimetableEntry}
              onUpdateTimetableEntry={handleUpdateTimetableEntry}
              onDeleteTimetableEntry={handleDeleteTimetableEntry}
              onAddTimingSlot={handleAddTimingSlot}
              onDeleteTimingSlot={handleDeleteTimingSlot}
              onResetAllData={handleResetAllData}
              onUpdateRoomsList={(list) => { setRoomsList(list); setIsCustomData(true); }}
              onUpdateTimingsList={(list) => { setTimingsList(list); setIsCustomData(true); }}
              onUpdateTimetableList={(list) => { setTimetableList(list); setIsCustomData(true); }}
            />
          )}
        </div>

      </main>

      {/* Data & Timetable Manager Modal */}
      <DataManagerModal
        isOpen={isDataManagerOpen}
        onClose={() => setIsDataManagerOpen(false)}
        roomsList={roomsList}
        timingsList={timingsList}
        timetableList={timetableList}
        onUpdateRoomsList={(list) => { setRoomsList(list); setIsCustomData(true); }}
        onUpdateTimingsList={(list) => { setTimingsList(list); setIsCustomData(true); }}
        onUpdateTimetableList={(list) => { setTimetableList(list); setIsCustomData(true); }}
        onResetAllData={handleResetAllData}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-6 mt-auto text-center text-xs text-slate-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#a51c30]">ABES Engineering College</span>
            <span>•</span>
            <span>Smart Room Allocation Finder</span>
          </div>
          <p>© {new Date().getFullYear()} ABES EC. Timetable & Infrastructure Management.</p>
        </div>
      </footer>

    </div>
  );
}
