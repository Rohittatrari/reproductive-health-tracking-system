import React, { useState } from 'react';
import { X, Droplet, Heart, CheckCircle2 } from 'lucide-react';
import { api } from '../api';

export default function PeriodLogModal({ isOpen, onClose, onSuccess }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isNewCycle, setIsNewCycle] = useState(true);
  const [flowIntensity, setFlowIntensity] = useState('medium');
  const [painLevel, setPainLevel] = useState(2);
  const [padCount, setPadCount] = useState(3);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isNewCycle) {
        // Record cycle start
        await api.recordCycle(date, null, 5, notes);
      } else {
        // Record daily period record
        await api.recordPeriodDay({
          date,
          flow_intensity: flowIntensity,
          pain_level: Number(painLevel),
          pad_tampon_count: Number(padCount),
          notes
        });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record period');
    } finally {
      setLoading(false);
    }
  };

  const flowOptions = [
    { id: 'spotting', label: 'Spotting', color: 'bg-rose-100 text-rose-700 border-rose-300' },
    { id: 'light', label: 'Light', color: 'bg-rose-200 text-rose-800 border-rose-400' },
    { id: 'medium', label: 'Medium', color: 'bg-rose-500 text-white border-rose-600' },
    { id: 'heavy', label: 'Heavy', color: 'bg-rose-800 text-white border-rose-950' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-purple-100 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Droplet className="w-5 h-5 fill-rose-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-purple-950">Record Menstrual Period</h2>
              <p className="text-xs text-purple-500">Track cycle start, bleeding intensity & discomfort</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="my-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-purple-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-sm font-medium text-purple-950"
              required
            />
          </div>

          {/* New Cycle Toggle */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-start gap-3 cursor-pointer" onClick={() => setIsNewCycle(!isNewCycle)}>
            <input
              type="checkbox"
              id="newCycle"
              checked={isNewCycle}
              onChange={(e) => setIsNewCycle(e.target.checked)}
              className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
            />
            <div>
              <label htmlFor="newCycle" className="text-sm font-semibold text-purple-950 cursor-pointer">
                First day of my period (New Cycle)
              </label>
              <p className="text-xs text-purple-600 mt-0.5">
                Automatically calculates length of previous cycle and resets your ovulation forecast.
              </p>
            </div>
          </div>

          {/* Flow Intensity */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-2">
              Bleeding Intensity
            </label>
            <div className="grid grid-cols-4 gap-2">
              {flowOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setFlowIntensity(opt.id)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                    flowIntensity === opt.id
                      ? `${opt.color} ring-2 ring-purple-500 ring-offset-1 scale-[1.03]`
                      : 'bg-white border-purple-100 text-purple-900 hover:bg-purple-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pain Level Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-900">
                Pain / Cramp Level: <span className="text-pink-600">{painLevel} / 10</span>
              </label>
              <span className="text-xs text-purple-500 font-medium">
                {painLevel === 0 ? 'No Pain' : painLevel <= 3 ? 'Mild' : painLevel <= 6 ? 'Moderate' : 'Severe'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={painLevel}
              onChange={(e) => setPainLevel(e.target.value)}
              className="w-full accent-rose-500"
            />
          </div>

          {/* Pad / Tampon Count */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-2">
              Pads / Tampons Used
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPadCount(Math.max(0, padCount - 1))}
                className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 font-bold hover:bg-purple-200"
              >
                -
              </button>
              <span className="w-12 text-center font-bold text-lg text-purple-950">{padCount}</span>
              <button
                type="button"
                onClick={() => setPadCount(padCount + 1)}
                className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 font-bold hover:bg-purple-200"
              >
                +
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="2"
              placeholder="e.g. used heating pad, took ibuprofen"
              className="w-full px-4 py-2 rounded-xl border border-purple-200 text-sm font-medium text-purple-950 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-md shadow-purple-200 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Period Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
