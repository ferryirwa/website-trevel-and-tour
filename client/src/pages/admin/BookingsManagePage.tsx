import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Package as PackageIcon,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  DollarSign,
  CreditCard,
  Download,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Booking } from '@/types';

/* -------------------- Config -------------------- */
const STATUS_OPTIONS = ['PENDING', 'PAID', 'COMPLETED', 'CANCELLED'] as const;
type StatusFilter = 'ALL' | (typeof STATUS_OPTIONS)[number];
type SortKey = 'date' | 'total' | 'guest' | 'status';
type SortDir = 'asc' | 'desc';

const statusMeta: Record<string, { label: string; color: string; icon: any; dot: string }> = {
  PENDING: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    dot: 'bg-yellow-500',
    icon: Clock,
  },
  PAID: {
    label: 'Paid',
    color: 'bg-green-100 text-green-800',
    dot: 'bg-green-500',
    icon: CheckCircle2,
  },
  COMPLETED: {
    label: 'Completed',
    color: 'bg-blue-100 text-blue-800',
    dot: 'bg-blue-500',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    dot: 'bg-red-500',
    icon: XCircle,
  },
};

/* -------------------- Component -------------------- */
export default function BookingsManagePage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selected, setSelected] = useState<Booking | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['admin-bookings'],
    queryFn: async () => (await api.get('/bookings')).data,
  });

  /* ---- Update status ---- */
  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/bookings/${id}/status`, { status });
    queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    setSelected(null);
  };

  /* ---- Stats ---- */
  const stats = useMemo(() => {
    const list = bookings ?? [];
    const paidRevenue = list
      .filter((b) => b.status === 'PAID' || b.status === 'COMPLETED')
      .reduce((s, b) => s + Number(b.totalAmount), 0);
    const pendingRevenue = list
      .filter((b) => b.status === 'PENDING')
      .reduce((s, b) => s + Number(b.totalAmount), 0);
    return {
      total: list.length,
      pending: list.filter((b) => b.status === 'PENDING').length,
      paid: list.filter((b) => b.status === 'PAID').length,
      completed: list.filter((b) => b.status === 'COMPLETED').length,
      revenue: paidRevenue,
      pendingRevenue,
    };
  }, [bookings]);

  /* ---- Filter + sort ---- */
  const filtered = useMemo(() => {
    if (!bookings) return [];
    let result = bookings;

    if (statusFilter !== 'ALL') {
      result = result.filter((b) => b.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.bookingCode.toLowerCase().includes(q) ||
          b.guestName.toLowerCase().includes(q) ||
          b.guestEmail.toLowerCase().includes(q) ||
          b.guestCountry?.toLowerCase().includes(q) ||
          b.package?.nameEn?.toLowerCase().includes(q)
      );
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    result = [...result].sort((a, b) => {
      switch (sortKey) {
        case 'date':
          return (
            dir *
            (new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime())
          );
        case 'total':
          return dir * (Number(a.totalAmount) - Number(b.totalAmount));
        case 'guest':
          return dir * a.guestName.localeCompare(b.guestName);
        case 'status':
          return dir * a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return result;
  }, [bookings, statusFilter, search, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  /* ---- Export CSV ---- */
  const exportCsv = () => {
    const headers = [
      'Code',
      'Guest',
      'Email',
      'Phone',
      'Country',
      'Tour',
      'Date',
      'Time',
      'Adults',
      'Children',
      'Total',
      'Status',
    ];
    const rows = filtered.map((b) => [
      b.bookingCode,
      b.guestName,
      b.guestEmail,
      b.guestPhone,
      b.guestCountry,
      b.package?.nameEn ?? '',
      new Date(b.bookingDate).toISOString().slice(0, 10),
      b.timeSlot,
      b.adults,
      b.children,
      b.totalAmount,
      b.status,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---- Loading ---- */
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <Skeleton className="h-9 w-48 mb-2 rounded" />
        <Skeleton className="h-4 w-72 mb-8 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary">Bookings</h1>
          <p className="text-sm text-neutral-mid mt-1">
            Manage bookings, verify payments, and update status.
          </p>
        </div>
        <button onClick={exportCsv} className="btn-secondary text-sm">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* ============ STATS ============ */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatBox label="Total" value={String(stats.total)} icon={PackageIcon} color="text-primary" />
        <StatBox
          label="Pending"
          value={String(stats.pending)}
          icon={Clock}
          color="text-yellow-600"
          hint={stats.pending > 0 ? formatCurrency(stats.pendingRevenue) : undefined}
          highlight={stats.pending > 0}
        />
        <StatBox label="Paid" value={String(stats.paid)} icon={CheckCircle2} color="text-green-600" />
        <StatBox
          label="Completed"
          value={String(stats.completed)}
          icon={CheckCircle2}
          color="text-blue-600"
        />
        <StatBox
          label="Revenue"
          value={formatCurrency(stats.revenue)}
          icon={DollarSign}
          color="text-primary"
          hint="paid + completed"
        />
      </div>

      {/* ============ FILTERS ============ */}
      <div className="flex flex-col lg:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-mid"
          />
          <input
            type="text"
            placeholder="Search by code, guest, email, or tour…"
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
          <FilterTab
            active={statusFilter === 'ALL'}
            onClick={() => setStatusFilter('ALL')}
            count={bookings?.length ?? 0}
          >
            All
          </FilterTab>
          {STATUS_OPTIONS.map((s) => (
            <FilterTab
              key={s}
              active={statusFilter === s}
              onClick={() => setStatusFilter(s)}
              count={bookings?.filter((b) => b.status === s).length ?? 0}
            >
              {statusMeta[s].label}
            </FilterTab>
          ))}
        </div>
      </div>

      {/* ============ TABLE ============ */}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="border-b bg-neutral-light">
            <tr>
              <th className="w-10"></th>
              <th className="p-4 text-xs font-semibold uppercase tracking-wide text-neutral-dark">
                Reference
              </th>
              <SortHeader
                label="Guest"
                active={sortKey === 'guest'}
                dir={sortDir}
                onClick={() => toggleSort('guest')}
              />
              <th className="p-4 text-xs font-semibold uppercase tracking-wide text-neutral-dark">
                Tour
              </th>
              <SortHeader
                label="Date"
                active={sortKey === 'date'}
                dir={sortDir}
                onClick={() => toggleSort('date')}
              />
              <th className="p-4 text-xs font-semibold uppercase tracking-wide text-neutral-dark">
                Guests
              </th>
              <SortHeader
                label="Total"
                active={sortKey === 'total'}
                dir={sortDir}
                onClick={() => toggleSort('total')}
              />
              <SortHeader
                label="Status"
                active={sortKey === 'status'}
                dir={sortDir}
                onClick={() => toggleSort('status')}
              />
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-12 text-center">
                  <AlertCircle className="mx-auto text-neutral-mid mb-2" size={32} />
                  <p className="text-neutral-mid">
                    {search
                      ? 'No bookings match your search.'
                      : statusFilter !== 'ALL'
                      ? `No ${statusFilter.toLowerCase()} bookings.`
                      : 'No bookings yet.'}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((booking) => {
                const meta = statusMeta[booking.status] ?? statusMeta.PENDING;
                const StatusIcon = meta.icon;
                const expanded = expandedId === booking.id;

                return (
                  <>
                    <tr
                      key={booking.id}
                      className="border-b border-neutral-light hover:bg-neutral-light/40 transition-colors"
                    >
                      <td className="p-2 pl-4">
                        <button
                          onClick={() =>
                            setExpandedId(expanded ? null : booking.id)
                          }
                          className="p-1 rounded hover:bg-neutral-light text-neutral-mid"
                        >
                          {expanded ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-xs font-semibold text-primary">
                          {booking.bookingCode}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-neutral-dark">
                          {booking.guestName}
                        </p>
                        <p className="text-xs text-neutral-mid truncate max-w-[180px]">
                          {booking.guestEmail}
                        </p>
                      </td>
                      <td className="p-4 text-neutral-dark truncate max-w-[180px]">
                        {booking.package?.nameEn ?? '—'}
                      </td>
                      <td className="p-4 text-neutral-mid whitespace-nowrap">
                        {formatDate(booking.bookingDate)}
                      </td>
                      <td className="p-4 text-neutral-mid whitespace-nowrap">
                        {booking.adults}A
                        {booking.children > 0 && ` · ${booking.children}C`}
                      </td>
                      <td className="p-4 font-semibold text-primary whitespace-nowrap">
                        {formatCurrency(booking.totalAmount)}
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
                          onClick={() => setSelected(booking)}
                          className="p-1.5 rounded-button hover:bg-primary/10 text-primary"
                          aria-label="View details"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="bg-neutral-light/30 border-b border-neutral-light">
                        <td colSpan={9} className="p-6">
                          <div className="grid md:grid-cols-3 gap-6">
                            <div>
                              <h4 className="text-xs font-bold uppercase text-neutral-mid mb-2">
                                Contact
                              </h4>
                              <div className="space-y-1.5 text-sm">
                                <div className="flex items-center gap-2 text-neutral-dark">
                                  <Mail size={14} className="text-neutral-mid" />
                                  <a
                                    href={`mailto:${booking.guestEmail}`}
                                    className="text-primary hover:underline truncate"
                                  >
                                    {booking.guestEmail}
                                  </a>
                                </div>
                                <div className="flex items-center gap-2 text-neutral-dark">
                                  <Phone size={14} className="text-neutral-mid" />
                                  <a
                                    href={`tel:${booking.guestPhone}`}
                                    className="text-primary hover:underline"
                                  >
                                    {booking.guestPhone}
                                  </a>
                                </div>
                                <div className="flex items-center gap-2 text-neutral-dark">
                                  <MapPin size={14} className="text-neutral-mid" />
                                  {booking.guestCountry}
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold uppercase text-neutral-mid mb-2">
                                Tour
                              </h4>
                              <div className="space-y-1.5 text-sm">
                                <div className="flex items-center gap-2 text-neutral-dark">
                                  <PackageIcon size={14} className="text-neutral-mid" />
                                  {booking.package?.nameEn}
                                </div>
                                <div className="flex items-center gap-2 text-neutral-dark">
                                  <Calendar size={14} className="text-neutral-mid" />
                                  {formatDate(booking.bookingDate)} · {booking.timeSlot}
                                </div>
                                <div className="flex items-center gap-2 text-neutral-dark">
                                  <Users size={14} className="text-neutral-mid" />
                                  {booking.adults} adult
                                  {booking.adults !== 1 ? 's' : ''}
                                  {booking.children > 0 &&
                                    `, ${booking.children} children`}
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold uppercase text-neutral-mid mb-2">
                                Quick actions
                              </h4>
                              <div className="space-y-2">
                                <select
                                  value={booking.status}
                                  onChange={(e) =>
                                    updateStatus(booking.id, e.target.value)
                                  }
                                  className="input text-sm"
                                >
                                  {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>
                                      {statusMeta[s].label}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => setSelected(booking)}
                                  className="btn-secondary w-full text-sm"
                                >
                                  <Eye size={14} /> Full details
                                </button>
                              </div>
                            </div>
                          </div>
                          {booking.notes && (
                            <div className="mt-4 pt-4 border-t border-neutral-light">
                              <h4 className="text-xs font-bold uppercase text-neutral-mid mb-1">
                                Notes
                              </h4>
                              <p className="text-sm text-neutral-dark">{booking.notes}</p>
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

      <div className="mt-3 flex items-center justify-between text-xs text-neutral-mid">
        <span>
          Showing {filtered.length} of {bookings?.length ?? 0} bookings
        </span>
        <span>
          Revenue (paid): <strong className="text-primary">{formatCurrency(stats.revenue)}</strong>
        </span>
      </div>

      {/* ============ MODAL ============ */}
      {selected && (
        <BookingDetailModal
          booking={selected}
          onClose={() => setSelected(null)}
          onUpdateStatus={updateStatus}
        />
      )}
    </div>
  );
}

/* -------------------- Helpers -------------------- */
function StatBox({
  label,
  value,
  icon: Icon,
  color,
  hint,
  highlight,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`card p-4 ${highlight ? 'border-2 border-yellow-400/50' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-medium text-neutral-mid uppercase tracking-wide">
          {label}
        </p>
        <Icon size={16} className={color} />
      </div>
      <p className="text-2xl font-heading font-bold text-neutral-dark">{value}</p>
      {hint && <p className="text-xs text-neutral-mid mt-0.5">{hint}</p>}
    </div>
  );
}

function FilterTab({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-button text-sm font-medium whitespace-nowrap transition-colors ${
        active
          ? 'bg-primary text-white'
          : 'bg-white text-neutral-dark hover:bg-neutral-light'
      }`}
    >
      {children}{' '}
      <span className={active ? 'text-white/70' : 'text-neutral-mid'}>
        ({count})
      </span>
    </button>
  );
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: 'asc' | 'desc';
  onClick: () => void;
}) {
  return (
    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-neutral-dark">
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1 hover:text-primary ${
          active ? 'text-primary' : ''
        }`}
      >
        {label}
        {active ? (
          dir === 'asc' ? (
            <ChevronUp size={12} />
          ) : (
            <ChevronDown size={12} />
          )
        ) : (
          <ArrowUpDown size={12} className="opacity-40" />
        )}
      </button>
    </th>
  );
}

/* -------------------- Modal -------------------- */
function BookingDetailModal({
  booking,
  onClose,
  onUpdateStatus,
}: {
  booking: Booking;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => Promise<void>;
}) {
  const [updating, setUpdating] = useState(false);

  const handle = async (status: string) => {
    setUpdating(true);
    try {
      await onUpdateStatus(booking.id, status);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-modal max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-neutral-light px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-xs text-neutral-mid uppercase tracking-wide">
              Booking details
            </p>
            <p className="font-mono font-bold text-primary">
              {booking.bookingCode}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-button hover:bg-neutral-light"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <h3 className="text-xs font-bold uppercase text-neutral-mid mb-3">
              Guest
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-neutral-mid" />
                <span className="font-medium text-neutral-dark">
                  {booking.guestName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-neutral-mid" />
                <a
                  href={`mailto:${booking.guestEmail}`}
                  className="text-primary hover:underline"
                >
                  {booking.guestEmail}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-neutral-mid" />
                <a
                  href={`tel:${booking.guestPhone}`}
                  className="text-primary hover:underline"
                >
                  {booking.guestPhone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-neutral-mid" />
                <span className="text-neutral-dark">{booking.guestCountry}</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase text-neutral-mid mb-3">
              Tour
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <PackageIcon size={14} className="text-neutral-mid" />
                <span className="font-medium text-neutral-dark">
                  {booking.package?.nameEn}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-neutral-mid" />
                <span className="text-neutral-dark">
                  {formatDate(booking.bookingDate)} · {booking.timeSlot}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-neutral-mid" />
                <span className="text-neutral-dark">
                  {booking.adults} adult{booking.adults !== 1 ? 's' : ''}
                  {booking.children > 0 &&
                    `, ${booking.children} child${booking.children !== 1 ? 'ren' : ''}`}
                </span>
              </div>
            </div>
          </section>

          <section className="border-t pt-4 flex justify-between items-center">
            <span className="font-semibold text-neutral-dark">Total</span>
            <span className="font-heading text-2xl font-bold text-primary">
              {formatCurrency(booking.totalAmount)}
            </span>
          </section>

          {booking.notes && (
            <section className="bg-neutral-light rounded-card p-4">
              <h3 className="text-xs font-bold uppercase text-neutral-mid mb-2">
                Notes
              </h3>
              <p className="text-sm text-neutral-dark">{booking.notes}</p>
            </section>
          )}

          <section className="border-t pt-4">
            <h3 className="text-xs font-bold uppercase text-neutral-mid mb-3">
              Update status
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((s) => {
                const meta = statusMeta[s];
                const StatusIcon = meta.icon;
                const isCurrent = booking.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => handle(s)}
                    disabled={updating || isCurrent}
                    className={`flex items-center gap-2 px-3 py-2 rounded-button text-sm font-medium transition-colors ${
                      isCurrent
                        ? 'bg-primary text-white cursor-default'
                        : 'bg-neutral-light hover:bg-primary/10 text-neutral-dark'
                    } ${updating ? 'opacity-50' : ''}`}
                  >
                    <StatusIcon size={14} />
                    {meta.label}
                    {isCurrent && <span className="ml-auto text-xs">✓</span>}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}