import React from 'react';
import { Clock, CalendarDays, Layers, Grid3X3, ShieldCheck } from 'lucide-react';

export default function TabNavigation({ activeTab, setActiveTab, vacantRoomsCount, totalRoomsCount, sectionsCount }) {
  const tabs = [
    {
      id: 'time',
      label: 'Find Vacant Room',
      subtitle: 'Time-Based Lookup',
      icon: Clock,
      badge: `${vacantRoomsCount} Vacant`
    },
    {
      id: 'room',
      label: 'Check Room Schedule',
      subtitle: 'Room-Based Matrix',
      icon: CalendarDays,
      badge: `${totalRoomsCount} Rooms`
    },
    {
      id: 'section',
      label: 'Section Timetables',
      subtitle: 'Section-Wise Schedule',
      icon: Layers,
      badge: `${sectionsCount} Sections`
    },
    {
      id: 'directory',
      label: 'Rooms Directory',
      subtitle: 'All Blocks Inventory',
      icon: Grid3X3,
      badge: 'All Rooms'
    },
    {
      id: 'admin',
      label: 'Admin Portal',
      subtitle: 'Rooms & Timetables',
      icon: ShieldCheck,
      badge: 'Admin Control',
      isAdmin: true
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center space-x-3 px-3.5 py-3 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? tab.isAdmin
                      ? 'bg-[#a51c30] text-white font-bold shadow-md border border-red-800'
                      : 'bg-[#a51c30] text-white font-bold shadow-md border border-red-800'
                    : 'bg-white text-slate-700 hover:text-[#a51c30] hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : tab.isAdmin
                      ? 'bg-red-50 text-[#a51c30]'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold truncate">{tab.label}</span>
                    {isActive && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-full ml-1">
                        Active
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] truncate mt-0.5 ${isActive ? 'text-amber-100 font-medium' : 'text-slate-500'}`}>
                    {tab.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
