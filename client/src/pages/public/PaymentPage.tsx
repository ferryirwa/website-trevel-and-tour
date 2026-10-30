import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

const METHODS = [
  { value: 'CARD', label: 'Credit / Debit Card' },
  { value: 'PAYPAL', label: 'PayPal' },
  { value: 'BANK', label: 'Bank Transfer' },
  { value: 'QRIS', label: 'QRIS / E-Wallet' },
] as const;

type MethodValue = (typeof METHODS)[number]['value'];

export default function PaymentPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const code = params.get('booking');

  const [method, setMethod] = useState<MethodValue>('CARD');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: booking, isLoading, error: fetchError } = useQuery({
    queryKey: ['booking', code],
    enabled: Boolean(code),
    queryFn: async () => (await api.get(`/bookings/${code}`)).data,
  });

  const submit = async () => {
    if (!code || !booking) return;
    setSubmitting(true);
    setError(null);

    try {
      const { data } = await api.post('/payments', {
        bookingCode: code,
        method,
      });

      if (data?.redirectUrl) {
        window.location.assign(data.redirectUrl);
        return;
      }
      navigate(`/confirmation?booking=${encodeURIComponent(code)}`);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Payment could not be prepared. Please try again.'
      );
      setSubmitting(false);
    }
  };

  if (!code) return <MissingBooking />;
  if (isLoading) {
    return (
      <div className="container-page section">
        <p className="text-neutral-mid">Loading…</p>
      </div>
    );
  }
  if (fetchError || !booking) return <MissingBooking />;

  return (
    <div className="container-page section">
      <div className="max-w-3xl mx-auto">
        <Link
          to={`/booking?package=${booking.package?.id ?? ''}`}
          className="text-sm text-neutral-mid hover:text-primary"
        >
          ← Back to booking
        </Link>

        <h1 className="font-heading text-3xl font-bold text-primary mt-4 mb-1">
          Payment
        </h1>
        <p className="text-neutral-mid mb-10">
          Booking <span className="font-mono">{booking.bookingCode}</span>
        </p>

        {error && (
          <p className="mb-6 text-sm text-error bg-red-50 px-4 py-3 rounded">
            {error}
          </p>
        )}

        {/* Payment methods */}
        <div className="mb-10">
          <h2 className="font-semibold text-neutral-dark mb-4">
            Payment method
          </h2>
          <div className="space-y-2">
            {METHODS.map((m) => (
              <label
                key={m.value}
                className={`flex items-center gap-3 px-4 py-3 border rounded cursor-pointer transition-colors ${
                  method === m.value
                    ? 'border-primary bg-primary/5'
                    : 'border-neutral-light hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="method"
                  value={m.value}
                  checked={method === m.value}
                  onChange={() => setMethod(m.value)}
                  className="text-primary"
                />
                <span className="text-sm font-medium text-neutral-dark">
                  {m.label}
                </span>
              </label>
            ))}
          </div>
          <p className="text-xs text-neutral-mid mt-3">
            Payments are recorded as pending. No real funds are charged in this
            demo.
          </p>
        </div>

        {/* Order summary */}
        <div className="border-t border-neutral-light pt-6">
          <h2 className="font-semibold text-neutral-dark mb-4">
            Order summary
          </h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-mid">Tour</span>
              <span className="text-neutral-dark font-medium text-right">
                {booking.package?.nameEn}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-mid">Date</span>
              <span className="text-neutral-dark">
                {formatDate(booking.bookingDate)} · {booking.timeSlot}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-mid">Guests</span>
              <span className="text-neutral-dark">
                {booking.adults} adult{booking.adults !== 1 ? 's' : ''}
                {booking.children > 0 && `, ${booking.children} children`}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-baseline mt-6 pt-6 border-t border-neutral-light">
            <span className="font-semibold text-neutral-dark">Total</span>
            <span className="font-heading text-2xl font-bold text-primary">
              {formatCurrency(booking.totalAmount)}
            </span>
          </div>

          <button
            onClick={submit}
            disabled={submitting}
            className="btn-primary w-full py-4 mt-6 disabled:opacity-60"
          >
            {submitting ? 'Preparing payment…' : 'Continue to payment'}
          </button>

          <p className="text-xs text-neutral-mid text-center mt-3">
            Questions?{' '}
            <Link to="/contact" className="underline hover:text-primary">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function MissingBooking() {
  return (
    <div className="container-page section max-w-md mx-auto text-center">
      <h1 className="font-heading text-2xl font-bold text-primary mb-2">
        Booking not found
      </h1>
      <p className="text-neutral-mid mb-6">
        Start by choosing one of our tours.
      </p>
      <Link to="/packages" className="btn-primary">
        Browse tours
      </Link>
    </div>
  );
}
