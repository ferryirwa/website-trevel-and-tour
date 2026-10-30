import { usePackages } from "@/hooks/usePackages";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";

export default function PackagesPage() {
  const { data: packages, isLoading } = usePackages();

  if (isLoading) {
    return (
      <div className="container-page section">
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-6 w-full rounded" />
                <Skeleton className="mt-2 h-4 w-3/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="container-page section">
        <EmptyState title="No tours available yet" description="Please check back soon for new Aik Bukak experiences." />
      </div>
    );
  }

  return (
    <div className="container-page section">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-4xl font-bold text-primary mb-2">Tour Packages</h1>
          <p className="text-neutral-mid">Choose an experience that fits your time, interests, and travel style.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="card p-0 overflow-hidden">
            <div className="h-48 overflow-hidden">
              <img
                src={pkg.media?.[pkg.media.length - 1]?.url || "https://images.unsplash.com/photo-1541868615250-7e00328bd3b3?w=600&q=80"}
                alt={pkg.nameId}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="font-heading font-bold text-neutral-dark mb-2">{pkg.nameId}</h3>
              <p className="text-sm text-neutral-mid mb-4 line-clamp-2">{pkg.descriptionId}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-primary">{formatCurrency(pkg.price)}</span>
                <span className="text-xs text-neutral-mid">{pkg.durationHours} hours</span>
              </div>
              <div className="flex gap-2">
                <a href={`/packages/${pkg.slug}`} className="btn-primary flex-1 text-sm text-center block">
                  Details
                </a>
                <a href={`/booking?package=${pkg.id}`} className="btn-ghost flex-1 text-sm text-center block">
                  Book now
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
