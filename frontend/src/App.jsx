import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PeriodLogModal from './components/PeriodLogModal';
import SymptomLogModal from './components/SymptomLogModal';
import InstallPrompt from './components/InstallPrompt';

import DashboardPage from './pages/DashboardPage';
import CycleTrackingPage from './pages/CycleTrackingPage';
import SymptomTrackingPage from './pages/SymptomTrackingPage';
import FertilityPage from './pages/FertilityPage';
import RemindersPage from './pages/RemindersPage';
import ReportsPage from './pages/ReportsPage';
import EducationPage from './pages/EducationPage';
import AiAssistantPage from './pages/AiAssistantPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [periodModalOpen, setPeriodModalOpen] = useState(false);
  const [symptomModalOpen, setSymptomModalOpen] = useState(false);
  const location = useLocation();

  const getPageMeta = (pathname) => {
    switch (pathname) {
      case '/':
        return { title: 'Health Overview', subtitle: 'Personalized cycle tracker & wellness insights' };
      case '/cycles':
        return { title: 'Cycle & Monthly Calendar', subtitle: 'Menstrual period dates & phase history' };
      case '/symptoms':
        return { title: 'Symptom Logger & Trends', subtitle: 'Physical & hormonal trends over time' };
      case '/fertility':
        return { title: 'Fertility Awareness', subtitle: 'Estimated fertile window & ovulation forecast' };
      case '/reminders':
        return { title: 'Health Reminders', subtitle: 'Personal alerts for periods, fertility & medicine' };
      case '/reports':
        return { title: 'Health Reports', subtitle: 'Comprehensive PDF health summary documents' };
      case '/education':
        return { title: 'Educational Library', subtitle: 'Verified medical articles & reproductive guides' };
      case '/assistant':
        return { title: 'AI Health Assistant', subtitle: 'Educational conversational assistant with disclaimers' };
      case '/admin':
        return { title: 'Admin Dashboard', subtitle: 'System usage, patient accounts & content publishing' };
      case '/profile':
        return { title: 'Health Profile & Settings', subtitle: 'Cycle parameters, notifications & privacy' };
      default:
        return { title: 'Reproductive Health System', subtitle: '' };
    }
  };

  const meta = getPageMeta(location.pathname);

  return (
    <div className="min-h-screen bg-[#faf7fd] flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenPeriodModal={() => setPeriodModalOpen(true)}
          onOpenSymptomModal={() => setSymptomModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-8">
          <Routes>
            <Route
              path="/"
              element={
                <DashboardPage
                  onOpenPeriodModal={() => setPeriodModalOpen(true)}
                  onOpenSymptomModal={() => setSymptomModalOpen(true)}
                />
              }
            />
            <Route
              path="/cycles"
              element={
                <CycleTrackingPage
                  onOpenPeriodModal={() => setPeriodModalOpen(true)}
                />
              }
            />
            <Route
              path="/symptoms"
              element={
                <SymptomTrackingPage
                  onOpenSymptomModal={() => setSymptomModalOpen(true)}
                />
              }
            />
            <Route path="/fertility" element={<FertilityPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/assistant" element={<AiAssistantPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Modals */}
      <PeriodLogModal
        isOpen={periodModalOpen}
        onClose={() => setPeriodModalOpen(false)}
        onSuccess={() => {
          // Trigger reload by re-navigating or event
          window.location.reload();
        }}
      />

      <SymptomLogModal
        isOpen={symptomModalOpen}
        onClose={() => setSymptomModalOpen(false)}
        onSuccess={() => {
          window.location.reload();
        }}
      />

      {/* PWA Add to Home Screen Banner */}
      <InstallPrompt />
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('auth_token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('auth_token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <HashRouter>
      {token ? (
        <AppLayout />
      ) : (
        <Routes>
          <Route path="/login" element={<AuthPage onLoginSuccess={() => setToken(localStorage.getItem('auth_token'))} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </HashRouter>
  );
}
