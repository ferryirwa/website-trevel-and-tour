import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ConfirmationPage() {
  const [params] = useSearchParams();
  const code = params.get('booking');
  const { data: booking, isLoading } = useQuery({ queryKey: ['booking', code], enabled: Boolean(code), queryFn: async () => (await api.get(`/bookings/${code}`)).data });
  if (isLoading) return <div className="container-page section text-neutral-mid">Loading your booking…</div>;
  if (!booking) return <div className="container-page section text-center"><h1 className="font-heading text-3xl font-bold text-primary">Booking not found</h1><Link to="/packages" className="btn-primary mt-6">Browse tours</Link></div>;
  return <div className="container-page section"><div className="mx-auto max-w-xl text-center"><CheckCircle2 className="mx-auto text-secondary" size={64} /><h1 className="mt-5 font-heading text-3xl font-bold text-primary">Your booking is reserved</h1><p className="mt-3 text-neutral-mid">Your payment is pending. We will email you when payment has been verified.</p><div className="card mt-8 text-left p-6"><div className="flex justify-between gap-6 border-b border-neutral-light pb-4"><span className="text-neutral-mid">Booking reference</span><strong className="text-primary">{booking.bookingCode}</strong></div><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-5"><dt className="text-neutral-mid">Tour</dt><dd className="font-medium text-right">{booking.package.nameEn}</dd></div><div className="flex justify-between gap-5"><dt className="text-neutral-mid">Date</dt><dd className="font-medium">{formatDate(booking.bookingDate)}</dd></div><div className="flex justify-between gap-5"><dt className="text-neutral-mid">Guests</dt><dd className="font-medium">{booking.adults} adult{booking.adults !== 1 ? 's' : ''}{booking.children ? `, ${booking.children} child${booking.children !== 1 ? 'ren' : ''}` : ''}</dd></div><div className="flex justify-between gap-5 border-t border-neutral-light pt-3"><dt className="font-semibold text-neutral-dark">Total</dt><dd className="font-heading text-lg font-bold text-primary">{formatCurrency(booking.totalAmount)}</dd></div></dl></div><div className="mt-8 flex justify-center gap-3"><Link to="/packages" className="btn-secondary">Browse more tours</Link><Link to="/" className="btn-primary">Back home</Link></div></div></div>;
}
