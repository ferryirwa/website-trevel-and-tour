import { Star } from 'lucide-react';

const ratings = [
  {
    source: 'Google',
    score: 4.8,
    totalReviews: 1800,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    link: 'https://google.com/maps',
  },
  {
    source: 'TripAdvisor',
    score: 4.7,
    totalReviews: 700,
    color: 'text-green-600',
    bg: 'bg-green-50',
    link: 'https://tripadvisor.com',
  },
];

export function RatingSummary() {
  return (
    <section className="border-y border-gray-100 bg-white">
      <div className="container-page py-8 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16">
        {ratings.map((r) => (
          <a
            key={r.source}
            href={r.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 group"
          >
            <div className="flex text-accent">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={20}
                  fill={i <= Math.round(r.score) ? 'currentColor' : 'none'}
                  className={i <= Math.round(r.score) ? '' : 'text-gray-300'}
                />
              ))}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-heading">{r.score}</span>
                <span className="text-sm text-neutral-mid">
                  ({r.totalReviews.toLocaleString()} reviews)
                </span>
              </div>
              <p className="text-sm font-medium text-neutral-mid group-hover:text-primary transition-colors">
                on {r.source} →
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}