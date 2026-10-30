import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronRight,
  Star,
  Clock,
  Users,
  MapPin,
  Tag,
  ArrowLeft,
  Check,
  X as XIcon,
  Calendar,
} from 'lucide-react';
import { usePackage, usePackages } from '@/hooks/usePackages';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, mediaUrl } from '@/lib/utils';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1541868615250-7e00328bd3b3?w=1200&q=80';

export default function PackageDetailPage() {
  const { slug = '' } = useParams();
  const { data: pkg, isLoading } = usePackage(slug);
  const { data: allPackages } = usePackages();
  const [activeImage, setActiveImage] = useState(0);

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <div className="container-page section">
        <Skeleton className="h-4 w-64 mb-6" />
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <Skeleton className="aspect-[4/3] w-full rounded-card" />
            <Skeleton className="h-8 w-3/4 mt-6" />
            <Skeleton className="h-4 w-full mt-3" />
            <Skeleton className="h-4 w-5/6 mt-2" />
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-64 w-full rounded-card" />
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Not found ---------- */
  if (!pkg) {
    return (
      <div className="container-page section">
        <EmptyState
          title="Tour not found"
          description="The tour you're looking for may have been removed or renamed."
          action={
            <Link to="/packages" className="btn-primary">
              Browse all tours
            </Link>
          }
        />
      </div>
    );
  }

  const images = (pkg.media ?? []).map((m) => mediaUrl(m.url)).filter(Boolean);
  const mainImage = images[activeImage] || FALLBACK_IMAGE;
  const related = (allPackages ?? [])
    .filter((p) => p.id !== pkg.id && p.type?.slug === pkg.type?.slug)
    .slice(0, 3);

  /* ---------- Main ---------- */
  return (
    <div className="container-page section">
      {/* ============ BREADCRUMB ============ */}
      <nav className="flex items-center flex-wrap gap-2 text-sm text-neutral-mid mb-6">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={14} />
        <Link to="/packages" className="hover:text-primary">Packages</Link>
        <ChevronRight size={14} />
        <span className="text-neutral-dark font-medium truncate max-w-[200px]">
          {pkg.nameEn}
        </span>
      </nav>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* ============ LEFT: CONTENT ============ */}
        <div className="lg:col-span-8">
          {/* -------- Gallery -------- */}
          <div className="mb-6">
            <div className="aspect-[4/3] rounded-card overflow-hidden bg-neutral-light">
              <img
                src={mainImage}
                alt={pkg.nameEn}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {images.slice(0, 5).map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      i === activeImage
                        ? 'border-primary'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={src}
                      alt={`${pkg.nameEn} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* -------- Badges & title -------- */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {pkg.type?.nameEn && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                <Tag size={12} /> {pkg.type.nameEn}
              </span>
            )}
            {pkg.location?.name && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-neutral-light text-neutral-mid text-xs font-semibold">
                <MapPin size={12} /> {pkg.location.name}
              </span>
            )}
            {pkg.status === 'ACTIVE' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                <Check size={12} /> Available
              </span>
            )}
          </div>

          <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-3">
            {pkg.nameEn}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-mid mb-6">
            <div className="flex items-center gap-1">
              <Star size={16} fill="currentColor" className="text-accent" />
              <span className="font-semibold text-neutral-dark">4.8</span>
              <span>(120 reviews)</span>
            </div>
            <span className="flex items-center gap-1">
              <Clock size={14} /> {pkg.durationHours} hours
            </span>
            <span className="flex items-center gap-1">
              <Users size={14} /> Up to {pkg.maxGuests} guests
            </span>
          </div>

          <p className="text-neutral-mid text-base leading-relaxed mb-8">
            {pkg.descriptionEn}
          </p>

          {/* -------- Itinerary -------- */}
          <section className="mb-10">
            <h2 className="font-heading text-2xl font-bold text-neutral-dark mb-4">
              Itinerary
            </h2>
            {pkg.itineraries && pkg.itineraries.length > 0 ? (
              <ol className="relative border-l-2 border-primary/20 ml-2 space-y-5">
                {[...pkg.itineraries]
                  .sort((a, b) => (a.time > b.time ? 1 : -1))
                  .map((step, i) => (
                    <li key={i} className="pl-7 relative">
                      <span className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-primary border-4 border-white shadow" />
                      <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1">
                        <Clock size={14} /> {step.time}
                      </div>
                      <p className="text-neutral-dark leading-relaxed">
                        {step.description}
                      </p>
                    </li>
                  ))}
              </ol>
            ) : (
              <p className="text-sm text-neutral-mid italic">
                Detailed itinerary will be provided upon booking.
              </p>
            )}
          </section>

          {/* -------- Include / Exclude -------- */}
          <section className="mb-10">
            <h2 className="font-heading text-2xl font-bold text-neutral-dark mb-4">
              What's included
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Included */}
              <div className="card p-5">
                <h3 className="font-semibold text-neutral-dark mb-3 flex items-center gap-2">
                  <Check className="text-success" size={18} /> Included
                </h3>
                {pkg.includes && pkg.includes.length > 0 ? (
                  <ul className="space-y-2 text-sm">
                    {pkg.includes.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check
                          className="text-success mt-0.5 shrink-0"
                          size={14}
                        />
                        <span>{item.item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-neutral-mid italic">Not specified</p>
                )}
              </div>

              {/* Excluded */}
              <div className="card p-5">
                <h3 className="font-semibold text-neutral-dark mb-3 flex items-center gap-2">
                  <XIcon className="text-error" size={18} /> Not included
                </h3>
                {pkg.excludes && pkg.excludes.length > 0 ? (
                  <ul className="space-y-2 text-sm text-neutral-mid">
                    {pkg.excludes.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <XIcon
                          className="text-error mt-0.5 shrink-0"
                          size={14}
                        />
                        <span>{item.item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-neutral-mid italic">Not specified</p>
                )}
              </div>
            </div>
          </section>

          {/* -------- Location -------- */}
          <section className="mb-10">
            <h2 className="font-heading text-2xl font-bold text-neutral-dark mb-4">
              Location
            </h2>
            <div className="rounded-card overflow-hidden border border-gray-200">
              <iframe
                src="https://www.google.com/maps?q=Aik+Bukak+Waterfall+Lombok&output=embed"
                width="100%"
                height="320"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Aik Bukak Location"
              />
            </div>
          </section>
        </div>

        {/* ============ RIGHT: BOOKING CARD ============ */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="card p-6">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-heading font-bold text-primary">
                  {formatCurrency(pkg.price)}
                </span>
                <span className="text-sm text-neutral-mid">/ person</span>
              </div>
              <p className="text-xs text-neutral-mid mb-5">
                Free cancellation up to 48 hours before
              </p>

              <div className="space-y-3 mb-5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-mid flex items-center gap-2">
                    <Clock size={14} /> Duration
                  </span>
                  <span className="font-semibold text-neutral-dark">
                    {pkg.durationHours} hours
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-mid flex items-center gap-2">
                    <Users size={14} /> Group size
                  </span>
                  <span className="font-semibold text-neutral-dark">
                    Up to {pkg.maxGuests}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-mid flex items-center gap-2">
                    <Tag size={14} /> Type
                  </span>
                  <span className="font-semibold text-neutral-dark">
                    {pkg.type?.nameEn ?? '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-mid flex items-center gap-2">
                    <MapPin size={14} /> Location
                  </span>
                  <span className="font-semibold text-neutral-dark text-right">
                    {pkg.location?.name ?? '—'}
                  </span>
                </div>
              </div>

              <Link
                to={`/booking?package=${pkg.id}`}
                className="btn-primary w-full py-4"
              >
                <Calendar size={18} />
                Book this tour
              </Link>

              <p className="text-xs text-neutral-mid text-center mt-3">
                No payment required until confirmation
              </p>
            </div>

            {/* Help box */}
            <div className="card p-5 bg-neutral-light border-0">
              <h3 className="font-semibold text-neutral-dark mb-2 text-sm">
                Have questions?
              </h3>
              <p className="text-xs text-neutral-mid mb-3">
                Our local team is happy to help you plan.
              </p>
              <Link
                to="/contact"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Contact us →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ============ RELATED ============ */}
      {related.length > 0 && (
        <section className="mt-16 pt-12 border-t border-neutral-light">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="font-semibold uppercase tracking-widest text-secondary">
                More like this
              </p>
              <h2 className="mt-2 font-heading text-2xl font-bold text-primary">
                You might also like
              </h2>
            </div>
            <Link
              to="/packages"
              className="text-sm font-semibold text-primary hover:underline"
            >
              View all tours →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((p) => (
              <Link
                key={p.id}
                to={`/packages/${p.slug}`}
                className="card overflow-hidden group"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={mediaUrl(p.media?.[0]?.url) || FALLBACK_IMAGE}
                    alt={p.nameEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-heading font-semibold text-neutral-dark mb-2 line-clamp-1">
                    {p.nameEn}
                  </h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-primary">
                      {formatCurrency(p.price)}
                    </span>
                    <span className="text-neutral-mid">
                      {p.durationHours}h
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============ BACK ============ */}
      <div className="mt-12 text-center">
        <Link to="/packages" className="btn-ghost">
          <ArrowLeft size={16} />
          Back to all packages
        </Link>
      </div>
    </div>
  );
}
