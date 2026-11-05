import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Clock,
  Sparkles,
  Tag,
  X,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { api } from '../api';

export default function EducationPage() {
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [activeArticle, setActiveArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const [cats, arts, recs] = await Promise.all([
        api.getEducationCategories(),
        api.getEducationArticles(selectedCategory, search),
        api.getEducationalRecommendations()
      ]);
      setCategories(cats);
      setArticles(arts);
      setRecommendations(recs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [selectedCategory, search]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-purple-950 flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-purple-600" />
            <span>Reproductive Health Education Library</span>
          </h2>
          <p className="text-xs sm:text-sm text-purple-500 font-medium mt-1">
            Clinically verified articles on menstrual phases, hormones, fertility, PCOS, and preventive care
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics (e.g. cramps, PCOS)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-purple-50/70 border border-purple-100 text-xs font-medium text-purple-950 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
          />
        </div>
      </div>

      {/* Personalized AI Recommendations Banner */}
      {recommendations.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-r from-purple-50 via-pink-50 to-purple-50 border border-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-pink-600" />
            <h3 className="font-bold text-sm text-purple-950">Recommended For You</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
              Based on your recent cycle & symptoms
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recommendations.slice(0, 3).map((art) => (
              <div
                key={`rec-${art.id}`}
                onClick={() => setActiveArticle(art)}
                className="p-4 rounded-2xl bg-white border border-purple-100 hover:border-pink-300 transition-all cursor-pointer shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm text-purple-950 line-clamp-1">{art.title}</h4>
                  <p className="text-xs text-purple-600/80 mt-1 line-clamp-2">{art.excerpt}</p>
                </div>
                <div className="flex items-center justify-between mt-3 text-[11px] font-semibold text-pink-600">
                  <span>{art.read_time_minutes} min read</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === ''
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white border border-purple-100 text-purple-900 hover:bg-purple-50'
          }`}
        >
          All Topics
        </button>
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setSelectedCategory(c.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === c.key
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white border border-purple-100 text-purple-900 hover:bg-purple-50'
            }`}
          >
            {c.name} ({c.article_count})
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((art) => (
          <div
            key={art.id}
            onClick={() => setActiveArticle(art)}
            className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs hover:shadow-md hover:border-purple-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-purple-500 mb-2">
                <span className="uppercase tracking-wider text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  {art.category.replace('_', ' ')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{art.read_time_minutes} min</span>
                </span>
              </div>

              <h3 className="font-bold text-lg text-purple-950 mt-2 line-clamp-2">
                {art.title}
              </h3>

              <p className="text-xs text-purple-700/80 mt-2 line-clamp-3 leading-relaxed">
                {art.excerpt}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-purple-50 flex items-center justify-between">
              <span className="text-xs font-bold text-purple-600 flex items-center gap-1">
                Read Guide <ChevronRight className="w-3.5 h-3.5" />
              </span>
              {art.is_featured && (
                <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                  Featured
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Article Detail Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-10 shadow-2xl border border-purple-100 overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between pb-4 border-b border-purple-100">
              <div className="min-w-0 pr-4">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
                  {activeArticle.category.replace('_', ' ')}
                </span>
                <h2 className="text-2xl font-bold text-purple-950 mt-2 leading-tight">
                  {activeArticle.title}
                </h2>
                <p className="text-xs text-purple-500 mt-1 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{activeArticle.read_time_minutes} min read</span>
                </p>
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Markdown rendered body */}
            <div className="mt-6 prose prose-purple max-w-none text-sm text-purple-950 leading-relaxed whitespace-pre-line">
              {activeArticle.content_markdown}
            </div>

            {/* Medical Disclaimer Note */}
            <div className="mt-8 p-4 rounded-2xl bg-purple-50 border border-purple-100 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <p className="text-xs text-purple-800 leading-relaxed">
                <span className="font-bold">Clinical Disclaimer:</span> Content is provided for educational and health literacy purposes only and does not substitute professional medical diagnosis or personalized treatment plans.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
