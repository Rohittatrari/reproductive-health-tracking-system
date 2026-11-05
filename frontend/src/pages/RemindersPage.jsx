import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Clock,
  Calendar,
  Pill,
  Droplet,
  Heart
} from 'lucide-react';
import { api } from '../api';

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // New reminder form state
  const [title, setTitle] = useState('');
  const [reminderType, setReminderType] = useState('medication');
  const [reminderDate, setReminderDate] = useState(new Date().toISOString().split('T')[0]);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [message, setMessage] = useState('');

  const loadReminders = async () => {
    try {
      setLoading(true);
      const data = await api.getReminders();
      setReminders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const handleToggle = async (id) => {
    try {
      await api.toggleReminder(id);
      loadReminders();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this reminder?')) {
      try {
        await api.deleteReminder(id);
        loadReminders();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleAutoSync = async () => {
    try {
      setSyncing(true);
      const created = await api.autoSyncReminders();
      alert(`Auto-synced cycle reminders! Added ${created.length} new notification alerts.`);
      loadReminders();
    } catch (err) {
      alert(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createReminder({
        reminder_type: reminderType,
        title,
        message,
        reminder_date: reminderDate,
        reminder_time: reminderTime
      });
      setIsAdding(false);
      setTitle('');
      setMessage('');
      loadReminders();
    } catch (err) {
      alert(err.message);
    }
  };

  const activeReminders = reminders.filter((r) => !r.is_completed);
  const completedReminders = reminders.filter((r) => r.is_completed);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-purple-950 flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-purple-600" />
            <span>Health & Cycle Reminders</span>
          </h2>
          <p className="text-xs sm:text-sm text-purple-500 font-medium mt-1">
            Personalized alerts for upcoming periods, fertile windows, doctor visits, and daily vitamins
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAutoSync}
            disabled={syncing}
            className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs sm:text-sm font-bold border border-purple-200 transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>Auto-Sync Cycle Alerts</span>
          </button>

          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold shadow-sm shadow-purple-200 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Reminder</span>
          </button>
        </div>
      </div>

      {/* Add Reminder Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-purple-100">
            <h3 className="font-bold text-xl text-purple-950 mb-1">Create Reminder</h3>
            <p className="text-xs text-purple-500 mb-5">Set up custom reproductive wellness notifications</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                  Reminder Type
                </label>
                <select
                  value={reminderType}
                  onChange={(e) => setReminderType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-purple-200 text-sm font-medium text-purple-950 focus:outline-hidden"
                >
                  <option value="period_expected">Expected Period</option>
                  <option value="ovulation_window">Ovulation / Fertile Window</option>
                  <option value="medication">Medication / Daily Vitamins</option>
                  <option value="doctor_appointment">Doctor / OB-GYN Appointment</option>
                  <option value="hydration">Hydration / Self-Care</option>
                  <option value="custom">Custom Notification</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Gynecologist Checkup"
                  required
                  className="w-full px-4 py-2 rounded-xl border border-purple-200 text-sm font-medium text-purple-950 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-purple-200 text-sm font-medium text-purple-950 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                    Time
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-purple-200 text-sm font-medium text-purple-950 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                  Optional Note
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="2"
                  placeholder="Bring cycle report with questions"
                  className="w-full px-4 py-2 rounded-xl border border-purple-200 text-sm font-medium text-purple-950 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-md shadow-purple-200"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Reminders List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xs">
        <h3 className="font-bold text-lg text-purple-950 mb-4 flex items-center justify-between">
          <span>Active Reminders</span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-800">
            {activeReminders.length} Scheduled
          </span>
        </h3>

        {activeReminders.length > 0 ? (
          <div className="space-y-3">
            {activeReminders.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 flex items-center justify-between gap-4 transition-all hover:bg-purple-50/70"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    onClick={() => handleToggle(r.id)}
                    className="mt-0.5 text-purple-300 hover:text-emerald-600 transition-colors shrink-0"
                    title="Mark Done"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </button>
                  <div className="min-w-0">
                    <p className="font-bold text-base text-purple-950 truncate">{r.title}</p>
                    <p className="text-xs text-purple-500 flex items-center gap-2 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{r.reminder_date}</span>
                      <Clock className="w-3.5 h-3.5 ml-2" />
                      <span>{r.reminder_time}</span>
                    </p>
                    {r.message && (
                      <p className="text-xs text-purple-700/80 mt-1 italic">{r.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 hidden sm:inline-block">
                    {r.reminder_type.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-2 text-purple-300 hover:text-red-600 hover:bg-red-50 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-purple-400">
            No active reminders. Click "Auto-Sync Cycle Alerts" or "New Reminder" to create one.
          </div>
        )}
      </div>

      {/* Completed Reminders */}
      {completedReminders.length > 0 && (
        <div className="bg-white/60 rounded-3xl p-6 sm:p-8 border border-purple-100/70 shadow-xs">
          <h3 className="font-bold text-base text-purple-950/70 mb-4">Completed Reminders</h3>
          <div className="space-y-2 opacity-70">
            {completedReminders.map((r) => (
              <div
                key={r.id}
                className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 line-through text-gray-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{r.title}</span>
                  <span>({r.reminder_date})</span>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
