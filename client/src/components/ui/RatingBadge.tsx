import { Star } from 'lucide-react';

interface RatingBadgeProps {
  score: number;
  totalReviews?: number;
  source?: 'google' | 'tripadvisor';
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { icon: 14, text: 'text-sm' },
  md: { icon: 18, text: 'text-base' },
  lg: { icon: 24, text: 'text-xl' },
};

export function RatingBadge({ score, totalReviews, source, size = 'md' }: RatingBadgeProps) {
  const s = sizes[size];
  return (
    <div className="flex items-center gap-2">
      <div className="flex text-accent">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={s.icon}
            fill={i <= Math.round(score) ? 'currentColor' : 'none'}
            className={i <= Math.round(score) ? '' : 'text-gray-300'}
          />
        ))}
      </div>
      <span className={`font-semibold ${s.text}`}>{score.toFixed(1)}</span>
      {totalReviews !== undefined && (
        <span className="text-neutral-mid text-sm">({totalReviews.toLocaleString()})</span>
      )}
      {source && (
        <span className="text-xs text-neutral-mid capitalize">· {source}</span>
      )}
    </div>
  );
}