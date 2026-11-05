import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Activity,
  Heart,
  Bell,
  FileText,
  BookOpen,
  Bot,
  Shield,
  User,
  LogOut,
  X,
  Sparkles
} from 'lucide-react';
import { api } from '../api';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const currentUser = api.getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/cycles', label: 'Cycle & Calendar', icon: Calendar },
    { to: '/symptoms', label: 'Symptoms & Trends', icon: Activity },
    { to: '/fertility', label: 'Fertility Awareness', icon: Heart },
    { to: '/reminders', label: 'Health Reminders', icon: Bell },
    { to: '/reports', label: 'Reports & PDF', icon: FileText },
    { to: '/education', label: 'Educational Library', icon: BookOpen },
    { to: '/assistant', label: 'AI Health Assistant', icon: Bot, badge: 'AI' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin Portal', icon: Shield, badge: 'Admin' }] : []),
    { to: '/profile', label: 'My Health Profile', icon: User },
  ];

  const handleLogout = () => {
    api.logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white/95 border-r border-purple-100 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-purple-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-purple-950 tracking-tight leading-none">
                AuraHealth
              </h1>
              <p className="text-xs text-purple-500 font-medium mt-1">
                Reproductive Care & Tracker
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-sm shadow-purple-300 font-semibold'
                      : 'text-purple-900/70 hover:text-purple-950 hover:bg-purple-50/70'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer Card */}
        <div className="p-4 border-t border-purple-50 bg-purple-50/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-pink-200 text-pink-700 flex items-center justify-center font-bold text-sm shrink-0">
                {currentUser?.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-purple-950 truncate">
                  {currentUser?.full_name || 'Sarah Jenkins'}
                </p>
                <p className="text-xs text-purple-500 truncate">
                  {currentUser?.email || 'user@health.org'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-purple-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
