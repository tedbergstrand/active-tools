import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Heart, Clock, Activity, Wrench } from 'lucide-react';
import { Header } from '../components/layout/Header.jsx';
import { ToolCard } from '../components/tools/ToolCard.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { toolsApi } from '../api/tools.js';
import { formatSessionTime } from '../utils/buildSteps.js';
import { formatRelative } from '../utils/dates.js';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'warmup', label: 'Warm-Up' },
  { value: 'footwork', label: 'Footwork' },
  { value: 'movement', label: 'Movement' },
  { value: 'power', label: 'Power' },
  { value: 'power-endurance', label: 'Power Endurance' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'technique', label: 'Technique' },
  { value: 'game', label: 'Games' },
  { value: 'rhythm', label: 'Rhythm' },
  { value: 'grip', label: 'Grip' },
  { value: 'position', label: 'Position' },
  { value: 'session', label: 'Session' },
  { value: 'cooldown', label: 'Cool-Down' },
  { value: 'competition', label: 'Competition' },
];


export default function TrainingTools() {
  const navigate = useNavigate();
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [recentIds, setRecentIds] = useState([]);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    Promise.all([
      toolsApi.list(),
      toolsApi.getFavorites().catch(() => []),
      toolsApi.recentTools().catch(() => []),
      toolsApi.stats().catch(() => null),
      toolsApi.history({ limit: 8 }).catch(() => []),
    ]).then(([allTools, favs, recent, statsData, history]) => {
      setTools(allTools);
      setFavoriteIds(favs);
      setRecentIds(recent);
      setStats(statsData);
      setRecentActivity(history);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const favorites = useMemo(() => {
    if (favoriteIds.length === 0) return [];
    return favoriteIds.map(id => tools.find(t => t.id === id)).filter(Boolean);
  }, [tools, favoriteIds]);

  const recentTools = useMemo(() => {
    if (recentIds.length === 0) return [];
    return recentIds
      .filter(id => !favoriteIds.includes(id))
      .map(id => tools.find(t => t.id === id))
      .filter(Boolean)
      .slice(0, 6);
  }, [tools, recentIds, favoriteIds]);

  const filtered = useMemo(() => {
    let result = tools;
    if (category !== 'all') {
      result = result.filter(t => t.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.trains?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [tools, category, search]);

  const gridRef = useRef(null);

  const showSections = !search && category === 'all';
  const isFirstTime = !stats || stats.totalSessions === 0;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <Header title="Training Tools" />

      {/* First-time guidance */}
      {isFirstTime && showSections && (
        <div className="bg-gradient-to-br from-blue-600/10 to-violet-600/10 border border-blue-500/20 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Wrench size={20} className="text-violet-400" />
            <h2 className="text-lg font-bold text-white">On-the-wall coaching</h2>
          </div>
          <p className="text-sm text-gray-200 leading-relaxed">
            Training tools give you audio-guided drills you can use while climbing.
            Hit start, put your phone down, and follow the voice cues.
            Try a warm-up first, then pick a skill to work on.
          </p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setCategory('warmup')}
              className="px-4 py-2.5 text-sm font-medium rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-colors"
            >
              Warm-Up Tools
            </button>
            <button
              onClick={() => setCategory('footwork')}
              className="px-4 py-2.5 text-sm font-medium rounded-xl bg-[#1a1d27] border border-[#2e3347] text-gray-200 hover:bg-[#1f2333] active:bg-[#252838] transition-colors"
            >
              Footwork Drills
            </button>
          </div>
        </div>
      )}

      {/* Stats bar — only shown when user has sessions */}
      {stats && stats.totalSessions > 0 && showSections && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1a1d27] border border-[#2e3347] rounded-xl px-4 py-3">
            <div className="text-sm text-gray-400">This Week</div>
            <div className="text-xl font-bold">{stats.weekSessions} <span className="text-sm font-normal text-gray-400">sessions</span></div>
            <div className="text-sm text-gray-400">{formatSessionTime(stats.weekSeconds)}</div>
          </div>
          <div className="bg-[#1a1d27] border border-[#2e3347] rounded-xl px-4 py-3">
            <div className="text-sm text-gray-400">All Time</div>
            <div className="text-xl font-bold">{stats.totalSessions} <span className="text-sm font-normal text-gray-400">sessions</span></div>
            <div className="text-sm text-gray-400">{formatSessionTime(stats.totalSeconds)}</div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search tools..."
          className="w-full bg-[#0f1117] border border-[#2e3347] rounded-xl pl-10 pr-4 py-3 text-base text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Favorites section */}
      {showSections && favorites.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
            <Heart size={15} className="text-red-400" /> Favorites
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {favorites.map(tool => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isFavorite
                onClick={() => navigate(`/tools/${tool.slug}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recently used section */}
      {showSections && recentTools.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
            <Clock size={15} className="text-blue-400" /> Recently Used
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentTools.map(tool => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onClick={() => navigate(`/tools/${tool.slug}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      {showSections && recentActivity.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
            <Activity size={15} className="text-emerald-400" /> Recent Activity
          </h3>
          <div className="space-y-1.5">
            {recentActivity.map(s => (
              <button
                key={s.id}
                onClick={() => navigate(`/tools/${s.tool_slug}`)}
                className="w-full bg-[#0f1117] rounded-xl px-4 py-3 flex items-center justify-between hover:bg-[#1a1d27] active:bg-[#252838] transition-colors text-left min-h-[44px]"
              >
                <span className="text-sm text-gray-100">{s.tool_name}</span>
                <div className="flex items-center gap-3 text-sm text-gray-400 tabular-nums">
                  <span>{formatSessionTime(s.duration_seconds)}</span>
                  <span>{formatRelative(s.created_at)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      {showSections && (favorites.length > 0 || recentTools.length > 0 || recentActivity.length > 0 || isFirstTime) && (
        <div className="border-t border-[#2e3347]" />
      )}

      {/* Category tabs — larger touch targets */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => {
              setCategory(cat.value);
              gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }}
            className={`px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap transition-colors shrink-0
              ${category === cat.value
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'bg-[#1a1d27] text-gray-300 border border-[#2e3347] hover:text-white active:bg-[#252838]'
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div ref={gridRef} className="text-sm text-gray-400">
        {filtered.length} tool{filtered.length !== 1 ? 's' : ''}
        {category !== 'all' && ` in ${CATEGORIES.find(c => c.value === category)?.label}`}
      </div>

      {/* Tool grid */}
      {filtered.length === 0 ? (
        <EmptyState title="No tools found" description="Try a different category or search term." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(tool => (
            <ToolCard
              key={tool.id}
              tool={tool}
              isFavorite={favoriteIds.includes(tool.id)}
              onClick={() => navigate(`/tools/${tool.slug}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
