import React, { useState } from 'react';
import { ChevronDown, HelpCircle, FileText, ShoppingBag, ShieldCheck, Wrench } from 'lucide-react';
import { FAQS_DATA } from '../data/faqs';

export const FAQPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openFaq, setOpenFaq] = useState<string | null>(FAQS_DATA[0].id);

  const filteredFaqs = activeCategory === 'all'
    ? FAQS_DATA
    : FAQS_DATA.filter((f) => f.category === activeCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '50px', paddingBottom: '80px' }}>
      
      {/* Header Banner */}
      <section style={{ paddingTop: '20px' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '720px' }}>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: 'var(--olive-dark)',
              textTransform: 'uppercase',
              backgroundColor: 'var(--olive-light)',
              padding: '4px 14px',
              borderRadius: 'var(--radius-full)',
              display: 'inline-block',
              marginBottom: '12px',
            }}
          >
            Help & Documentation
          </span>
          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: 800, color: 'var(--brown)', marginBottom: '10px' }}>
            Frequently Asked Questions
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--muted)' }}>
            Everything you need to know about our digital assets, installation, licensing, and orders.
          </p>
        </div>
      </section>

      {/* Category Filter Pills */}
      <section>
        <div className="container" style={{ maxWidth: '840px' }}>
          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '32px',
            }}
          >
            {[
              { id: 'all', label: 'All Questions', icon: HelpCircle },
              { id: 'products', label: 'Products & Formats', icon: FileText },
              { id: 'orders', label: 'Orders & Downloads', icon: ShoppingBag },
              { id: 'license', label: 'Commercial License', icon: ShieldCheck },
              { id: 'technical', label: 'Technical & Compatibility', icon: Wrench },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    backgroundColor: isSelected ? 'var(--brown)' : 'var(--cream-light)',
                    color: isSelected ? 'var(--white)' : 'var(--brown)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--brown-dark)' : 'var(--border)',
                    boxShadow: isSelected ? '0 4px 12px rgba(96, 68, 46, 0.25)' : 'var(--shadow-sm)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Accordion List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredFaqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  style={{
                    backgroundColor: 'var(--cream-light)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-clay)',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    style={{
                      width: '100%',
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      fontWeight: 700,
                      fontSize: '1.05rem',
                      color: 'var(--brown)',
                    }}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={18}
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                        color: 'var(--muted)',
                      }}
                    />
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: '0 24px 22px 24px',
                        fontSize: '0.94rem',
                        color: 'var(--muted)',
                        lineHeight: 1.65,
                        borderTop: '1px solid var(--border-light)',
                        paddingTop: '14px',
                      }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
};
