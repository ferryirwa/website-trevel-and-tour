import { cn } from '@/lib/utils';

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin',
        className
      )}
    />
  );
}