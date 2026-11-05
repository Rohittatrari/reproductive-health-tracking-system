import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Heart,
  Sparkles,
  Plus,
  Trash2,
  Activity,
  Info
} from 'lucide-react';
import { api } from '../api';

export default function CycleTrackingPage({ onOpenPeriodModal }) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-12
  const [calendarData, setCalendarData] = useState(null);
  const [cycles, setCycles] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cal, cyc] = await Promise.all([
        api.getMonthCalendar(currentYear, currentMonth),
        api.getCycles()
      ]);
      setCalendarData(cal);
      setCycles(cyc);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  const handleDeleteCycle = async (id) => {
    if (window.confirm('Are you sure you want to delete this menstrual cycle record?')) {
      try {
        await api.deleteCycle(id);
        loadData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calculate start day of week for calendar alignment
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 is Sun

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Calendar Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-purple-50">
          <div>
            <h2 className="text-2xl font-bold text-purple-950 flex items-center gap-2.5">
              <CalendarIcon className="w-6 h-6 text-purple-600" />
              <span>Interactive Menstrual Calendar</span>
            </h2>
            <p className="text-xs sm:text-sm text-purple-500 font-medium mt-1">
              Monthly projection of period days, fertile window, and ovulation
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-purple-50 rounded-2xl p-1 border border-purple-100">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl text-purple-700 hover:bg-white transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 text-sm font-bold text-purple-950 min-w-32 text-center">
                {monthNames[currentMonth - 1]} {currentYear}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl text-purple-700 hover:bg-white transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={onOpenPeriodModal}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold shadow-sm shadow-purple-200 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log Period</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="py-4 flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-semibold text-purple-900/80 border-b border-purple-50">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500"></span>
            <span>Recorded Period</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-200 border border-dashed border-rose-400"></span>
            <span>Predicted Period</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-purple-200 border border-purple-400"></span>
            <span>Fertile Window</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-pink-500"></span>
            <span>Estimated Ovulation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span>Symptoms Logged</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="mt-6">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-xs font-bold uppercase tracking-wider text-purple-400 py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {/* Blank prefix days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-20 sm:min-h-24 rounded-2xl bg-gray-50/40 opacity-40"></div>
            ))}

            {/* Actual Month Days */}
            {calendarData?.days?.map((day) => {
              const isSelected = selectedDay?.day === day.day;
              return (
                <div
                  key={day.date}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-20 sm:min-h-24 p-2 sm:p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-purple-600 ring-2 ring-purple-500/20 shadow-md bg-purple-50/40'
                      : day.is_period
                      ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
                      : day.is_ovulation
                      ? 'bg-pink-50/80 border-pink-300 hover:border-pink-400'
                      : day.is_fertile
                      ? 'bg-purple-50/50 border-purple-200 hover:border-purple-300'
                      : day.is_predicted_period
                      ? 'bg-rose-50/30 border-dashed border-rose-200 hover:border-rose-300'
                      : 'bg-white border-purple-50 hover:border-purple-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs sm:text-sm font-bold ${
                      day.is_period ? 'text-rose-700' : 'text-purple-950'
                    }`}>
                      {day.day}
                    </span>

                    {/* Flow Badge if period */}
                    {day.is_period && (
                      <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md bg-rose-600 text-white">
                        {day.flow_intensity?.charAt(0) || 'P'}
                      </span>
                    )}

                    {/* Ovulation Icon */}
                    {day.is_ovulation && !day.is_period && (
                      <Sparkles className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                    )}
                  </div>

                  {/* Badges container */}
                  <div className="space-y-1 mt-1">
                    {day.is_period && (
                      <p className="text-[10px] font-bold text-rose-700 truncate hidden sm:block">
                        Period • Pain {day.pain_level}/10
                      </p>
                    )}
                    {day.is_predicted_period && (
                      <p className="text-[10px] font-semibold text-rose-500 italic truncate hidden sm:block">
                        Expected Period
                      </p>
                    )}
                    {day.is_fertile && !day.is_ovulation && (
                      <p className="text-[10px] font-semibold text-purple-600 truncate hidden sm:block">
                        Fertile Window
                      </p>
                    )}
                    {day.is_ovulation && (
                      <p className="text-[10px] font-bold text-pink-600 truncate hidden sm:block">
                        Ovulation Day
                      </p>
                    )}

                    {/* Symptoms dots */}
                    {day.symptoms && day.symptoms.length > 0 && (
                      <div className="flex items-center gap-1 pt-0.5">
                        <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                        <span className="text-[9px] font-bold text-purple-700">
                          {day.symptoms.length} sym
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Inspector */}
      {selectedDay && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-purple-100 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-purple-50 mb-4">
            <div>
              <h3 className="font-bold text-lg text-purple-950">
                Details for {selectedDay.date}
              </h3>
              <p className="text-xs text-purple-500">
                {selectedDay.is_period ? 'Menstrual Flow Day' : selectedDay.is_fertile ? 'Fertile Phase' : 'Cycle Activity'}
              </p>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-xs font-semibold text-purple-500 hover:text-purple-700"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
              <p className="text-xs font-bold text-purple-900 uppercase">Bleeding Status</p>
              <p className="text-base font-bold text-purple-950 mt-1 capitalize">
                {selectedDay.is_period ? `${selectedDay.flow_intensity} Flow` : selectedDay.is_predicted_period ? 'Forecasted Period' : 'None'}
              </p>
              {selectedDay.pain_level !== null && (
                <p className="text-xs text-purple-600 mt-1">Cramp / Pain: {selectedDay.pain_level} / 10</p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100">
              <p className="text-xs font-bold text-pink-900 uppercase">Fertility Status</p>
              <p className="text-base font-bold text-pink-950 mt-1">
                {selectedDay.is_ovulation ? 'Peak Fertility (Ovulation Day)' : selectedDay.is_fertile ? 'Fertile Window' : 'Low Likelihood'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <p className="text-xs font-bold text-indigo-900 uppercase">Logged Symptoms</p>
              <p className="text-base font-bold text-indigo-950 mt-1">
                {selectedDay.symptoms?.length ? `${selectedDay.symptoms.length} Recorded` : 'None'}
              </p>
              {selectedDay.symptoms?.map((s) => (
                <span key={s.id} className="inline-block mr-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  {s.name} ({s.severity})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Historical Cycles List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-purple-50 mb-5">
          <div>
            <h3 className="font-bold text-lg text-purple-950">Menstrual Cycle Records</h3>
            <p className="text-xs text-purple-500">Historical records used to calculate your average cycle length</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-700">
            {cycles.length} Total Cycles
          </span>
        </div>

        {cycles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-purple-100 text-xs font-bold text-purple-900 uppercase tracking-wider">
                  <th className="py-3 px-4">Cycle</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">End Date</th>
                  <th className="py-3 px-4">Cycle Length</th>
                  <th className="py-3 px-4">Flow Days</th>
                  <th className="py-3 px-4">Estimated Ovulation</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 text-purple-950">
                {cycles.map((c) => (
                  <tr key={c.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-purple-700">#{c.cycle_number}</td>
                    <td className="py-3 px-4 font-semibold">{c.start_date}</td>
                    <td className="py-3 px-4 text-purple-600">{c.end_date || 'Ongoing'}</td>
                    <td className="py-3 px-4 font-semibold">
                      {c.cycle_length_days ? `${c.cycle_length_days} days` : '-'}
                    </td>
                    <td className="py-3 px-4">{c.period_duration_days || 5} days</td>
                    <td className="py-3 px-4 text-pink-600">{c.estimated_ovulation_date || '-'}</td>
                    <td className="py-3 px-4 text-xs text-purple-600 max-w-xs truncate">{c.notes || '-'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteCycle(c.id)}
                        className="p-1.5 rounded-lg text-purple-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete Cycle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-purple-400">
            No menstrual cycles logged yet.
          </div>
        )}
      </div>
    </div>
  );
}
