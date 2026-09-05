import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock,
  Unlock,
  Sparkles,
  ArrowUpDown,
  FolderKanban,
  Settings,
  Plus,
  Trash2,
  Upload,
  CheckCircle,
  Eye,
  RefreshCw,
  Layers,
  Image as ImageIcon,
  Key,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  Save,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { useShopify } from '../context/ShopifyContext';
import { CATEGORIES } from '../data/categories';
import { ProductCategory, Product } from '../types';
import { BeforeAfterSlider } from '../components/comparison/BeforeAfterSlider';
import {
  getAdminPin,
  setAdminPin,
  getAdminCustomizations,
  saveAdminCustomizations,
  CustomBeforeAfterLook,
} from '../services/adminStore';

type AdminTab = 'beforeAfter' | 'productOrder' | 'collections' | 'settings';

export const AdminPage: React.FC = () => {
  const {
    products,
    rawProducts,
    refreshProducts,
    updateProductBeforeAfter,
    updateProductOrder,
    updateCollectionMapping,
    resetAllCustomizations,
  } = useShopify();

  // PIN Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('cinevo_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('beforeAfter');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- TAB 1: Before/After State ---
  const [selectedProductSlug, setSelectedProductSlug] = useState<string>('');
  const [activeLooks, setActiveLooks] = useState<CustomBeforeAfterLook[]>([]);
  const [previewLookIndex, setPreviewLookIndex] = useState<number>(0);

  // --- TAB 2: Product Order State ---
  const [orderedProductList, setOrderedProductList] = useState<Product[]>([]);

  // --- TAB 3: Collections State ---
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('presets');
  const [collectionProductIds, setCollectionProductIds] = useState<string[]>([]);
  const [collectionFilterMode, setCollectionFilterMode] = useState<'all' | 'inCollection'>('all');

  // --- TAB 4: Settings State ---
  const [currentPin, setCurrentPin] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [pinSuccess, setPinSuccess] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Initialize selected product when products load
  useEffect(() => {
    if (products.length > 0 && !selectedProductSlug) {
      setSelectedProductSlug(products[0].slug);
    }
  }, [products, selectedProductSlug]);

  // Sync ordered product list with current products
  useEffect(() => {
    setOrderedProductList(products);
  }, [products]);

  // Load existing Before/After looks when selected product changes
  useEffect(() => {
    if (!selectedProductSlug) return;
    const currentProd = products.find((p) => p.slug === selectedProductSlug);
    if (!currentProd) return;

    if (currentProd.beforeAfterList && currentProd.beforeAfterList.length > 0) {
      setActiveLooks(JSON.parse(JSON.stringify(currentProd.beforeAfterList)));
    } else if (currentProd.beforeAfterImage) {
      setActiveLooks([
        {
          id: 'ba-look-1',
          title: 'Main Grade Look',
          before: currentProd.beforeAfterImage.before,
          after: currentProd.beforeAfterImage.after,
        },
      ]);
    } else {
      // Default empty look template
      setActiveLooks([
        {
          id: `ba-${Date.now()}-1`,
          title: 'Cinematic Look #1',
          before: currentProd.thumbnail || '',
          after: currentProd.gallery?.[1] || currentProd.thumbnail || '',
        },
      ]);
    }
    setPreviewLookIndex(0);
  }, [selectedProductSlug, products]);

  // Sync collection product IDs when selected category changes
  useEffect(() => {
    const overrides = getAdminCustomizations().collectionOverrides;
    if (overrides && overrides[selectedCategory] && Array.isArray(overrides[selectedCategory])) {
      setCollectionProductIds(overrides[selectedCategory]);
    } else {
      const matching = products
        .filter((p) => p.category === selectedCategory || (selectedCategory === 'psds' && ((p.category as string) === 'albums' || p.category === 'psds')))
        .map((p) => p.slug);
      setCollectionProductIds(matching);
    }
  }, [selectedCategory, products]);

  // PIN Login Handler
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = getAdminPin();
    if (pinInput.trim() === correctPin) {
      setIsAuthenticated(true);
      sessionStorage.setItem('cinevo_admin_auth', 'true');
      setPinError(null);
      setPinInput('');
    } else {
      setPinError('Incorrect PIN. Default is 2026.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('cinevo_admin_auth');
  };

  // --- Helper to convert local image File to Data URL ---
  const handleFileUpload = (file: File, callback: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        callback(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Before/After Manager Actions ---
  const handleAddLook = () => {
    const newIdx = activeLooks.length + 1;
    setActiveLooks((prev) => [
      ...prev,
      {
        id: `ba-look-${Date.now()}-${newIdx}`,
        title: `Look #${newIdx}`,
        before: '',
        after: '',
      },
    ]);
  };

  const handleRemoveLook = (index: number) => {
    if (activeLooks.length <= 1) {
      showToast('You must keep at least 1 look.');
      return;
    }
    setActiveLooks((prev) => prev.filter((_, idx) => idx !== index));
    if (previewLookIndex >= index && previewLookIndex > 0) {
      setPreviewLookIndex((prev) => prev - 1);
    }
  };

  const handleUpdateLook = (index: number, field: keyof CustomBeforeAfterLook, value: string) => {
    setActiveLooks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSaveBeforeAfter = () => {
    if (!selectedProductSlug) return;
    updateProductBeforeAfter(selectedProductSlug, activeLooks);
    showToast(`✓ Before/After Looks saved for "${selectedProduct?.name}"!`);
  };

  // --- Product Ordering Actions ---
  const handleMoveProduct = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= orderedProductList.length) return;

    const list = [...orderedProductList];
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);
    setOrderedProductList(list);
  };

  const handleMoveToExtreme = (index: number, position: 'top' | 'bottom') => {
    const list = [...orderedProductList];
    const [moved] = list.splice(index, 1);
    if (position === 'top') {
      list.unshift(moved);
    } else {
      list.push(moved);
    }
    setOrderedProductList(list);
  };

  const handleSaveProductOrder = () => {
    const slugOrder = orderedProductList.map((p) => p.slug);
    updateProductOrder(slugOrder);
    showToast('✓ Product display order updated across Storefront!');
  };

  // --- Collection Manager Actions ---
  const handleToggleProductInCollection = (slug: string) => {
    setCollectionProductIds((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleSaveCollectionMapping = () => {
    updateCollectionMapping(selectedCategory, collectionProductIds);
    showToast(`✓ Products assigned to "${selectedCategory.toUpperCase()}" collection!`);
  };

  // --- Settings Actions ---
  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = getAdminPin();
    if (currentPin !== correctPin) {
      setPinSuccess(null);
      alert('Current PIN is incorrect.');
      return;
    }
    if (!newPin || newPin.length < 4) {
      alert('New PIN must be at least 4 digits.');
      return;
    }
    setAdminPin(newPin);
    setCurrentPin('');
    setNewPin('');
    setPinSuccess('✓ PIN updated successfully!');
    setTimeout(() => setPinSuccess(null), 3000);
  };

  const handleExportBackup = () => {
    const data = getAdminCustomizations();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cinevo-admin-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ Backup file downloaded!');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        saveAdminCustomizations(parsed);
        refreshProducts();
        showToast('✓ Backup imported successfully! Refreshing...');
      } catch {
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetAll = () => {
    if (window.confirm('Are you sure you want to reset all custom Before/After and product order back to Shopify defaults?')) {
      resetAllCustomizations();
      showToast('✓ Reset to Shopify defaults complete.');
    }
  };

  const selectedProduct = useMemo(() => {
    return products.find((p) => p.slug === selectedProductSlug);
  }, [products, selectedProductSlug]);

  const currentPreviewLook = activeLooks[previewLookIndex] || activeLooks[0];

  // =========================================================================
  // 1. PIN LOGIN SCREEN (If not authenticated)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            backgroundColor: '#ffffff',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '36px 28px',
            boxShadow: 'var(--shadow-clay)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--cream-light)',
              border: '2px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px auto',
              color: 'var(--terracotta)',
            }}
          >
            <Lock size={26} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brown)', marginBottom: '6px' }}>
            Store Admin Portal
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--muted)', marginBottom: '24px' }}>
            Enter your 4-digit admin security PIN to manage Before/After looks, product sorting & collections.
          </p>

          <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input
              type="password"
              maxLength={8}
              autoFocus
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter PIN (Default: 2026)"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: pinError ? '2px solid #ef4444' : '1.5px solid var(--border)',
                fontSize: '1.2rem',
                textAlign: 'center',
                letterSpacing: '0.3em',
                fontWeight: 700,
                outline: 'none',
                backgroundColor: 'var(--cream-light)',
                boxSizing: 'border-box',
              }}
            />

            {pinError && (
              <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>{pinError}</span>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.95rem',
                fontWeight: 800,
              }}
            >
              <Unlock size={18} />
              Unlock Admin Portal
            </button>
          </form>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <Link to="/" style={{ fontSize: '0.82rem', color: 'var(--muted)', textDecoration: 'none' }}>
              ← Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. MAIN AUTHENTICATED ADMIN DASHBOARD
  // =========================================================================
  return (
    <div style={{ paddingBottom: '90px', paddingTop: '20px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 99999,
            backgroundColor: 'var(--brown)',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.88rem',
            fontWeight: 700,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <CheckCircle size={18} color="var(--terracotta-light)" />
          {toastMessage}
        </div>
      )}

      <div className="container">
        
        {/* Admin Header Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1.5px solid var(--border)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  backgroundColor: 'var(--terracotta)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  letterSpacing: '0.04em',
                }}
              >
                ADMIN SUITE
              </span>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brown)', margin: 0 }}>
                Store Customizer & Studio
              </h1>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '4px 0 0 0' }}>
              Visually configure Before/After looks, drag product display orders & manage collections.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              to="/"
              target="_blank"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--cream-light)',
                border: '1.5px solid var(--border)',
                color: 'var(--brown)',
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <ExternalLink size={14} /> View Live Store
            </Link>

            <button
              onClick={handleLogout}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1.5px solid rgba(239, 68, 68, 0.3)',
                color: '#dc2626',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Lock / Exit
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Pills */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            overflowX: 'auto',
            paddingBottom: '4px',
          }}
        >
          <button
            onClick={() => setActiveTab('beforeAfter')}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.88rem',
              fontWeight: 700,
              backgroundColor: activeTab === 'beforeAfter' ? 'var(--brown)' : 'var(--cream-light)',
              color: activeTab === 'beforeAfter' ? '#fff' : 'var(--brown)',
              border: '1.5px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'beforeAfter' ? 'var(--shadow-sm)' : 'none',
              flexShrink: 0,
            }}
          >
            <Sparkles size={16} color={activeTab === 'beforeAfter' ? 'var(--terracotta-light)' : 'var(--terracotta)'} />
            Before / After Studio
          </button>

          <button
            onClick={() => setActiveTab('productOrder')}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.88rem',
              fontWeight: 700,
              backgroundColor: activeTab === 'productOrder' ? 'var(--brown)' : 'var(--cream-light)',
              color: activeTab === 'productOrder' ? '#fff' : 'var(--brown)',
              border: '1.5px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'productOrder' ? 'var(--shadow-sm)' : 'none',
              flexShrink: 0,
            }}
          >
            <ArrowUpDown size={16} />
            Product Display Ordering
          </button>

          <button
            onClick={() => setActiveTab('collections')}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.88rem',
              fontWeight: 700,
              backgroundColor: activeTab === 'collections' ? 'var(--brown)' : 'var(--cream-light)',
              color: activeTab === 'collections' ? '#fff' : 'var(--brown)',
              border: '1.5px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'collections' ? 'var(--shadow-sm)' : 'none',
              flexShrink: 0,
            }}
          >
            <FolderKanban size={16} />
            Collection Manager
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.88rem',
              fontWeight: 700,
              backgroundColor: activeTab === 'settings' ? 'var(--brown)' : 'var(--cream-light)',
              color: activeTab === 'settings' ? '#fff' : 'var(--brown)',
              border: '1.5px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'settings' ? 'var(--shadow-sm)' : 'none',
              flexShrink: 0,
            }}
          >
            <Settings size={16} />
            Settings & Backup
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: BEFORE / AFTER VISUAL STUDIO                                       */}
        {/* ========================================================================= */}
        {activeTab === 'beforeAfter' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px' }} className="admin-grid-2col">
            {/* Left: Product Selector & Look Builder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Product Picker Dropdown */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-clay)',
                }}
              >
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: 'var(--brown)', marginBottom: '8px' }}>
                  1. SELECT SHOPIFY PRODUCT TO CONFIGURE:
                </label>
                <select
                  value={selectedProductSlug}
                  onChange={(e) => setSelectedProductSlug(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border)',
                    backgroundColor: 'var(--cream-light)',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--brown)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.slug}>
                      [{p.category.toUpperCase()}] {p.name} — (₹{p.price})
                    </option>
                  ))}
                </select>
              </div>

              {/* Variation Looks List */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-clay)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brown)', margin: 0 }}>
                      2. Configure Variation Looks ({activeLooks.length} Total)
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '2px 0 0 0' }}>
                      Drag photos from your computer or paste image links for Before and After.
                    </p>
                  </div>

                  <button
                    onClick={handleAddLook}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--cream-dark)',
                      border: '1.5px solid var(--border)',
                      color: 'var(--brown)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={15} /> Add Look
                  </button>
                </div>

                {/* Individual Looks Builder */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {activeLooks.map((look, idx) => {
                    const isSelected = previewLookIndex === idx;
                    return (
                      <div
                        key={look.id || idx}
                        style={{
                          border: isSelected ? '2px solid var(--terracotta)' : '1.5px solid var(--border)',
                          borderRadius: 'var(--radius-md)',
                          padding: '16px',
                          backgroundColor: isSelected ? 'var(--cream-light)' : '#ffffff',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {/* Look Top Bar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, marginRight: '10px' }}>
                            <span
                              style={{
                                backgroundColor: isSelected ? 'var(--terracotta)' : 'var(--brown)',
                                color: '#fff',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)',
                              }}
                            >
                              Look #{idx + 1}
                            </span>
                            <input
                              type="text"
                              value={look.title}
                              onChange={(e) => handleUpdateLook(idx, 'title', e.target.value)}
                              placeholder={`e.g. Look ${idx + 1} Title`}
                              style={{
                                flex: 1,
                                padding: '6px 10px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                color: 'var(--brown)',
                                outline: 'none',
                                backgroundColor: '#fff',
                              }}
                            />
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => setPreviewLookIndex(idx)}
                              style={{
                                padding: '5px 10px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: isSelected ? 'var(--terracotta)' : 'var(--cream-dark)',
                                color: isSelected ? '#fff' : 'var(--brown)',
                                border: 'none',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Preview
                            </button>

                            {activeLooks.length > 1 && (
                              <button
                                onClick={() => handleRemoveLook(idx)}
                                title="Delete look"
                                style={{
                                  padding: '5px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                  border: 'none',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                }}
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 2-Box Split: Before Box & After Box */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          {/* BEFORE IMAGE BOX */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--muted)' }}>
                                📸 BEFORE IMAGE
                              </span>
                              {look.before && (
                                <button
                                  onClick={() => handleUpdateLook(idx, 'before', '')}
                                  style={{ fontSize: '0.7rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                  Clear
                                </button>
                              )}
                            </div>

                            <div
                              style={{
                                height: '110px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1.5px dashed var(--border)',
                                backgroundColor: '#fff',
                                overflow: 'hidden',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {look.before ? (
                                <img
                                  src={look.before}
                                  alt="Before Preview"
                                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                              ) : (
                                <label
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    height: '100%',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    textAlign: 'center',
                                  }}
                                >
                                  <Upload size={18} color="var(--terracotta)" />
                                  <span style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '4px' }}>
                                    Upload / Drop Photo
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleFileUpload(file, (url) => handleUpdateLook(idx, 'before', url));
                                    }}
                                  />
                                </label>
                              )}
                            </div>

                            <input
                              type="text"
                              value={look.before}
                              onChange={(e) => handleUpdateLook(idx, 'before', e.target.value)}
                              placeholder="Or paste Before Image URL"
                              style={{
                                width: '100%',
                                padding: '6px 8px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                fontSize: '0.74rem',
                                color: 'var(--brown)',
                                outline: 'none',
                                boxSizing: 'border-box',
                              }}
                            />
                          </div>

                          {/* AFTER IMAGE BOX */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--terracotta-dark)' }}>
                                ✨ AFTER IMAGE
                              </span>
                              {look.after && (
                                <button
                                  onClick={() => handleUpdateLook(idx, 'after', '')}
                                  style={{ fontSize: '0.7rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                  Clear
                                </button>
                              )}
                            </div>

                            <div
                              style={{
                                height: '110px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1.5px dashed var(--terracotta-light)',
                                backgroundColor: '#fff',
                                overflow: 'hidden',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {look.after ? (
                                <img
                                  src={look.after}
                                  alt="After Preview"
                                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                              ) : (
                                <label
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    height: '100%',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    textAlign: 'center',
                                  }}
                                >
                                  <Upload size={18} color="var(--terracotta)" />
                                  <span style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '4px' }}>
                                    Upload / Drop Photo
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleFileUpload(file, (url) => handleUpdateLook(idx, 'after', url));
                                    }}
                                  />
                                </label>
                              )}
                            </div>

                            <input
                              type="text"
                              value={look.after}
                              onChange={(e) => handleUpdateLook(idx, 'after', e.target.value)}
                              placeholder="Or paste After Image URL"
                              style={{
                                width: '100%',
                                padding: '6px 8px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                fontSize: '0.74rem',
                                color: 'var(--brown)',
                                outline: 'none',
                                boxSizing: 'border-box',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveBeforeAfter}
                  className="btn-primary"
                  style={{
                    padding: '14px',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '0.96rem',
                    fontWeight: 800,
                    marginTop: '8px',
                  }}
                >
                  <Save size={18} /> Save & Publish Looks to Store
                </button>
              </div>
            </div>

            {/* Right: Live Interactive Simulator & Thumbnail Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '90px' }}>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-clay)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brown)', margin: 0 }}>
                    Live Split-Slider Preview
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: 'var(--terracotta-dark)', fontWeight: 700 }}>
                    {currentPreviewLook?.title || `Look #${previewLookIndex + 1}`}
                  </span>
                </div>

                {/* Live Slider Render */}
                {currentPreviewLook?.before && currentPreviewLook?.after ? (
                  <BeforeAfterSlider
                    key={`${currentPreviewLook.id}-${previewLookIndex}`}
                    beforeImage={currentPreviewLook.before}
                    afterImage={currentPreviewLook.after}
                    beforeLabel="BEFORE"
                    afterLabel="AFTER"
                    aspectRatio="1 / 1"
                  />
                ) : (
                  <div
                    style={{
                      aspectRatio: '1 / 1',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--cream-light)',
                      border: '1.5px dashed var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--muted)',
                      textAlign: 'center',
                      padding: '20px',
                    }}
                  >
                    <ImageIcon size={36} color="var(--terracotta-light)" style={{ marginBottom: '8px' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>No Before/After images set for this look</span>
                    <span style={{ fontSize: '0.76rem', marginTop: '4px' }}>Upload or paste images on the left to preview</span>
                  </div>
                )}

                {/* Look Switcher Pills in Simulator */}
                {activeLooks.length > 1 && (
                  <div style={{ marginTop: '16px' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                      SELECT LOOK TO TEST SLIDER:
                    </span>
                    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {activeLooks.map((look, idx) => (
                        <button
                          key={idx}
                          onClick={() => setPreviewLookIndex(idx)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            backgroundColor: previewLookIndex === idx ? 'var(--terracotta)' : 'var(--cream-light)',
                            color: previewLookIndex === idx ? '#fff' : 'var(--brown)',
                            border: '1px solid var(--border)',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          #{idx + 1} {look.title?.split('(')[0] || `Look ${idx + 1}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PRODUCT DISPLAY ORDERING (DRAG & DROP / PRIORITY SORT)             */}
        {/* ========================================================================= */}
        {activeTab === 'productOrder' && (
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              boxShadow: 'var(--shadow-clay)',
              maxWidth: '860px',
              margin: '0 auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brown)', margin: 0 }}>
                  Product Display Hierarchy
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--muted)', margin: '4px 0 0 0' }}>
                  Arrange which products show up first on the Homepage, Shop Catalog & Category grids.
                </p>
              </div>

              <button
                onClick={handleSaveProductOrder}
                className="btn-primary"
                style={{
                  padding: '10px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                }}
              >
                <Save size={16} /> Save Product Hierarchy
              </button>
            </div>

            {/* Reorderable List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {orderedProductList.map((product, idx) => (
                <div
                  key={product.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--cream-light)',
                    border: '1.5px solid var(--border)',
                    gap: '14px',
                  }}
                >
                  {/* Left: Position & Thumbnail & Title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--brown)',
                        color: '#fff',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </span>

                    <img
                      src={product.thumbnail}
                      alt=""
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '6px',
                        objectFit: 'contain',
                        backgroundColor: '#fff',
                        border: '1px solid var(--border)',
                        flexShrink: 0,
                      }}
                    />

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            color: 'var(--terracotta-dark)',
                            backgroundColor: 'var(--terracotta-light)',
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-full)',
                            textTransform: 'uppercase',
                          }}
                        >
                          {product.category}
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brown)' }}>
                          ₹{product.price}
                        </span>
                      </div>
                      <h4
                        style={{
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          color: 'var(--brown-dark)',
                          margin: '2px 0 0 0',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {product.name}
                      </h4>
                    </div>
                  </div>

                  {/* Right: Priority Reorder Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <button
                      onClick={() => handleMoveToExtreme(idx, 'top')}
                      disabled={idx === 0}
                      title="Move to Top"
                      style={{
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#fff',
                        border: '1px solid var(--border)',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: idx === 0 ? 'not-allowed' : 'pointer',
                        opacity: idx === 0 ? 0.4 : 1,
                      }}
                    >
                      Top
                    </button>

                    <button
                      onClick={() => handleMoveProduct(idx, 'up')}
                      disabled={idx === 0}
                      title="Move Up"
                      style={{
                        padding: '6px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#fff',
                        border: '1px solid var(--border)',
                        cursor: idx === 0 ? 'not-allowed' : 'pointer',
                        opacity: idx === 0 ? 0.4 : 1,
                      }}
                    >
                      <ChevronUp size={16} />
                    </button>

                    <button
                      onClick={() => handleMoveProduct(idx, 'down')}
                      disabled={idx === orderedProductList.length - 1}
                      title="Move Down"
                      style={{
                        padding: '6px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#fff',
                        border: '1px solid var(--border)',
                        cursor: idx === orderedProductList.length - 1 ? 'not-allowed' : 'pointer',
                        opacity: idx === orderedProductList.length - 1 ? 0.4 : 1,
                      }}
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: COLLECTION MANAGER (ASSIGN & ORGANIZE COLLECTIONS)                  */}
        {/* ========================================================================= */}
        {activeTab === 'collections' && (
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              boxShadow: 'var(--shadow-clay)',
              maxWidth: '860px',
              margin: '0 auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brown)', margin: 0 }}>
                  Collection Manager
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--muted)', margin: '4px 0 0 0' }}>
                  Select a collection to manage and toggle which products belong inside it.
                </p>
              </div>

              <button
                onClick={handleSaveCollectionMapping}
                className="btn-primary"
                style={{
                  padding: '10px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                }}
              >
                <Save size={16} /> Save Collection Items
              </button>
            </div>

            {/* Collection Category Selector Pills */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as ProductCategory)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    backgroundColor: selectedCategory === cat.id ? 'var(--brown)' : 'var(--cream-light)',
                    color: selectedCategory === cat.id ? '#fff' : 'var(--brown)',
                    border: '1.5px solid var(--border)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {cat.iconImage && (
                    <img
                      src={cat.iconImage}
                      alt={cat.title}
                      style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                    />
                  )}
                  <span>{cat.title}</span>
                </button>
              ))}
            </div>

            {/* View Filter Bar (All Products vs In Collection Only) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>
                {collectionProductIds.length} {collectionProductIds.length === 1 ? 'product' : 'products'} assigned to this collection
              </span>

              <div style={{ display: 'inline-flex', backgroundColor: 'var(--cream)', padding: '3px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)' }}>
                <button
                  onClick={() => setCollectionFilterMode('all')}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    backgroundColor: collectionFilterMode === 'all' ? 'var(--brown)' : 'transparent',
                    color: collectionFilterMode === 'all' ? '#fff' : 'var(--brown)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  All Products ({products.length})
                </button>
                <button
                  onClick={() => setCollectionFilterMode('inCollection')}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    backgroundColor: collectionFilterMode === 'inCollection' ? 'var(--brown)' : 'transparent',
                    color: collectionFilterMode === 'inCollection' ? '#fff' : 'var(--brown)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  In Collection Only ({collectionProductIds.length})
                </button>
              </div>
            </div>

            {/* Product Assignment Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {products
                .filter((product) => {
                  if (collectionFilterMode === 'inCollection') {
                    return collectionProductIds.includes(product.slug);
                  }
                  return true;
                })
                .map((product) => {
                  const isChecked = collectionProductIds.includes(product.slug);
                  return (
                    <div
                      key={product.id}
                      onClick={() => handleToggleProductInCollection(product.slug)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isChecked ? 'rgba(201, 130, 103, 0.08)' : 'var(--cream-light)',
                        border: isChecked ? '1.5px solid var(--terracotta)' : '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--terracotta)', cursor: 'pointer' }}
                        />
                        <img
                          src={product.thumbnail}
                          alt=""
                          style={{ width: '38px', height: '38px', borderRadius: '4px', objectFit: 'contain', backgroundColor: '#fff' }}
                        />
                        <div>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--brown)', margin: 0 }}>
                            {product.name}
                          </h4>
                          <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
                            Original Category: {product.category.toUpperCase()} • ₹{product.price}
                          </span>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: isChecked ? 'var(--terracotta-dark)' : 'var(--muted)',
                        }}
                      >
                        {isChecked ? '✓ In Collection' : '+ Excluded'}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SETTINGS, PIN & BACKUP                                             */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="admin-grid-2col">
            {/* PIN Security Manager */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                boxShadow: 'var(--shadow-clay)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Key size={20} color="var(--terracotta)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brown)', margin: 0 }}>
                  Change Admin PIN
                </h3>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--muted)', marginBottom: '18px' }}>
                Change your 4-digit security PIN used to unlock this Admin Studio.
              </p>

              <form onSubmit={handleChangePin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--brown)', marginBottom: '4px' }}>
                    Current PIN:
                  </label>
                  <input
                    type="password"
                    maxLength={8}
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    placeholder="Enter current PIN"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--brown)', marginBottom: '4px' }}>
                    New Security PIN:
                  </label>
                  <input
                    type="password"
                    maxLength={8}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Enter new 4-digit PIN"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--border)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {pinSuccess && (
                  <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 700 }}>{pinSuccess}</span>
                )}

                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    marginTop: '6px',
                  }}
                >
                  <ShieldCheck size={16} /> Update Security PIN
                </button>
              </form>
            </div>

            {/* Backup & System Reset */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                boxShadow: 'var(--shadow-clay)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Layers size={20} color="var(--terracotta)" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brown)', margin: 0 }}>
                    Backup & Data Sync
                  </h3>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--muted)', marginBottom: '18px' }}>
                  Export your Before/After looks and product sorting configuration as a JSON file, or import to another device.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={handleExportBackup}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--cream-light)',
                      border: '1.5px solid var(--border)',
                      color: 'var(--brown)',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    ⬇️ Export Customizations JSON Backup
                  </button>

                  <label
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--cream-light)',
                      border: '1.5px solid var(--border)',
                      color: 'var(--brown)',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      textAlign: 'center',
                    }}
                  >
                    ⬆️ Import Customizations JSON File
                    <input type="file" accept=".json" onChange={handleImportBackup} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* Reset to Default */}
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={handleResetAll}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1.5px solid rgba(239, 68, 68, 0.3)',
                    color: '#dc2626',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <RotateCcw size={15} /> Reset All to Shopify Defaults
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
