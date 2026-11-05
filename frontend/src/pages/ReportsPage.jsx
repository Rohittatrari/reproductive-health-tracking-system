import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../api';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - 90);

  const [title, setTitle] = useState('Quarterly Reproductive Health Summary');
  const [startDate, setStartDate] = useState(pastDate.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [reportType, setReportType] = useState('monthly_summary');
  const [generatingStatus, setGeneratingStatus] = useState(false);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await api.getReports();
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      setGeneratingStatus(true);
      await api.generateReport(title, startDate, endDate, reportType);
      setIsGenerating(false);
      loadReports();
    } catch (err) {
      alert(err.message);
    } finally {
      setGeneratingStatus(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this health report?')) {
      try {
        await api.deleteReport(id);
        loadReports();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleDownloadPdf = (reportId) => {
    const token = localStorage.getItem('auth_token');
    window.open(`/api/reports/${reportId}/pdf`, '_blank');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-purple-950 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-purple-600" />
            <span>Clinical Health Reports & PDF Export</span>
          </h2>
          <p className="text-xs sm:text-sm text-purple-500 font-medium mt-1">
            Generate printable, comprehensive health dossiers for your personal records or OB-GYN consultations
          </p>
        </div>

        <button
          onClick={() => setIsGenerating(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold shadow-sm shadow-purple-200 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Report</span>
        </button>
      </div>

      {/* Generation Modal */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-purple-100">
            <h3 className="font-bold text-xl text-purple-950 mb-1">Generate Health Report</h3>
            <p className="text-xs text-purple-500 mb-5">
              Compiles cycle metrics, recorded flows, symptom trends, and physician notes into a PDF
            </p>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                  Report Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-xl border border-purple-200 text-sm font-medium text-purple-950 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-purple-200 text-sm font-medium text-purple-950 focus:outline-hidden"
                >
                  <option value="monthly_summary">Monthly Cycle Summary</option>
                  <option value="cycle_analysis">Cycle Length & Regularity Analysis</option>
                  <option value="symptom_trends">Symptom History & Trends</option>
                  <option value="doctor_export">Doctor Consultation Dossier</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-purple-200 text-sm font-medium text-purple-950 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-purple-200 text-sm font-medium text-purple-950 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsGenerating(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generatingStatus}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-md shadow-purple-200 flex items-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{generatingStatus ? 'Generating PDF...' : 'Compile & Generate'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xs">
        <h3 className="font-bold text-lg text-purple-950 mb-4 flex items-center justify-between">
          <span>Generated Reports Archive</span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-800">
            {reports.length} Reports
          </span>
        </h3>

        {reports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((r) => {
              let summaryObj = {};
              try {
                summaryObj = JSON.parse(r.summary_json);
              } catch (e) {}

              const metrics = summaryObj.metrics || {};

              return (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl bg-purple-50/40 border border-purple-100 flex flex-col justify-between hover:bg-purple-50/70 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-200 text-purple-800">
                          {r.report_type.replace('_', ' ')}
                        </span>
                        <h4 className="font-bold text-base text-purple-950 mt-1.5 truncate">
                          {r.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 text-purple-400 hover:text-red-600 rounded-lg"
                        title="Delete Report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-purple-500">
                      Window: {r.start_date} to {r.end_date}
                    </p>

                    {/* Summary Chips */}
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-purple-100 text-purple-900 font-semibold">
                        Avg Cycle: {metrics.average_cycle_length || 28}d
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-purple-100 text-purple-900 font-semibold">
                        Logged Cycles: {summaryObj.total_cycles_logged || 0}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-purple-100 text-purple-900 font-semibold">
                        Regularity: {metrics.is_regular ? 'Regular' : 'Variable'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-purple-100/60 flex items-center justify-between">
                    <span className="text-[11px] text-purple-400">
                      Created: {new Date(r.generated_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDownloadPdf(r.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all hover:scale-[1.02]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-purple-400">
            No health reports generated yet. Click "Generate New Report" to create your first clinical summary.
          </div>
        )}
      </div>
    </div>
  );
}
