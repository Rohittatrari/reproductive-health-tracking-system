const API_BASE = '/api';

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
  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Only redirect if not already on login/register
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      window.location.href = '/login';
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
  return response.json();
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
    window.location.href = '/login';
  },

  getCurrentUser() {
    const info = localStorage.getItem('user_info');
    return info ? JSON.parse(info) : null;
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
