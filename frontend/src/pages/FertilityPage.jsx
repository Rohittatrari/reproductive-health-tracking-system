import React, { useState, useEffect } from 'react';
import {
  Heart,
  Sparkles,
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { api } from '../api';

export default function FertilityPage() {
  const [data, setData] = useState(null);
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getFertilityEstimate(), api.getFertilityGuide()])
      .then(([est, g]) => {
        setData(est);
        setGuide(g);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentStatus = data?.current_status;
  const isFertile = currentStatus?.is_in_fertile_window;
  const conceptionChance = currentStatus?.chance_of_conception;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Fertility Banner */}
      <div className="bg-linear-to-r from-pink-600 via-purple-600 to-indigo-600 text-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-pink-100 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-4">
            <Heart className="w-3.5 h-3.5 fill-pink-200 text-pink-200" />
            <span>Fertility Awareness & Ovulation</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Fertility Window & Conception Estimates
          </h2>

          <p className="text-sm text-pink-100 mt-3 leading-relaxed">
            Estimates are calculated using your historical cycle lengths and the biological standard 14-day luteal phase model.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="px-5 py-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
              <p className="text-xs text-pink-200 font-semibold uppercase">Current Window</p>
              <p className="text-xl font-bold text-white mt-0.5">
                {isFertile ? 'In Fertile Window' : 'Outside Fertile Window'}
              </p>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
              <p className="text-xs text-pink-200 font-semibold uppercase">Chance of Conception</p>
              <p className="text-xl font-bold text-white mt-0.5">{conceptionChance}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contraceptive Warning Alert Card (Crucial requirement) */}
      <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 flex items-start gap-3.5">
        <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm text-amber-950 uppercase tracking-wide">
            Important Contraception & Family Planning Advisory
          </h4>
          <p className="text-xs sm:text-sm text-amber-900 mt-1 leading-relaxed">
            {data?.clinical_disclaimer || guide?.important_contraceptive_warning}
          </p>
        </div>
      </div>

      {/* Projected Upcoming Fertile Windows */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xs">
        <h3 className="font-bold text-lg text-purple-950 flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          <span>Upcoming Projected Fertile Windows</span>
        </h3>
        <p className="text-xs text-purple-500 mb-6">
          Forecast of your next 3 fertile windows and ovulation dates based on your {data?.average_cycle_length || 28}-day average cycle
        </p>

        {data?.upcoming_windows && data.upcoming_windows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.upcoming_windows.map((w, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">
                      Cycle +{w.cycle_projection}
                    </span>
                    <Sparkles className="w-4 h-4 text-pink-500" />
                  </div>

                  <p className="text-xs font-bold text-purple-900 uppercase">Fertile Window Range</p>
                  <p className="text-sm font-bold text-purple-950 mt-1">
                    {w.fertile_window_start} to {w.fertile_window_end}
                  </p>

                  <div className="mt-4 pt-3 border-t border-purple-100">
                    <p className="text-xs font-semibold text-pink-700">Estimated Ovulation Day:</p>
                    <p className="text-base font-bold text-pink-900 mt-0.5">{w.estimated_ovulation_date}</p>
                  </div>
                </div>

                <p className="text-[11px] text-purple-500 mt-4">
                  Expected period starts: {w.estimated_period_start}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-purple-400">
            Log your latest period to generate upcoming fertility projections.
          </div>
        )}
      </div>

      {/* Educational Guide Cards */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xs">
        <h3 className="font-bold text-lg text-purple-950 flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <span>Biological Principles of Fertility Awareness</span>
        </h3>
        <p className="text-xs text-purple-500 mb-6">
          Verified medical indicators used to detect fertile days and ovulation
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {guide?.key_principles?.map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-purple-50/30 border border-purple-100/70">
              <h4 className="font-bold text-sm text-purple-950 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                {item.topic}
              </h4>
              <p className="text-xs sm:text-sm text-purple-900/80 mt-2 leading-relaxed">
                {item.details}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
