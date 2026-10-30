import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import RatingsPage from './pages/public/RatingsPage';
import GalleryPage from './pages/public/GalleryPage';
import ExperiencesPage from './pages/public/ExperiencesPage';
import PackagesPage from './pages/public/PackagesPage';
import PackageDetailPage from './pages/public/PackageDetailPage';
import BookingPage from './pages/public/BookingPage';
import PaymentPage from './pages/public/PaymentPage';
import ConfirmationPage from './pages/public/ConfirmationPage';
import ContactPage from './pages/public/ContactPage';
import NotFoundPage from './pages/public/NotFoundPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import HomeManagePage from './pages/admin/HomeManagePage';
import AboutManagePage from './pages/admin/AboutManagePage';
import RatingsManagePage from './pages/admin/RatingsManagePage';
import GalleryManagePage from './pages/admin/GalleryManagePage';
import ExperiencesManagePage from './pages/admin/ExperiencesManagePage';
import PackagesManagePage from './pages/admin/PackagesManagePage';
import BookingsManagePage from './pages/admin/BookingsManagePage';
import ContactManagePage from './pages/admin/ContactManagePage';
import UsersManagePage from './pages/admin/UsersManagePage';

export default function App() {
  return (
    <Routes>
      {/* PUBLIC AREA */}
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="ratings" element={<RatingsPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="experiences" element={<ExperiencesPage />} />
        <Route path="packages" element={<PackagesPage />} />
        <Route path="packages/:slug" element={<PackageDetailPage />} />
        <Route path="booking" element={<BookingPage />} />
        <Route path="payment" element={<PaymentPage />} />
        <Route path="confirmation" element={<ConfirmationPage />} />
        <Route path="contact" element={<ContactPage />} />
      </Route>

      {/* ADMIN AREA */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="home" element={<HomeManagePage />} />
        <Route path="about" element={<AboutManagePage />} />
        <Route path="ratings" element={<RatingsManagePage />} />
        <Route path="gallery" element={<GalleryManagePage />} />
        <Route path="experiences" element={<ExperiencesManagePage />} />
        <Route path="packages" element={<PackagesManagePage />} />
        <Route path="bookings" element={<BookingsManagePage />} />
        <Route path="contact" element={<ContactManagePage />} />
        <Route path="users" element={<UsersManagePage />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}