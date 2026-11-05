import React, { useState, useEffect } from 'react';
import {
  Activity,
  Plus,
  Trash2,
  TrendingUp,
  PieChart as PieIcon,
  BarChart2,
  Calendar,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { api } from '../api';

const COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#6366F1'];

export default function SymptomTrackingPage({ onOpenSymptomModal }) {
  const [analytics, setAnalytics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [timeframe, setTimeframe] = useState(30);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ana, l] = await Promise.all([
        api.getSymptomAnalytics(timeframe),
        api.getSymptomLogs()
      ]);
      setAnalytics(ana);
      setLogs(l);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeframe]);

  const handleDeleteLog = async (id) => {
    if (window.confirm('Delete this symptom log entry?')) {
      try {
        await api.deleteSymptomLog(id);
        loadData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-purple-950 flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-purple-600" />
            <span>Symptom Tracker & Analytics</span>
          </h2>
          <p className="text-xs sm:text-sm text-purple-500 font-medium mt-1">
            Monitor physical discomfort, mood shifts, and hormonal patterns over time
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(Number(e.target.value))}
            className="px-3.5 py-2 rounded-xl bg-purple-50 border border-purple-100 text-xs font-bold text-purple-900 focus:outline-hidden"
          >
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>

          <button
            onClick={onOpenSymptomModal}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold shadow-sm shadow-purple-200 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Log Symptom</span>
          </button>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Symptoms Bar Chart (Col 8) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-purple-100 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-purple-50 mb-6">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-base text-purple-950">Most Frequent Symptoms</h3>
            </div>
            <span className="text-xs font-semibold text-purple-400">By Severity</span>
          </div>

          {analytics?.top_symptoms && analytics.top_symptoms.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.top_symptoms.slice(0, 7)} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3E8FF" />
                  <XAxis dataKey="symptom_name" tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FAF5FF', borderColor: '#E9D5FF', borderRadius: '1rem', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="mild" name="Mild" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="moderate" name="Moderate" stackId="a" fill="#F59E0B" />
                  <Bar dataKey="severe" name="Severe" stackId="a" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-xs text-purple-400">
              No symptoms logged in this timeframe.
            </div>
          )}
        </div>

        {/* Category Breakdown Pie Chart (Col 4) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-purple-100 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-purple-50 mb-6">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-pink-500" />
              <h3 className="font-bold text-base text-purple-950">Category Breakdown</h3>
            </div>
          </div>

          {analytics?.category_distribution && analytics.category_distribution.length > 0 ? (
            <div className="h-72 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={analytics.category_distribution}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {analytics.category_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#FAF5FF', borderColor: '#E9D5FF', borderRadius: '1rem', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {analytics.category_distribution.map((entry, index) => (
                  <span key={entry.category} className="text-[10px] font-semibold text-purple-900 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    {entry.category}: {entry.count}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-xs text-purple-400">
              No category data yet.
            </div>
          )}
        </div>
      </div>

      {/* Symptom History List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-purple-50 mb-5">
          <div>
            <h3 className="font-bold text-lg text-purple-950">Symptom Activity Log</h3>
            <p className="text-xs text-purple-500">Chronological history of recorded symptoms</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-700">
            {logs.length} Total Logs
          </span>
        </div>

        {logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-purple-100 text-xs font-bold text-purple-900 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Symptom</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 text-purple-950">
                {logs.map((item) => (
                  <tr key={item.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-3 px-4 font-semibold">{item.date}</td>
                    <td className="py-3 px-4 font-bold text-purple-900">{item.symptom?.name || 'Symptom'}</td>
                    <td className="py-3 px-4 capitalize text-xs text-purple-600">{item.symptom?.category || 'physical'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          item.severity === 'mild'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.severity === 'moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-purple-600 italic max-w-xs truncate">{item.notes || '-'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteLog(item.id)}
                        className="p-1.5 rounded-lg text-purple-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete log"
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
            No symptoms recorded yet. Click "Log Symptom" above to start tracking.
          </div>
        )}
      </div>
    </div>
  );
}
