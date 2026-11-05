import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Calendar,
  Activity,
  FileText,
  Bot,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  BookOpen
} from 'lucide-react';
import { api } from '../api';

export default function AdminPage() {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingArticle, setIsAddingArticle] = useState(false);

  // New article form
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('menstrual_health');
  const [excerpt, setExcerpt] = useState('');
  const [contentMarkdown, setContentMarkdown] = useState('');
  const [readTime, setReadTime] = useState(4);

  const loadData = async () => {
    try {
      setLoading(true);
      const [m, u, a] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminUsers(),
        api.getEducationArticles()
      ]);
      setMetrics(m);
      setUsers(u);
      setArticles(a);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleUser = async (userId) => {
    try {
      await api.toggleUserStatus(userId);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteArticle = async (id) => {
    if (window.confirm('Delete this educational article?')) {
      try {
        await api.deleteAdminArticle(id);
        loadData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    try {
      await api.createAdminArticle({
        title,
        slug: slug.toLowerCase().replace(/\s+/g, '-'),
        category,
        excerpt,
        content_markdown: contentMarkdown,
        read_time_minutes: Number(readTime),
        is_featured: false
      });
      setIsAddingArticle(false);
      setTitle('');
      setSlug('');
      setExcerpt('');
      setContentMarkdown('');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-900 text-white flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-purple-950">Administrative Portal</h2>
            <p className="text-xs sm:text-sm text-purple-500 font-medium">
              System health monitoring, patient account controls, and educational resource publishing
            </p>
          </div>
        </div>
      </div>

      {/* System Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-2xs">
          <div className="flex items-center gap-2 text-purple-500 text-xs font-bold uppercase mb-1">
            <Users className="w-4 h-4" />
            <span>Users</span>
          </div>
          <p className="text-2xl font-extrabold text-purple-950">{metrics?.total_users || 0}</p>
          <p className="text-[10px] text-emerald-600 font-semibold">{metrics?.active_users || 0} active</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-2xs">
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase mb-1">
            <Calendar className="w-4 h-4" />
            <span>Cycles</span>
          </div>
          <p className="text-2xl font-extrabold text-purple-950">{metrics?.total_cycles_logged || 0}</p>
          <p className="text-[10px] text-purple-400 font-semibold">Tracked</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase mb-1">
            <Activity className="w-4 h-4" />
            <span>Symptoms</span>
          </div>
          <p className="text-2xl font-extrabold text-purple-950">{metrics?.total_symptom_logs || 0}</p>
          <p className="text-[10px] text-purple-400 font-semibold">Entries</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-2xs">
          <div className="flex items-center gap-2 text-indigo-500 text-xs font-bold uppercase mb-1">
            <FileText className="w-4 h-4" />
            <span>Reports</span>
          </div>
          <p className="text-2xl font-extrabold text-purple-950">{metrics?.total_reports_generated || 0}</p>
          <p className="text-[10px] text-purple-400 font-semibold">PDFs Compiled</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-2xs">
          <div className="flex items-center gap-2 text-pink-500 text-xs font-bold uppercase mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Articles</span>
          </div>
          <p className="text-2xl font-extrabold text-purple-950">{metrics?.total_educational_articles || 0}</p>
          <p className="text-[10px] text-purple-400 font-semibold">Published</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-2xs">
          <div className="flex items-center gap-2 text-purple-500 text-xs font-bold uppercase mb-1">
            <Bot className="w-4 h-4" />
            <span>AI Chats</span>
          </div>
          <p className="text-2xl font-extrabold text-purple-950">{metrics?.total_ai_chat_queries || 0}</p>
          <p className="text-[10px] text-purple-400 font-semibold">Queries Answered</p>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-purple-50 mb-4">
          <div>
            <h3 className="font-bold text-lg text-purple-950">Patient Accounts & Access Control</h3>
            <p className="text-xs text-purple-500">
              HIPAA & GDPR privacy protections: Personal health records are strictly inaccessible to admins
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-700">
            {users.length} Registered Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-purple-100 text-xs font-bold text-purple-900 uppercase tracking-wider">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 text-purple-950">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-purple-50/40 transition-colors">
                  <td className="py-3 px-4 font-bold">{u.full_name}</td>
                  <td className="py-3 px-4 text-purple-600">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {u.is_active ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <CheckCircle className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
                        <XCircle className="w-3.5 h-3.5" /> Suspended
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-purple-400">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleUser(u.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        u.is_active
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Educational Content Management Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-purple-50 mb-4">
          <div>
            <h3 className="font-bold text-lg text-purple-950">Educational Content Publishing</h3>
            <p className="text-xs text-purple-500">Manage verified reproductive health guides</p>
          </div>
          <button
            onClick={() => setIsAddingArticle(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Publish New Guide</span>
          </button>
        </div>

        {/* New Guide Form Modal */}
        {isAddingArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-purple-100 overflow-y-auto max-h-[90vh]">
              <h3 className="font-bold text-xl text-purple-950 mb-1">Publish Educational Guide</h3>
              <p className="text-xs text-purple-500 mb-5">Create verified clinical content for users</p>

              <form onSubmit={handleCreateArticle} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                    Article Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-purple-200 text-sm font-medium text-purple-950 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      required
                      className="w-full px-4 py-2 rounded-xl border border-purple-200 text-sm font-medium text-purple-950 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-purple-200 text-sm font-medium text-purple-950 focus:outline-hidden"
                    >
                      <option value="menstrual_health">Menstrual Health</option>
                      <option value="reproductive_health">Reproductive Anatomy</option>
                      <option value="hormonal_changes">Hormones & PMS</option>
                      <option value="pcos_endometriosis">PCOS & Endometriosis</option>
                      <option value="pregnancy_fertility">Fertility & Conception</option>
                      <option value="hygiene_preventive">Hygiene & Wellness</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                    Short Excerpt
                  </label>
                  <input
                    type="text"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-purple-200 text-sm font-medium text-purple-950 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-purple-900 mb-1.5">
                    Markdown Content
                  </label>
                  <textarea
                    value={contentMarkdown}
                    onChange={(e) => setContentMarkdown(e.target.value)}
                    rows="6"
                    required
                    placeholder="# Article Heading&#10;&#10;Detailed medical insights..."
                    className="w-full px-4 py-2 rounded-xl border border-purple-200 text-sm font-mono text-purple-950 focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddingArticle(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-md shadow-purple-200"
                  >
                    Publish Article
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Existing Articles Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-purple-100 text-xs font-bold text-purple-900 uppercase tracking-wider">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Read Time</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 text-purple-950">
              {articles.map((art) => (
                <tr key={art.id} className="hover:bg-purple-50/40 transition-colors">
                  <td className="py-3 px-4 font-bold">{art.title}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {art.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-purple-600">{art.read_time_minutes} min</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteArticle(art.id)}
                      className="p-1.5 text-purple-400 hover:text-red-600 rounded-lg"
                      title="Delete Article"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
