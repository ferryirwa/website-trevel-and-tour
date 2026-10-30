import { FormEvent, useState, useRef } from 'react';
import { LoaderCircle, Star, Upload, X, CheckCircle2, AlertCircle, Quote, Image as ImageIcon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useExperiences } from '@/hooks/useExperiences';
import { Skeleton } from '@/components/ui/Skeleton';
import { mediaUrl } from '@/lib/utils';

type FilterSource = 'ALL' | 'GOOGLE' | 'TRIPADVISOR';

export default function ExperiencesPage() {
  const { data: experiences, isLoading } = useExperiences();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterSource>('ALL');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const next = files.slice(0, 5).map((f) => URL.createObjectURL(f));
    setPreviews(next);
  }

  function removePreview(index: number) {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setNotice(null);
    setError(null);
    try {
      const form = new FormData(event.currentTarget);
      await api.post('/experiences', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      formRef.current?.reset();
      setPreviews([]);
      setNotice('Thank you! Your story has been submitted and is awaiting review.');
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.message ||
          'We could not submit your experience. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = experiences?.filter((exp) =>
    filter === 'ALL' ? true : exp.verifiedVia === filter
  );

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="bg-primary text-white">
        <div className="container-page py-16 md:py-20 text-center">
          <p className="font-semibold uppercase tracking-widest text-accent mb-3">
            Guest experiences
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Stories from people who've been there.
          </h1>
          <p className="text-white/85 max-w-2xl mx-auto text-lg">
            Every visit leaves a memory. Read what other guests remember most —
            and share your own.
          </p>
        </div>
      </section>

      {/* ============ FORM ============ */}
      <section className="container-page section">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
            {/* -------- Form -------- */}
            <div className="card p-6 md:p-8">
              <div className="mb-6">
                <h2 className="font-heading text-2xl font-bold text-neutral-dark">
                  Share your experience
                </h2>
                <p className="text-sm text-neutral-mid mt-1">
                  All submissions are reviewed by our team before publishing.
                </p>
              </div>

              {notice && (
                <div className="mb-5 flex items-start gap-3 rounded-input bg-green-50 p-4">
                  <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={20} />
                  <p className="text-sm text-green-800">{notice}</p>
                </div>
              )}
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-input bg-red-50 p-4">
                  <AlertCircle className="text-error shrink-0 mt-0.5" size={20} />
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}

              <form ref={formRef} onSubmit={submit} className="space-y-6">
                {/* Identity */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-mid mb-3">
                    Your identity
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Full name">
                      <input
                        name="guestName"
                        required
                        minLength={2}
                        className="input"
                        placeholder="John Doe"
                      />
                    </Field>
                    <Field label="Email address">
                      <input
                        name="guestEmail"
                        type="email"
                        required
                        className="input"
                        placeholder="you@example.com"
                      />
                    </Field>
                    <Field label="Country">
                      <input
                        name="country"
                        required
                        minLength={2}
                        className="input"
                        placeholder="United States"
                      />
                    </Field>
                    <Field label="Where did you review us?">
                      <select name="verifiedVia" className="input" defaultValue="GOOGLE">
                        <option value="GOOGLE">Google Reviews</option>
                        <option value="TRIPADVISOR">TripAdvisor</option>
                      </select>
                    </Field>
                  </div>
                </div>

                {/* Rating */}
                <div className="pt-5 border-t border-neutral-light">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-mid mb-3">
                    Your rating
                  </h3>
                  <Field label="How would you rate your visit?">
                    <select name="rating" className="input" defaultValue="5">
                      <option value="5">★★★★★ — Excellent</option>
                      <option value="4">★★★★☆ — Very good</option>
                      <option value="3">★★★☆☆ — Good</option>
                      <option value="2">★★☆☆☆ — Fair</option>
                      <option value="1">★☆☆☆☆ — Poor</option>
                    </select>
                  </Field>
                </div>

                {/* Story */}
                <div className="pt-5 border-t border-neutral-light">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-mid mb-3">
                    Your story
                  </h3>
                  <Field label="What made your visit memorable?">
                    <textarea
                      name="story"
                      required
                      minLength={20}
                      maxLength={5000}
                      rows={5}
                      className="input"
                      placeholder="Tell us about your experience — the trail, the people, the food, the moment you'll remember…"
                    />
                  </Field>
                </div>

                {/* Media */}
                <div className="pt-5 border-t border-neutral-light">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-mid mb-3">
                    Photos (optional)
                  </h3>
                  <label className="block cursor-pointer">
                    <input
                      ref={fileInputRef}
                      name="media"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFiles}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-neutral-light rounded-card p-6 text-center hover:border-primary hover:bg-primary/5 transition-colors">
                      <Upload className="mx-auto text-neutral-mid mb-2" size={24} />
                      <p className="text-sm font-medium text-neutral-dark">
                        Click to upload photos
                      </p>
                      <p className="text-xs text-neutral-mid mt-1">
                        Up to 5 images, 20 MB each (JPG, PNG, WebP)
                      </p>
                    </div>
                  </label>

                  {previews.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-4">
                      {previews.map((src, i) => (
                        <div key={i} className="relative group aspect-square">
                          <img
                            src={src}
                            alt={`Preview ${i + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removePreview(i)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full py-4"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle className="animate-spin" size={18} />
                      Submitting…
                    </>
                  ) : (
                    'Submit for review'
                  )}
                </button>
              </form>
            </div>

            {/* -------- Sidebar guide -------- */}
            <div className="space-y-5">
              <div className="card p-6 bg-primary/5 border-2 border-primary/20">
                <h3 className="font-heading font-bold text-primary mb-3">
                  Why share your story?
                </h3>
                <ul className="space-y-2 text-sm text-neutral-dark">
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    Help future travelers plan their visit
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    Support our local guide community
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    Inspire others to explore Lombok
                  </li>
                </ul>
              </div>

              <div className="card p-6">
                <h3 className="font-heading font-bold text-neutral-dark mb-3">
                  Guidelines
                </h3>
                <ul className="space-y-2 text-sm text-neutral-mid">
                  <li>• Only verified guests can submit</li>
                  <li>• Reviews may be edited for clarity</li>
                  <li>• Photos must be your own</li>
                  <li>• No promotional content</li>
                </ul>
              </div>

              <div className="card p-6 bg-accent/5 border-2 border-accent/20">
                <Quote className="text-accent mb-2" size={24} />
                <p className="text-sm italic text-neutral-dark">
                  "The best way to say thank you to our guides is to tell others
                  what you experienced."
                </p>
                <p className="text-xs text-neutral-mid mt-3">— Aik Bukak team</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LATEST STORIES ============ */}
      <section className="bg-neutral-light">
        <div className="container-page section">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <p className="font-semibold uppercase tracking-widest text-secondary">
                Recent
              </p>
              <h2 className="mt-2 font-heading text-3xl font-bold text-primary">
                Latest guest stories
              </h2>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              {(['ALL', 'GOOGLE', 'TRIPADVISOR'] as FilterSource[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-button text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-primary text-white'
                      : 'bg-white text-neutral-dark hover:bg-gray-100'
                  }`}
                >
                  {f === 'ALL' ? 'All' : f === 'GOOGLE' ? 'Google' : 'TripAdvisor'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-72 w-full rounded-card" />
              ))
            ) : filtered && filtered.length > 0 ? (
              filtered.map((experience) => (
                <article
                  key={experience.id}
                  className="card overflow-hidden flex flex-col"
                >
                  {experience.media?.[0]?.type === 'IMAGE' && (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={mediaUrl(experience.media[0].url)}
                        alt={`Shared by ${experience.guestName}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex text-accent mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          fill={star <= experience.rating ? 'currentColor' : 'none'}
                          className={
                            star <= experience.rating ? '' : 'text-gray-300'
                          }
                        />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed text-neutral-dark flex-1 line-clamp-6">
                      "{experience.story}"
                    </p>
                    <div className="mt-5 pt-4 border-t border-neutral-light flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm text-neutral-dark">
                          {experience.guestName}
                        </p>
                        <p className="text-xs text-neutral-mid">
                          {experience.country}
                        </p>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                        {experience.verifiedVia === 'GOOGLE' ? 'Google' : 'TripAdvisor'}
                      </span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <ImageIcon className="mx-auto text-neutral-mid mb-3" size={40} />
                <p className="text-neutral-mid">
                  No approved stories {filter !== 'ALL' ? 'from this source ' : ''}yet.
                  Be the first to share yours.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
