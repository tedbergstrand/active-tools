import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header.jsx';
import { WorkoutCard } from '../components/workout/WorkoutCard.jsx';
import { Card } from '../components/common/Card.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Tabs } from '../components/common/Tabs.jsx';
import { Button } from '../components/common/Button.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { useToast } from '../components/common/Toast.jsx';
import { workoutsApi } from '../api/workouts.js';
import { toolsApi } from '../api/tools.js';
import { formatRelative, formatDate } from '../utils/dates.js';
import { formatSeconds } from '../utils/formatters.js';
import { Search, X, Wrench, Clock, Play } from 'lucide-react';

const viewTabs = [
  { value: 'workouts', label: 'Workouts' },
  { value: 'tools', label: 'Tool Sessions' },
];

const categoryTabs = [
  { value: '', label: 'All' },
  { value: 'roped', label: 'Roped' },
  { value: 'bouldering', label: 'Bouldering' },
  { value: 'traditional', label: 'Training' },
];

export function WorkoutHistory() {
  const navigate = useNavigate();
  const toast = useToast();
  const [view, setView] = useState('workouts');

  // Workout state
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [workouts, setWorkouts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Tool session state
  const [sessions, setSessions] = useState([]);
  const [toolsLoading, setToolsLoading] = useState(false);

  const searchRef = useRef(search);
  searchRef.current = search;

  const fetchWorkouts = useCallback(() => {
    setLoading(true);
    const params = { limit, offset };
    if (category) params.category = category;
    if (searchRef.current) params.search = searchRef.current;
    workoutsApi.list(params)
      .then(res => { setWorkouts(res.workouts); setTotal(res.total); })
      .catch(() => toast.error('Failed to load workouts'))
      .finally(() => setLoading(false));
  }, [category, offset, toast]);

  const fetchSessions = useCallback(() => {
    setToolsLoading(true);
    toolsApi.history({ limit: 50 })
      .then(setSessions)
      .catch(() => toast.error('Failed to load tool sessions'))
      .finally(() => setToolsLoading(false));
  }, [toast]);

  useEffect(() => { setOffset(0); }, [category]);
  useEffect(() => { if (view === 'workouts') fetchWorkouts(); }, [fetchWorkouts, view]);
  useEffect(() => { if (view === 'tools') fetchSessions(); }, [fetchSessions, view]);

  const handleSearch = (e) => {
    e.preventDefault();
    setOffset(0);
    fetchWorkouts();
  };

  return (
    <div className="space-y-6">
      <Header title="History" />

      <Tabs tabs={viewTabs} active={view} onChange={setView} />

      {view === 'workouts' && (
        <>
          <div className="flex flex-wrap items-end gap-4">
            <Tabs tabs={categoryTabs} active={category} onChange={setCategory} />
            <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-[200px]">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search notes, location..."
                  className="w-full bg-[#0f1117] border border-[#2e3347] rounded-lg pl-9 pr-8 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                {search && (
                  <button type="button" onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    <X size={14} />
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="text-sm text-gray-500">{total} workout{total !== 1 ? 's' : ''}</div>

          {loading ? (
            <LoadingSpinner className="py-12" />
          ) : workouts.length === 0 ? (
            <EmptyState icon={Search} title="No workouts found" description={search ? 'Try a different search term' : 'Start logging workouts to see them here'} />
          ) : (
            <div className="space-y-3">
              {workouts.map(w => <WorkoutCard key={w.id} workout={w} />)}
            </div>
          )}

          {total > limit && (
            <div className="flex items-center justify-center gap-3">
              <Button variant="secondary" size="sm" disabled={offset === 0} onClick={() => setOffset(o => Math.max(0, o - limit))}>Previous</Button>
              <span className="text-sm text-gray-500">{Math.floor(offset / limit) + 1} / {Math.ceil(total / limit)}</span>
              <Button variant="secondary" size="sm" disabled={offset + limit >= total} onClick={() => setOffset(o => o + limit)}>Next</Button>
            </div>
          )}
        </>
      )}

      {view === 'tools' && (
        <>
          {toolsLoading ? (
            <LoadingSpinner className="py-12" />
          ) : sessions.length === 0 ? (
            <EmptyState icon={Wrench} title="No sessions yet" description="Complete a training tool session to see history here">
              <Button className="mt-3" onClick={() => navigate('/tools')}><Play size={16} /> Browse Tools</Button>
            </EmptyState>
          ) : (
            <div className="space-y-3">
              {sessions.map(session => {
                let rounds = null;
                try {
                  const results = session.results ? JSON.parse(session.results) : null;
                  rounds = results?.rounds;
                } catch (e) { /* corrupted JSON — skip */ }
                return (
                  <Card key={session.id} onClick={() => navigate(`/tools/${session.tool_slug}`)} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-100">{session.tool_name}</span>
                          <Badge color="gray">{session.tool_category}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span>{formatDate(session.date)}</span>
                          <span className="text-gray-600">{formatRelative(session.date)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-400">
                        <Clock size={14} />
                        <span>{formatSeconds(session.duration_seconds)}</span>
                      </div>
                    </div>
                    {rounds > 0 && (
                      <div className="mt-2 text-sm text-gray-500">{rounds} rounds completed</div>
                    )}
                    {session.notes && (
                      <p className="mt-2 text-sm text-gray-500 line-clamp-1">{session.notes}</p>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
