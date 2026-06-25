import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Instagram, Facebook } from 'lucide-react';
import dfcLogo from '../../assets/dfc-logo.png';

const Footer = () => (
  <footer className="relative overflow-hidden border-t mt-16" style={{ borderColor: 'rgba(26,24,22,0.06)', background: '#fffdfb' }}>

    {/* Top tricolor divider */}
    <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, #e2131c, #f7780e, #5b9e0f)' }} />

    {/* Ambient soft orbs */}
    <div className="absolute -bottom-20 -left-20 w-72 h-72 orb-red rounded-full pointer-events-none" />
    <div className="absolute -top-10 -right-10 w-56 h-56 orb-green rounded-full pointer-events-none" />

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">

      {/* Brand */}
      <div className="md:col-span-1 space-y-5">
        <div className="flex items-center gap-2.5">
          <img src={dfcLogo} alt="DFC — Devi Food Court" className="w-10 h-10 object-contain" />
          <span className="font-display text-2xl tracking-wide text-ink-900">Devi Food Court</span>
        </div>
        <p className="text-ink-600 text-sm leading-relaxed">
          Authentic flavours crafted with love, delivered hot to your doorstep across Vijayawada.
        </p>
        <div className="flex gap-3">
          {[
            { href: '#', Icon: Instagram, color: '#e2131c' },
            { href: '#', Icon: Facebook,  color: '#5b9e0f' },
          ].map(({ href, Icon, color }) => (
            <a key={color} href={href}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 bg-ink-900/[0.04] border border-ink-900/[0.06] hover:shadow-soft"
              style={{ color }}>
              <Icon size={15} />
            </a>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h4 className="font-bold text-xs uppercase tracking-widest mb-5" style={{ color: '#e2131c' }}>Quick Links</h4>
        <ul className="space-y-2.5">
          {[['/', 'Home'], ['/menu', 'Menu'], ['/offers', 'Offers'], ['/track', 'Track Order'], ['/contact', 'Contact']].map(([to, label]) => (
            <li key={to}>
              <Link to={to} className="text-ink-600 hover:text-ink-900 text-sm transition-colors duration-200 flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-ink-300 group-hover:bg-brand-500 transition-colors" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Contact */}
      <div>
        <h4 className="font-bold text-xs uppercase tracking-widest mb-5" style={{ color: '#f7780e' }}>Contact</h4>
        <ul className="space-y-3.5">
          <li className="flex items-start gap-3 text-sm text-ink-600">
            <MapPin size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#f7780e' }} />
            Benz Circle, Vijayawada, Andhra Pradesh 520010
          </li>
          <li className="flex items-center gap-3 text-sm text-ink-600">
            <Phone size={14} className="flex-shrink-0" style={{ color: '#f7780e' }} />
            <a href="tel:+919876543210" className="hover:text-ink-900 transition-colors">+91 98765 43210</a>
          </li>
          <li className="flex items-center gap-3 text-sm text-ink-600">
            <Mail size={14} className="flex-shrink-0" style={{ color: '#f7780e' }} />
            <a href="mailto:hello@dfcrestaurant.com" className="hover:text-ink-900 transition-colors truncate">hello@dfcrestaurant.com</a>
          </li>
        </ul>
      </div>

      {/* Hours */}
      <div>
        <h4 className="font-bold text-xs uppercase tracking-widest mb-5" style={{ color: '#5b9e0f' }}>Hours</h4>
        <ul className="space-y-2 text-sm text-ink-600">
          <li className="flex items-center gap-2"><Clock size={12} style={{ color: '#5b9e0f' }} /> Mon–Fri: 10am – 10pm</li>
          <li className="flex items-center gap-2"><Clock size={12} style={{ color: '#5b9e0f' }} /> Sat–Sun: 10am – 11pm</li>
        </ul>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: 'rgba(91,158,15,0.08)', border: '1px solid rgba(91,158,15,0.25)' }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#5b9e0f' }} />
          <span className="text-xs font-bold tracking-wide" style={{ color: '#5b9e0f' }}>Open Now</span>
        </div>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="border-t py-5 text-center text-xs text-ink-500" style={{ borderColor: 'rgba(26,24,22,0.06)' }}>
      <span className="gradient-text font-bold">Devi Food Court</span>
      <span className="mx-2 text-ink-300">·</span>
      © {new Date().getFullYear()} All rights reserved
      <span className="mx-2 text-ink-300">·</span>
      Made with ❤️ in Vijayawada
    </div>
  </footer>
);

export default Footer;
