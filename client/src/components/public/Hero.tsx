import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1920&q=80)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Content */}
      <div className="relative container-page text-center text-white">
        <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur text-sm font-medium mb-6">
          🌿 Lombok, Indonesia
        </span>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold leading-tight mb-6 max-w-4xl mx-auto">
          Discover Aik Bukak
          <span className="block text-accent mt-2">Hidden Paradise of Lombok</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-10">
          Natural springs, lush jungle, and local culture — experience the beauty of
          Aik Bukak with our guided tours.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/packages" className="btn-primary text-lg px-8 py-4">
            Book Now
          </Link>
          <button className="inline-flex items-center gap-2 px-8 py-4 rounded-button border-2 border-white/40 text-white font-semibold hover:bg-white/10 transition-colors">
            <Play size={20} />
            Watch Video
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/50 flex items-start justify-center p-1.5">
          <div className="w-1 h-2 bg-white/80 rounded-full" />
        </div>
      </div>
    </section>
  );
}