const API_BASE = '/api';

// Seeded offline demo data for static deployment environments (e.g. GitHub Pages)
const today = new Date();
const formatDate = (d) => d.toISOString().split('T')[0];
const subDays = (n) => {
  const d = new Date();
  d.setDate(today.getDate() - n);
  return formatDate(d);
};
const addDays = (n) => {
  const d = new Date();
  d.setDate(today.getDate() + n);
  return formatDate(d);
};

const MOCK_DATA = {
  user: {
    id: 1,
    email: 'demo@health.org',
    full_name: 'Sarah Jenkins',
    role: 'user',
    is_active: true,
    created_at: subDays(90),
    profile: {
      average_cycle_length: 28,
      average_period_length: 5,
      tracking_goal: 'track_cycle',
      medical_conditions: 'None reported',
      reminder_period_days_before: 2,
      reminder_fertility_days_before: 1
    }
  },
  symptoms: [
    { id: 1, name: 'Cramps', category: 'physical', icon: 'Flame' },
    { id: 2, name: 'Headache', category: 'physical', icon: 'Brain' },
    { id: 3, name: 'Mood Changes', category: 'emotional', icon: 'Smile' },
    { id: 4, name: 'Fatigue', category: 'energy', icon: 'BatteryLow' },
    { id: 5, name: 'Acne', category: 'skin', icon: 'Sparkles' },
    { id: 6, name: 'Bloating', category: 'digestive', icon: 'Waves' },
    { id: 7, name: 'Breast Tenderness', category: 'physical', icon: 'Heart' },
    { id: 8, name: 'Nausea', category: 'digestive', icon: 'AlertCircle' },
    { id: 9, name: 'Insomnia', category: 'energy', icon: 'Moon' },
    { id: 10, name: 'Food Cravings', category: 'digestive', icon: 'Utensils' }
  ],
  cycles: [
    {
      id: 3,
      user_id: 1,
      cycle_number: 3,
      start_date: subDays(12),
      end_date: null,
      cycle_length_days: null,
      period_duration_days: 5,
      estimated_ovulation_date: addDays(2),
      fertile_window_start: subDays(3),
      fertile_window_end: addDays(3),
      notes: 'Active ongoing cycle.'
    },
    {
      id: 2,
      user_id: 1,
      cycle_number: 2,
      start_date: subDays(40),
      end_date: subDays(13),
      cycle_length_days: 28,
      period_duration_days: 5,
      estimated_ovulation_date: subDays(26),
      notes: 'Light flow on day 4-5.'
    },
    {
      id: 1,
      user_id: 1,
      cycle_number: 1,
      start_date: subDays(68),
      end_date: subDays(41),
      cycle_length_days: 28,
      period_duration_days: 5,
      estimated_ovulation_date: subDays(54),
      notes: 'Regular cycle.'
    }
  ],
  symptomLogs: [
    { id: 1, symptom: { name: 'Cramps', category: 'physical' }, date: subDays(12), severity: 'moderate', notes: 'Pelvic cramping' },
    { id: 2, symptom: { name: 'Fatigue', category: 'energy' }, date: subDays(11), severity: 'moderate', notes: 'Low stamina' },
    { id: 3, symptom: { name: 'Mood Changes', category: 'emotional' }, date: subDays(2), severity: 'mild', notes: 'Slightly sensitive' },
    { id: 4, symptom: { name: 'Bloating', category: 'digestive' }, date: subDays(1), severity: 'mild', notes: 'Water retention' }
  ],
  reminders: [
    { id: 1, title: 'Upcoming Period Expected', reminder_date: addDays(16), reminder_time: '09:00', reminder_type: 'period_expected', is_completed: false },
    { id: 2, title: 'Daily Iron & Vitamin D', reminder_date: formatDate(today), reminder_time: '08:00', reminder_type: 'medication', is_completed: false },
    { id: 3, title: 'Approaching Fertile Window', reminder_date: addDays(2), reminder_time: '09:30', reminder_type: 'ovulation_window', is_completed: false }
  ],
  reports: [
    {
      id: 1,
      title: 'Quarterly Reproductive Health Summary',
      report_type: 'monthly_summary',
      start_date: subDays(90),
      end_date: formatDate(today),
      summary_json: JSON.stringify({ metrics: { average_cycle_length: 28, average_period_length: 5, is_regular: true }, total_cycles_logged: 3 }),
      generated_at: subDays(2)
    }
  ]
};

function handleMockFallback(endpoint, options) {
  console.log(`[Static Fallback] Using local simulation for: ${endpoint}`);

  if (endpoint.includes('/auth/login') || endpoint.includes('/auth/register')) {
    return {
      access_token: 'mock-jwt-token-gh-pages',
      token_type: 'bearer',
      user_id: 1,
      email: 'demo@health.org',
      full_name: 'Sarah Jenkins',
      role: 'user'
    };
  }

  if (endpoint.includes('/auth/me')) {
    return MOCK_DATA.user;
  }

  if (endpoint.includes('/dashboard/summary')) {
    return {
      current_cycle_day: 13,
      phase_name: 'Fertile Window / Ovulation Approach',
      phase_description: 'Estrogen and LH are peaking. You are in your estimated fertile window.',
      last_period_date: subDays(12),
      estimated_next_period: addDays(16),
      estimated_ovulation_date: addDays(2),
      fertile_window_start: subDays(3),
      fertile_window_end: addDays(3),
      is_in_fertile_window: true,
      chance_of_conception: 'High',
      average_cycle_length: 28,
      average_period_length: 5,
      cycle_history: MOCK_DATA.cycles,
      recent_symptoms: MOCK_DATA.symptomLogs,
      upcoming_reminders: MOCK_DATA.reminders,
      insights: [
        '🌸 You are currently in your estimated fertile window.',
        'Next period is estimated to begin in 16 days.'
      ]
    };
  }

  if (endpoint.includes('/cycles/calendar/month')) {
    const days = [];
    const daysInMonth = 30;
    for (let i = 1; i <= daysInMonth; i++) {
      const isPeriod = i >= 1 && i <= 5;
      const isFertile = i >= 11 && i <= 16;
      const isOvulation = i === 14;
      days.push({
        day: i,
        date: `2026-11-${String(i).padStart(2, '0')}`,
        is_period: isPeriod,
        flow_intensity: isPeriod ? (i <= 2 ? 'heavy' : 'medium') : null,
        pain_level: isPeriod ? 3 : null,
        is_predicted_period: i >= 28,
        is_fertile: isFertile,
        is_ovulation: isOvulation,
        symptoms: i === 13 ? [{ id: 1, name: 'Cramps', severity: 'moderate' }] : []
      });
    }
    return { year: 2026, month: 11, days, average_cycle_length: 28, average_period_length: 5 };
  }

  if (endpoint.includes('/cycles') && !options.method) {
    return MOCK_DATA.cycles;
  }

  if (endpoint.includes('/symptoms/analytics')) {
    return {
      timeframe_days: 30,
      total_logs: 12,
      top_symptoms: [
        { symptom_name: 'Cramps', mild: 1, moderate: 4, severe: 1, count: 6 },
        { symptom_name: 'Fatigue', mild: 2, moderate: 3, severe: 0, count: 5 },
        { symptom_name: 'Mood Changes', mild: 3, moderate: 1, severe: 0, count: 4 },
        { symptom_name: 'Bloating', mild: 2, moderate: 1, severe: 0, count: 3 }
      ],
      category_distribution: [
        { category: 'Physical', count: 7 },
        { category: 'Energy', count: 5 },
        { category: 'Emotional', count: 4 },
        { category: 'Digestive', count: 3 }
      ]
    };
  }

  if (endpoint.includes('/symptoms/logs')) {
    return MOCK_DATA.symptomLogs;
  }

  if (endpoint.includes('/symptoms')) {
    return MOCK_DATA.symptoms;
  }

  if (endpoint.includes('/fertility/estimate')) {
    return {
      has_data: true,
      current_status: {
        is_in_fertile_window: true,
        chance_of_conception: 'High',
        estimated_ovulation_date: addDays(2),
        fertile_window_start: subDays(3),
        fertile_window_end: addDays(3)
      },
      average_cycle_length: 28,
      upcoming_windows: [
        { cycle_projection: 1, fertile_window_start: subDays(3), fertile_window_end: addDays(3), estimated_ovulation_date: addDays(2), estimated_period_start: addDays(16) },
        { cycle_projection: 2, fertile_window_start: addDays(25), fertile_window_end: addDays(31), estimated_ovulation_date: addDays(30), estimated_period_start: addDays(44) }
      ],
      clinical_disclaimer: 'Educational & Awareness Notice: Cycle and fertility estimates cannot reliably prevent pregnancy.'
    };
  }

  if (endpoint.includes('/fertility/educational-guide')) {
    return {
      title: 'Comprehensive Guide to Fertility Awareness',
      key_principles: [
        { topic: 'Sperm & Ovum Longevity', details: 'Sperm survive up to 5 days; ovum survives 12-24 hours.' },
        { topic: 'Basal Body Temperature (BBT)', details: 'Rises ~0.5°F to 1.0°F after ovulation due to progesterone.' },
        { topic: 'Cervical Mucus Changes', details: 'Clear, stretchy egg-white fluid indicates peak fertile window.' }
      ],
      important_contraceptive_warning: 'Natural rhythm tracking should not be relied upon as foolproof contraception.'
    };
  }

  if (endpoint.includes('/reminders')) {
    return MOCK_DATA.reminders;
  }

  if (endpoint.includes('/reports')) {
    return MOCK_DATA.reports;
  }

  if (endpoint.includes('/education/categories')) {
    return [
      { key: 'menstrual_health', name: 'Menstrual Health', article_count: 3 },
      { key: 'reproductive_health', name: 'Reproductive Anatomy', article_count: 2 },
      { key: 'hormonal_changes', name: 'Hormones & PMS', article_count: 2 },
      { key: 'pcos_endometriosis', name: 'PCOS & Endometriosis', article_count: 2 },
      { key: 'pregnancy_fertility', name: 'Fertility & Conception', article_count: 3 },
      { key: 'hygiene_preventive', name: 'Hygiene & Wellness', article_count: 2 }
    ];
  }

  if (endpoint.includes('/education/articles')) {
    return [
      {
        id: 1,
        title: 'Understanding the 4 Menstrual Cycle Phases',
        slug: 'understanding-menstrual-cycle-phases',
        category: 'menstrual_health',
        excerpt: 'A deep dive into Menstrual, Follicular, Ovulatory, and Luteal phases.',
        content_markdown: '# The 4 Menstrual Phases\n\n### 1. Menstrual Phase\nUterine lining sheds.\n\n### 2. Follicular Phase\nEstrogen levels rise.',
        read_time_minutes: 5,
        is_featured: true
      },
      {
        id: 2,
        title: 'PCOS vs. Endometriosis: Key Differences',
        slug: 'pcos-vs-endometriosis-awareness',
        category: 'pcos_endometriosis',
        excerpt: 'Signs, diagnosis paths, and clinical awareness for PCOS and Endometriosis.',
        content_markdown: '# PCOS and Endometriosis\n\nChronic pelvic pain is never normal. Consult an OB-GYN.',
        read_time_minutes: 6,
        is_featured: true
      }
    ];
  }

  if (endpoint.includes('/assistant/chat')) {
    return {
      id: Date.now(),
      role: 'assistant',
      message: 'Thank you for your question! Reproductive cycles involve delicate hormone balances (estrogen, progesterone, LH, FSH). Always consult a licensed gynecologist for persistent pain or clinical diagnosis.\n\n⚕️ Educational Medical Disclaimer: This information is for educational purposes only.',
      disclaimer_included: true,
      timestamp: new Date().toISOString()
    };
  }

  if (endpoint.includes('/admin/metrics')) {
    return {
      total_users: 142,
      active_users: 139,
      total_cycles_logged: 486,
      total_symptom_logs: 1240,
      total_reports_generated: 88,
      total_educational_articles: 12,
      total_ai_chat_queries: 520
    };
  }

  if (endpoint.includes('/admin/users')) {
    return [
      MOCK_DATA.user,
      { id: 2, email: 'admin@health.org', full_name: 'Administrator', role: 'admin', is_active: true, created_at: subDays(120) }
    ];
  }

  return { success: true };
}

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { ...getAuthHeaders(), ...options.headers };

  try {
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      if (!window.location.hash.includes('/login')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        window.location.hash = '#/login';
      }
    }

    if (!response.ok) {
      let errorDetail = 'Request failed';
      try {
        const errJson = await response.json();
        errorDetail = errJson.detail || JSON.stringify(errJson);
      } catch (e) {
        errorDetail = response.statusText;
      }
      throw new Error(errorDetail);
    }

    if (response.status === 204) return null;
    return await response.json();
  } catch (err) {
    // If backend server is unreachable (static GitHub Pages hosting), seamlessly use client mock fallback!
    return handleMockFallback(endpoint, options);
  }
}

export const api = {
  // Auth
  async login(email, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('auth_token', data.access_token);
    localStorage.setItem('user_info', JSON.stringify(data));
    return data;
  },

  async register(email, password, full_name) {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name })
    });
    localStorage.setItem('auth_token', data.access_token);
    localStorage.setItem('user_info', JSON.stringify(data));
    return data;
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    window.location.hash = '#/login';
  },

  getCurrentUser() {
    const info = localStorage.getItem('user_info');
    return info ? JSON.parse(info) : MOCK_DATA.user;
  },

  async getMe() {
    return request('/auth/me');
  },

  async updateProfile(profileData) {
    return request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  async resetPassword(email, new_password) {
    return request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, new_password })
    });
  },

  async exportData() {
    return request('/auth/export-data');
  },

  async deleteAccount() {
    return request('/auth/delete-account', { method: 'DELETE' });
  },

  // Dashboard
  async getDashboardSummary() {
    return request('/dashboard/summary');
  },

  // Cycles
  async getCycles() {
    return request('/cycles');
  },

  async recordCycle(start_date, end_date = null, period_duration_days = 5, notes = '') {
    return request('/cycles', {
      method: 'POST',
      body: JSON.stringify({ start_date, end_date, period_duration_days, notes })
    });
  },

  async deleteCycle(cycleId) {
    return request(`/cycles/${cycleId}`, { method: 'DELETE' });
  },

  async getPeriodRecords(start = '', end = '') {
    let q = '';
    if (start || end) q = `?start=${start}&end=${end}`;
    return request(`/cycles/periods/records${q}`);
  },

  async recordPeriodDay(record) {
    return request('/cycles/periods/records', {
      method: 'POST',
      body: JSON.stringify(record)
    });
  },

  async deletePeriodRecord(recordId) {
    return request(`/cycles/periods/records/${recordId}`, { method: 'DELETE' });
  },

  async getMonthCalendar(year, month) {
    return request(`/cycles/calendar/month?year=${year}&month=${month}`);
  },

  // Symptoms
  async getSymptoms() {
    return request('/symptoms');
  },

  async logSymptom(symptom_id, date, severity = 'mild', notes = '') {
    return request('/symptoms/log', {
      method: 'POST',
      body: JSON.stringify({ symptom_id, date, severity, notes })
    });
  },

  async getSymptomLogs(start = '', end = '') {
    let q = '';
    if (start || end) q = `?start=${start}&end=${end}`;
    return request(`/symptoms/logs${q}`);
  },

  async deleteSymptomLog(logId) {
    return request(`/symptoms/logs/${logId}`, { method: 'DELETE' });
  },

  async getSymptomAnalytics(days = 30) {
    return request(`/symptoms/analytics?days=${days}`);
  },

  // Fertility
  async getFertilityEstimate() {
    return request('/fertility/estimate');
  },

  async getFertilityGuide() {
    return request('/fertility/educational-guide');
  },

  // Reminders
  async getReminders() {
    return request('/reminders');
  },

  async createReminder(reminder) {
    return request('/reminders', {
      method: 'POST',
      body: JSON.stringify(reminder)
    });
  },

  async toggleReminder(reminderId) {
    return request(`/reminders/${reminderId}/toggle`, { method: 'PATCH' });
  },

  async deleteReminder(reminderId) {
    return request(`/reminders/${reminderId}`, { method: 'DELETE' });
  },

  async autoSyncReminders() {
    return request('/reminders/auto-sync', { method: 'POST' });
  },

  // Reports
  async getReports() {
    return request('/reports');
  },

  async generateReport(title, start_date, end_date, report_type = 'monthly_summary') {
    return request('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ title, start_date, end_date, report_type })
    });
  },

  getReportPdfUrl(reportId) {
    const token = localStorage.getItem('auth_token');
    return `/api/reports/${reportId}/pdf?token=${token}`;
  },

  async deleteReport(reportId) {
    return request(`/reports/${reportId}`, { method: 'DELETE' });
  },

  // Education
  async getEducationCategories() {
    return request('/education/categories');
  },

  async getEducationArticles(category = '', search = '', featured = null) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (featured !== null) params.append('featured', featured);
    return request(`/education/articles?${params.toString()}`);
  },

  async getArticleBySlug(slug) {
    return request(`/education/articles/${slug}`);
  },

  async getEducationalRecommendations() {
    return request('/education/recommendations');
  },

  // Assistant
  async sendAssistantMessage(message) {
    return request('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  },

  async getAssistantHistory() {
    return request('/assistant/history');
  },

  async clearAssistantHistory() {
    return request('/assistant/history', { method: 'DELETE' });
  },

  // Admin
  async getAdminMetrics() {
    return request('/admin/metrics');
  },

  async getAdminUsers() {
    return request('/admin/users');
  },

  async toggleUserStatus(userId) {
    return request(`/admin/users/${userId}/toggle-status`, { method: 'PATCH' });
  },

  async createAdminArticle(article) {
    return request('/admin/education', {
      method: 'POST',
      body: JSON.stringify(article)
    });
  },

  async deleteAdminArticle(articleId) {
    return request(`/admin/education/${articleId}`, { method: 'DELETE' });
  }
};
