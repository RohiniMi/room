import * as XLSX from 'xlsx';

export const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Normalizes room inventory items
 */
export function normalizeRoomItem(item, index) {
  const roomNumber = item['Room Number'] || item.roomNumber || item.room || item.room_no || item.roomNo || `Room-${index + 1}`;
  return {
    roomNumber: String(roomNumber).trim(),
    roomName: item['Room Name'] || item.roomName || item.name || `Classroom ${roomNumber}`,
    block: item['Academic Block'] || item.block || item.building || 'ABES EC Academic Block',
    floor: item['Floor Level'] || item.floor || 'Ground Floor',
    type: item['Room Type'] || item.type || (String(roomNumber).toLowerCase().includes('lab') ? 'Computer Lab' : String(roomNumber).toLowerCase().includes('lt') ? 'Lecture Theatre' : 'Classroom'),
    capacity: Number(item['Capacity'] || item.capacity) || 60
  };
}

/**
 * Normalizes period timing slots
 */
export function normalizeTimingItem(item, index) {
  const slot = item['Time Slot'] || item.slot || item.timeSlot || item.time || item.timing || `Slot-${index + 1}`;
  return {
    id: Number(item['Period ID'] || item.id) || index + 1,
    slot: String(slot).trim(),
    label: item['Period Description'] || item.label || item.period || `Period ${index + 1} (${slot})`
  };
}

/**
 * Normalizes timetable schedule entries
 */
export function normalizeScheduleItem(item, index) {
  return {
    id: Number(item.id) || index + 1,
    section: String(item['Section / Branch'] || item.section || item.branchSection || item.branch || item.class || 'General').trim(),
    day: capitalizeFirstLetter(String(item['Day of Week'] || item.day || item.weekday || 'Monday').trim()),
    timeSlot: String(item['Time Slot'] || item.timeSlot || item.slot || item.time || '09:00–09:50').trim(),
    roomNumber: String(item['Assigned Room'] || item.roomNumber || item.room || item.room_no || 'CR-301').trim(),
    subjectName: String(item['Subject Name'] || item.subjectName || item.subject || item.course || 'Subject').trim(),
    facultyName: String(item['Faculty Name'] || item.facultyName || item.faculty || item.teacher || 'Faculty Staff').trim()
  };
}

function capitalizeFirstLetter(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Derives comprehensive metadata from roomsList, timingsList, and timetableList
 */
export function processAllData(rawRooms, rawTimings, rawTimetable) {
  const roomsList = rawRooms.map((r, i) => normalizeRoomItem(r, i));
  const timingsList = rawTimings.map((t, i) => normalizeTimingItem(t, i));
  const timetableList = rawTimetable.map((s, i) => normalizeScheduleItem(s, i));

  // Extract unique Days
  const daysSet = new Set(timetableList.map((t) => t.day));
  const days = Array.from(daysSet).sort((a, b) => {
    const ia = DAYS_ORDER.indexOf(a);
    const ib = DAYS_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    return a.localeCompare(b);
  });
  const finalDays = days.length > 0 ? days : DAYS_ORDER;

  // Extract unique Time Slots
  const timeSlots = timingsList.map((t) => t.slot);
  const derivedSlotsSet = new Set([...timeSlots, ...timetableList.map((t) => t.timeSlot)]);
  const finalTimeSlots = Array.from(derivedSlotsSet);

  // Map of room details
  const roomDetailsMap = {};
  roomsList.forEach((r) => {
    roomDetailsMap[r.roomNumber] = r;
  });

  timetableList.forEach((entry) => {
    if (!roomDetailsMap[entry.roomNumber]) {
      const newRoom = normalizeRoomItem({ roomNumber: entry.roomNumber }, Object.keys(roomDetailsMap).length);
      roomDetailsMap[entry.roomNumber] = newRoom;
      roomsList.push(newRoom);
    }
  });

  const roomNumbers = Object.keys(roomDetailsMap).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const sectionsSet = new Set(timetableList.map((t) => t.section));
  const sections = Array.from(sectionsSet).sort((a, b) => a.localeCompare(b));

  return {
    roomsList,
    timingsList,
    timetableList,
    days: finalDays,
    timeSlots: finalTimeSlots,
    roomNumbers,
    roomDetailsMap,
    sections
  };
}

export function calculateAvailabilityByTime(roomsList, roomDetailsMap, timetableList, selectedDay, selectedTimeSlot) {
  const occupiedEntries = timetableList.filter(
    (item) => item.day.toLowerCase() === selectedDay.toLowerCase() && item.timeSlot === selectedTimeSlot
  );

  const occupiedMap = new Map();
  occupiedEntries.forEach((entry) => {
    occupiedMap.set(entry.roomNumber, entry);
  });

  const vacantRooms = [];
  const busyRooms = [];

  const allRoomNumbers = Object.keys(roomDetailsMap).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  allRoomNumbers.forEach((roomNum) => {
    const details = roomDetailsMap[roomNum] || {
      roomNumber: roomNum,
      roomName: `Room ${roomNum}`,
      block: 'Academic Block',
      type: 'Classroom',
      floor: 'Main Floor'
    };

    if (occupiedMap.has(roomNum)) {
      const occ = occupiedMap.get(roomNum);
      busyRooms.push({
        ...details,
        isVacant: false,
        occupiedBy: {
          subjectName: occ.subjectName,
          facultyName: occ.facultyName,
          section: occ.section
        }
      });
    } else {
      vacantRooms.push({
        ...details,
        isVacant: true
      });
    }
  });

  return {
    vacantRooms,
    busyRooms,
    totalCount: allRoomNumbers.length,
    vacantCount: vacantRooms.length,
    busyCount: busyRooms.length
  };
}

export function buildRoomWeeklyMatrix(timetableList, roomNumber, daysList, timeSlotsList) {
  const roomEntries = timetableList.filter(
    (item) => item.roomNumber.toLowerCase() === roomNumber.toLowerCase()
  );

  const scheduleMatrix = {};
  daysList.forEach((d) => {
    scheduleMatrix[d] = {};
    timeSlotsList.forEach((slot) => {
      scheduleMatrix[d][slot] = null;
    });
  });

  let occupiedCount = 0;
  roomEntries.forEach((entry) => {
    if (scheduleMatrix[entry.day]) {
      scheduleMatrix[entry.day][entry.timeSlot] = entry;
      occupiedCount++;
    }
  });

  const totalSlots = daysList.length * timeSlotsList.length;
  const vacantSlotsCount = totalSlots - occupiedCount;

  return {
    scheduleMatrix,
    occupiedCount,
    vacantSlotsCount,
    totalSlots,
    occupancyRate: totalSlots > 0 ? Math.round((occupiedCount / totalSlots) * 100) : 0
  };
}

export function buildSectionWeeklyMatrix(timetableList, sectionName, daysList, timeSlotsList) {
  const sectionEntries = timetableList.filter(
    (item) => item.section.toLowerCase() === sectionName.toLowerCase()
  );

  const scheduleMatrix = {};
  daysList.forEach((d) => {
    scheduleMatrix[d] = {};
    timeSlotsList.forEach((slot) => {
      scheduleMatrix[d][slot] = null;
    });
  });

  let scheduledCount = 0;
  sectionEntries.forEach((entry) => {
    if (scheduleMatrix[entry.day]) {
      scheduleMatrix[entry.day][entry.timeSlot] = entry;
      scheduledCount++;
    }
  });

  const totalSlots = daysList.length * timeSlotsList.length;

  return {
    scheduleMatrix,
    scheduledCount,
    freeCount: totalSlots - scheduledCount,
    totalSlots
  };
}

/**
 * Multi-Sheet & Single Sheet Excel Parser
 */
export async function parseExcelOrCsvWorkbook(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const result = {
          rooms: null,
          timings: null,
          timetable: null,
          rawRows: null
        };

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          const lowerName = sheetName.toLowerCase();

          if (lowerName.includes('room')) {
            result.rooms = json.map((r, i) => normalizeRoomItem(r, i));
          } else if (lowerName.includes('timing') || lowerName.includes('slot') || lowerName.includes('period')) {
            result.timings = json.map((t, i) => normalizeTimingItem(t, i));
          } else if (lowerName.includes('schedule') || lowerName.includes('timetable') || lowerName.includes('class')) {
            result.timetable = json.map((s, i) => normalizeScheduleItem(s, i));
          }
        });

        // If no named sheets matched, resolve first sheet as generic rows
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const firstSheetJson = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
        result.rawRows = firstSheetJson;

        resolve(result);
      } catch (err) {
        reject(new Error('Failed to parse Excel file. Please ensure it is a valid .xlsx or .csv spreadsheet.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('File reading failed.'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * EXCEL TEMPLATE GENERATORS
 */

// 1. Download Master Combined Excel Template (.xlsx)
export function downloadMasterExcelTemplate() {
  const wb = XLSX.utils.book_new();

  // Rooms Sheet Template
  const roomsData = [
    {
      'Room Number': 'CR-401',
      'Room Name': 'Classroom 401 (Smart Room)',
      'Academic Block': 'Ramanujan Academic Block',
      'Floor Level': '4th Floor',
      'Room Type': 'Classroom',
      'Capacity': 60
    },
    {
      'Room Number': 'Lab-6',
      'Room Name': 'Embedded Systems & IoT Lab',
      'Academic Block': 'Aryabhata Lab Block',
      'Floor Level': '2nd Floor',
      'Room Type': 'Computer Lab',
      'Capacity': 45
    },
    {
      'Room Number': 'LT-3',
      'Room Name': 'Lecture Theatre 3',
      'Academic Block': 'Ramanujan Academic Block',
      'Floor Level': '2nd Floor',
      'Room Type': 'Lecture Theatre',
      'Capacity': 120
    }
  ];
  const wsRooms = XLSX.utils.json_to_sheet(roomsData);

  // Timings Sheet Template
  const timingsData = [
    { 'Period ID': 1, 'Time Slot': '09:00–09:50', 'Period Description': 'Period 1 (09:00 AM - 09:50 AM)' },
    { 'Period ID': 2, 'Time Slot': '09:50–10:40', 'Period Description': 'Period 2 (09:50 AM - 10:40 AM)' },
    { 'Period ID': 3, 'Time Slot': '10:40–11:30', 'Period Description': 'Period 3 (10:40 AM - 11:30 AM)' },
    { 'Period ID': 4, 'Time Slot': '11:30–12:20', 'Period Description': 'Period 4 (11:30 AM - 12:20 PM)' },
    { 'Period ID': 5, 'Time Slot': '12:20–01:10', 'Period Description': 'Lunch Break' },
    { 'Period ID': 6, 'Time Slot': '01:10–02:00', 'Period Description': 'Period 5 (01:10 PM - 02:00 PM)' },
    { 'Period ID': 7, 'Time Slot': '02:00–02:50', 'Period Description': 'Period 6 (02:00 PM - 02:50 PM)' },
    { 'Period ID': 8, 'Time Slot': '02:50–03:40', 'Period Description': 'Period 7 (02:50 PM - 03:40 PM)' }
  ];
  const wsTimings = XLSX.utils.json_to_sheet(timingsData);

  // Timetable Sheet Template
  const timetableData = [
    {
      'Section / Branch': 'CSE-3A',
      'Day of Week': 'Monday',
      'Time Slot': '09:00–09:50',
      'Assigned Room': 'CR-301',
      'Subject Name': 'Data Structures & Algorithms',
      'Faculty Name': 'Dr. A. K. Sharma'
    },
    {
      'Section / Branch': 'CSE-3A',
      'Day of Week': 'Monday',
      'Time Slot': '09:50–10:40',
      'Assigned Room': 'CR-301',
      'Subject Name': 'Operating Systems',
      'Faculty Name': 'Prof. Anjali Srivastava'
    },
    {
      'Section / Branch': 'AIML-3A',
      'Day of Week': 'Monday',
      'Time Slot': '09:00–09:50',
      'Assigned Room': 'Lab-1',
      'Subject Name': 'AI Neural Networks Lab',
      'Faculty Name': 'Prof. Meenakshi Sundaram'
    }
  ];
  const wsTimetable = XLSX.utils.json_to_sheet(timetableData);

  XLSX.utils.book_append_sheet(wb, wsRooms, 'Rooms');
  XLSX.utils.book_append_sheet(wb, wsTimings, 'Timings');
  XLSX.utils.book_append_sheet(wb, wsTimetable, 'Timetable');

  XLSX.writeFile(wb, 'ABES_EC_Master_College_Timetable_Template.xlsx');
}

// 2. Download Rooms List Template (.xlsx)
export function downloadRoomsExcelTemplate() {
  const wb = XLSX.utils.book_new();
  const roomsData = [
    {
      'Room Number': 'CR-301',
      'Room Name': 'Classroom 301 (Smart Room)',
      'Academic Block': 'Ramanujan Academic Block',
      'Floor Level': '3rd Floor',
      'Room Type': 'Classroom',
      'Capacity': 60
    },
    {
      'Room Number': 'Lab-1',
      'Room Name': 'AI & Machine Learning Lab',
      'Academic Block': 'Aryabhata Lab Block',
      'Floor Level': 'Ground Floor',
      'Room Type': 'Computer Lab',
      'Capacity': 45
    }
  ];
  const ws = XLSX.utils.json_to_sheet(roomsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Rooms');
  XLSX.writeFile(wb, 'ABES_EC_Rooms_List_Template.xlsx');
}

// 3. Download Period Timings Template (.xlsx)
export function downloadTimingsExcelTemplate() {
  const wb = XLSX.utils.book_new();
  const timingsData = [
    { 'Period ID': 1, 'Time Slot': '09:00–09:50', 'Period Description': 'Period 1 (09:00 AM - 09:50 AM)' },
    { 'Period ID': 2, 'Time Slot': '09:50–10:40', 'Period Description': 'Period 2 (09:50 AM - 10:40 AM)' },
    { 'Period ID': 3, 'Time Slot': '10:40–11:30', 'Period Description': 'Period 3 (10:40 AM - 11:30 AM)' },
    { 'Period ID': 4, 'Time Slot': '11:30–12:20', 'Period Description': 'Period 4 (11:30 AM - 12:20 PM)' },
    { 'Period ID': 5, 'Time Slot': '12:20–01:10', 'Period Description': 'Lunch Break' },
    { 'Period ID': 6, 'Time Slot': '01:10–02:00', 'Period Description': 'Period 5 (01:10 PM - 02:00 PM)' }
  ];
  const ws = XLSX.utils.json_to_sheet(timingsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Timings');
  XLSX.writeFile(wb, 'ABES_EC_Period_Timings_Template.xlsx');
}

/**
 * Merges overlapping or contiguous timing slots.
 * Accepts an array of timing objects (with at least `slot` and `label`).
 * Returns a new array with merged slots, re‑indexed IDs.
 */
export function mergeOverlappingTimings(timingsArray) {
  if (!Array.isArray(timingsArray) || timingsArray.length === 0) return [];

  // Helper to convert HH:MM to minutes since midnight
  const toMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Helper to format minutes back to HH:MM (zero‑padded)
  const toTimeString = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // Parse each timing slot into start/end minutes
  const parsed = timingsArray.map((t, idx) => {
    const slot = t.slot || '';
    const parts = slot.split(/[-–]/); // handles hyphen and en‑dash
    if (parts.length !== 2) {
      // If format unexpected, treat as whole interval
      return { start: 0, end: 0, original: t, idx };
    }
    const start = toMinutes(parts[0].trim());
    const end = toMinutes(parts[1].trim());
    return { start, end, original: t, idx };
  });

  // Sort by start time
  parsed.sort((a, b) => a.start - b.start);

  const merged = [];
  for (const cur of parsed) {
    if (merged.length === 0) {
      merged.push({ ...cur });
      continue;
    }
    const last = merged[merged.length - 1];
    // Overlapping or contiguous if last.end >= cur.start
    if (last.end >= cur.start) {
      // Extend the end if needed
      if (cur.end > last.end) last.end = cur.end;
      // Keep earlier label (or could combine)
    } else {
      merged.push({ ...cur });
    }
  }

  // Convert back to timing objects with new IDs
  return merged.map((item, i) => {
    const slot = `${toTimeString(item.start)}–${toTimeString(item.end)}`;
    const label = item.original.label || `Period ${i + 1} (${slot})`;
    return { id: i + 1, slot, label };
  });
}

/**
 * EXCEL TEMPLATE \u0026 SINGLE SHEET Excel Parser
 */

// 4. Download Section Timetable Template (.xlsx)
export function downloadTimetableExcelTemplate() {
  const wb = XLSX.utils.book_new();
  const timetableData = [
    {
      'Section / Branch': 'CSE-3A',
      'Day of Week': 'Monday',
      'Time Slot': '09:00–09:50',
      'Assigned Room': 'CR-301',
      'Subject Name': 'Data Structures & Algorithms',
      'Faculty Name': 'Dr. A. K. Sharma'
    },
    {
      'Section / Branch': 'CSE-3B',
      'Day of Week': 'Monday',
      'Time Slot': '09:00–09:50',
      'Assigned Room': 'CR-302',
      'Subject Name': 'Operating Systems',
      'Faculty Name': 'Prof. Anjali Srivastava'
    }
  ];
  const ws = XLSX.utils.json_to_sheet(timetableData);
  XLSX.utils.book_append_sheet(wb, ws, 'Timetable');
  XLSX.writeFile(wb, 'ABES_EC_Section_Timetable_Template.xlsx');
}

export function getCurrentDayAndTimeSlot(daysList, timeSlotsList) {
  const now = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = dayNames[now.getDay()];

  const defaultDay = daysList.includes(currentDayName) ? currentDayName : daysList[0] || 'Monday';

  const currentHour = now.getHours();
  let defaultSlot = timeSlotsList[0] || '09:00–09:50';

  if (currentHour === 9) defaultSlot = timeSlotsList[0] || '09:00–09:50';
  else if (currentHour === 10) defaultSlot = timeSlotsList[2] || '10:40–11:30';
  else if (currentHour === 11) defaultSlot = timeSlotsList[3] || '11:30–12:20';
  else if (currentHour === 13) defaultSlot = timeSlotsList[5] || '01:10–02:00';
  else if (currentHour === 14) defaultSlot = timeSlotsList[6] || '02:00–02:50';
  else if (currentHour === 15) defaultSlot = timeSlotsList[7] || '02:50–03:40';

  return { day: defaultDay, timeSlot: defaultSlot };
}
