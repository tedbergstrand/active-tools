import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Clock, Heart, ListChecks, ChevronDown, ChevronUp, Volume2 } from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { ToolConfigModal } from '../components/tools/ToolConfigModal.jsx';
import { useToolSession } from '../components/tools/ToolSessionContext.jsx';
import { toolsApi } from '../api/tools.js';
import { useToast } from '../components/common/Toast.jsx';
import { getStepSummary, estimateSessionTime, formatSessionTime } from '../utils/buildSteps.js';
import { useSpeech, warmUpSpeech } from '../hooks/useSpeech.js';

const difficultyColors = { beginner: 'green', intermediate: 'amber', advanced: 'red' };

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000) return 'Today';
  if (diff < 172800000) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function ToolSession() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toolSession = useToolSession();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [history, setHistory] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [audioTested, setAudioTested] = useState(false);
  const toast = useToast();
  const { speak } = useSpeech();

  const testAudio = useCallback(() => {
    warmUpSpeech();
    speak('Audio is working. You will hear callouts like this during your session.');
    setAudioTested(true);
  }, [speak]);

  useEffect(() => {
    setAudioTested(false);
    setShowSteps(false);
    setLoading(true);
    toolsApi.get(slug).then(data => {
      setTool(data);
      setLoading(false);
      toolsApi.history({ tool_id: data.id, limit: 5 }).then(setHistory).catch(() => {});
      toolsApi.getFavorites().then(favs => setIsFavorite(favs.includes(data.id))).catch(() => {});
    }).catch(() => { setLoading(false); toast.error('Failed to load tool'); });
  }, [slug]);

  const defaultConfig = tool?.default_config ? JSON.parse(tool.default_config) : {};

  const stepSummary = useMemo(() => {
    if (!tool) return [];
    try { return getStepSummary(tool, defaultConfig); } catch { return []; }
  }, [tool]);

  const estimated = useMemo(() => {
    if (!tool) return 0;
    try { return estimateSessionTime(tool, defaultConfig); } catch { return 0; }
  }, [tool]);

  const handleStart = (config) => {
    toolSession.startSession(tool, config);
    setShowConfig(false);
  };

  const toggleFavorite = async () => {
    if (!tool) return;
    try {
      if (isFavorite) {
        await toolsApi.removeFavorite(tool.id);
        setIsFavorite(false);
      } else {
        await toolsApi.addFavorite(tool.id);
        setIsFavorite(true);
      }
    } catch (e) { toast.error('Failed to update favorite'); }
  };

  if (loading) return <LoadingSpinner />;

  if (!tool) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-300 text-lg">Tool not found</p>
        <Button variant="ghost" onClick={() => navigate('/tools')} className="mt-4">
          <ArrowLeft size={18} /> Back to Tools
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top bar: back + favorite */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/tools')} size="sm">
          <ArrowLeft size={18} /> Back
        </Button>
        <button
          onClick={toggleFavorite}
          className="p-2.5 rounded-lg hover:bg-[#1f2333] active:bg-[#252838] transition-colors"
        >
          <Heart
            size={22}
            className={isFavorite ? 'text-red-400 fill-red-400' : 'text-gray-500'}
          />
        </button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{tool.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge color={difficultyColors[tool.difficulty] || 'gray'}>{tool.difficulty}</Badge>
          {estimated > 0 && (
            <span className="flex items-center gap-1 text-sm text-gray-300">
              <Clock size={14} className="text-blue-400" />
              {formatSessionTime(estimated)}
            </span>
          )}
        </div>
      </div>

      <p className="text-base text-gray-300 leading-relaxed">{tool.description}</p>

      {/* Primary actions — always visible without scrolling */}
      <div className="space-y-3">
        <Button onClick={() => setShowConfig(true)} size="lg" className="w-full text-lg">
          <Play size={22} /> Start Session
        </Button>
        <button
          onClick={testAudio}
          className={`w-full flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-xl transition-colors ${
            audioTested
              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
              : 'text-gray-300 bg-[#1a1d27] border border-[#2e3347] hover:text-white active:bg-[#252838]'
          }`}
        >
          <Volume2 size={18} />
          {audioTested ? 'Audio working' : 'Test audio before climbing'}
        </button>
      </div>

      {/* Expandable details below the fold */}
      {tool.trains && (
        <div className="bg-[#1a1d27] border border-[#2e3347] rounded-xl p-4">
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">Trains</span>
          <p className="text-sm text-gray-200 mt-1">{tool.trains}</p>
        </div>
      )}

      {tool.instructions && (
        <div className="bg-[#1a1d27] border border-[#2e3347] rounded-xl p-4">
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">Instructions</span>
          <p className="text-sm text-gray-200 mt-1.5 whitespace-pre-line leading-relaxed">{tool.instructions}</p>
        </div>
      )}

      {/* Session structure preview */}
      {stepSummary.length > 0 && (
        <div className="bg-[#1a1d27] border border-[#2e3347] rounded-xl p-4 space-y-3">
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="w-full flex items-center justify-between"
          >
            <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">
              Session Structure
            </span>
            <span className="flex items-center gap-1.5 text-sm text-gray-300">
              {stepSummary.length} steps
              {showSteps ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>
          {showSteps && (
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {stepSummary.map((step, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-[#2e3347]/50 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      step.type === 'rest' ? 'bg-emerald-400' : 'bg-blue-400'
                    }`} />
                    <span className="text-gray-200">{step.label}</span>
                  </div>
                  {step.duration > 0 && (
                    <span className="text-gray-400 tabular-nums">{formatSessionTime(step.duration)}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Session history */}
      {history.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Past Sessions</h3>
          <div className="space-y-2">
            {history.map(s => (
              <div key={s.id} className="bg-[#0f1117] rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-200">{formatDate(s.created_at)}</span>
                <span className="text-sm text-gray-400 tabular-nums">{formatSessionTime(s.duration_seconds)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <ToolConfigModal
        open={showConfig}
        onClose={() => setShowConfig(false)}
        tool={tool}
        onStart={handleStart}
      />
    </div>
  );
}
