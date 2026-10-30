import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  X,
  Mail,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  MessageCircle,
  Trash2,
  AlertCircle,
  ExternalLink,
  Reply,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

type ContactStatus = 'NEW' | 'READ' | 'REPLIED';
type Filter = 'ALL' | ContactStatus;

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
}

const STATUS_META: Record<
  ContactStatus,
  { label: string; color: string; icon: any }
> = {
  NEW: {
    label: 'New',
    color: 'bg-blue-100 text-blue-800',
    icon: MessageCircle,
  },
  READ: {
    label: 'Read',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  REPLIED: {
    label: 'Replied',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle2,
  },
};

export default function ContactManagePage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const { data: messages, isLoading } = useQuery<ContactMessage[]>({
    queryKey: ['admin-contact'],
    queryFn: async () => (await api.get('/contact/admin')).data,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-contact'] });
  };

  /* ---- Update status ---- */
  const updateStatus = async (id: string, status: ContactStatus) => {
    setError('');
    try {
      await api.patch(`/contact/${id}/status`, { status });
      refresh();
      setNotice(`Marked as ${status.toLowerCase()}`);
      setTimeout(() => setNotice(''), 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not update status.');
    }
  };

  /* ---- Delete ---- */
  const remove = async (id: string) => {
    if (!window.confirm('Delete this message permanently?')) return;
    setError('');
    try {
      await api.delete(`/contact/${id}`);
      refresh();
      setExpandedId(null);
      setNotice('Message deleted');
      setTimeout(() => setNotice(''), 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not delete message.');
    }
  };

  /* ---- Stats ---- */
  const stats = useMemo(() => {
    const list = messages ?? [];
    return {
      total: list.length,
      newCount: list.filter((m) => m.status === 'NEW').length,
      replied: list.filter((m) => m.status === 'REPLIED').length,
    };
  }, [messages]);

  /* ---- Filter + search ---- */
  const filtered = useMemo(() => {
    if (!messages) return [];
    let result = messages;
    if (filter !== 'ALL') {
      result = result.filter((m) => m.status === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q)
      );
    }
    return result;
  }, [messages, filter, search]);

  /* ---- Loading ---- */
  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl">
        <Skeleton className="h-9 w-56 mb-2 rounded" />
        <Skeleton className="h-4 w-80 mb-8 rounded" />
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
    <div className="mx-auto max-w-6xl">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary">
          Contact Messages
        </h1>
        <p className="text-sm text-neutral-mid mt-1">
          Review, reply, and manage messages from the contact form.
        </p>
      </div>

      {/* TOASTS */}
      {notice && (
        <div className="mb-4 flex items-center gap-2 rounded-input bg-green-50 px-4 py-3 text-sm text-green-800">
          <CheckCircle2 size={16} className="text-green-600" />
          {notice}
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-input bg-red-50 px-4 py-3 text-sm text-error">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatBox label="Total" value={stats.total} icon={Mail} color="text-primary" />
        <StatBox
          label="New"
          value={stats.newCount}
          icon={MessageCircle}
          color="text-blue-600"
          highlight={stats.newCount > 0}
        />
        <StatBox
          label="Replied"
          value={stats.replied}
          icon={CheckCircle2}
          color="text-green-600"
        />
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-mid"
          />
          <input
            type="text"
            placeholder="Search by name, email, or subject…"
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
          {(['ALL', 'NEW', 'READ', 'REPLIED'] as Filter[]).map((f) => {
            const count =
              f === 'ALL'
                ? messages?.length ?? 0
                : messages?.filter((m) => m.status === f).length ?? 0;
            const label = f === 'ALL' ? 'All' : STATUS_META[f].label;
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
          })}
        </div>
      </div>

      {/* LIST */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="mx-auto text-neutral-mid mb-2" size={40} />
            <p className="text-neutral-mid">
              {search
                ? 'No messages match your search.'
                : filter !== 'ALL'
                ? `No ${filter.toLowerCase()} messages.`
                : 'No contact messages yet.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-light">
            {filtered.map((msg) => {
              const meta = STATUS_META[msg.status];
              const StatusIcon = meta.icon;
              const expanded = expandedId === msg.id;

              return (
                <div key={msg.id}>
                  {/* Row summary */}
                  <button
                    onClick={() =>
                      setExpandedId(expanded ? null : msg.id)
                    }
                    className="w-full text-left px-4 py-4 hover:bg-neutral-light/40 transition-colors flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-semibold text-primary">
                      {msg.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-neutral-dark">
                          {msg.name}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${meta.color}`}
                        >
                          <StatusIcon size={10} />
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-neutral-dark mt-1 truncate">
                        {msg.subject}
                      </p>
                      <p className="text-xs text-neutral-mid truncate mt-0.5">
                        {msg.message}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-xs text-neutral-mid whitespace-nowrap">
                        {formatDate(msg.createdAt)}
                      </p>
                      {expanded ? (
                        <ChevronUp
                          className="ml-auto text-neutral-mid mt-2"
                          size={16}
                        />
                      ) : (
                        <ChevronDown
                          className="ml-auto text-neutral-mid mt-2"
                          size={16}
                        />
                      )}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {expanded && (
                    <div className="px-4 pb-5 pl-[calc(1rem+40px+0.75rem)] bg-neutral-light/30">
                      <div className="bg-white rounded-card p-4 mt-2">
                        <p className="text-sm text-neutral-dark whitespace-pre-wrap leading-relaxed">
                          {msg.message}
                        </p>
                        <div className="mt-4 pt-4 border-t border-neutral-light flex items-center justify-between flex-wrap gap-2">
                          <a
                            href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            <Mail size={14} /> {msg.email}
                          </a>
                          <p className="text-xs text-neutral-mid">
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <a
                          href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                          onClick={() => updateStatus(msg.id, 'REPLIED')}
                          className="btn-primary text-sm py-2 px-4"
                        >
                          <Reply size={14} /> Reply via email
                        </a>
                        {msg.status === 'NEW' && (
                          <button
                            onClick={() => updateStatus(msg.id, 'READ')}
                            className="btn-secondary text-sm py-2 px-4"
                          >
                            <Clock size={14} /> Mark as read
                          </button>
                        )}
                        {msg.status !== 'REPLIED' && (
                          <button
                            onClick={() => updateStatus(msg.id, 'REPLIED')}
                            className="btn-secondary text-sm py-2 px-4"
                          >
                            <CheckCircle2 size={14} /> Mark as replied
                          </button>
                        )}
                        <button
                          onClick={() => remove(msg.id)}
                          className="text-sm py-2 px-4 text-error border border-error/30 rounded-button hover:bg-red-50"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-neutral-mid">
        Showing {filtered.length} of {messages?.length ?? 0} messages
      </p>
    </div>
  );
}

/* ---- StatBox ---- */
function StatBox({
  label,
  value,
  icon: Icon,
  color,
  highlight,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div className={`card p-4 ${highlight ? 'border-2 border-blue-200' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-medium text-neutral-mid uppercase tracking-wide">
          {label}
        </p>
        <Icon size={16} className={color} />
      </div>
      <p className="text-2xl font-heading font-bold text-neutral-dark">
        {value}
      </p>
    </div>
  );
}
