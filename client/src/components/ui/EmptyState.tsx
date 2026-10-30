import { cn } from '@/lib/utils';

export function EmptyState({
  title = 'Nothing here yet',
  description,
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('text-center py-16 px-4', className)}>
      <div className="text-5xl mb-4">🌿</div>
      <h3 className="text-xl font-heading font-semibold text-neutral-dark mb-2">{title}</h3>
      {description && <p className="text-neutral-mid mb-6">{description}</p>}
      {action}
    </div>
  );
}