import React, { useState, useEffect } from 'react';
import { X, Activity } from 'lucide-react';
import { api } from '../api';

export default function SymptomLogModal({ isOpen, onClose, onSuccess }) {
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptomId, setSelectedSymptomId] = useState(null);
  const [severity, setSeverity] = useState('mild');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.getSymptoms()
        .then((data) => {
          setSymptoms(data);
          if (data.length > 0 && !selectedSymptomId) {
            setSelectedSymptomId(data[0].id);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSymptomId) return;

    setLoading(true);
    setError('');

    try {
      await api.logSymptom(selectedSymptomId, date, severity, notes);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to log symptom');
    } finally {
      setLoading(false);
    }
  };

  const severityOptions = [
    { id: 'mild', label: 'Mild', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    { id: 'moderate', label: 'Moderate', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    { id: 'severe', label: 'Severe', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-purple-100 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-purple-950">Log Daily Symptom</h2>
              <p className="text-xs text-purple-500">Record physical, emotional, or hormonal changes</p>
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

          {/* Symptom Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-2">
              Select Symptom
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-purple-100 rounded-2xl">
              {symptoms.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setSelectedSymptomId(s.id)}
                  className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition-all ${
                    selectedSymptomId === s.id
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-200'
                      : 'bg-purple-50/50 text-purple-900 border-purple-100 hover:bg-purple-100/50'
                  }`}
                >
                  <p className="font-bold">{s.name}</p>
                  <p className={`text-[10px] capitalize ${selectedSymptomId === s.id ? 'text-purple-200' : 'text-purple-500'}`}>
                    {s.category}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-2">
              Severity Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {severityOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setSeverity(opt.id)}
                  className={`py-2 px-3 text-center rounded-xl text-xs font-bold border transition-all ${
                    severity === opt.id
                      ? `${opt.color} ring-2 ring-purple-500 ring-offset-1 scale-[1.03]`
                      : 'bg-white border-purple-100 text-purple-900 hover:bg-purple-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-2">
              Personal Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="2"
              placeholder="e.g. felt better after resting and herbal tea"
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
              disabled={loading || !selectedSymptomId}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-md shadow-purple-200 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Log Symptom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
