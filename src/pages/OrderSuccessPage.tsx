import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, DownloadCloud, Key, Copy, Check, ArrowRight, ShieldCheck, FileArchive } from 'lucide-react';
import { getLastOrder } from '../services/paymentMock';
import { OrderDetails } from '../types';

export const OrderSuccessPage: React.FC = () => {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    // Fire confetti on load
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D8B892', '#C98267', '#7F876A', '#60442E'],
      });
    } catch {
      // ignore
    }

    const last = getLastOrder();
    setOrder(last);
  }, []);

  const handleCopyLicense = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleDownload = (productName: string) => {
    alert(`Downloading ${productName} (High-Speed Package .ZIP)`);
  };

  if (!order) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--brown)', marginBottom: '12px' }}>No Recent Order Found</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>Please explore our store and complete a purchase.</p>
        <Link to="/shop" className="btn-primary">Go to Shop</Link>
      </div>
    );
  }

  const simulatedLicenseKey = `CNV-COMM-${order.orderId.replace('CNV-', '')}-LIFETIME`;

  return (
    <div style={{ paddingBottom: '90px', paddingTop: '30px' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        
        {/* Success Header Box */}
        <div
          style={{
            backgroundColor: 'var(--cream-light)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '48px 40px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-clay)',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: 'var(--olive-light)',
              color: 'var(--olive-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 4px 14px rgba(101, 109, 84, 0.25)',
            }}
          >
            <CheckCircle2 size={38} />
          </div>

          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--olive-dark)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Payment Successful
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', fontWeight: 800, color: 'var(--brown)', marginTop: '4px', marginBottom: '10px' }}>
            You're All Set!
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--muted)', maxWidth: '540px', margin: '0 auto 24px' }}>
            Thank you, {order.customerName}. Your order confirmation and permanent download access have also been emailed to <strong style={{ color: 'var(--brown)' }}>{order.customerEmail}</strong>.
          </p>

          <div
            style={{
              display: 'inline-flex',
              gap: '24px',
              padding: '12px 24px',
              backgroundColor: 'var(--cream-dark)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.88rem',
              color: 'var(--brown)',
              fontWeight: 600,
            }}
          >
            <span>Order ID: <strong>{order.orderId}</strong></span>
            <span>Date: <strong>{order.date}</strong></span>
            <span>Total: <strong>${order.total}</strong></span>
          </div>
        </div>

        {/* License Key Card */}
        <div
          style={{
            backgroundColor: 'var(--cream-light)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px 32px',
            boxShadow: 'var(--shadow-clay)',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'var(--clay-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brown)',
              }}
            >
              <Key size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--brown)' }}>
                Your Commercial License Key
              </h4>
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                Valid for unlimited personal & commercial client deliverables.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <code
              style={{
                padding: '8px 14px',
                backgroundColor: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: 'var(--brown-dark)',
                letterSpacing: '0.04em',
              }}
            >
              {simulatedLicenseKey}
            </code>
            <button
              onClick={() => handleCopyLicense(simulatedLicenseKey)}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
            >
              {copiedKey ? <Check size={14} color="var(--olive-dark)" /> : <Copy size={14} />}
              <span>{copiedKey ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Downloads List */}
        <div
          style={{
            backgroundColor: 'var(--cream-light)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '36px 32px',
            boxShadow: 'var(--shadow-clay)',
            marginBottom: '32px',
          }}
        >
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brown)', marginBottom: '20px' }}>
            Download Your Assets
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {order.items.map(({ product }) => (
              <div
                key={product.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  backgroundColor: 'var(--white)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img
                    src={product.thumbnail}
                    alt=""
                    style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--brown)' }}>{product.name}</h4>
                    <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                      {product.fileSize} • {product.format.join(', ')} • v{product.version}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(product.name)}
                  className="btn-primary"
                  style={{ padding: '10px 20px', fontSize: '0.88rem' }}
                >
                  <DownloadCloud size={16} />
                  <span>Download Package (.ZIP)</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps CTA */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link to="/shop" className="btn-secondary" style={{ padding: '12px 28px' }}>
            <span>Continue Exploring Template Theory</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
};
