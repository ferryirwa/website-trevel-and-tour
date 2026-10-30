import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  CheckCircle2,
  Navigation,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

const contactSchema = z.object({
  name: z.string().min(2, "Please enter at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(2, "Please enter a subject"),
  message: z.string().min(10, "Please enter at least 10 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@aikbukak.com",
    href: "mailto:hello@aikbukak.com",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+62 812-3456-7890",
    href: "https://wa.me/6281234567890",
    external: true,
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+62 812-3456-7890",
    href: "tel:+6281234567890",
  },
  {
    icon: Clock,
    label: "Opening hours",
    value: "Mon – Sun, 08:00 – 17:00",
  },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    try {
      await api.post("/contact", data);
      setSuccess(true);
      reset();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "We could not send your message. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* -------------------- SUCCESS STATE -------------------- */
  if (success) {
    return (
      <div className="container-page section">
        <div className="max-w-md mx-auto text-center py-12">
          <div className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-6">
            <CheckCircle2 className="text-success" size={48} />
          </div>
          <h1 className="font-heading text-3xl font-bold text-primary mb-3">
            Message sent!
          </h1>
          <p className="text-neutral-mid mb-8 leading-relaxed">
            Thank you for reaching out. Our team will get back to you within 1–2
            business days.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setSuccess(false)}
              className="btn-secondary"
            >
              Send another message
            </button>
            <Link to="/" className="btn-primary">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------- MAIN -------------------- */
  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="bg-primary text-white">
        <div className="container-page py-16 md:py-20 text-center">
          <p className="font-semibold uppercase tracking-widest text-accent mb-3">
            Get in touch
          </p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            We'd love to hear from you.
          </h1>
          <p className="text-white/85 max-w-2xl mx-auto text-lg">
            Questions about a tour, special requests, or travel tips — our local
            team is happy to help.
          </p>
        </div>
      </section>

      {/* ============ FORM + INFO ============ */}
      <section className="container-page section">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 max-w-6xl mx-auto">
          {/* -------- Form -------- */}
          <div className="card p-6 md:p-8">
            <div className="mb-6">
              <h2 className="font-heading text-2xl font-bold text-neutral-dark">
                Send us a message
              </h2>
              <p className="text-sm text-neutral-mid mt-1">
                Fill out the form and we'll reply as soon as possible.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="label">Full name</label>
                  <input
                    {...register("name")}
                    className={`input ${errors.name ? "border-error" : ""}`}
                    placeholder="Your name"
                  />
                  {errors.name && (
                    <p className="text-xs text-error mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    {...register("email")}
                    className={`input ${errors.email ? "border-error" : ""}`}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="text-xs text-error mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="label">Subject</label>
                <input
                  {...register("subject")}
                  className={`input ${errors.subject ? "border-error" : ""}`}
                  placeholder="What is this about?"
                />
                {errors.subject && (
                  <p className="text-xs text-error mt-1">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label">Message</label>
                <textarea
                  {...register("message")}
                  rows={5}
                  className={`input ${errors.message ? "border-error" : ""}`}
                  placeholder="Tell us how we can help…"
                />
                {errors.message && (
                  <p className="text-xs text-error mt-1">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-4"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send size={18} /> Send message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* -------- Info -------- */}
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-2xl font-bold text-neutral-dark mb-1">
                Contact information
              </h2>
              <p className="text-sm text-neutral-mid">
                Reach us through any of these channels.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {contactInfo.map((item) => {
                const Icon = item.icon;
                const content = (
                  <>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="text-primary" size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-neutral-mid font-medium uppercase tracking-wide">
                        {item.label}
                      </p>
                      <p className="text-sm font-semibold text-neutral-dark truncate">
                        {item.value}
                      </p>
                    </div>
                  </>
                );

                return item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="card p-4 flex items-center gap-3 hover:border-primary border border-transparent transition-colors"
                  >
                    {content}
                  </a>
                ) : (
                  <div
                    key={item.label}
                    className="card p-4 flex items-center gap-3"
                  >
                    {content}
                  </div>
                );
              })}
            </div>

            {/* Address */}
            <div className="card p-5">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="text-primary" size={18} />
                </div>
                <div>
                  <p className="text-xs text-neutral-mid font-medium uppercase tracking-wide">
                    Address
                  </p>
                  <p className="text-sm text-neutral-dark leading-relaxed mt-1">
                    Aik Bukak Waterfall, North Lombok, West Nusa Tenggara,
                    Indonesia
                  </p>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="card p-5 flex items-center justify-between hover:border-primary border border-transparent transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <MessageCircle className="text-green-600" size={18} />
                </div>
                <div>
                  <p className="font-semibold text-neutral-dark">
                    Chat on WhatsApp
                  </p>
                  <p className="text-xs text-neutral-mid">
                    Fastest response, usually within minutes
                  </p>
                </div>
              </div>
              <span className="text-primary group-hover:translate-x-1 transition-transform">
                →
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ============ MAP ============ */}
      <section className="bg-neutral-light">
        <div className="container-page py-16 md:py-20">
          <div className="text-center mb-8">
            <p className="font-semibold uppercase tracking-widest text-secondary">
              Find us
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold text-primary">
              Our location
            </h2>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="rounded-card overflow-hidden shadow-card">
              <iframe
                src="https://www.google.com/maps?q=Aik+Bukak+Waterfall+Lombok&output=embed"
                width="100%"
                height="420"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Aik Bukak Location"
              />
            </div>
            <div className="text-center mt-6">
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Aik+Bukak+Waterfall+Lombok"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <Navigation size={18} />
                Get directions
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
