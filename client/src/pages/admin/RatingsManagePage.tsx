
import { FormEvent, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Star,
  RefreshCw,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';

type RatingSource = 'GOOGLE' | 'TRIPADVISOR';

interface RatingSnapshot {
  id: string;
  source: RatingSource;
  score: number;
  totalReviews: number;
  fetchedAt: string;
}

const SOURCES: {
  value: RatingSource;
  label: string;
  color: string;
  bg: string;
}[] = [
  {
    value: 'GOOGLE',
    label: 'Google Reviews',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    value: 'TRIPADVISOR',
    label: 'TripAdvisor',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
];

export default function RatingsManagePage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<{
    source: RatingSource;
    score: string;
    totalReviews: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [syncing, setSyncing] = useState<RatingSource | null>(null);
  const [showSetup, setShowSetup] = useState(false);

  const { data: ratings = [], isLoading } = useQuery<RatingSnapshot[]>({
    queryKey: ['admin-ratings'],
    queryFn: async () => (await api.get('/ratings')).data,
  });

  const getRating = (source: RatingSource) =>
    ratings.find((r) => r.source === source);

  const startEdit = (source: RatingSource) => {
    const current = getRating(source);
    setEditing({
      source,
      score: current ? String(current.score) : '4.8',
      totalReviews: current ? String(current.totalReviews) : '0',
    });
    setError('');
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError('');
    try {
      const score = parseFloat(editing.score);
      const totalReviews = parseInt(editing.totalReviews);
      if (isNaN(score) || score < 0 || score > 5)
        throw new Error('Score must be between 0 and 5');
      if (isNaN(totalReviews) || totalReviews < 0)
        throw new Error('Total reviews must be a positive number');

      await api.post('/ratings', {
        source: editing.source,
        score,
        totalReviews,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-ratings'] });
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      queryClient.invalidateQueries({ queryKey: ['home-ratings'] });
      setEditing(null);
      setNotice('Rating updated successfully');
      setTimeout(() => setNotice(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const sync = async (source: RatingSource) => {
    setSyncing(source);
    setError('');
    try {
      await api.post(`/ratings/sync/${source.toLowerCase()}`);
      queryClient.invalidateQueries({ queryKey: ['admin-ratings'] });
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      setNotice(`Synced ${source === 'GOOGLE' ? 'Google' : 'TripAdvisor'} rating`);
      setTimeout(() => setNotice(''), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Could not sync. Check API keys in server .env'
      );
    } finally {
      setSyncing(null);
    }
  };

  /* ---- Computed ---- */
  const overall = (() => {
    if (ratings.length === 0) return 0;
    const totalReviews = ratings.reduce((s, r) => s + r.totalReviews, 0);
    if (totalReviews === 0) return 0;
    const weighted = ratings.reduce(
      (s, r) => s + Number(r.score) * r.totalReviews,
      0
    );
    return weighted / totalReviews;
  })();

  const totalReviews = ratings.reduce((s, r) => s + r.totalReviews, 0);

  /* ---- Loading ---- */
  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl">
        <Skeleton className="h-9 w-64 mb-2 rounded" />
        <Skeleton className="h-4 w-96 mb-8 rounded" />
        <Skeleton className="h-32 rounded-card mb-6" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-card" />
          <Skeleton className="h-64 rounded-card" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* ============ HEADER ============ */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-mid">
          Reputation
        </p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-primary">
          Ratings & Reviews
        </h1>
        <p className="mt-1 text-sm text-neutral-mid">
          Manage the Google and TripAdvisor ratings displayed on the public
          site.
        </p>
      </div>

      {/* ============ TOASTS ============ */}
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-input bg-red-50 p-4">
          <AlertCircle className="text-error shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-error flex-1">{error}</p>
          <button
            onClick={() => setError('')}
            className="text-error hover:opacity-70"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {notice && (
        <div className="mb-5 flex items-start gap-3 rounded-input bg-green-50 p-4">
          <CheckCircle2
            className="text-green-600 shrink-0 mt-0.5"
            size={20}
          />
          <p className="text-sm text-green-800 flex-1">{notice}</p>
        </div>
      )}

      {/* ============ OVERALL CARD ============ */}
      <div className="card p-6 mb-6 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="grid md:grid-cols-[auto_1fr_auto] gap-6 items-center">
          <div className="text-center md:text-left">
            <p className="text-xs font-medium text-neutral-mid uppercase tracking-wide mb-1">
              Overall rating
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-heading font-bold text-primary leading-none">
                {overall > 0 ? overall.toFixed(1) : '—'}
              </span>
              <span className="text-sm text-neutral-mid">/ 5.0</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex text-accent">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={20}
                    fill={i <= Math.round(overall) ? 'currentColor' : 'none'}
                    className={
                      i <= Math.round(overall) ? '' : 'text-gray-300'
                    }
                  />
                ))}
              </div>
              <span className="text-sm text-neutral-mid">
                {totalReviews > 0
                  ? `${totalReviews.toLocaleString()} total reviews`
                  : 'No reviews yet'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-neutral-mid">
              <TrendingUp size={12} className="text-primary" />
              Combined average from all sources
            </div>
          </div>

          <div className="text-center md:text-right">
            <p className="text-xs text-neutral-mid mb-1">Sources</p>
            <p className="font-heading text-2xl font-bold text-primary">
              {ratings.length}
              <span className="text-sm font-normal text-neutral-mid">/2</span>
            </p>
          </div>
        </div>
      </div>

      {/* ============ SOURCE CARDS ============ */}
      <div className="grid gap-6 md:grid-cols-2">
        {SOURCES.map(({ value, label, color, bg }) => {
          const current = getRating(value);
          const isEditing = editing?.source === value;
          const isSyncing = syncing === value;

          return (
            <div key={value} className="card p-6 relative">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <span
                    className={`inline-block text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${bg} ${color}`}
                  >
                    {label}
                  </span>
                  <p className="text-xs text-neutral-mid mt-2 flex items-center gap-1">
                    {current ? (
                      <>
                        <CheckCircle2 size={12} className="text-green-600" />
                        Last synced{' '}
                        {new Date(current.fetchedAt).toLocaleDateString()}
                      </>
                    ) : (
                      <>
                        <AlertCircle size={12} className="text-yellow-600" />
                        Not configured yet
                      </>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => sync(value)}
                  disabled={isSyncing}
                  className="rounded-button p-2 text-neutral-mid hover:bg-neutral-light disabled:opacity-50"
                  title="Sync from API"
                >
                  {isSyncing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <RefreshCw size={16} />
                  )}
                </button>
              </div>

              {/* Content */}
              {!isEditing ? (
                <>
                  <div className="mb-5">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-heading font-bold text-primary">
                        {current ? Number(current.score).toFixed(1) : '—'}
                      </span>
                      <span className="text-sm text-neutral-mid">/ 5.0</span>
                    </div>
                    <div className="flex text-accent mb-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={20}
                          fill={
                            current && i <= Math.round(Number(current.score))
                              ? 'currentColor'
                              : 'none'
                          }
                          className={
                            current && i <= Math.round(Number(current.score))
                              ? ''
                              : 'text-gray-300'
                          }
                        />
                      ))}
                    </div>
                    <p className="text-sm text-neutral-mid">
                      {current
                        ? `${current.totalReviews.toLocaleString()} reviews`
                        : 'No data yet'}
                    </p>
                  </div>
                  <button
                    onClick={() => startEdit(value)}
                    className="btn-secondary w-full text-sm"
                  >
                    Edit manually
                  </button>
                </>
              ) : (
                <form onSubmit={save} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label text-xs">Score (0–5)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={editing.score}
                        onChange={(e) =>
                          setEditing({ ...editing, score: e.target.value })
                        }
                        className="input"
                        required
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="label text-xs">Total reviews</label>
                      <input
                        type="number"
                        min="0"
                        value={editing.totalReviews}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            totalReviews: e.target.value,
                          })
                        }
                        className="input"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary flex-1 text-sm"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="animate-spin" size={14} />
                          Saving…
                        </>
                      ) : (
                        <>
                          <Save size={14} /> Save
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className="btn-secondary text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          );
        })}
      </div>

      {/* ============ SETUP INFO (collapsible) ============ */}
      <div className="mt-6 card p-5 bg-neutral-light border-0">
        <button
          onClick={() => setShowSetup(!showSetup)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <Info size={16} className="text-primary" />
            <span className="font-semibold text-neutral-dark text-sm">
              Automatic sync setup
            </span>
          </div>
          {showSetup ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showSetup && (
          <div className="mt-4 pt-4 border-t border-neutral-light/50">
            <p className="text-sm text-neutral-mid leading-relaxed mb-3">
              To enable automatic sync from Google and TripAdvisor, set API keys
              in{' '}
              <code className="bg-white px-1.5 py-0.5 rounded text-xs">
                server/.env
              </code>
              :
            </p>
            <pre className="bg-white px-3 py-2 rounded text-xs text-neutral-dark overflow-x-auto">
              {`GOOGLE_PLACES_API_KEY=...
GOOGLE_PLACE_ID=...
TRIPADVISOR_API_KEY=...
TRIPADVISOR_LOCATION_ID=...`}
            </pre>
            <p className="text-xs text-neutral-mid mt-3">
              Without API keys, sync will save default values (4.8 / 4.7) and
              you can still edit manually.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
