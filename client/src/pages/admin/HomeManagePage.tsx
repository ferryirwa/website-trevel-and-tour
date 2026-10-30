import { FormEvent, useEffect, useState } from 'react';
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { Skeleton } from '@/components/ui/Skeleton';
import { ImageUploader } from '@/components/ui/ImageUploader';

const DEFAULT_SETTINGS = {
  'brand.logo': '',
  'hero.badge': 'North Lombok, Indonesia',
  'hero.title': 'Aik Bukak — a hidden spring in the heart of Lombok.',
  'hero.subtitle':
    'Fresh mountain water, shaded forest trails, and the quiet rhythm of village life. Join a guided tour with the people who call this place home.',
  'hero.image': '',
  'hero.cta.label': 'Browse tours',
  'hero.cta.link': '/packages',
  'trust.reviews.label': 'verified guest reviews',
  'trust.guides.label': 'Local guides',
  'trust.guides.subtitle': 'trained, welcoming, safety-first',
  'packages.title': 'Pick the experience that fits your day.',
  'gallery.title': 'The landscape, up close.',
  'stories.title': 'What guests remember most.',
};

type Settings = typeof DEFAULT_SETTINGS;

export default function HomeManagePage() {
  const { data, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  const [form, setForm] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (data) {
      setForm((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]) {
          if (data[key] !== undefined) next[key] = data[key];
        }
        return next;
      });
    }
  }, [data]);

  const setField = (key: keyof Settings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    try {
      await updateMutation.mutateAsync(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Could not save settings. Please try again.'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl">
        <Skeleton className="h-9 w-64 mb-2 rounded" />
        <Skeleton className="h-4 w-80 mb-8 rounded" />
        <Skeleton className="h-96 rounded-card" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-primary">
            Home Content
          </h1>
          <p className="text-sm text-neutral-mid mt-1">
            Edit the text and visuals shown on the public homepage.
          </p>
        </div>
        <Link
          to="/"
          target="_blank"
          className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
        >
          View homepage <ExternalLink size={14} />
        </Link>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-input bg-red-50 p-4">
          <AlertCircle className="text-error shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {saved && (
        <div className="mb-5 flex items-start gap-3 rounded-input bg-green-50 p-4">
          <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-green-800">Settings saved successfully.</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* ============ BRANDING ============ */}
        <Section
          title="Branding"
          description="Logo shown in the navbar across all pages"
        >
          <ImageUploader
            label="Logo"
            value={form['brand.logo']}
            onChange={(v) => setField('brand.logo', v)}
            hint="Kosongkan untuk pakai logo default. Ukuran ideal: PNG transparan, maksimal 400×120px."
          />
        </Section>

        {/* ============ HERO ============ */}
        <Section title="Hero section" description="Top banner of the homepage">
          <ImageUploader
            label="Hero background image"
            value={form['hero.image']}
            onChange={(v) => setField('hero.image', v)}
            hint="Kosongkan untuk pakai gambar default. Ukuran ideal: 1920×1080px."
          />

          <Field
            label="Location badge"
            value={form['hero.badge']}
            onChange={(v) => setField('hero.badge', v)}
            placeholder="North Lombok, Indonesia"
          />
          <Field
            label="Main headline"
            value={form['hero.title']}
            onChange={(v) => setField('hero.title', v)}
            placeholder="Aik Bukak — a hidden spring..."
            textarea
          />
          <Field
            label="Subtitle"
            value={form['hero.subtitle']}
            onChange={(v) => setField('hero.subtitle', v)}
            textarea
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Primary CTA label"
              value={form['hero.cta.label']}
              onChange={(v) => setField('hero.cta.label', v)}
              placeholder="Browse tours"
            />
            <Field
              label="Primary CTA link"
              value={form['hero.cta.link']}
              onChange={(v) => setField('hero.cta.link', v)}
              placeholder="/packages"
            />
          </div>
        </Section>

        {/* ============ TRUST BAR ============ */}
        <Section title="Trust bar" description="Stats below the hero">
          <Field
            label="Reviews label"
            value={form['trust.reviews.label']}
            onChange={(v) => setField('trust.reviews.label', v)}
            placeholder="verified guest reviews"
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Guides label"
              value={form['trust.guides.label']}
              onChange={(v) => setField('trust.guides.label', v)}
              placeholder="Local guides"
            />
            <Field
              label="Guides subtitle"
              value={form['trust.guides.subtitle']}
              onChange={(v) => setField('trust.guides.subtitle', v)}
              placeholder="trained, welcoming, safety-first"
            />
          </div>
        </Section>

        {/* ============ SECTION HEADINGS ============ */}
        <Section
          title="Section headings"
          description="Titles of the main sections below"
        >
          <Field
            label="Popular packages heading"
            value={form['packages.title']}
            onChange={(v) => setField('packages.title', v)}
            placeholder="Pick the experience that fits your day."
          />
          <Field
            label="Gallery heading"
            value={form['gallery.title']}
            onChange={(v) => setField('gallery.title', v)}
            placeholder="The landscape, up close."
          />
          <Field
            label="Guest stories heading"
            value={form['stories.title']}
            onChange={(v) => setField('stories.title', v)}
            placeholder="What guests remember most."
          />
        </Section>

        {/* ============ ACTIONS ============ */}
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-light">
          <button
            type="button"
            onClick={() => setForm(DEFAULT_SETTINGS)}
            className="btn-secondary"
            disabled={updateMutation.isPending}
          >
            Reset to defaults
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Saving…
              </>
            ) : (
              <>
                <Save size={16} /> Save changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-6">
      <div className="mb-5 pb-4 border-b border-neutral-light">
        <h2 className="font-heading font-bold text-neutral-dark">{title}</h2>
        {description && (
          <p className="text-xs text-neutral-mid mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {textarea ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="input"
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="input"
        />
      )}
    </div>
  );
}
