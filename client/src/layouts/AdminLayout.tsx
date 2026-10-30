
import { useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  Info,
  Package,
  Ticket,
  Star,
  Image as ImageIcon,
  MessageSquare,
  Mail,
  Users,
} from 'lucide-react';
import { isAuthenticated, removeToken, getUser } from '@/lib/auth';
import { Topbar } from '@/components/ui/Topbar';
import { Sidebar } from '@/components/ui/Sidebar';

const adminRoutes = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/home', label: 'Home Content', icon: Home },
  { path: '/admin/about', label: 'About Content', icon: Info },
  { path: '/admin/packages', label: 'Tour Packages', icon: Package },
  { path: '/admin/bookings', label: 'Bookings', icon: Ticket },
  { path: '/admin/ratings', label: 'Ratings & Reviews', icon: Star },
  { path: '/admin/gallery', label: 'Gallery', icon: ImageIcon },
  { path: '/admin/experiences', label: 'Guest Stories', icon: MessageSquare },
  { path: '/admin/contact', label: 'Contact Messages', icon: Mail },
  { path: '/admin/users', label: 'Admin Users', icon: Users },
];

export default function AdminLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = getUser();

  const logout = () => {
    removeToken();
    window.location.href = '/login';
  };

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Topbar
        onLogout={logout}
        onToggleMenu={() => setMobileOpen((v) => !v)}
        mobileMenuOpen={mobileOpen}
        userName={user?.name}
        userRole={user?.role}
      />
      <div className="mx-auto flex max-w-[1600px]">
        <Sidebar routes={adminRoutes} currentPath={location.pathname} />

        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-72 bg-[#0F172A] text-white lg:hidden overflow-y-auto">
              <Sidebar
                routes={adminRoutes}
                currentPath={location.pathname}
                mobile
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </>
        )}

        <main className="min-w-0 flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
