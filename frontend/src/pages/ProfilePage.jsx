import React, { useState, useEffect } from 'react';
import {
  User,
  Settings,
  Shield,
  Download,
  Trash2,
  Lock,
  Save,
  CheckCircle2,
  Heart
} from 'lucide-react';
import { api } from '../api';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [avgCycleLength, setAvgCycleLength] = useState(28);
  const [avgPeriodLength, setAvgPeriodLength] = useState(5);
  const [trackingGoal, setTrackingGoal] = useState('track_cycle');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [reminderPeriodDays, setReminderPeriodDays] = useState(2);
  const [reminderFertilityDays, setReminderFertilityDays] = useState(1);

  // Password reset
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userData = await api.getMe();
      setUser(userData);
      if (userData.profile) {
        setProfile(userData.profile);
        setAvgCycleLength(userData.profile.average_cycle_length);
        setAvgPeriodLength(userData.profile.average_period_length);
        setTrackingGoal(userData.profile.tracking_goal);
        setMedicalConditions(userData.profile.medical_conditions || '');
        setReminderPeriodDays(userData.profile.reminder_period_days_before);
        setReminderFertilityDays(userData.profile.reminder_fertility_days_before);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await api.updateProfile({
        average_cycle_length: Number(avgCycleLength),
        average_period_length: Number(avgPeriodLength),
        tracking_goal: trackingGoal,
        medical_conditions: medicalConditions,
        reminder_period_days_before: Number(reminderPeriodDays),
        reminder_fertility_days_before: Number(reminderFertilityDays)
      });
      setSuccessMsg('Profile settings updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await api.resetPassword(user.email, newPassword);
      setPasswordMsg('Password changed successfully.');
      setNewPassword('');
      setTimeout(() => setPasswordMsg(''), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExport = async () => {
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reproductive_health_export_${user?.full_name?.replace(/\s+/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('CAUTION: Are you sure you want to permanently delete your account and all associated reproductive health records? This action cannot be undone.')) {
      try {
        await api.deleteAccount();
        api.logout();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-purple-950">{user?.full_name}</h2>
            <p className="text-xs sm:text-sm text-purple-500">{user?.email} • Role: {user?.role}</p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-sm font-semibold border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Cycle & Health Parameters Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xs">
        <h3 className="font-bold text-lg text-purple-950 mb-1 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-600" />
          <span>Cycle Parameters & Goals</span>
        </h3>
        <p className="text-xs text-purple-500 mb-6">
          Tailor default predictions, notification windows, and health condition awareness
        </p>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                Average Cycle Length (Days)
              </label>
              <input
                type="number"
                min="20"
                max="50"
                value={avgCycleLength}
                onChange={(e) => setAvgCycleLength(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-purple-200 text-sm font-medium text-purple-950 focus:outline-hidden"
              />
              <p className="text-[11px] text-purple-400 mt-1">Normal medical range: 21 to 35 days (default 28)</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                Average Period Duration (Days)
              </label>
              <input
                type="number"
                min="2"
                max="12"
                value={avgPeriodLength}
                onChange={(e) => setAvgPeriodLength(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-purple-200 text-sm font-medium text-purple-950 focus:outline-hidden"
              />
              <p className="text-[11px] text-purple-400 mt-1">Typical bleeding duration: 3 to 7 days (default 5)</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
              Primary Tracking Objective
            </label>
            <select
              value={trackingGoal}
              onChange={(e) => setTrackingGoal(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-200 text-sm font-medium text-purple-950 focus:outline-hidden"
            >
              <option value="track_cycle">Track Menstrual Rhythm & Symptoms</option>
              <option value="conceive">Conception & Pregnancy Planning</option>
              <option value="prevent_pregnancy">Fertility Awareness & Natural Tracking</option>
              <option value="monitor_health">Monitor Endocrine / Gynecological Health</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
              Diagnosed or Monitored Conditions
            </label>
            <input
              type="text"
              value={medicalConditions}
              onChange={(e) => setMedicalConditions(e.target.value)}
              placeholder="e.g. PCOS, Endometriosis, Thyroid irregularity"
              className="w-full px-4 py-2.5 rounded-xl border border-purple-200 text-sm font-medium text-purple-950 focus:outline-hidden"
            />
            <p className="text-[11px] text-purple-400 mt-1">
              Enables personalized educational article recommendations in your library
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-purple-50">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                Period Reminder Alert
              </label>
              <select
                value={reminderPeriodDays}
                onChange={(e) => setReminderPeriodDays(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-purple-200 text-sm font-medium text-purple-950"
              >
                <option value={1}>1 day before expected start</option>
                <option value={2}>2 days before expected start</option>
                <option value={3}>3 days before expected start</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                Fertility Window Alert
              </label>
              <select
                value={reminderFertilityDays}
                onChange={(e) => setReminderFertilityDays(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-purple-200 text-sm font-medium text-purple-950"
              >
                <option value={1}>1 day before ovulation window</option>
                <option value={2}>2 days before ovulation window</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-200 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Password Reset Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xs">
        <h3 className="font-bold text-lg text-purple-950 mb-1 flex items-center gap-2">
          <Lock className="w-5 h-5 text-purple-600" />
          <span>Security & Password</span>
        </h3>
        <p className="text-xs text-purple-500 mb-5">Update your account credentials</p>

        {passwordMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
            {passwordMsg}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength="6"
              className="w-full px-4 py-2 rounded-xl border border-purple-200 text-sm text-purple-950"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-purple-100 text-purple-800 hover:bg-purple-200 font-bold text-xs"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Privacy & Data Ownership Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xs">
        <h3 className="font-bold text-lg text-purple-950 mb-1 flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600" />
          <span>Data Privacy & Self-Sovereignty</span>
        </h3>
        <p className="text-xs text-purple-500 mb-6">
          You retain 100% control over your personal reproductive health data
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-purple-50/50 border border-purple-100 mb-4">
          <div>
            <p className="font-bold text-sm text-purple-950">Export Complete Health Records</p>
            <p className="text-xs text-purple-600 mt-0.5">
              Download your full JSON dataset including cycle logs, symptom entries, and reminders
            </p>
          </div>
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-xl bg-white border border-purple-200 text-purple-900 font-bold text-xs shadow-2xs hover:bg-purple-100 flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download My Data</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-red-50/50 border border-red-100">
          <div>
            <p className="font-bold text-sm text-red-950">Permanently Delete Account</p>
            <p className="text-xs text-red-700 mt-0.5">
              Cascades and permanently erases all personal health entries from the database
            </p>
          </div>
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
