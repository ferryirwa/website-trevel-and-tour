import { FormEvent, useEffect, useState } from 'react';
import { Save, Loader2, CheckCircle2, AlertCircle, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { Skeleton } from '@/components/ui/Skeleton';

type Stat = { value: string; label: string };
type TeamMember = { name: string; role: string; bio: string; photo: string };
type Value = { title: string; text: string };

const DEFAULT_SETTINGS: Record<string, string> = {
  'about.hero.title': 'A natural escape with a local heart.',
  'about.hero.subtitle':
    'Discover a side of Lombok where forest, fresh water, and community come together — guided by the people who call this place home.',
  'about.story.p1':
    "Visit Aik Bukak connects travellers with one of Lombok's peaceful natural areas. From the first question to the final walk back, we make it simple to experience the destination with trusted local guidance.",
  'about.story.p2':
    "What started as a small trail project led by village guides has grown into a full tour operation — but our mission remains the same: share Aik Bukak responsibly, support the community, and give every guest a day they'll remember.",
  'about.vision':
    "To be Lombok's most trusted community-based nature destination — where travellers experience authentic hospitality and the landscape is protected for generations to come.",
  'about.mission':
    "Deliver safe, meaningful, and locally guided tours.|Support local families through fair tourism income.|Protect the forest, springs, and wildlife of Aik Bukak.|Share Lombok's culture with respect and curiosity.",
  'about.stats':
    '[{"value":"10+","label":"Years welcoming guests"},{"value":"2,500+","label":"Verified guest reviews"},{"value":"15","label":"Local guides & staff"},{"value":"100%","label":"Community-run tours"}]',
  'about.team':
    '[{"name":"Ahmad Fauzi","role":"Founder & Head Guide","bio":"Born in North Lombok, Ahmad has led treks to Aik Bukak for over a decade.","photo":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"},{"name":"Siti Rahma","role":"Operations Manager","bio":"Siti coordinates bookings, guides, and community partnerships.","photo":"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80"},{"name":"Budi Santoso","role":"Lead Local Guide","bio":"Budi knows every trail, spring, and story around Aik Bukak.","photo":"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80"},{"name":"Maria Lopez","role":"Guest Experience","bio":"Maria makes sure every guest feels welcomed from first message to last step.","photo":"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80"}]',
  'about.values':
    '[{"title":"A place to reconnect","text":"Clear water, green forest, and a gentler pace for travellers who want to be outdoors."},{"title":"Rooted in community","text":"We work directly with local guides and families. Every tour supports livelihoods."},{"title":"Travel with confidence","text":"Thoughtfully planned experiences, clear itineraries, and safety-first guides."},{"title":"Low-impact tourism","text":"We keep group sizes small, respect the trail, and protect this landscape."}]',
};

/* ---------- helpers ---------- */
function parseJson<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

export default function AboutManagePage() {
  const { data, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  const [form, setForm] = useState<Record<string, string>>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<Stat[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [values, setValues] = useState<Value[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  /* hydrate */
  useEffect(() => {
    if (data) {
      const merged = { ...DEFAULT_SETTINGS, ...data };
      setForm(merged);
      setStats(parseJson<Stat[]>(merged['about.stats'], []));
      setTeam(parseJson<TeamMember[]>(merged['about.team'], []));
      setValues(parseJson<Value[]>(merged['about.values'], []));
    }
  }, [data]);

  const setField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    try {
      const payload: Record<string, string> = {
        ...form,
        'about.stats': JSON.stringify(stats),
        'about.team': JSON.stringify(team),
        'about.values': JSON.stringify(values),
      };
      await updateMutation.mutateAsync(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not save settings.');
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
          <h1 className="font-heading text-2xl font-bold text-primary">About Content</h1>
          <p className="text-sm text-neutral-mid mt-1">
            Edit the content of the About Us page.
          </p>
        </div>
        <Link
          to="/about"
          target="_blank"
          className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
        >
          View about page <ExternalLink size={14} />
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
        {/* HERO */}
        <Section title="Hero" description="Top banner of About page">
          <Field label="Headline" value={form['about.hero.title']} onChange={(v) => setField('about.hero.title', v)} />
          <Field label="Subtitle" value={form['about.hero.subtitle']} onChange={(v) => setField('about.hero.subtitle', v)} textarea />
        </Section>

        {/* STORY */}
        <Section title="Story" description="Two paragraphs describing your journey">
          <Field label="Paragraph 1" value={form['about.story.p1']} onChange={(v) => setField('about.story.p1', v)} textarea />
          <Field label="Paragraph 2" value={form['about.story.p2']} onChange={(v) => setField('about.story.p2', v)} textarea />
        </Section>

        {/* VISION & MISSION */}
        <Section title="Vision & Mission" description="Guiding principles of the destination">
          <Field label="Vision" value={form['about.vision']} onChange={(v) => setField('about.vision', v)} textarea />
          <Field
            label="Mission (separate items with | )"
            value={form['about.mission']}
            onChange={(v) => setField('about.mission', v)}
            textarea
            hint="Example: Item 1|Item 2|Item 3"
          />
        </Section>

        {/* STATS */}
        <Section title="Stats" description="The 4 numbers shown on About page">
          <div className="space-y-3">
            {stats.map((s, i) => (
              <div key={i} className="flex gap-3">
                <input
                  value={s.value}
                  onChange={(e) => {
                    const copy = [...stats];
                    copy[i] = { ...copy[i], value: e.target.value };
                    setStats(copy);
                  }}
                  placeholder="10+"
                  className="input w-32"
                />
                <input
                  value={s.label}
                  onChange={(e) => {
                    const copy = [...stats];
                    copy[i] = { ...copy[i], label: e.target.value };
                    setStats(copy);
                  }}
                  placeholder="Years welcoming guests"
                  className="input flex-1"
                />
                <button
                  type="button"
                  onClick={() => setStats(stats.filter((_, x) => x !== i))}
                  className="p-2 rounded-button text-error hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setStats([...stats, { value: '', label: '' }])}
              className="btn-secondary text-sm"
            >
              <Plus size={14} /> Add stat
            </button>
          </div>
        </Section>

        {/* TEAM */}
        <Section title="Team" description="Guides and staff shown on About page">
          <div className="space-y-4">
            {team.map((m, i) => (
              <div key={i} className="border border-neutral-light rounded-card p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-neutral-dark">Member {i + 1}</p>
                  <button
                    type="button"
                    onClick={() => setTeam(team.filter((_, x) => x !== i))}
                    className="p-1.5 rounded-button text-error hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    value={m.name}
                    onChange={(e) => {
                      const copy = [...team];
                      copy[i] = { ...copy[i], name: e.target.value };
                      setTeam(copy);
                    }}
                    placeholder="Name"
                    className="input"
                  />
                  <input
                    value={m.role}
                    onChange={(e) => {
                      const copy = [...team];
                      copy[i] = { ...copy[i], role: e.target.value };
                      setTeam(copy);
                    }}
                    placeholder="Role"
                    className="input"
                  />
                </div>
                <input
                  value={m.photo}
                  onChange={(e) => {
                    const copy = [...team];
                    copy[i] = { ...copy[i], photo: e.target.value };
                    setTeam(copy);
                  }}
                  placeholder="Photo URL"
                  className="input"
                />
                <textarea
                  value={m.bio}
                  onChange={(e) => {
                    const copy = [...team];
                    copy[i] = { ...copy[i], bio: e.target.value };
                    setTeam(copy);
                  }}
                  placeholder="Short bio"
                  rows={2}
                  className="input"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setTeam([...team, { name: '', role: '', bio: '', photo: '' }])}
              className="btn-secondary text-sm"
            >
              <Plus size={14} /> Add member
            </button>
          </div>
        </Section>

        {/* VALUES */}
        <Section title="Values" description="4 cards below the story">
          <div className="space-y-4">
            {values.map((v, i) => (
              <div key={i} className="border border-neutral-light rounded-card p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-neutral-dark">Value {i + 1}</p>
                  <button
                    type="button"
                    onClick={() => setValues(values.filter((_, x) => x !== i))}
                    className="p-1.5 rounded-button text-error hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <input
                  value={v.title}
                  onChange={(e) => {
                    const copy = [...values];
                    copy[i] = { ...copy[i], title: e.target.value };
                    setValues(copy);
                  }}
                  placeholder="Title"
                  className="input"
                />
                <textarea
                  value={v.text}
                  onChange={(e) => {
                    const copy = [...values];
                    copy[i] = { ...copy[i], text: e.target.value };
                    setValues(copy);
                  }}
                  placeholder="Description"
                  rows={2}
                  className="input"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setValues([...values, { title: '', text: '' }])}
              className="btn-secondary text-sm"
            >
              <Plus size={14} /> Add value
            </button>
          </div>
        </Section>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-light">
          <button type="submit" className="btn-primary" disabled={updateMutation.isPending}>
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

/* ---------- subcomponents ---------- */
function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <div className="mb-5 pb-4 border-b border-neutral-light">
        <h2 className="font-heading font-bold text-neutral-dark">{title}</h2>
        {description && <p className="text-xs text-neutral-mid mt-1">{description}</p>}
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
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  hint?: string;
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
      {hint && <p className="text-xs text-neutral-mid mt-1">{hint}</p>}
    </div>
  );
}
