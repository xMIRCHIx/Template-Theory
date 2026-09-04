import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageSquare, Send, CheckCircle2, HelpCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: 'Product Question',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitted'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setStatus('submitted');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '50px', paddingBottom: '80px' }}>
      
      {/* Header Banner */}
      <section style={{ paddingTop: '20px' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '700px' }}>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: 'var(--terracotta)',
              textTransform: 'uppercase',
              backgroundColor: 'var(--terracotta-light)',
              padding: '4px 14px',
              borderRadius: 'var(--radius-full)',
              display: 'inline-block',
              marginBottom: '12px',
            }}
          >
            We're Here to Help
          </span>
          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: 800, color: 'var(--brown)', marginBottom: '10px' }}>
            Get in Touch
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--muted)' }}>
            Have a question about a product, need help with installation, or inquiring about custom licensing?
          </p>
        </div>
      </section>

      {/* Main Split: Form + Direct Contact Cards */}
      <section>
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr',
              gap: '40px',
            }}
            className="contact-split-grid"
          >
            {/* Contact Form */}
            <div
              style={{
                backgroundColor: 'var(--cream-light)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                padding: '40px',
                boxShadow: 'var(--shadow-clay)',
              }}
            >
              {status === 'submitted' ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--olive-light)',
                      color: 'var(--olive-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}
                  >
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brown)', marginBottom: '8px' }}>
                    Message Received!
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--muted)', marginBottom: '24px' }}>
                    Thank you {formData.name}. Our creator support team will respond to {formData.email} within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setStatus('idle');
                      setFormData({ name: '', email: '', reason: 'Product Question', message: '' });
                    }}
                    className="btn-primary"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--brown)', marginBottom: '6px' }}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border)',
                        backgroundColor: 'var(--white)',
                        color: 'var(--brown)',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--brown)', marginBottom: '6px' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border)',
                        backgroundColor: 'var(--white)',
                        color: 'var(--brown)',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--brown)', marginBottom: '6px' }}>
                      Inquiry Reason
                    </label>
                    <select
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border)',
                        backgroundColor: 'var(--white)',
                        color: 'var(--brown)',
                        outline: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      <option value="Product Question">Product Question</option>
                      <option value="Order Help">Order / Download Help</option>
                      <option value="License Question">Commercial License Question</option>
                      <option value="Partnership">Partnership / Creator Collaboration</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--brown)', marginBottom: '6px' }}>
                      Your Message
                    </label>
                    <textarea
                      rows={5}
                      required
                      placeholder="How can we assist you today?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border)',
                        backgroundColor: 'var(--white)',
                        color: 'var(--brown)',
                        outline: 'none',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ padding: '14px 24px', width: '100%', marginTop: '8px' }}>
                    <Send size={18} />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>

            {/* Support Info Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="clay-card" style={{ padding: '28px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--clay-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brown)', marginBottom: '14px' }}>
                  <Mail size={20} />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brown)', marginBottom: '6px' }}>
                  Direct Support Email
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '12px' }}>
                  Reach out directly anytime. We respond within 24 hours Monday–Saturday.
                </p>
                <a
                  href="mailto:support@templatetheory.co"
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--terracotta-dark)',
                    textDecoration: 'none',
                  }}
                >
                  support@templatetheory.co
                </a>
              </div>

              <div className="clay-card" style={{ padding: '28px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--olive-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--olive-dark)', marginBottom: '14px' }}>
                  <HelpCircle size={20} />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brown)', marginBottom: '6px' }}>
                  Need Immediate Answers?
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '14px' }}>
                  Check our categorized FAQ for instant guidance on downloading, installation, and commercial usage.
                </p>
                <Link to="/faq" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  Browse FAQs →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 800px) {
          .contact-split-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};
