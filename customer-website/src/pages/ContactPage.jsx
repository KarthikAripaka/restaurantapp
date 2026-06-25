import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Instagram, Facebook, MessageCircle } from 'lucide-react';

const HOURS = [
  { days: 'Monday – Friday', time: '10:00 AM – 10:00 PM' },
  { days: 'Saturday',        time: '10:00 AM – 11:00 PM' },
  { days: 'Sunday',          time: '10:00 AM – 11:00 PM' },
];

const CONTACT_CARDS = [
  { icon: Phone, title: 'Call Us', value: '+91 98765 43210', sub: 'Available during business hours',
    href: 'tel:+919876543210', cta: 'Call Now', grad: 'linear-gradient(135deg, #e2131c, #f7780e)' },
  { icon: MessageCircle, title: 'WhatsApp', value: '+91 98765 43210', sub: 'Quick responses on WhatsApp',
    href: 'https://wa.me/919876543210', cta: 'Chat Now', grad: 'linear-gradient(135deg, #3f7a0a, #5b9e0f)' },
  { icon: Mail, title: 'Email Us', value: 'hello@dfcrestaurant.com', sub: 'We reply within 24 hours',
    href: 'mailto:hello@dfcrestaurant.com', cta: 'Send Email', grad: 'linear-gradient(135deg, #f7780e, #fb842f)' },
];

const ContactPage = () => {
  return (
    <div className="min-h-screen pt-20 pb-24 px-4 bg-cream-50">
      <div className="max-w-6xl mx-auto pt-12">

        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="section-heading text-4xl md:text-5xl mb-4">Get in <span className="gradient-text">Touch</span></h1>
          <p className="section-sub mx-auto text-center">
            Have a question or want to give feedback? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {CONTACT_CARDS.map(({ icon: Icon, title, value, sub, href, cta, grad }) => (
            <motion.a key={title} href={href} target="_blank" rel="noreferrer"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl p-6 group hover:scale-[1.02] transition-all duration-300 block text-white"
              style={{ background: grad, boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
              <div className="relative space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Icon size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-white/75 text-xs font-semibold uppercase tracking-wider">{title}</p>
                  <p className="text-white font-bold text-lg mt-1 break-all">{value}</p>
                  <p className="text-white/65 text-xs mt-1">{sub}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-white text-sm font-semibold group-hover:gap-2 transition-all">
                  {cta} →
                </span>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Location & Hours */}
          <div className="space-y-5">
            <div className="card-premium p-6 space-y-5">
              <h3 className="font-bold text-ink-900 text-lg flex items-center gap-2">
                <MapPin size={18} style={{ color: '#e2131c' }} /> Our Location
              </h3>
              <div className="space-y-2">
                <p className="text-ink-900 font-semibold">Devi Food Court</p>
                <p className="text-ink-600 text-sm leading-relaxed">
                  Benz Circle, Vijayawada,<br />
                  Andhra Pradesh 520010, India
                </p>
              </div>
              <a href="https://maps.google.com/?q=Benz+Circle,Vijayawada" target="_blank" rel="noreferrer"
                className="btn-outline text-sm py-2.5 px-5 inline-flex">
                <MapPin size={14} /> Open in Maps
              </a>
            </div>

            <div className="card-premium p-6 space-y-4">
              <h3 className="font-bold text-ink-900 text-lg flex items-center gap-2">
                <Clock size={18} style={{ color: '#f7780e' }} /> Business Hours
              </h3>
              <div className="space-y-3">
                {HOURS.map(({ days, time }) => (
                  <div key={days} className="flex justify-between items-center py-2 border-b border-ink-900/[0.06] last:border-0">
                    <span className="text-ink-600 text-sm">{days}</span>
                    <span className="text-ink-900 text-sm font-medium">{time}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: 'rgba(91,158,15,0.08)', border: '1px solid rgba(91,158,15,0.2)' }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#5b9e0f' }} />
                <span className="text-sm font-semibold" style={{ color: '#5b9e0f' }}>Currently Open</span>
              </div>
            </div>

            {/* Social */}
            <div className="card-premium p-6">
              <h3 className="font-bold text-ink-900 text-lg mb-4">Follow Us</h3>
              <div className="flex gap-3">
                {[
                  { icon: Instagram, label: 'Instagram', href: '#', color: '#e2131c' },
                  { icon: Facebook,  label: 'Facebook',  href: '#', color: '#5b9e0f' },
                ].map(({ icon: Icon, label, href, color }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 bg-cream-100 border border-ink-900/[0.06] rounded-xl px-4 py-2.5 text-ink-600 text-sm font-medium transition-all hover:text-white"
                    style={{ '--hover-bg': color }}
                    onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; }}>
                    <Icon size={16} /> {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Map placeholder card */}
          <div className="card-premium overflow-hidden h-full min-h-[400px] relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
              style={{ background: 'linear-gradient(160deg, #fff8f2 0%, #fffdfb 100%)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(226,19,28,0.08)' }}>
                <MapPin size={32} style={{ color: '#e2131c' }} />
              </div>
              <h3 className="font-bold text-ink-900 text-xl mb-2">Find Us Here</h3>
              <p className="text-ink-500 text-sm mb-6">Benz Circle, Vijayawada, Andhra Pradesh</p>
              <a href="https://maps.google.com/?q=Benz+Circle,Vijayawada" target="_blank" rel="noreferrer" className="btn-primary text-sm px-6 py-3">
                Open Google Maps
              </a>
              <p className="text-ink-400 text-xs mt-4">Easy to find · Ample parking available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
