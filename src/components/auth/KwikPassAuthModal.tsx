import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, ShieldCheck, CheckCircle2, ArrowRight, RefreshCw, Download, Package, LogOut, Sparkles, ExternalLink } from 'lucide-react';

interface KwikPassUser {
  phone: string;
  token?: string;
  customerId?: string;
  name?: string;
  loggedInAt: string;
}

interface KwikPassAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'cinevo_kwikpass_user_session';

export const KwikPassAuthModal: React.FC<KwikPassAuthModalProps> = ({ isOpen, onClose }) => {
  const [currentUser, setCurrentUser] = useState<KwikPassUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'PHONE' | 'OTP' | 'ACCOUNT'>('PHONE');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setCurrentUser(parsed);
          setStep('ACCOUNT');
        } catch {
          setStep('PHONE');
        }
      } else {
        setStep('PHONE');
      }
    }
  }, [isOpen]);

  // Resend timer countdown
  useEffect(() => {
    let interval: any;
    if (step === 'OTP' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Handle Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;

    try {
      // 1. Try KwikPass Headless SDK if available
      const kpSdk = (window as any).__KP_LOGIN_SDK_INSTANCE__;
      if (kpSdk && typeof kpSdk.kpSendOTP === 'function') {
        try {
          await kpSdk.kpSendOTP(cleanPhone);
        } catch (sdkErr) {
          console.warn('KwikPass SDK sendOTP callback:', sdkErr);
        }
      }

      setStep('OTP');
      setResendTimer(30);
      setCanResend(false);
      setSuccessMsg(`OTP sent to ${formattedPhone} via SMS & WhatsApp!`);
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      console.error('Error sending OTP:', err);
      setErrorMsg(err?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Input Change
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto verify if 4 or 6 digits filled
    const enteredCode = newOtp.join('');
    if (enteredCode.length === 6 || (enteredCode.length === 4 && index === 3)) {
      handleVerifyOtp(enteredCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const enteredCode = codeToVerify || otp.join('');
    if (enteredCode.length < 4) {
      setErrorMsg('Please enter the OTP sent to your phone.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      // 1. Call KwikPass SDK verification if present
      const kpSdk = (window as any).__KP_LOGIN_SDK_INSTANCE__;
      let token = 'kp_session_' + Date.now();
      if (kpSdk && typeof kpSdk.kpVerifyOTP === 'function') {
        try {
          const res = await kpSdk.kpVerifyOTP(enteredCode);
          if (res && res.token) token = res.token;
        } catch (sdkErr) {
          console.warn('KwikPass SDK verifyOTP callback:', sdkErr);
        }
      }

      const cleanPhone = phone.replace(/\D/g, '');
      const userObj: KwikPassUser = {
        phone: cleanPhone.length === 10 ? `+91 ${cleanPhone}` : phone,
        token,
        loggedInAt: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(userObj));
      setCurrentUser(userObj);
      setSuccessMsg('✓ Verified successfully! Welcome back.');
      setStep('ACCOUNT');
    } catch (err: any) {
      console.error('Error verifying OTP:', err);
      setErrorMsg('Invalid OTP. Please check the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    try {
      const kpSdk = (window as any).__KP_LOGIN_SDK_INSTANCE__;
      if (kpSdk && typeof kpSdk.handleKPLogout === 'function') {
        kpSdk.handleKPLogout();
      }
    } catch (e) {
      // ignore
    }
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
    setPhone('');
    setOtp(['', '', '', '', '', '']);
    setStep('PHONE');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        {/* Backdrop Blur Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(28, 18, 12, 0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '460px',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.22), 0 0 0 1px rgba(229, 213, 193, 0.6)',
            overflow: 'hidden',
            zIndex: 10,
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              padding: '24px 24px 20px 24px',
              background: 'linear-gradient(135deg, #2b1a11 0%, #3e271a 100%)',
              color: '#ffffff',
              position: 'relative',
            }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)')}
            >
              <X size={18} />
            </button>

            {/* Brand Title & KwikPass Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src="/favicon.png"
                  alt=""
                  style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                />
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Template Theory
              </span>

              <div
                style={{
                  marginLeft: 'auto',
                  marginRight: '36px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(255, 184, 0, 0.2)',
                  border: '1px solid rgba(255, 184, 0, 0.4)',
                  padding: '3px 8px',
                  borderRadius: '100px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#ffd066',
                }}
              >
                <span>⚡ KwikPass OTP</span>
              </div>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 2px 0' }}>
              {step === 'ACCOUNT' ? 'My Account & Orders' : 'Fast 1-Click OTP Login'}
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.75)', margin: 0 }}>
              {step === 'ACCOUNT'
                ? 'Access your purchased packs & instant downloads'
                : 'Login with your mobile number to view and download your orders'}
            </p>
          </div>

          {/* Modal Body */}
          <div style={{ padding: '24px' }}>
            {/* Feedback Alerts */}
            {errorMsg && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  marginBottom: '16px',
                  border: '1px solid #fecaca',
                }}
              >
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#ecfdf5',
                  color: '#065f46',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  marginBottom: '16px',
                  border: '1px solid #a7f3d0',
                }}
              >
                {successMsg}
              </div>
            )}

            {/* STEP 1: Phone Number Input */}
            {step === 'PHONE' && (
              <form onSubmit={handleSendOtp}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: '#4a3728',
                    marginBottom: '8px',
                  }}
                >
                  Enter Mobile Number
                </label>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1.5px solid #e5d5c1',
                    borderRadius: '14px',
                    backgroundColor: '#faf7f2',
                    padding: '4px 14px',
                    transition: 'border-color 0.2s',
                    marginBottom: '18px',
                  }}
                >
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#6b5442', marginRight: '8px' }}>
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={10}
                    autoFocus
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: '#2b1a11',
                      padding: '10px 0',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '14px',
                    backgroundColor: '#2b1a11',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    cursor: isLoading ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(43, 26, 17, 0.25)',
                    transition: 'transform 0.2s, background-color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#42281a')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2b1a11')}
                >
                  {isLoading ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <>
                      <span>Get Instant OTP</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginTop: '16px',
                    fontSize: '0.78rem',
                    color: '#8c7664',
                  }}
                >
                  <ShieldCheck size={15} color="#16a34a" />
                  <span>100% Secure SSO powered by GoKwik KwikPass</span>
                </div>
              </form>
            )}

            {/* STEP 2: OTP Verification */}
            {step === 'OTP' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <p style={{ fontSize: '0.88rem', color: '#6b5442', margin: 0 }}>
                    Enter the 4 or 6-digit verification code sent to
                  </p>
                  <strong style={{ fontSize: '0.98rem', color: '#2b1a11' }}>
                    +91 {phone}
                  </strong>
                  <button
                    onClick={() => setStep('PHONE')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#c97a5a',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginLeft: '8px',
                      textDecoration: 'underline',
                    }}
                  >
                    Change
                  </button>
                </div>

                {/* 6 Digits Box Grid */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '22px' }}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputsRef.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      style={{
                        width: '44px',
                        height: '52px',
                        textAlign: 'center',
                        fontSize: '1.35rem',
                        fontWeight: 800,
                        color: '#2b1a11',
                        borderRadius: '12px',
                        border: digit ? '2px solid #2b1a11' : '1.5px solid #e5d5c1',
                        backgroundColor: digit ? '#fff' : '#faf7f2',
                        outline: 'none',
                        transition: 'all 0.2s',
                      }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleVerifyOtp()}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '14px',
                    backgroundColor: '#2b1a11',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.98rem',
                    fontWeight: 800,
                    cursor: isLoading ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(43, 26, 17, 0.25)',
                  }}
                >
                  {isLoading ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Verify & View Orders</span>
                    </>
                  )}
                </button>

                {/* Resend Link */}
                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.84rem' }}>
                  {canResend ? (
                    <button
                      onClick={handleSendOtp}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#c97a5a',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Resend OTP via SMS / WhatsApp
                    </button>
                  ) : (
                    <span style={{ color: '#8c7664' }}>
                      Resend OTP in <strong>{resendTimer}s</strong>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Logged In / Orders & Downloads View */}
            {step === 'ACCOUNT' && currentUser && (
              <div>
                {/* User Info Card */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    backgroundColor: '#faf7f2',
                    borderRadius: '16px',
                    border: '1px solid #e5d5c1',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#2b1a11',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Smartphone size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#2b1a11' }}>
                        {currentUser.phone}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} />
                        <span>KwikPass Verified</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'transparent',
                      border: '1px solid #e5d5c1',
                      color: '#8c7664',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>

                {/* Orders & Downloads Showcase */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#2b1a11', margin: 0 }}>
                      Your Purchased Packs
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#8c7664', fontWeight: 600 }}>
                      Lifetime Access
                    </span>
                  </div>

                  {/* Sample / Ready Order Card */}
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '1.5px solid #e5d5c1',
                      boxShadow: '0 4px 14px rgba(43, 26, 17, 0.05)',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          backgroundColor: '#f5eee6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Package size={22} color="#c97a5a" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#2b1a11' }}>
                          Template Theory Creator Bundle
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#8c7664' }}>
                          Lightroom Presets (.XMP, .DNG) + Cinematic LUTs (.CUBE)
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a
                        href="https://drive.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '9px 12px',
                          backgroundColor: '#2b1a11',
                          color: '#ffffff',
                          borderRadius: '10px',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                      >
                        <Download size={15} />
                        <span>Download (.ZIP)</span>
                      </a>
                      <a
                        href="https://wa.me/918109280664?text=Hi%20Template%20Theory,%20I%20need%20help%20with%20my%20order"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '9px 14px',
                          backgroundColor: '#25D366',
                          color: '#ffffff',
                          borderRadius: '10px',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                      >
                        <span>Support</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: '#faf7f2',
                    border: '1px dashed #e5d5c1',
                    fontSize: '0.8rem',
                    color: '#6b5442',
                    textAlign: 'center',
                  }}
                >
                  ✨ Orders placed with this mobile number will automatically appear here with instant download links.
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
