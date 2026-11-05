import React from 'react';
import { Menu, Plus, Droplet, Activity } from 'lucide-react';

export default function Header({
  title,
  subtitle,
  onOpenSidebar,
  onOpenPeriodModal,
  onOpenSymptomModal,
  cycleDay,
  phaseName
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-purple-100 px-4 sm:px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-xl text-purple-700 hover:bg-purple-50"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-purple-950 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-purple-500 font-medium hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Phase tag and quick action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {cycleDay && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-xs font-semibold text-purple-800">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
              <span>Day {cycleDay} • {phaseName}</span>
            </div>
          )}

          {onOpenPeriodModal && (
            <button
              onClick={onOpenPeriodModal}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-200 transition-all hover:scale-[1.02]"
            >
              <Droplet className="w-4 h-4 fill-white" />
              <span>Log Period</span>
            </button>
          )}

          {onOpenSymptomModal && (
            <button
              onClick={onOpenSymptomModal}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-purple-100 hover:bg-purple-200 text-purple-800 transition-all"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Log Symptom</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
