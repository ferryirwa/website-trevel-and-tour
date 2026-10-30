import { Link } from 'react-router-dom';
import { Heart, Mountain, ShieldCheck, Leaf, Compass, Target, Eye, ArrowRight, MapPin, Mail } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

const ICONS = [Mountain, Heart, ShieldCheck, Leaf];
const FALLBACK_TEAM_PHOTO = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80';

function parseJson<T>(str: string | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

export default function AboutPage() {
  const { data: settings } = useSettings();
  const s = (key: string, fallback: string) => settings?.[key] ?? fallback;

  const stats = parseJson<{ value: string; label: string }[]>(settings?.['about.stats'], []);
  const team = parseJson<{ name: string; role: string; bio: string; photo: string }[]>(settings?.['about.team'], []);
  const values = parseJson<{ title: string; text: string }[]>(settings?.['about.values'], []);
  const mission = s('about.mission', '').split('|').filter(Boolean);

  return (
    <div>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-primary text-white">
        <img
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1800&q=85"
          alt="Forest near Aik Bukak"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-neutral-dark/90 via-primary/75 to-primary/40" />
        <div className="container-page py-24 md:py-32">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent backdrop-blur mb-5">
              <MapPin size={16} /> About Aik Bukak
            </p>
            <h1 className="font-heading text-4xl md:text-6xl font-bold leading-[1.1]">
              {s('about.hero.title', 'A natural escape with a local heart.')}
            </h1>
            <p className="mt-6 text-lg text-white/85 leading-relaxed max-w-xl">
              {s('about.hero.subtitle', 'Discover a side of Lombok where forest, fresh water, and community come together.')}
            </p>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="container-page section">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="aspect-[4/5] rounded-card overflow-hidden bg-neutral-light">
            <img
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=85"
              alt="Aik Bukak waterfall"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-semibold uppercase tracking-widest text-secondary">Our story</p>
            <h2 className="mt-3 font-heading text-3xl md:text-4xl font-bold text-primary">
              Made for meaningful days in nature.
            </h2>
            <p className="mt-5 leading-relaxed text-neutral-mid">
              {s('about.story.p1', '')}
            </p>
            <p className="mt-4 leading-relaxed text-neutral-mid">
              {s('about.story.p2', '')}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/packages" className="btn-primary">
                Browse tours <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="btn-secondary">Talk to our team</Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      {stats.length > 0 && (
        <section className="bg-neutral-light">
          <div className="container-page py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="font-heading text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                  <p className="mt-1 text-sm text-neutral-mid">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* VISION & MISSION */}
      <section className="container-page section">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="font-semibold uppercase tracking-widest text-secondary">What guides us</p>
          <h2 className="mt-3 font-heading text-3xl md:text-4xl font-bold text-primary">Vision & mission</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <div className="card p-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <Eye className="text-primary" size={24} />
            </div>
            <h3 className="font-heading text-xl font-bold text-neutral-dark mb-3">Our vision</h3>
            <p className="text-neutral-mid leading-relaxed">{s('about.vision', '')}</p>
          </div>
          <div className="card p-8">
            <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center mb-5">
              <Target className="text-accent" size={24} />
            </div>
            <h3 className="font-heading text-xl font-bold text-neutral-dark mb-3">Our mission</h3>
            <ul className="space-y-2 text-neutral-mid">
              {mission.map((m, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary">•</span>
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* VALUES */}
      {values.length > 0 && (
        <section className="bg-neutral-light">
          <div className="container-page section">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <p className="font-semibold uppercase tracking-widest text-secondary">Our values</p>
              <h2 className="mt-3 font-heading text-3xl md:text-4xl font-bold text-primary">
                What makes a visit here different.
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {values.map((v, i) => {
                const Icon = ICONS[i % ICONS.length];
                return (
                  <article key={i} className="card p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="text-primary" size={22} />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-neutral-dark mb-2">{v.title}</h3>
                    <p className="text-sm text-neutral-mid leading-relaxed">{v.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* TEAM */}
      {team.length > 0 && (
        <section className="container-page section">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <p className="font-semibold uppercase tracking-widest text-secondary">Meet the team</p>
            <h2 className="mt-3 font-heading text-3xl md:text-4xl font-bold text-primary">
              The people behind your visit.
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {team.map((member, i) => (
              <div key={i} className="card overflow-hidden text-center">
                <div className="aspect-square overflow-hidden bg-neutral-light">
                  <img
                    src={member.photo || FALLBACK_TEAM_PHOTO}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-heading font-bold text-neutral-dark">{member.name}</h3>
                  <p className="text-sm font-medium text-primary mt-1">{member.role}</p>
                  <p className="text-xs text-neutral-mid mt-3 leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary text-white">
        <div className="container-page section text-center">
          <Compass className="mx-auto text-accent mb-4" size={40} />
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">Ready to experience Aik Bukak?</h2>
          <p className="text-white/85 max-w-xl mx-auto mb-8">
            Browse our guided tours or reach out to our local team — we're happy to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/packages" className="inline-flex items-center justify-center gap-2 bg-accent text-neutral-dark px-6 py-3 rounded-button font-semibold hover:bg-yellow-400">
              Browse tours <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white px-6 py-3 rounded-button font-semibold hover:bg-white/10">
              <Mail size={16} /> Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
