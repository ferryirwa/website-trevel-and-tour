import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useGallery } from "@/hooks/useGallery";
import { Skeleton } from "@/components/ui/Skeleton";

const categories = ['ALL', 'NATURE', 'ACTIVITY', 'FACILITY', 'VIDEO'] as const;

export default function GalleryPage() {
  const { data: gallery, isLoading } = useGallery();
  const [category, setCategory] = useState<(typeof categories)[number]>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const items = gallery || [];
  const filteredItems = useMemo(
    () => (category === 'ALL' ? items : items.filter((item) => item.category === category)),
    [category, items]
  );
  const selectedItem = items.find((item) => item.id === selectedId);

  if (isLoading) {
    return (
      <div className="container-page section">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[300px] w-full rounded-card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-page section">
      <h1 className="font-heading text-3xl font-bold text-primary mb-2 text-center">Photo Gallery</h1>
      <p className="mb-8 text-center text-neutral-mid">A glimpse of the landscapes, activities, and facilities at Aik Bukak.</p>
      <div className="mb-8 flex flex-wrap justify-center gap-2" aria-label="Filter gallery">
        {categories.map((item) => (
          <button key={item} type="button" onClick={() => setCategory(item)} className={category === item ? 'btn-primary text-sm' : 'btn-secondary text-sm'}>
            {item === 'ALL' ? 'All' : item.charAt(0) + item.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      {filteredItems.length === 0 ? <p className="py-12 text-center text-neutral-mid">No gallery items in this category yet.</p> :
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className="relative overflow-hidden rounded-card aspect-video group text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            {item.type === 'VIDEO' ? <video src={item.url} className="h-full w-full object-cover" muted /> : <img src={item.url} alt={item.caption || `Aik Bukak ${item.category.toLowerCase()}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <span className="text-white font-medium bg-black/50 px-3 py-1 rounded">{item.category}</span>
            </div>
          </button>
        ))}
      </div>
      }
      {selectedItem && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-label="Gallery preview" onClick={() => setSelectedId(null)}>
        <div className="relative max-h-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
          <button type="button" className="absolute -right-2 -top-2 z-10 rounded-full bg-white p-2 text-neutral-dark shadow" onClick={() => setSelectedId(null)} aria-label="Close preview"><X size={20} /></button>
          {selectedItem.type === 'VIDEO' ? <video src={selectedItem.url} controls autoPlay className="max-h-[85vh] max-w-full rounded-card" /> : <img src={selectedItem.url} alt={selectedItem.caption || 'Aik Bukak gallery preview'} className="max-h-[85vh] max-w-full rounded-card object-contain" />}
          {selectedItem.caption && <p className="mt-3 text-center text-sm text-white">{selectedItem.caption}</p>}
        </div>
      </div>}
    </div>
  );
}
