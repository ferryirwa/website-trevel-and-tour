import { Link } from 'react-router-dom';
import { Star, ExternalLink, ArrowRight, MessageSquareQuote } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useRatings } from '@/hooks/useRatings';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { mediaUrl } from '@/lib/utils';
import type { GuestExperience, RatingSnapshot } from '@/types';

/* -------------------- Helpers -------------------- */
function starDistribution(score: number, total: number) {
  // Estimasi distribusi berdasarkan rata-rata (approximation).
  const weights =
    score >= 4.8
      ? [0.82, 0.12, 0.04, 0.01, 0.01]
      : score >= 4.5
      ? [0.7, 0.2, 0.06, 0.02, 0.02]
      : score >= 4.0
      ? [0.55, 0.25, 0.12, 0.05, 0.03]
      : [0.4, 0.3, 0.15, 0.1, 0.05];
  return [5, 4, 3, 2, 1].map((stars, i) => ({
    stars,
    count: Math.round(total * weights[i]),
    percent: Math.round(weights[i] * 100),
  }));
}

const sourceMeta = {
  GOOGLE: {
    label: 'Google Reviews',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    url: 'https://www.google.com/maps/search/?api=1&query=Aik+Bukak+Lombok',
  },
  TRIPADVISOR: {
    label: 'TripAdvisor',
    color: 'text-green-600',
    bg: 'bg-green-50',
    url: 'https://www.tripadvisor.com/Search?q=Aik+Bukak+Lombok',
  },
} as const;

type RatingSource = keyof typeof sourceMeta;

/* -------------------- Hooks -------------------- */
function useRecentExperiences() {
  return useQuery({
    queryKey: ['recent-experiences'],
    queryFn: async () => {
      const { data } = await api.get('/experiences');
      return (data as GuestExperience[]).slice(0, 6);
    },
  });
}

/* -------------------- Component -------------------- */
export default function RatingsPage() {
  const { data: ratings, isLoading } = useRatings();
  const { data: experiences } = useRecentExperiences();

  /* ---- Loading skeleton ---- */
  if (isLoading) {
    return (
      <div className="container-page section">
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-64 rounded-card" />
          ))}
        </div>
      </div>
    );
  }

  const google = ratings?.find((r) => r.source === 'GOOGLE') as RatingSnapshot | undefined;
  const tripadvisor = ratings?.find((r) => r.source === 'TRIPADVISOR') as RatingSnapshot | undefined;

  const totalReviews = (google?.totalReviews ?? 0) + (tripadvisor?.totalReviews ?? 0);
  const weightedSum =
    (Number(google?.score ?? 0) * (google?.totalReviews ?? 0)) +
    (Number(tripadvisor?.score ?? 0) * (tripadvisor?.totalReviews ?? 0));
  const overallScore = totalReviews > 0 ? weightedSum / totalReviews : 0;

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="bg-primary text-white">
        <div className="container-page py-16 md:py-20 text-center">
          <p className="font-semibold uppercase tracking-widest text-accent mb-3">
            Reputation
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Rated by travelers from around the world.
          </h1>
          <p className="text-white/85 max-w-2xl mx-auto text-lg">
            Real reviews, verified sources. See how guests rate their Aik Bukak
            experience on Google and TripAdvisor.
          </p>
        </div>
      </section>

      {/* ============ OVERALL SCORE ============ */}
      <section className="container-page section">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-center card p-8">
            {/* Overall number */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-1 text-accent mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={24}
                    fill={i <= Math.round(overallScore) ? 'currentColor' : 'none'}
                    className={i <= Math.round(overallScore) ? '' : 'text-gray-300'}
                  />
                ))}
              </div>
              <div className="text-6xl md:text-7xl font-heading font-bold text-primary leading-none">
                {overallScore > 0 ? overallScore.toFixed(1) : '—'}
              </div>
              <p className="text-sm text-neutral-mid mt-2">
                Based on <strong>{totalReviews.toLocaleString()}</strong> verified reviews
              </p>
            </div>

            {/* Distribution */}
            <div>
              <h3 className="font-heading font-bold text-neutral-dark mb-4">
                Rating distribution
              </h3>
              <div className="space-y-2">
                {starDistribution(overallScore, totalReviews).map((row) => (
                  <div key={row.stars} className="flex items-center gap-3 text-sm">
                    <span className="w-12 text-neutral-mid">{row.stars} star</span>
                    <div className="flex-1 h-2.5 bg-neutral-light rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-500"
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-neutral-mid">
                      {row.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ============ SOURCE CARDS ============ */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {[google, tripadvisor].map((r, idx) => {
              const source: RatingSource = idx === 0 ? 'GOOGLE' : 'TRIPADVISOR';
              const meta = sourceMeta[source];
              const score = Number(r?.score ?? 0);
              const reviews = r?.totalReviews ?? 0;

              return (
                <div key={source} className="card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span
                        className={`inline-block text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${meta.bg} ${meta.color}`}
                      >
                        {meta.label}
                      </span>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-heading font-bold text-primary">
                          {score > 0 ? score.toFixed(1) : '—'}
                        </span>
                        <span className="text-sm text-neutral-mid">/ 5.0</span>
                      </div>
                    </div>
                    <div className="flex text-accent">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={18}
                          fill={i <= Math.round(score) ? 'currentColor' : 'none'}
                          className={i <= Math.round(score) ? '' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-neutral-mid mb-4">
                    {reviews > 0
                      ? `${reviews.toLocaleString()} verified reviews`
                      : 'No reviews yet — be the first!'}
                  </p>

                  <a
                    href={meta.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    Read on {meta.label}
                    <ExternalLink size={14} />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ RECENT REVIEWS (dari experiences) ============ */}
      {experiences && experiences.length > 0 && (
        <section className="bg-neutral-light">
          <div className="container-page section">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10">
                <p className="font-semibold uppercase tracking-widest text-secondary">
                  Recent
                </p>
                <h2 className="mt-2 font-heading text-3xl font-bold text-primary">
                  Latest verified reviews
                </h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experiences.map((exp) => (
                  <div key={exp.id} className="card overflow-hidden flex flex-col">
                    {exp.media?.[0]?.type === 'IMAGE' && (
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={mediaUrl(exp.media[0].url)}
                          alt={`Photo by ${exp.guestName}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex text-accent mb-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i <= exp.rating ? 'currentColor' : 'none'}
                            className={i <= exp.rating ? '' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <p className="text-sm leading-relaxed text-neutral-dark line-clamp-4 flex-1">
                        "{exp.story}"
                      </p>
                      <div className="mt-4 pt-3 border-t border-neutral-light flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-neutral-dark">
                            {exp.guestName}
                          </p>
                          <p className="text-xs text-neutral-mid">{exp.country}</p>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {exp.verifiedVia === 'GOOGLE' ? 'Google' : 'TripAdvisor'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-10">
                <Link to="/experiences" className="btn-secondary">
                  Read all experiences <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ CTA ============ */}
      <section className="bg-primary text-white">
        <div className="container-page section text-center">
          <MessageSquareQuote className="mx-auto text-accent mb-4" size={40} />
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">
            Already visited Aik Bukak?
          </h2>
          <p className="text-white/85 max-w-xl mx-auto mb-8">
            Share your experience with future travelers. Your story helps our
            local guides keep doing what they love.
          </p>
          <Link
            to="/experiences"
            className="inline-flex items-center gap-2 bg-accent text-neutral-dark px-6 py-3 rounded-button font-semibold hover:bg-yellow-400 transition-colors"
          >
            Share your experience <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
