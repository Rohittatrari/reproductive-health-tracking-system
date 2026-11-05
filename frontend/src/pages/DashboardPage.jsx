import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Heart,
  Droplet,
  Activity,
  Bell,
  Clock,
  ChevronRight,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../api';

export default function DashboardPage({ onOpenPeriodModal, onOpenSymptomModal }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const summary = await api.getDashboardSummary();
      setData(summary);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleReminder = async (id) => {
    try {
      await api.toggleReminder(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin"></div>
          <p className="text-sm font-semibold text-purple-900">Loading your reproductive health insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="p-4 rounded-2xl bg-red-50 text-red-700 max-w-md mx-auto border border-red-200">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="font-semibold text-sm">{error}</p>
          <button
            onClick={loadData}
            className="mt-3 px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const cycleDay = data?.current_cycle_day;
  const phaseName = data?.phase_name || 'Cycle Active';
  const phaseDesc = data?.phase_description;
  const isFertile = data?.is_in_fertile_window;
  const conceptionChance = data?.chance_of_conception;
  const estNextPeriod = data?.estimated_next_period;
  const lastPeriod = data?.last_period_date;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Card: Cycle Day & Phase */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-purple-700 via-purple-600 to-pink-600 text-white p-6 sm:p-10 shadow-xl shadow-purple-200">
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-pink-400/20 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left: Cycle Ring / Day Display */}
          <div className="md:col-span-5 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5 text-pink-200" />
              <span>Current Cycle Rhythm</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-6xl sm:text-7xl font-extrabold tracking-tight">
                {cycleDay ? `Day ${cycleDay}` : 'Ready'}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold mt-2 text-pink-100">
              {phaseName}
            </h3>

            <p className="text-sm text-purple-100/90 mt-2 max-w-md leading-relaxed">
              {phaseDesc}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={onOpenPeriodModal}
                className="px-5 py-2.5 rounded-xl bg-white text-purple-900 font-bold text-sm shadow-md hover:bg-purple-50 transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                <Droplet className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>Log Period Day</span>
              </button>
              <button
                onClick={onOpenSymptomModal}
                className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold text-sm transition-all flex items-center gap-2 border border-white/20"
              >
                <Activity className="w-4 h-4" />
                <span>Log Symptoms</span>
              </button>
            </div>
          </div>

          {/* Right: Key Metric Cards */}
          <div className="md:col-span-7 grid grid-cols-2 gap-4">
            {/* Next Period */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <div className="flex items-center justify-between text-pink-200 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Estimated Next Period</span>
                <Calendar className="w-4 h-4 text-pink-200" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {estNextPeriod || 'Log Period First'}
              </p>
              <p className="text-xs text-purple-200 mt-1">
                {lastPeriod ? `Last recorded: ${lastPeriod}` : 'No history yet'}
              </p>
            </div>

            {/* Fertility Window */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <div className="flex items-center justify-between text-pink-200 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Fertile Window Status</span>
                <Heart className="w-4 h-4 text-pink-200" />
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isFertile ? 'bg-pink-300 animate-pulse' : 'bg-purple-300'}`}></span>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {conceptionChance}
                </p>
              </div>
              <p className="text-xs text-purple-200 mt-1">
                {isFertile ? 'Conception chance is elevated' : 'Low fertility phase'}
              </p>
            </div>

            {/* Average Cycle Length */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <div className="flex items-center justify-between text-pink-200 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Avg Cycle Length</span>
                <Clock className="w-4 h-4 text-pink-200" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {data?.average_cycle_length || 28} <span className="text-sm font-normal text-purple-200">days</span>
              </p>
              <p className="text-xs text-purple-200 mt-1">
                Average period: {data?.average_period_length || 5} days
              </p>
            </div>

            {/* Ovulation Date */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <div className="flex items-center justify-between text-pink-200 text-xs font-semibold uppercase tracking-wider mb-2">
                <span>Estimated Ovulation</span>
                <Sparkles className="w-4 h-4 text-pink-200" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {data?.estimated_ovulation_date || 'Projecting...'}
              </p>
              <p className="text-xs text-purple-200 mt-1">
                Based on luteal phase calculation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Banner */}
      {data?.insights && data.insights.length > 0 && (
        <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div className="text-sm text-purple-900">
            <span className="font-bold">Health Insight: </span>
            {data.insights.join(' • ')}
          </div>
        </div>
      )}

      {/* Two Column Section: Symptoms & Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Symptoms (Col 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-purple-100 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-purple-50 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-purple-950">Recent Logged Symptoms</h3>
            </div>
            <button
              onClick={onOpenSymptomModal}
              className="text-xs font-bold text-purple-600 hover:text-purple-800"
            >
              + Log More
            </button>
          </div>

          {data?.recent_symptoms && data.recent_symptoms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.recent_symptoms.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-purple-50/40 border border-purple-100/70 flex items-start justify-between"
                >
                  <div>
                    <p className="font-bold text-sm text-purple-950">
                      {log.symptom?.name || 'Symptom'}
                    </p>
                    <p className="text-xs text-purple-500 mt-0.5">{log.date}</p>
                    {log.notes && (
                      <p className="text-xs text-purple-700/80 italic mt-1 line-clamp-1">"{log.notes}"</p>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      log.severity === 'mild'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.severity === 'moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {log.severity}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-xs text-purple-400">No symptoms recorded in the last few days.</p>
              <button
                onClick={onOpenSymptomModal}
                className="mt-3 text-xs font-bold text-purple-600 hover:underline"
              >
                Log your first symptom today
              </button>
            </div>
          )}
        </div>

        {/* Upcoming Reminders (Col 5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-purple-100 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-purple-50 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-purple-950">Upcoming Reminders</h3>
            </div>
            <span className="text-xs font-semibold text-purple-400">
              {data?.upcoming_reminders?.length || 0} active
            </span>
          </div>

          {data?.upcoming_reminders && data.upcoming_reminders.length > 0 ? (
            <div className="space-y-3">
              {data.upcoming_reminders.map((rem) => (
                <div
                  key={rem.id}
                  className="p-3.5 rounded-2xl bg-purple-50/30 border border-purple-100/70 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-purple-950 truncate">{rem.title}</p>
                    <p className="text-xs text-purple-500 mt-0.5">
                      {rem.reminder_date} at {rem.reminder_time}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleReminder(rem.id)}
                    className="p-1.5 rounded-xl text-purple-300 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    title="Mark Done"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-xs text-purple-400">No pending reminders.</p>
            </div>
          )}
        </div>
      </div>

      {/* Cycle History Summary Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-purple-50 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-purple-950">Recent Menstrual Cycle History</h3>
          </div>
          <p className="text-xs text-purple-500 font-medium">Automatic cycle length tracking</p>
        </div>

        {data?.cycle_history && data.cycle_history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-purple-100 text-xs font-bold text-purple-900 uppercase tracking-wider">
                  <th className="py-3 px-4">Cycle</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">End Date</th>
                  <th className="py-3 px-4">Cycle Length</th>
                  <th className="py-3 px-4">Period Duration</th>
                  <th className="py-3 px-4">Ovulation Estimate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 text-purple-950">
                {data.cycle_history.map((c) => (
                  <tr key={c.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-purple-700">#{c.cycle_number}</td>
                    <td className="py-3 px-4 font-semibold">{c.start_date}</td>
                    <td className="py-3 px-4 text-purple-600">{c.end_date || 'Ongoing'}</td>
                    <td className="py-3 px-4 font-semibold">
                      {c.cycle_length_days ? `${c.cycle_length_days} days` : 'Calculating...'}
                    </td>
                    <td className="py-3 px-4">
                      {c.period_duration_days ? `${c.period_duration_days} days` : '5 days'}
                    </td>
                    <td className="py-3 px-4 text-pink-600 font-medium">
                      {c.estimated_ovulation_date || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-purple-400">
            No cycle records logged yet. Click "Log Period Day" to start recording your cycle history.
          </div>
        )}
      </div>
    </div>
  );
}
