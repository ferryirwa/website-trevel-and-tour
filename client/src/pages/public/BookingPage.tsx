import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePackages } from '@/hooks/usePackages';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

type BookingForm = { packageId: string; guestName: string; guestEmail: string; guestPhone: string; guestCountry: string; bookingDate: string; timeSlot: string; adults: number; children: number; notes?: string };

export default function BookingPage() {
  const { data: packages, isLoading } = usePackages();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<BookingForm>({ defaultValues: { packageId: searchParams.get('package') || '', adults: 1, children: 0, timeSlot: '09:00 AM' } });
  const packageId = watch('packageId');
  const adults = Number(watch('adults')) || 0;
  const children = Number(watch('children')) || 0;
  const selectedPackage = packages?.find((pkg) => pkg.id === packageId);
  const total = useMemo(() => selectedPackage ? Number(selectedPackage.price) * (adults + children * 0.5) : 0, [selectedPackage, adults, children]);

  const onSubmit = async (data: BookingForm) => {
    try {
      const { data: booking } = await api.post('/bookings', data);
      navigate(`/payment?booking=${encodeURIComponent(booking.bookingCode)}`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'We could not create your booking. Please try again.');
    }
  };

  return <div className="container-page section"><div className="mx-auto max-w-5xl"><h1 className="font-heading text-3xl font-bold text-primary">Book your tour</h1><p className="mb-8 mt-2 text-neutral-mid">Choose your experience, preferred date, and group details.</p><form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-[1fr_360px]"><div className="card p-6 md:p-8"><div className="space-y-6"><div><label className="label">Tour</label><select {...register('packageId', { required: 'Please choose a tour.' })} className="input" disabled={isLoading}><option value="">{isLoading ? 'Loading tours…' : 'Select a tour'}</option>{packages?.map((pkg) => <option key={pkg.id} value={pkg.id}>{pkg.nameEn} — {formatCurrency(pkg.price)}</option>)}</select>{errors.packageId && <p className="mt-1 text-xs text-error">{errors.packageId.message}</p>}</div><div className="grid gap-6 md:grid-cols-2"><Field label="Full name" error={errors.guestName?.message}><input {...register('guestName', { required: 'Your name is required.' })} className="input" placeholder="Your full name" /></Field><Field label="Email address" error={errors.guestEmail?.message}><input type="email" {...register('guestEmail', { required: 'Your email is required.' })} className="input" placeholder="you@example.com" /></Field><Field label="Phone number" error={errors.guestPhone?.message}><input {...register('guestPhone', { required: 'Your phone number is required.' })} className="input" placeholder="Include country code" /></Field><Field label="Country" error={errors.guestCountry?.message}><input {...register('guestCountry', { required: 'Your country is required.' })} className="input" placeholder="Your country of residence" /></Field></div><div className="grid gap-6 md:grid-cols-2"><Field label="Tour date" error={errors.bookingDate?.message}><input type="date" min={new Date().toISOString().slice(0, 10)} {...register('bookingDate', { required: 'Please choose a date.' })} className="input" /></Field><Field label="Start time"><select {...register('timeSlot')} className="input"><option>08:00 AM</option><option>09:00 AM</option><option>10:00 AM</option><option>01:00 PM</option><option>03:00 PM</option></select></Field></div><div className="grid gap-6 md:grid-cols-2"><Field label="Adults" error={errors.adults?.message}><input type="number" min="1" {...register('adults', { valueAsNumber: true, min: { value: 1, message: 'At least one adult is required.' } })} className="input" /></Field><Field label="Children"><input type="number" min="0" {...register('children', { valueAsNumber: true, min: 0 })} className="input" /></Field></div><Field label="Additional notes"><textarea {...register('notes')} rows={3} className="input" placeholder="Accessibility needs, questions, or other requests (optional)" /></Field></div></div><aside className="card h-fit p-6"><h2 className="font-heading text-xl font-bold text-neutral-dark">Booking summary</h2>{selectedPackage ? <><p className="mt-4 font-semibold text-primary">{selectedPackage.nameEn}</p><p className="mt-1 text-sm text-neutral-mid">{selectedPackage.durationHours} hours · {formatCurrency(selectedPackage.price)} per adult</p><div className="my-5 border-t border-neutral-light" /><div className="space-y-2 text-sm text-neutral-mid"><div className="flex justify-between"><span>Adults ({adults})</span><span>{formatCurrency(Number(selectedPackage.price) * adults)}</span></div><div className="flex justify-between"><span>Children ({children})</span><span>{formatCurrency(Number(selectedPackage.price) * children * 0.5)}</span></div></div><div className="mt-5 flex justify-between border-t border-neutral-light pt-5 font-heading text-xl font-bold text-primary"><span>Total</span><span>{formatCurrency(total)}</span></div></> : <p className="mt-4 text-sm text-neutral-mid">Select a tour to see your estimated total. Children are charged at 50% of the adult price.</p>}<button disabled={isSubmitting || !selectedPackage} className="btn-primary mt-6 w-full py-3 disabled:opacity-50">{isSubmitting ? 'Creating booking…' : 'Continue to payment'}</button><p className="mt-3 text-center text-xs text-neutral-mid">You will choose a payment method on the next step.</p></aside></form></div></div>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <div><label className="label">{label}</label>{children}{error && <p className="mt-1 text-xs text-error">{error}</p>}</div>; }
