import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  Mail,
  MapPin,
  AlertCircle,
  Image as ImageIcon,
  CheckSquare,
  Square,
} from 'lucide-react';
import { api } from '@/lib/api';
import { mediaUrl } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import type { GuestExperience } from '@/types';

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

const STATUS_META: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  PENDING: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  APPROVED: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
};

export default function ExperiencesManagePage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  const { data: stories, isLoading } = useQuery<GuestExperience[]>({
    queryKey: ['admin-experiences'],
    queryFn: async () => (await api.get('/experiences/admin')).data,
  });

  /* ---- Update single ---- */
  const update = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await api.patch(`/experiences/${id}/status`, { status });
      queryClient.invalidateQueries({ queryKey: ['admin-experiences'] });
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      queryClient.invalidateQueries({ queryKey: ['recent-experiences'] });
      setNotice(`Story ${status.toLowerCase()}`);
      setTimeout(() => setNotice(''), 2500);
    } finally {
      setUpdating(null);
    }
  };

  /* ---- Bulk update ---- */
  const bulkUpdate = async (status: string) => {
    if (selectedIds.size === 0) return;
    await Promise.all(
      Array.from(selectedIds).map((id) =>
        api.patch(`/experiences/${id}/status`, { status })
      )
    );
    queryClient.invalidateQueries({ queryKey: ['admin-experiences'] });
    queryClient.invalidateQueries({ queryKey: ['experiences'] });
    setSelectedIds(new Set());
    setNotice(`${selectedIds.size} stories ${status.toLowerCase()}`);
    setTimeout(() => setNotice(''), 2500);
  };

  /* ---- Filter + search ---- */
  const filtered = useMemo(() => {
    if (!stories) return [];
    let result = stories;
    if (filter !== 'ALL') {
      result = result.filter((s) => s.status === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.guestName.toLowerCase().includes(q) ||
          s.country.toLowerCase().includes(q) ||
          s.guestEmail?.toLowerCase().includes(q)
      );
    }
    return [...result].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [stories, filter, search]);

  /* ---- Stats ---- */
  const stats = useMemo(() => {
    const list = stories ?? [];
    return {
      total: list.length,
      pending: list.filter((s) => s.status === 'PENDING').length,
      approved: list.filter((s) => s.status === 'APPROVED').length,
      rejected: list.filter((s) => s.status === 'REJECTED').length,
    };
  }, [stories]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((s) => s.id)));
    }
  };

  /* ---- Loading ---- */
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <Skeleton className="h-9 w-56 mb-2 rounded" />
        <Skeleton className="h-4 w-72 mb-8 rounded" />
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-card" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-card" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* ============ HEADER ============ */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary">
          Guest Stories
        </h1>
        <p className="text-sm text-neutral-mid mt-1">
          Review, approve, or reject guest experiences before they appear on
          the public site.
        </p>
      </div>

      {/* ============ TOAST ============ */}
      {notice && (
        <div className="mb-4 flex items-center gap-2 rounded-input bg-green-50 px-4 py-3 text-sm text-green-800">
          <CheckCircle2 size={16} className="text-green-600" />
          {notice}
        </div>
      )}

      {/* ============ STATS ============ */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatBox
          label="Pending"
          value={stats.pending}
          color="text-yellow-600"
          bg="bg-yellow-50"
          icon={Clock}
        />
        <StatBox
          label="Approved"
          value={stats.approved}
          color="text-green-600"
          bg="bg-green-50"
          icon={CheckCircle2}
        />
        <StatBox
          label="Rejected"
          value={stats.rejected}
          color="text-red-600"
          bg="bg-red-50"
          icon={XCircle}
        />
      </div>

      {/* ============ FILTERS ============ */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-mid"
          />
          <input
            type="text"
            placeholder="Search by guest, country, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-mid hover:text-neutral-dark"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex gap-1 overflow-x-auto">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as StatusFilter[]).map(
            (f) => {
              const count =
                f === 'ALL'
                  ? stories?.length ?? 0
                  : stories?.filter((s) => s.status === f).length ?? 0;
              const label =
                f === 'ALL'
                  ? 'All'
                  : STATUS_META[f]?.label ?? f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-2 rounded-button text-sm font-medium whitespace-nowrap transition-colors ${
                    filter === f
                      ? 'bg-primary text-white'
                      : 'bg-white text-neutral-dark hover:bg-neutral-light'
                  }`}
                >
                  {label}{' '}
                  <span
                    className={
                      filter === f ? 'text-white/70' : 'text-neutral-mid'
                    }
                  >
                    ({count})
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* ============ BULK ACTION BAR ============ */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-card bg-primary/5 border border-primary/20 px-4 py-3">
          <p className="text-sm font-medium text-neutral-dark">
            {selectedIds.size} selected
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => bulkUpdate('APPROVED')}
              className="btn-primary text-sm py-2 px-4"
            >
              <CheckCircle2 size={14} /> Approve all
            </button>
            <button
              onClick={() => bulkUpdate('REJECTED')}
              className="btn-secondary text-sm py-2 px-4"
            >
              <XCircle size={14} /> Reject all
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-sm text-neutral-mid hover:text-neutral-dark px-2"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ============ TABLE ============ */}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b bg-neutral-light">
            <tr>
              <th className="w-10 pl-4">
                <button
                  onClick={toggleSelectAll}
                  className="text-neutral-mid hover:text-primary"
                >
                  {selectedIds.size === filtered.length &&
                  filtered.length > 0 ? (
                    <CheckSquare size={16} />
                  ) : (
                    <Square size={16} />
                  )}
                </button>
              </th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wide text-neutral-dark">
                Guest
              </th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wide text-neutral-dark">
                Rating
              </th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wide text-neutral-dark">
                Story
              </th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wide text-neutral-dark">
                Media
              </th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wide text-neutral-dark">
                Status
              </th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center">
                  <AlertCircle
                    className="mx-auto text-neutral-mid mb-2"
                    size={32}
                  />
                  <p className="text-neutral-mid">
                    {search
                      ? 'No stories match your search.'
                      : filter !== 'ALL'
                      ? `No ${filter.toLowerCase()} stories.`
                      : 'No guest stories yet.'}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((story) => {
                const meta = STATUS_META[story.status] ?? STATUS_META.PENDING;
                const StatusIcon = meta.icon;
                const expanded = expandedId === story.id;
                const selected = selectedIds.has(story.id);
                const isUpdating = updating === story.id;
                const media = story.media ?? [];

                return (
                  <>
                    <tr
                      key={story.id}
                      className={`border-b border-neutral-light hover:bg-neutral-light/40 transition-colors ${
                        selected ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="pl-4">
                        <button
                          onClick={() => toggleSelect(story.id)}
                          className="text-neutral-mid hover:text-primary"
                        >
                          {selected ? (
                            <CheckSquare size={16} className="text-primary" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-neutral-dark">
                          {story.guestName}
                        </p>
                        <p className="text-xs text-neutral-mid">
                          {story.country}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex text-accent">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i <= story.rating ? 'currentColor' : 'none'}
                              className={
                                i <= story.rating ? '' : 'text-gray-300'
                              }
                            />
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-neutral-mid max-w-xs">
                        <p className="line-clamp-2">{story.story}</p>
                      </td>
                      <td className="p-4">
                        {media.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                            <ImageIcon size={12} />
                            {media.length}
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-mid">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${meta.color}`}
                        >
                          <StatusIcon size={12} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="p-4 pr-4">
                        <button
                          onClick={() =>
                            setExpandedId(expanded ? null : story.id)
                          }
                          className="p-1.5 rounded-button hover:bg-neutral-light text-neutral-mid"
                          aria-label="Expand"
                        >
                          {expanded ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="bg-neutral-light/30 border-b border-neutral-light">
                        <td colSpan={7} className="p-6">
                          <div className="grid md:grid-cols-[1fr_300px] gap-6">
                            {/* Left: full story */}
                            <div>
                              <h4 className="text-xs font-bold uppercase text-neutral-mid mb-2">
                                Full story
                              </h4>
                              <p className="text-sm text-neutral-dark leading-relaxed mb-4">
                                "{story.story}"
                              </p>
                              <div className="flex flex-wrap gap-4 text-xs text-neutral-mid">
                                <span className="flex items-center gap-1">
                                  <Mail size={12} />
                                  {story.guestEmail ?? '—'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} />
                                  {story.country}
                                </span>
                                <span className="flex items-center gap-1">
                                  Via:{' '}
                                  {story.verifiedVia === 'GOOGLE'
                                    ? 'Google'
                                    : 'TripAdvisor'}
                                </span>
                              </div>
                            </div>

                            {/* Right: actions */}
                            <div>
                              <h4 className="text-xs font-bold uppercase text-neutral-mid mb-2">
                                Actions
                              </h4>
                              <div className="space-y-2">
                                {story.status !== 'APPROVED' && (
                                  <button
                                    onClick={() => update(story.id, 'APPROVED')}
                                    disabled={isUpdating}
                                    className="btn-primary w-full text-sm py-2"
                                  >
                                    <CheckCircle2 size={14} /> Approve
                                  </button>
                                )}
                                {story.status !== 'REJECTED' && (
                                  <button
                                    onClick={() => update(story.id, 'REJECTED')}
                                    disabled={isUpdating}
                                    className="btn-secondary w-full text-sm py-2 text-error border-error hover:bg-red-50 hover:text-error"
                                  >
                                    <XCircle size={14} /> Reject
                                  </button>
                                )}
                                {story.status !== 'PENDING' && (
                                  <button
                                    onClick={() => update(story.id, 'PENDING')}
                                    disabled={isUpdating}
                                    className="w-full text-sm py-2 text-neutral-mid hover:text-neutral-dark"
                                  >
                                    Set to pending
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Media grid */}
                          {media.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-neutral-light">
                              <h4 className="text-xs font-bold uppercase text-neutral-mid mb-2">
                                Media ({media.length})
                              </h4>
                              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                {media.map((m, i) => (
                                  <a
                                    key={i}
                                    href={mediaUrl(m.url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="aspect-square rounded-lg overflow-hidden bg-neutral-light hover:opacity-80 transition-opacity"
                                  >
                                    {m.type === 'IMAGE' ? (
                                      <img
                                        src={mediaUrl(m.url)}
                                        alt={`Media ${i + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-neutral-mid">
                                        <Eye size={20} />
                                      </div>
                                    )}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-neutral-mid">
        Showing {filtered.length} of {stories?.length ?? 0} stories
      </p>
    </div>
  );
}

/* -------------------- StatBox -------------------- */
function StatBox({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
  bg: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-medium text-neutral-mid uppercase tracking-wide">
          {label}
        </p>
        <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center`}>
          <Icon size={16} className={color} />
        </div>
      </div>
      <p className="text-2xl font-heading font-bold text-neutral-dark">
        {value}
      </p>
    </div>
  );
}
