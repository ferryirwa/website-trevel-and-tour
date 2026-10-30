import { Link } from 'react-router-dom';
import { ArrowRight, Camera, MapPin, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatCurrency, mediaUrl } from '@/lib/utils';
import type { Package, GalleryItem, RatingSnapshot, GuestExperience } from '@/types';

/* -------------------- Fallbacks (kalau API kosong) -------------------- */
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1800&q=85';
const FALLBACK_GALLERY = [
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=700&q=80',
  'https://images.unsplash.com/photo-1532980318861-95bb1c488983?w=700&q=80',
];

/* -------------------- Hooks -------------------- */
function useHomePackages() {
  return useQuery({
    queryKey: ['home-packages'],
    queryFn: async () => {
      const { data } = await api.get('/packages');
      return (data as Package[]).filter((p) => p.status === 'ACTIVE').slice(0, 3);
    },
  });
}

function useHomeGallery() {
  return useQuery({
    queryKey: ['home-gallery'],
    queryFn: async () => {
      const { data } = await api.get('/gallery');
      return (data as GalleryItem[]).filter((g) => g.type === 'IMAGE').slice(0, 4);
    },
  });
}

function useHomeRatings() {
  return useQuery({
    queryKey: ['home-ratings'],
    queryFn: async () => {
      const { data } = await api.get('/ratings');
      return data as RatingSnapshot[];
    },
  });
}

function useHomeExperiences() {
  return useQuery({
    queryKey: ['home-experiences'],
    queryFn: async () => {
      const { data } = await api.get('/experiences');
      return (data as GuestExperience[]).slice(0, 3);
    },
  });
}


/* -------------------- Component -------------------- */
export default function HomePage() {
  const { data: packages, isLoading: packagesLoading } = useHomePackages();
  const { data: gallery, isLoading: galleryLoading } = useHomeGallery();
  const { data: ratings } = useHomeRatings();
  const { data: featuredExperiences } = useHomeExperiences();

  const googleRating = ratings?.find((r) => r.source === 'GOOGLE');
  const tripadvisorRating = ratings?.find((r) => r.source === 'TRIPADVISOR');
  const totalReviews =
    (googleRating?.totalReviews ?? 0) + (tripadvisorRating?.totalReviews ?? 0);

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="relative isolate min-h-[640px] overflow-hidden bg-primary text-white">
        <img
          src={FALLBACK_IMAGE}
          alt="Rainforest and natural spring at Aik Bukak, Lombok"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-neutral-dark/90 via-primary/70 to-primary/30" />
        <div className="container-page flex min-h-[640px] items-center py-24">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent backdrop-blur">
              <MapPin size={16} /> North Lombok, Indonesia
            </p>
            <h1 className="font-heading text-4xl font-bold leading-[1.1] md:text-6xl">
              Aik Bukak — a hidden spring in the heart of Lombok.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
              Fresh mountain water, shaded forest trails, and the quiet rhythm of village
              life. Join a guided tour with the people who call this place home.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/packages"
                className="btn-primary bg-accent text-neutral-dark hover:bg-yellow-400"
              >
                Browse tours <ArrowRight size={18} />
              </Link>
              <Link
                to="/gallery"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-button font-semibold border-2 border-white text-white hover:bg-white hover:text-primary transition-colors"
              >
                View the gallery
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TRUST BAR (dari /api/ratings) ============ */}
      <section className="border-b border-neutral-light bg-white">
        <div className="container-page grid gap-6 py-8 text-center sm:grid-cols-3">
          <div>
            <div className="flex justify-center gap-1 text-accent">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={18} fill="currentColor" />
              ))}
            </div>
            <p className="mt-2 font-semibold text-neutral-dark">
              {googleRating
                ? `${Number(googleRating.score).toFixed(1)} on Google`
                : '4.8 on Google'}
            </p>
          </div>
          <div>
            <p className="text-2xl font-heading font-bold text-primary">
              {totalReviews > 0 ? totalReviews.toLocaleString() + '+' : '2,500+'}
            </p>
            <p className="mt-1 text-sm text-neutral-mid">verified guest reviews</p>
          </div>
          <div>
            <p className="text-2xl font-heading font-bold text-primary">Local guides</p>
            <p className="mt-1 text-sm text-neutral-mid">
              trained, welcoming, safety-first
            </p>
          </div>
        </div>
      </section>

      {/* ============ POPULAR PACKAGES (dari /api/packages) ============ */}
      <section className="bg-neutral-light">
        <div className="container-page section">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-semibold uppercase tracking-widest text-secondary">
                Popular tours
              </p>
              <h2 className="mt-3 font-heading text-3xl font-bold text-primary md:text-4xl">
                Pick the experience that fits your day.
              </h2>
            </div>
            <Link
              to="/packages"
              className="inline-flex items-center gap-2 font-semibold text-primary hover:text-secondary"
            >
              View all tours <ArrowRight size={18} />
            </Link>
          </div>

          {packagesLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card overflow-hidden animate-pulse">
                  <div className="h-52 bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : packages && packages.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {packages.map((pkg) => (
                <article key={pkg.id} className="card overflow-hidden group">
                  <Link to={`/packages/${pkg.slug}`} className="block">
                    <div className="h-52 overflow-hidden">
                      <img
                        src={mediaUrl(pkg.media?.[0]?.url) || FALLBACK_IMAGE}
                        alt={pkg.nameEn}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </Link>
                  <div className="p-6">
                    <div className="flex justify-between gap-4">
                      <h3 className="font-heading text-lg font-bold text-neutral-dark">
                        {pkg.nameEn}
                      </h3>
                      <span className="shrink-0 text-sm text-neutral-mid">
                        {pkg.durationHours}h
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-neutral-mid line-clamp-2">
                      {pkg.descriptionEn}
                    </p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="font-bold text-primary">
                        {formatCurrency(pkg.price)}
                      </span>
                      <Link
                        to={`/packages/${pkg.slug}`}
                        className="text-sm font-semibold text-primary hover:text-secondary"
                      >
                        View tour →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-center text-neutral-mid py-12">
              No tours published yet. Check back soon.
            </p>
          )}
        </div>
      </section>

      {/* ============ GALLERY PREVIEW (dari /api/gallery) ============ */}
      <section className="container-page section">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="font-semibold uppercase tracking-widest text-secondary">
              A glimpse of Aik Bukak
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-primary md:text-4xl">
              The landscape, up close.
            </h2>
          </div>
          <Link
            to="/gallery"
            aria-label="View the full gallery"
            className="rounded-button p-3 text-primary hover:bg-neutral-light"
          >
            <Camera />
          </Link>
        </div>

        {galleryLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-48 md:h-64 rounded-card bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        ) : gallery && gallery.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {gallery.map((item, index) => (
              <Link
                key={item.id}
                to="/gallery"
                className="group overflow-hidden rounded-card"
              >
                <img
                  src={mediaUrl(item.url)}
                  alt={item.caption ?? `Aik Bukak landscape ${index + 1}`}
                  className="h-48 md:h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {FALLBACK_GALLERY.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Aik Bukak ${i + 1}`}
                className="h-48 md:h-64 w-full rounded-card object-cover"
              />
            ))}
          </div>
        )}
      </section>

      {/* ============ FEATURED GUEST STORIES (dari /api/experiences) ============ */}
      <section className="bg-primary text-white">
        <div className="container-page section">
          <div className="text-center mb-10">
            <p className="font-semibold uppercase tracking-widest text-accent">
              Guest stories
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold md:text-4xl">
              What guests remember most.
            </h2>
          </div>

          {featuredExperiences && featuredExperiences.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {featuredExperiences.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-white/10 backdrop-blur rounded-card p-6 flex flex-col"
                >
                  <div className="flex gap-1 text-accent mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i <= exp.rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <blockquote className="text-white/95 leading-relaxed flex-1 line-clamp-5">
                    “{exp.story}”
                  </blockquote>
                  <div className="mt-5 pt-4 border-t border-white/20">
                    <p className="font-semibold text-white">{exp.guestName}</p>
                    <p className="text-sm text-white/70">{exp.country}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  name: 'Sarah M.',
                  country: 'Australia',
                  rating: 5,
                  story:
                    'The guide made us feel completely at home. Aik Bukak was peaceful, beautiful, and the highlight of our Lombok trip.',
                },
                {
                  name: 'Marco S.',
                  country: 'Germany',
                  rating: 5,
                  story:
                    'A hidden gem. The natural spring was crystal clear and refreshing — a perfect escape from the busy tourist spots.',
                },
                {
                  name: 'Yuki T.',
                  country: 'Japan',
                  rating: 5,
                  story:
                    'Quiet, clean, and truly welcoming. Our local guide shared stories that made the place feel alive.',
                },
              ].map((t) => (
                <div
                  key={t.name}
                  className="bg-white/10 backdrop-blur rounded-card p-6 flex flex-col"
                >
                  <div className="flex gap-1 text-accent mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i <= t.rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <blockquote className="text-white/95 leading-relaxed flex-1">
                    “{t.story}”
                  </blockquote>
                  <div className="mt-5 pt-4 border-t border-white/20">
                    <p className="font-semibold text-white">{t.name}</p>
                    <p className="text-sm text-white/70">{t.country}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/experiences"
              className="inline-flex items-center gap-2 font-semibold text-accent hover:text-yellow-300"
            >
              Read more guest experiences <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
