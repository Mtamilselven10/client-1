import React, { useState } from 'react';
import { Phone, Mail, Clock, MapPin, Send, MessageCircle, CheckCircle2 } from 'lucide-react';
import { 
  SHOP_NAME, 
  CUSTOMER_CARE_PHONES, 
  CUSTOMER_CARE_EMAIL, 
  STORE_ADDRESS, 
  WORKING_HOURS, 
  WHATSAPP_NUMBER 
} from '../config';
import { useToast } from '../context/ToastContext';

export default function CustomerCarePage() {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      addToast('Please fill in your name, phone number, and message.', 'error');
      return;
    }
    setSubmitted(true);
    addToast('Your inquiry has been received. Our team will contact you shortly.', 'success');
  };

  return (
    <div className="py-8 px-4 sm:px-8 max-w-7xl mx-auto bg-cream space-y-12">
      {/* Header */}
      <div className="max-w-2xl space-y-3">
        <span className="text-xs uppercase tracking-widest font-extrabold text-olive">
          At Your Service
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-ink">
          Customer Care & Sourcing Desk
        </h1>
        <p className="text-sm text-ink/75 leading-relaxed">
          Need advice on whole wheat grinding, authentic cold-pressed oil storage, or corporate bulk grocery gifting? Reach our family desk directly.
        </p>
      </div>

      {/* 3 Olive-Accented Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Phone 1 Card */}
        <a
          href={`tel:${CUSTOMER_CARE_PHONES[0].replace(/\s+/g, '')}`}
          className="p-6 rounded-card bg-cream-light border-2 border-olive/30 shadow-olive-sm hover:border-olive hover:shadow-olive-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-btn bg-olive text-cream flex items-center justify-center shadow-xs mb-4 group-hover:scale-105 transition-transform">
              <Phone className="w-6 h-6 text-cream" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-olive">
              Primary Phone Helpline (Tap to Call)
            </span>
            <h3 className="font-serif text-xl font-bold text-ink mt-1 group-hover:text-olive transition-colors">
              {CUSTOMER_CARE_PHONES[0]}
            </h3>
            <p className="text-xs text-ink/70 mt-2">
              Instant voice consultation for urgent grocery queries and order tracking.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-olive/10 text-xs font-bold text-olive flex items-center gap-1">
            <span>Tap to place a call</span>
            <span>→</span>
          </div>
        </a>

        {/* Phone 2 Card */}
        <a
          href={`tel:${CUSTOMER_CARE_PHONES[1].replace(/\s+/g, '')}`}
          className="p-6 rounded-card bg-cream-light border-2 border-olive/30 shadow-olive-sm hover:border-olive hover:shadow-olive-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-btn bg-olive text-cream flex items-center justify-center shadow-xs mb-4 group-hover:scale-105 transition-transform">
              <Phone className="w-6 h-6 text-cream" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-olive">
              Secondary Store Line (Tap to Call)
            </span>
            <h3 className="font-serif text-xl font-bold text-ink mt-1 group-hover:text-olive transition-colors">
              {CUSTOMER_CARE_PHONES[1]}
            </h3>
            <p className="text-xs text-ink/70 mt-2">
              Direct line to our store counter and dispatch supervisor.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-olive/10 text-xs font-bold text-olive flex items-center gap-1">
            <span>Tap to place a call</span>
            <span>→</span>
          </div>
        </a>

        {/* Email Card */}
        <a
          href={`mailto:${CUSTOMER_CARE_EMAIL}`}
          className="p-6 rounded-card bg-cream-light border-2 border-olive/30 shadow-olive-sm hover:border-olive hover:shadow-olive-md transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-btn bg-olive text-cream flex items-center justify-center shadow-xs mb-4 group-hover:scale-105 transition-transform">
              <Mail className="w-6 h-6 text-cream" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-olive">
              Official Email Desk (Tap to Mail)
            </span>
            <h3 className="font-serif text-xl font-bold text-ink mt-1 group-hover:text-olive transition-colors truncate">
              {CUSTOMER_CARE_EMAIL}
            </h3>
            <p className="text-xs text-ink/70 mt-2">
              For bulk institutional supply, corporate gifting, and feedback letters.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-olive/10 text-xs font-bold text-olive flex items-center gap-1">
            <span>Tap to send email</span>
            <span>→</span>
          </div>
        </a>
      </div>

      {/* Inquiry Form & Store Information Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Form Column (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-card bg-cream-deep border border-olive/20 shadow-olive-sm">
          <h2 className="font-serif text-2xl font-bold text-ink mb-2">
            Send an Inquiry to Our Sourcing Desk
          </h2>
          <p className="text-xs sm:text-sm text-ink/75 mb-6">
            We review and respond to every message within 2 working hours.
          </p>

          {submitted ? (
            <div className="p-8 rounded-card bg-cream-light border border-olive/30 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-olive mx-auto" />
              <h3 className="font-serif text-xl font-bold text-ink">Inquiry Submitted Successfully</h3>
              <p className="text-sm text-ink/75">
                Thank you, {formData.name}! Our customer care lead will call or message your number ({formData.phone}) promptly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', phone: '', subject: '', message: '' });
                }}
                className="px-6 py-2 rounded-btn bg-olive text-cream text-xs font-bold hover:bg-olive-dark transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-4 py-3 rounded-btn bg-cream-light text-ink text-sm border border-olive/25 focus:border-olive focus:ring-1 focus:ring-olive"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 rounded-btn bg-cream-light text-ink text-sm border border-olive/25 focus:border-olive focus:ring-1 focus:ring-olive"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Inquiring about A2 Gir Cow Ghee or Monthly Grain Subscription"
                  className="w-full px-4 py-3 rounded-btn bg-cream-light text-ink text-sm border border-olive/25 focus:border-olive focus:ring-1 focus:ring-olive"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                  Your Message or Requirement *
                </label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write your grocery questions, special dietary requirements, or feedback..."
                  className="w-full px-4 py-3 rounded-btn bg-cream-light text-ink text-sm border border-olive/25 focus:border-olive focus:ring-1 focus:ring-olive"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-btn bg-olive text-cream font-bold text-sm shadow-olive-md hover:bg-olive-dark active:scale-98 transition-all flex items-center justify-center gap-2 border border-olive-dark focus-visible:ring-2 focus-visible:ring-olive"
              >
                <Send className="w-4 h-4 text-cream" />
                <span>Submit Care Inquiry</span>
              </button>
            </form>
          )}
        </div>

        {/* Store Hours & WhatsApp Assistant (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-card bg-cream-light border border-olive/20 shadow-olive-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
              <Clock className="w-5 h-5 text-olive" />
              <span>Operating Hours</span>
            </h3>
            <p className="text-sm font-semibold text-ink">{WORKING_HOURS}</p>
            <p className="text-xs text-ink/70 leading-relaxed">
              Our telephone and WhatsApp care desk is manned continuously during operating hours. Messages received after hours are answered early morning.
            </p>
          </div>

          <div className="p-6 rounded-card bg-cream-light border border-olive/20 shadow-olive-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
              <MapPin className="w-5 h-5 text-olive" />
              <span>Main Store Address</span>
            </h3>
            <p className="text-sm text-ink/85 leading-relaxed">{STORE_ADDRESS}</p>
          </div>

          <div className="p-6 rounded-card bg-olive text-cream shadow-olive-md space-y-3">
            <div className="flex items-center gap-2 font-serif text-lg font-bold text-cream">
              <MessageCircle className="w-5 h-5 text-cream" />
              <span>Prefer Instant WhatsApp?</span>
            </div>
            <p className="text-xs text-cream/90 leading-relaxed">
              No forms needed! Chat directly with our manager to check daily fresh batches or get instant grain guidance.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello ${SHOP_NAME}, I would like to speak to Customer Care!`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 px-5 py-2.5 rounded-btn bg-cream text-olive font-bold text-xs shadow-sm hover:bg-cream-deep transition-colors"
            >
              Start WhatsApp Chat →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
