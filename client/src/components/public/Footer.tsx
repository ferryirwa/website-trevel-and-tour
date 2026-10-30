import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-neutral-dark text-gray-300 mt-auto">
      <div className="container-page py-12 grid gap-8 md:grid-cols-4">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-heading font-bold text-lg">
              A
            </div>
            <span className="font-heading font-bold text-white text-lg">
              Visit<span className="text-accent">Aikbukak</span>
            </span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Discover the hidden paradise of Lombok. Natural springs, local culture,
            and unforgettable experiences await.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-white font-semibold mb-4">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/packages" className="hover:text-accent">Tour Packages</Link></li>
            <li><Link to="/gallery" className="hover:text-accent">Gallery</Link></li>
            <li><Link to="/ratings" className="hover:text-accent">Ratings</Link></li>
            <li><Link to="/experiences" className="hover:text-accent">Guest Experiences</Link></li>
            <li><Link to="/about" className="hover:text-accent">About Us</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 text-accent shrink-0" />
              <span>Aik Bukak, Lombok, NTB, Indonesia</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-accent shrink-0" />
              <a href="mailto:hello@aikbukak.com" className="hover:text-accent">
                hello@aikbukak.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-accent shrink-0" />
              <a href="tel:+6281234567890" className="hover:text-accent">
                +62 812-3456-7890
              </a>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="text-white font-semibold mb-4">Follow Us</h4>
          <div className="flex gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-neutral-dark transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-neutral-dark transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={18} />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-neutral-dark transition-colors"
              aria-label="YouTube"
            >
              <Youtube size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Visit Aikbukak. All rights reserved.</p>
          <p>Made with 🌿 in Lombok, Indonesia</p>
        </div>
      </div>
    </footer>
  );
}