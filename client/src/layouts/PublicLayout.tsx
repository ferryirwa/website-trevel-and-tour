
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';

export default function PublicLayout() {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip to content (aksesibilitas) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-button focus:font-semibold"
      >
        Skip to content
      </a>

      <Navbar />

      <main
        id="main-content"
        className="flex-1 pt-16 md:pt-20"
      >
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
