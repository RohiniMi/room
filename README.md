# ABES Engineering College — Smart Room Allocation Finder

A fast, modern academic web application themed around **ABES Engineering College (ABES EC)** featuring modular separated JSON data files, custom Excel/JSON uploaders, room allocation lookup, room matrix timetables, and section-wise class schedules.

![ABES EC Smart Room Allocation Finder](https://img.shields.io/badge/ABES%20EC-Smart%20Room%20Allocation-002147?style=for-the-badge)

---

## 🌟 What's New & Key Features

1. **Modular 3-File Dataset Architecture**
   - **`rooms_list.json`**: Master inventory of all college rooms, blocks, floors, room types, and capacities.
   - **`timings.json`**: Official college period timings (e.g. `09:00–09:50`, `09:50–10:40`).
   - **`timetable.json`**: Section-wise schedule allocations linking sections, subjects, faculty, rooms, days, and time slots.

2. **Data & Timetable Manager UI ("Manage Datasets")**
   - Open the **"Manage Datasets"** button in the header to view, upload, or export any of the 3 datasets independently via Excel (`.xlsx`, `.xls`, `.csv`) or JSON (`.json`) files.

3. **Section-Wise Timetable Search ("Section Timetables")**
   - Select any branch section (e.g. `CSE-3A`, `AIML-3A`, `ECE-2A`) to view that section's weekly timetable grid with room numbers, subjects, and faculty.

4. **Time-Based Search Filter ("Find Vacant Room")**
   - Select **Day** and **Period Timing** to view all vacant rooms highlighted in emerald green alongside occupied rooms.

5. **Room-Based Search Filter ("Check Room Schedule")**
   - Select any **Room Number** to view its weekly timetable matrix (Day × Time Slot).

---

## 📂 Separated Data File Specifications (`public/data/` & `src/data/`)

### 1. `public/data/rooms_list.json`
```json
[
  {
    "roomNumber": "CR-301",
    "roomName": "Classroom 301 (Smart Class)",
    "block": "Ramanujan Academic Block",
    "floor": "3rd Floor",
    "type": "Classroom",
    "capacity": 60
  }
]
```

### 2. `public/data/timings.json`
```json
[
  { "id": 1, "slot": "09:00–09:50", "label": "Period 1 (09:00 AM - 09:50 AM)" },
  { "id": 2, "slot": "09:50–10:40", "label": "Period 2 (09:50 AM - 10:40 AM)" }
]
```

### 3. `public/data/timetable.json`
```json
[
  {
    "id": 1,
    "section": "CSE-3A",
    "day": "Monday",
    "timeSlot": "09:00–09:50",
    "roomNumber": "CR-301",
    "subjectName": "Data Structures & Algorithms",
    "facultyName": "Dr. A. K. Sharma"
  }
]
```

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

Open your browser at `http://localhost:5173`.
