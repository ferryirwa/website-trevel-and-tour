import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Package as PackageIcon,
  Ticket,
  DollarSign,
  Star,
  ArrowRight,
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Booking, GuestExperience } from '@/types';

/* -------------------- Hooks -------------------- */
function useDashboardData() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const [packagesRes, bookingsRes, experiencesRes, ratingsRes] =
        await Promise.all([
          api.get('/packages'),
          api.get('/bookings').catch(() => ({ data: [] })),
          api.get('/experiences/admin').catch(() => ({ data: [] })),
          api.get('/ratings').catch(() => ({ data: [] })),
        ]);

      return {
        packages: packagesRes.data as any[],
        bookings: bookingsRes.data as Booking[],
        experiences: experiencesRes.data as GuestExperience[],
        ratings: ratingsRes.data as { source: string; score: number; totalReviews: number }[],
      };
    },
  });
}

/* -------------------- Component -------------------- */
export default function DashboardPage() {
  const { data, isLoading } = useDashboardData();

  const packages = data?.packages ?? [];
  const bookings = data?.bookings ?? [];
  const experiences = data?.experiences ?? [];
  const ratings = data?.ratings ?? [];

  /* ---- Computed stats ---- */
  const totalPackages = packages.length;
  const activePackages = packages.filter((p) => p.status === 'ACTIVE').length;

  const activeBookings = bookings.filter((b) =>
    ['PENDING', 'PAID'].includes(b.status)
  ).length;

  const totalRevenue = bookings
    .filter((b) => b.status === 'PAID' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + Number(b.totalAmount), 0);

  const pendingExperiences = experiences.filter(
    (e) => e.status === 'PENDING'
  ).length;

  const googleRating = ratings.find((r) => r.source === 'GOOGLE');
  const avgRating = googleRating ? Number(googleRating.score).toFixed(1) : '—';

  /* ---- Recent bookings ---- */
  const recentBookings = [...bookings]
    .sort(
      (a, b) =>
        new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
    )
    .slice(0, 5);

  /* ---- Top packages by booking count ---- */
  const bookingCountByPackage = bookings.reduce(
    (acc, b) => {
      const name = b.package?.nameEn ?? 'Unknown';
      acc[name] = (acc[name] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const topPackages = Object.entries(bookingCountByPackage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  /* ---- Pending experiences (quick list) ---- */
  const pendingList = experiences
    .filter((e) => e.status === 'PENDING')
    .slice(0, 3);

  /* ---- Loading ---- */
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <Skeleton className="h-9 w-48 mb-2 rounded" />
        <Skeleton className="h-4 w-72 mb-8 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-card" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-card" />
          <Skeleton className="h-72 rounded-card" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* ============ HEADER ============ */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-primary">
          Dashboard
        </h1>
        <p className="text-sm text-neutral-mid mt-1">
          Overview of bookings, content, and guest activity.
        </p>
      </div>

      {/* ============ STATS ============ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={PackageIcon}
          label="Packages"
          value={String(totalPackages)}
          hint={`${activePackages} active`}
          href="/admin/packages"
        />
        <StatCard
          icon={Ticket}
          label="Active bookings"
          value={String(activeBookings)}
          hint={`${bookings.length} total`}
          href="/admin/bookings"
        />
        <StatCard
          icon={DollarSign}
          label="Revenue"
          value={formatCurrency(totalRevenue)}
          hint="from paid bookings"
        />
        <StatCard
          icon={Star}
          label="Google rating"
          value={avgRating}
          hint={
            pendingExperiences > 0
              ? `${pendingExperiences} story pending`
              : 'No pending stories'
          }
          href="/admin/experiences"
          highlight={pendingExperiences > 0}
        />
      </div>

      {/* ============ TWO COLUMNS ============ */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* -------- Recent bookings -------- */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-neutral-dark">
              Recent bookings
            </h2>
            <Link
              to="/admin/bookings"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <p className="text-sm text-neutral-mid py-6 text-center">
              No bookings yet.
            </p>
          ) : (
            <div className="divide-y divide-neutral-light">
              {recentBookings.map((b) => (
                <div key={b.id} className="py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Ticket className="text-primary" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-dark truncate">
                      {b.guestName}
                    </p>
                    <p className="text-xs text-neutral-mid truncate">
                      {b.package?.nameEn} · {formatDate(b.bookingDate)}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusColor(b.status)}`}
                  >
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* -------- Top packages -------- */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-neutral-dark">
              Most booked packages
            </h2>
            <Link
              to="/admin/packages"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              Manage <ArrowRight size={12} />
            </Link>
          </div>

          {topPackages.length === 0 ? (
            <p className="text-sm text-neutral-mid py-6 text-center">
              No booking data yet.
            </p>
          ) : (
            <div className="space-y-3">
              {topPackages.map(([name, count], i) => {
                const percent =
                  topPackages.length > 0
                    ? Math.round(
                        (count / Math.max(...topPackages.map((t) => t[1]))) * 100
                      )
                    : 0;
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-neutral-mid w-4">
                          {i + 1}
                        </span>
                        <span className="font-medium text-neutral-dark truncate">
                          {name}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-mid shrink-0 ml-2">
                        {count} booking{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="h-1.5 bg-neutral-light rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ============ PENDING EXPERIENCES ============ */}
      {pendingList.length > 0 && (
        <div className="card p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-yellow-600" size={18} />
              <h2 className="font-heading font-bold text-neutral-dark">
                Stories awaiting review
              </h2>
            </div>
            <Link
              to="/admin/experiences"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              Review all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {pendingList.map((e) => (
              <div
                key={e.id}
                className="flex items-start gap-3 py-2 border-b border-neutral-light last:border-0"
              >
                <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                  <Star className="text-accent" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-dark">
                    {e.guestName} · {e.country}
                  </p>
                  <p className="text-xs text-neutral-mid line-clamp-2 mt-0.5">
                    "{e.story}"
                  </p>
                </div>
                <span className="text-xs text-neutral-mid shrink-0 flex items-center gap-1">
                  <Clock size={12} />
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============ QUICK ACTION ============ */}
      {totalPackages === 0 && (
        <div className="card p-8 mt-6 text-center bg-primary/5 border-2 border-primary/20">
          <TrendingUp className="mx-auto text-primary mb-3" size={32} />
          <h3 className="font-heading font-bold text-neutral-dark mb-2">
            Get started
          </h3>
          <p className="text-sm text-neutral-mid mb-4">
            You haven't added any tour packages yet.
          </p>
          <Link to="/admin/packages" className="btn-primary inline-flex">
            Create your first package
          </Link>
        </div>
      )}
    </div>
  );
}

/* -------------------- Stat Card -------------------- */
function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  href,
  highlight,
}: {
  icon: any;
  label: string;
  value: string;
  hint?: string;
  href?: string;
  highlight?: boolean;
}) {
  const inner = (
    <div
      className={`card p-5 transition-colors ${
        href ? 'hover:border-primary cursor-pointer' : ''
      } ${highlight ? 'border-2 border-accent/40' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="text-primary" size={18} />
        </div>
        {highlight && (
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        )}
      </div>
      <p className="text-xs font-medium text-neutral-mid uppercase tracking-wide">
        {label}
      </p>
      <p className="text-2xl font-heading font-bold text-neutral-dark mt-1">
        {value}
      </p>
      {hint && <p className="text-xs text-neutral-mid mt-1">{hint}</p>}
    </div>
  );

  return href ? <Link to={href}>{inner}</Link> : inner;
}

/* -------------------- Helpers -------------------- */
function statusColor(status: string) {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-700';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-700';
    case 'CANCELLED':
      return 'bg-red-100 text-red-700';
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-neutral-light text-neutral-dark';
  }
}
