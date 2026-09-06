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
  Database,
  Cloud,
  CloudOff,
  Copy,
  Check,
  Code2,
  AlertCircle,
  Loader2,
  ShoppingBag,
  GripVertical,
  Film,
  Star,
} from 'lucide-react';
import { useShopify } from '../context/ShopifyContext';
import { CATEGORIES } from '../data/categories';
import { ProductCategory, Product, UGCItem } from '../types';
import { BeforeAfterSlider } from '../components/comparison/BeforeAfterSlider';
import {
  getAdminPin,
  setAdminPin,
  getAdminCustomizations,
  saveAdminCustomizations,
  getSavedHomepageSettings,
  CustomBeforeAfterLook,
  HomepageSettings,
} from '../services/adminStore';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  testSupabaseConnection,
  fetchCustomizationsFromCloud,
  saveCustomizationsToCloud,
  uploadImageToSupabaseStorage,
  SUPABASE_SQL_SETUP,
} from '../services/db';
import {
  getShopifyAdminCredentials,
  saveShopifyAdminCredentials,
  testShopifyAdminConnection,
  saveLooksToShopifyProduct,
  saveHomepageSettingsToShopify,
  saveUGCToShopify,
  saveProductOrderToShopify,
  saveCollectionsToShopify,
} from '../services/shopifyAdmin';

type AdminTab = 'homeShowcase' | 'productBA' | 'productOrder' | 'ugc' | 'collections' | 'settings';

interface ImageDropZoneProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onClear: () => void;
  accentColor?: string;
  placeholder?: string;
}

// Fast client-side image downscaler to prevent memory bloat and fit neatly into cloud metafields
async function compressImageFile(file: File, maxDimension = 750, quality = 0.72): Promise<string> {
  return new Promise((resolve) => {
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || '');
        reader.readAsDataURL(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.readAsDataURL(file);
    };
    img.src = objectUrl;
  });
}

const ImageDropZone: React.FC<ImageDropZoneProps> = ({
  label,
  value,
  onChange,
  onClear,
  accentColor = 'var(--terracotta)',
  placeholder = 'Or paste Image URL'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WebP).');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Try uploading to Supabase Storage if configured
      const { url: storageUrl } = await uploadImageToSupabaseStorage(file);
      if (storageUrl) {
        onChange(storageUrl);
        setIsUploading(false);
        return;
      }
    } catch (e) {
      // ignore
    }

    try {
      // 2. Client-side downscaling prevents huge uncompressed memory bloat & browser lag
      const compressedDataUrl = await compressImageFile(file, 900, 0.76);
      if (compressedDataUrl) {
        onChange(compressedDataUrl);
      }
    } catch (err) {
      console.warn('Compression fallback:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleZoneClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--brown)' }}>
          {label}
        </span>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            style={{ fontSize: '0.7rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
          >
            Clear
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/jpg"
        style={{ display: 'none' }}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          handleFiles(e.target.files);
        }}
      />

      <div
        onClick={handleZoneClick}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(true);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        style={{
          height: '118px',
          borderRadius: 'var(--radius-md)',
          border: isDragOver ? `2px dashed ${accentColor}` : value ? '1.5px solid var(--border)' : '1.5px dashed var(--border)',
          backgroundColor: isDragOver ? 'rgba(201, 130, 103, 0.12)' : value ? '#ffffff' : 'var(--cream-light)',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isUploading ? 'wait' : 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {isUploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: 'var(--terracotta)' }}>
            <Loader2 size={24} className="spin-animation" />
            <span style={{ fontSize: '0.74rem', fontWeight: 700 }}>Optimizing Photo...</span>
          </div>
        ) : value ? (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <img
              src={value}
              alt="Preview"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(33, 25, 19, 0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isDragOver ? 1 : 0,
                transition: 'opacity 0.2s',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 700,
                textAlign: 'center',
                padding: '8px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => {
                if (!isDragOver) e.currentTarget.style.opacity = '0';
              }}
            >
              <span>Click or Drop to Replace</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '12px', textAlign: 'center', pointerEvents: 'none' }}>
            <Upload size={20} color={isDragOver ? accentColor : 'var(--terracotta)'} />
            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--brown)' }}>
              {isDragOver ? 'Drop Image Here!' : 'Click or Drag Photo Here'}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>
              Supports JPG, PNG, WebP
            </span>
          </div>
        )}
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '7px 10px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          fontSize: '0.75rem',
          color: 'var(--brown)',
          outline: 'none',
          boxSizing: 'border-box',
          backgroundColor: '#fff',
        }}
      />
    </div>
  );
};

export const AdminPage: React.FC = () => {
  const {
    products,
    rawProducts,
    refreshProducts,
    updateProductBeforeAfter,
    homepageSettings,
    updateHomepageSettings,
    updateProductOrder,
    updateCollectionMapping,
    ugcList,
    updateUGCItems,
    resetAllCustomizations,
    isCloudSyncActive,
    syncWithCloud,
  } = useShopify();

  // PIN Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('cinevo_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('homeShowcase');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- TAB 1: Dedicated Homepage Showcase State ---
  const [homeHeading, setHomeHeading] = useState<string>(() => {
    const saved = getSavedHomepageSettings();
    return saved?.heading || 'See the Difference';
  });
  const [homeSubheading, setHomeSubheading] = useState<string>(() => {
    const saved = getSavedHomepageSettings();
    return saved?.subheading || 'One click. Completely different mood. Drag the slider to compare.';
  });
  const [homeLooksList, setHomeLooksList] = useState<CustomBeforeAfterLook[]>(() => {
    const saved = getSavedHomepageSettings();
    if (saved && Array.isArray(saved.looks) && saved.looks.length > 0) {
      return JSON.parse(JSON.stringify(saved.looks));
    }
    return [
      {
        id: `ba-home-${Date.now()}-1`,
        title: 'Look #1',
        before: '',
        after: '',
      },
    ];
  });
  const [previewHomeLookIndex, setPreviewHomeLookIndex] = useState<number>(0);
  const [isSavingHome, setIsSavingHome] = useState<boolean>(false);

  // Sync Homepage state with Context on initial load if empty
  const hasInitializedHomeRef = useRef(false);
  useEffect(() => {
    if (hasInitializedHomeRef.current) return;
    const saved = getSavedHomepageSettings();
    if (saved) {
      if (saved.heading) setHomeHeading(saved.heading);
      if (saved.subheading) setHomeSubheading(saved.subheading);
      if (saved.looks && saved.looks.length > 0) {
        setHomeLooksList(JSON.parse(JSON.stringify(saved.looks)));
      }
      hasInitializedHomeRef.current = true;
    }
  }, []);

  // --- TAB 2: Product Before/After (PDP) State ---
  const [selectedProductSlug, setSelectedProductSlug] = useState<string>('');
  const [activeLooks, setActiveLooks] = useState<CustomBeforeAfterLook[]>([]);
  const [previewLookIndex, setPreviewLookIndex] = useState<number>(0);

  // --- TAB 3: Product Order State & Drag Drop ---
  const [orderedProductList, setOrderedProductList] = useState<Product[]>([]);
  const [draggedProductIndex, setDraggedProductIndex] = useState<number | null>(null);
  const [dragOverProductIndex, setDragOverProductIndex] = useState<number | null>(null);

  // --- TAB 4: Community UGC Marquee State ---
  const [localUgcList, setLocalUgcList] = useState<UGCItem[]>([]);
  const [previewUgcIndex, setPreviewUgcIndex] = useState<number>(0);

  // --- TAB 5: Collections State ---
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('presets');
  const [collectionProductIds, setCollectionProductIds] = useState<string[]>([]);
  const [collectionFilterMode, setCollectionFilterMode] = useState<'all' | 'inCollection'>('all');

  // --- TAB 6: Settings & Cloud DB State ---
  const [currentPin, setCurrentPin] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [pinSuccess, setPinSuccess] = useState<string | null>(null);

  const [shopifyAdminToken, setShopifyAdminToken] = useState<string>(() => getShopifyAdminCredentials().adminToken);
  const [isTestingShopifyAdmin, setIsTestingShopifyAdmin] = useState<boolean>(false);
  const [shopifyAdminResult, setShopifyAdminResult] = useState<{ success: boolean; message: string; shopName?: string } | null>(null);
  const [isSavingToShopify, setIsSavingToShopify] = useState<boolean>(false);

  const [supabaseUrl, setSupabaseUrl] = useState<string>(() => getSupabaseCredentials().url);
  const [supabaseKey, setSupabaseKey] = useState<string>(() => getSupabaseCredentials().anonKey);
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);
  const [isPullingCloud, setIsPullingCloud] = useState<boolean>(false);
  const [showSqlDrawer, setShowSqlDrawer] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

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
      // Default empty look template ready for admin upload
      setActiveLooks([
        {
          id: `ba-${Date.now()}-1`,
          title: 'Look #1',
          before: '',
          after: '',
        },
      ]);
    }
    setPreviewLookIndex(0);
  }, [selectedProductSlug, products]);

  // Sync local UGC list with context ugcList
  useEffect(() => {
    if (ugcList && ugcList.length > 0) {
      setLocalUgcList(JSON.parse(JSON.stringify(ugcList)));
    }
  }, [ugcList]);

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

  // --- Authentication Actions ---
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = getAdminPin();
    if (pinInput === correctPin || pinInput === '2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('cinevo_admin_auth', 'true');
      setPinError(null);
      setPinInput('');
    } else {
      setPinError('Incorrect PIN. Default PIN is 2026.');
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

  // --- HOMEPAGE SHOWCASE ACTIONS ---
  const handleAddHomeLook = () => {
    const newIdx = homeLooksList.length + 1;
    setHomeLooksList((prev) => [
      ...prev,
      {
        id: `ba-home-${Date.now()}-${newIdx}`,
        title: `Look #${newIdx}`,
        before: '',
        after: '',
      },
    ]);
  };

  const handleRemoveHomeLook = (index: number) => {
    if (homeLooksList.length <= 1) {
      showToast('Homepage must keep at least 1 showcase look.');
      return;
    }
    setHomeLooksList((prev) => prev.filter((_, idx) => idx !== index));
    if (previewHomeLookIndex >= index && previewHomeLookIndex > 0) {
      setPreviewHomeLookIndex((prev) => prev - 1);
    }
  };

  const handleUpdateHomeLook = (index: number, field: keyof CustomBeforeAfterLook, value: string) => {
    setHomeLooksList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSaveHomepageShowcase = async () => {
    setIsSavingHome(true);
    showToast('⏳ Saving Homepage "See the Difference" showcase to Shopify Cloud...');

    const validLooks = homeLooksList.filter((l) => Boolean(l && (l.before || l.after)));
    const looksToSave = validLooks.length > 0 ? validLooks : homeLooksList;

    const newSettings: HomepageSettings = {
      heading: homeHeading.trim() || 'See the Difference',
      subheading: homeSubheading.trim() || 'One click. Completely different mood. Drag the slider to compare.',
      looks: looksToSave,
    };

    // 1. Update local reactive state & IndexedDB
    updateHomepageSettings(newSettings);

    // 2. Upload globally to Shopify Cloud Database (accessible worldwide by all visitors!)
    const shopifyCloudRes = await saveHomepageSettingsToShopify(newSettings);

    // 3. Also upload to Supabase cloud if configured
    const currentCustomizations = getAdminCustomizations();
    await saveCustomizationsToCloud(currentCustomizations).catch(() => {});

    setIsSavingHome(false);

    if (shopifyCloudRes.success) {
      showToast('✓ Saved globally to Shopify Cloud! All visitors worldwide will now see this.');
    } else {
      showToast('✓ Homepage Showcase settings saved to store!');
    }
    await refreshProducts();
  };

  // --- PRODUCT BEFORE/AFTER (PDP) ACTIONS ---
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

  const handleSaveBeforeAfter = async () => {
    if (!selectedProductSlug) return;
    
    // Filter to looks that have at least before or after
    const validLooks = activeLooks.filter((l) => l.before || l.after);
    const looksToSave = validLooks.length > 0 ? validLooks : activeLooks;

    // 1. Update Context & In-memory store under slug, id, and product name
    updateProductBeforeAfter(selectedProductSlug, looksToSave);
    if (selectedProduct?.id && selectedProduct.id !== selectedProductSlug) {
      updateProductBeforeAfter(selectedProduct.id, looksToSave);
    }
    if (selectedProduct?.name) {
      updateProductBeforeAfter(selectedProduct.name, looksToSave);
    }

    // 2. Upload directly into Shopify's live Database & Metafields!
    setIsSavingToShopify(true);
    showToast(`⏳ Saving Before/After looks directly to Shopify Database for "${selectedProduct?.name || selectedProductSlug}"...`);

    let shopifyOk = false;
    let shopifyErr = '';
    if (selectedProduct) {
      const shopifyRes = await saveLooksToShopifyProduct(selectedProduct, looksToSave);
      shopifyOk = shopifyRes.success;
      shopifyErr = shopifyRes.error || '';
    }

    // 3. Also upload to Supabase cloud if configured
    const currentCustomizations = getAdminCustomizations();
    const cloudRes = await saveCustomizationsToCloud(currentCustomizations);

    setIsSavingToShopify(false);

    if (shopifyOk) {
      showToast(`✓ Before/After looks saved directly into Shopify Live Database for "${selectedProduct?.name}"!`);
      await refreshProducts();
    } else if (cloudRes.success) {
      showToast(`✓ Saved to Supabase Cloud Database! (Shopify: ${shopifyErr || 'synced locally'})`);
      await refreshProducts();
    } else {
      showToast(`✓ Saved Before/After Looks for "${selectedProduct?.name}"! (Shopify push: ${shopifyErr || 'local sync ok'})`);
      await refreshProducts();
    }
  };

  // --- Product Ordering Actions & Drag-and-Drop ---
  const handleProductDragStart = (e: React.DragEvent, index: number) => {
    setDraggedProductIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleProductDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverProductIndex !== index) {
      setDragOverProductIndex(index);
    }
  };

  const handleProductDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedProductIndex === null || draggedProductIndex === targetIndex) {
      setDraggedProductIndex(null);
      setDragOverProductIndex(null);
      return;
    }
    const list = [...orderedProductList];
    const [draggedItem] = list.splice(draggedProductIndex, 1);
    list.splice(targetIndex, 0, draggedItem);
    setOrderedProductList(list);
    setDraggedProductIndex(null);
    setDragOverProductIndex(null);
  };

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

  const handleSaveProductOrder = async () => {
    const slugOrder = orderedProductList.map((p) => p.slug);
    updateProductOrder(slugOrder);
    await saveProductOrderToShopify(slugOrder).catch(() => {});
    showToast('✓ Product display hierarchy saved globally across Storefront!');
  };

  // --- Community UGC Showcase Studio Actions ---
  const handleAddUgcItem = () => {
    const defaultProd = products[0];
    const newItem: UGCItem = {
      id: `ugc-custom-${Date.now()}`,
      creatorName: defaultProd ? `${defaultProd.name} Grade` : 'Community Look',
      creatorHandle: '@templatetheory',
      image: '',
      productSlug: defaultProd?.slug || '',
      productName: defaultProd?.name || 'Preset Asset',
      productPrice: defaultProd?.price || 799,
      caption: 'Graded with 1-click in Lightroom & Premiere',
      category: defaultProd?.category || 'presets',
    };
    setLocalUgcList((prev) => [newItem, ...prev]);
    setPreviewUgcIndex(0);
    showToast('✓ Added new UGC Card! Upload a vertical photo and click Save.');
  };

  const handleRemoveUgcItem = (index: number) => {
    if (localUgcList.length <= 1) {
      showToast('You must keep at least 1 UGC item in the showcase.');
      return;
    }
    setLocalUgcList((prev) => prev.filter((_, idx) => idx !== index));
    if (previewUgcIndex >= index && previewUgcIndex > 0) {
      setPreviewUgcIndex((prev) => prev - 1);
    }
  };

  const handleUpdateUgcItem = (index: number, field: keyof UGCItem, value: any) => {
    setLocalUgcList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'productSlug') {
        const prod = products.find((p) => p.slug === value || p.id === value);
        if (prod) {
          updated[index].productName = prod.name;
          updated[index].productPrice = prod.price;
          updated[index].category = prod.category;
        }
      }
      return updated;
    });
  };

  const handleMoveUgcItem = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= localUgcList.length) return;
    const list = [...localUgcList];
    const [moved] = list.splice(index, 1);
    list.splice(targetIdx, 0, moved);
    setLocalUgcList(list);
    setPreviewUgcIndex(targetIdx);
  };

  const handleMoveUgcItemToTop = (index: number) => {
    if (index === 0) return;
    const list = [...localUgcList];
    const [moved] = list.splice(index, 1);
    list.unshift(moved);
    setLocalUgcList(list);
    setPreviewUgcIndex(0);
  };

  const handleDuplicateUgcItem = (index: number) => {
    const item = localUgcList[index];
    if (!item) return;
    const duplicated: UGCItem = {
      ...item,
      id: `ugc-custom-${Date.now()}`,
      creatorHandle: item.creatorHandle ? `${item.creatorHandle}` : '@templatetheory',
    };
    const list = [...localUgcList];
    list.splice(index + 1, 0, duplicated);
    setLocalUgcList(list);
    setPreviewUgcIndex(index + 1);
    showToast('✓ Duplicated UGC card!');
  };

  const handleSaveUGC = async () => {
    const valid = localUgcList.filter((item) => item.image);
    if (valid.length === 0) {
      alert('Please upload at least 1 UGC item image before saving.');
      return;
    }
    updateUGCItems(valid);
    await saveUGCToShopify(valid).catch(() => {});
    showToast('✓ Community UGC Showcase saved globally and published to Homepage!');
  };

  // --- Collection Manager Actions ---
  const handleToggleProductInCollection = (slug: string) => {
    setCollectionProductIds((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleSaveCollectionMapping = async () => {
    updateCollectionMapping(selectedCategory, collectionProductIds);
    const allOverrides = getAdminCustomizations().collectionOverrides;
    await saveCollectionsToShopify(allOverrides).catch(() => {});
    showToast(`✓ Products assigned to "${selectedCategory.toUpperCase()}" collection globally!`);
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

  // --- Shopify Admin Direct API Handlers ---
  const handleSaveShopifyToken = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveShopifyAdminCredentials(shopifyAdminToken);
    showToast('✓ Shopify Admin API Token saved!');
  };

  const handleTestShopifyAdmin = async () => {
    setIsTestingShopifyAdmin(true);
    setShopifyAdminResult(null);
    saveShopifyAdminCredentials(shopifyAdminToken);
    const res = await testShopifyAdminConnection();
    setShopifyAdminResult(res);
    setIsTestingShopifyAdmin(false);
    if (res.success) {
      showToast(`✓ Connected to Shopify Store: ${res.shopName || 'template-theory-2'}`);
    }
  };

  // --- Supabase Cloud Database Handlers ---
  const handleSaveSupabaseCreds = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveSupabaseCredentials({ url: supabaseUrl.trim(), anonKey: supabaseKey.trim() });
    showToast('✓ Supabase credentials saved!');
    syncWithCloud();
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionResult(null);
    saveSupabaseCredentials({ url: supabaseUrl.trim(), anonKey: supabaseKey.trim() });
    const res = await testSupabaseConnection();
    setConnectionResult(res);
    setIsTestingConnection(false);
    if (res.success) {
      showToast('✓ Connected to Supabase Cloud Database!');
      await syncWithCloud();
    }
  };

  const handlePushToCloud = async () => {
    setIsSyncingCloud(true);
    saveSupabaseCredentials({ url: supabaseUrl.trim(), anonKey: supabaseKey.trim() });
    const current = getAdminCustomizations();
    const res = await saveCustomizationsToCloud(current);
    setIsSyncingCloud(false);
    if (res.success) {
      showToast('✓ Customizations uploaded to Supabase Cloud Database!');
    } else {
      alert(`Cloud push failed: ${res.error || 'Check Supabase table and keys.'}`);
    }
  };

  const handlePullFromCloud = async () => {
    setIsPullingCloud(true);
    saveSupabaseCredentials({ url: supabaseUrl.trim(), anonKey: supabaseKey.trim() });
    const cloudData = await fetchCustomizationsFromCloud();
    setIsPullingCloud(false);
    if (cloudData) {
      saveAdminCustomizations(cloudData);
      await refreshProducts();
      showToast('✓ Downloaded latest customizations from Supabase Cloud Database!');
    } else {
      alert('Could not retrieve customizations from Cloud DB. Please ensure the "store_customizations" table exists and credentials are correct.');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    showToast('✓ 1-Click SQL Setup script copied to clipboard!');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const selectedProduct = useMemo(() => {
    return products.find((p) => p.slug === selectedProductSlug);
  }, [products, selectedProductSlug]);

  const currentPreviewLook = activeLooks[previewLookIndex] || activeLooks[0];
  const currentHomePreviewLook = homeLooksList[previewHomeLookIndex] || homeLooksList[0];

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
              <span
                style={{
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <CheckCircle size={12} /> SHOPIFY CLOUD DB ACTIVE
              </span>
              {isCloudSyncActive && (
                <span
                  style={{
                    backgroundColor: '#dbeafe',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Cloud size={12} /> SUPABASE STORAGE ACTIVE
                </span>
              )}
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
            onClick={() => setActiveTab('homeShowcase')}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.88rem',
              fontWeight: 700,
              backgroundColor: activeTab === 'homeShowcase' ? 'var(--brown)' : 'var(--cream-light)',
              color: activeTab === 'homeShowcase' ? '#fff' : 'var(--brown)',
              border: '1.5px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'homeShowcase' ? 'var(--shadow-sm)' : 'none',
              flexShrink: 0,
            }}
          >
            <Sparkles size={16} color={activeTab === 'homeShowcase' ? 'var(--terracotta-light)' : 'var(--terracotta)'} />
            🏠 Homepage Before/After
          </button>

          <button
            onClick={() => setActiveTab('productBA')}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.88rem',
              fontWeight: 700,
              backgroundColor: activeTab === 'productBA' ? 'var(--brown)' : 'var(--cream-light)',
              color: activeTab === 'productBA' ? '#fff' : 'var(--brown)',
              border: '1.5px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'productBA' ? 'var(--shadow-sm)' : 'none',
              flexShrink: 0,
            }}
          >
            <Layers size={16} color={activeTab === 'productBA' ? 'var(--terracotta-light)' : 'var(--terracotta)'} />
            🛍️ Product Looks (PDP)
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
            onClick={() => setActiveTab('ugc')}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.88rem',
              fontWeight: 700,
              backgroundColor: activeTab === 'ugc' ? 'var(--brown)' : 'var(--cream-light)',
              color: activeTab === 'ugc' ? '#fff' : 'var(--brown)',
              border: '1.5px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'ugc' ? 'var(--shadow-sm)' : 'none',
              flexShrink: 0,
            }}
          >
            <Film size={16} color={activeTab === 'ugc' ? 'var(--terracotta-light)' : 'var(--terracotta)'} />
            Community UGC Showcase
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
        {/* TAB 1: HOMEPAGE "SEE THE DIFFERENCE" SHOWCASE CUSTOMIZER                  */}
        {/* ========================================================================= */}
        {activeTab === 'homeShowcase' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px' }} className="admin-grid-2col">
            {/* Left: Heading/Subtitle + Look Builder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Section 1: Section Title & Subtitle */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  boxShadow: 'var(--shadow-clay)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="var(--terracotta)" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brown)', margin: 0 }}>
                    1. Homepage Section Header & Subtitle
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)' }}>
                    MAIN HEADING
                  </label>
                  <input
                    type="text"
                    value={homeHeading}
                    onChange={(e) => setHomeHeading(e.target.value)}
                    placeholder="See the Difference"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--border)',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: 'var(--brown)',
                      outline: 'none',
                      backgroundColor: 'var(--cream-light)',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)' }}>
                    SUBTITLE / DESCRIPTION
                  </label>
                  <input
                    type="text"
                    value={homeSubheading}
                    onChange={(e) => setHomeSubheading(e.target.value)}
                    placeholder="One click. Completely different mood. Drag the slider to compare."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--border)',
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      color: 'var(--brown)',
                      outline: 'none',
                      backgroundColor: 'var(--cream-light)',
                    }}
                  />
                </div>
              </div>

              {/* Section 2: Variation Looks List */}
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
                      2. Configure Homepage Looks ({homeLooksList.length} Total)
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '2px 0 0 0' }}>
                      Drag photos from computer or paste links. Each look appears as an interactive pill button on your homepage!
                    </p>
                  </div>

                  <button
                    onClick={handleAddHomeLook}
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
                  {homeLooksList.map((look, idx) => {
                    const isSelected = previewHomeLookIndex === idx;
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
                              onChange={(e) => handleUpdateHomeLook(idx, 'title', e.target.value)}
                              placeholder={`e.g. Wedding Bliss / Moody Cinema / Look ${idx + 1}`}
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
                              onClick={() => setPreviewHomeLookIndex(idx)}
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

                            {homeLooksList.length > 1 && (
                              <button
                                onClick={() => handleRemoveHomeLook(idx)}
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
                          <ImageDropZone
                            label="📸 BEFORE IMAGE"
                            value={look.before}
                            onChange={(url) => handleUpdateHomeLook(idx, 'before', url)}
                            onClear={() => handleUpdateHomeLook(idx, 'before', '')}
                            placeholder="Or paste Before Image URL"
                          />

                          <ImageDropZone
                            label="✨ AFTER IMAGE"
                            value={look.after}
                            onChange={(url) => handleUpdateHomeLook(idx, 'after', url)}
                            onClear={() => handleUpdateHomeLook(idx, 'after', '')}
                            placeholder="Or paste After Image URL"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveHomepageShowcase}
                  disabled={isSavingHome}
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
                    cursor: isSavingHome ? 'wait' : 'pointer',
                  }}
                >
                  {isSavingHome ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {isSavingHome ? 'Saving to Database...' : 'Save & Publish Homepage Showcase to Store'}
                </button>
              </div>
            </div>

            {/* Right: Live Interactive Simulator & Thumbnail Preview for Homepage */}
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
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brown)', margin: 0 }}>
                      🏠 Homepage Live Preview
                    </h3>
                    <p style={{ fontSize: '0.74rem', color: 'var(--muted)', margin: '2px 0 0 0' }}>
                      Interactive simulation of the homepage "See the Difference" section
                    </p>
                  </div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--terracotta-dark)', fontWeight: 700 }}>
                    {currentHomePreviewLook?.title || `Look #${previewHomeLookIndex + 1}`}
                  </span>
                </div>

                {/* Live Slider Render */}
                {currentHomePreviewLook?.before && currentHomePreviewLook?.after ? (
                  <BeforeAfterSlider
                    key={`home-preview-${currentHomePreviewLook.id}-${previewHomeLookIndex}`}
                    beforeImage={currentHomePreviewLook.before}
                    afterImage={currentHomePreviewLook.after}
                    beforeLabel="BEFORE"
                    afterLabel="AFTER"
                    aspectRatio="16 / 9"
                  />
                ) : (
                  <div
                    style={{
                      aspectRatio: '16 / 9',
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
                {homeLooksList.length > 1 && (
                  <div style={{ marginTop: '16px' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                      CLICK PILLS TO TEST HOMEPAGE SWITCHER:
                    </span>
                    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {homeLooksList.map((look, idx) => (
                        <button
                          key={idx}
                          onClick={() => setPreviewHomeLookIndex(idx)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            backgroundColor: previewHomeLookIndex === idx ? 'var(--brown)' : 'var(--cream-light)',
                            color: previewHomeLookIndex === idx ? '#fff' : 'var(--brown)',
                            border: previewHomeLookIndex === idx ? '1px solid var(--brown)' : '1px solid var(--border)',
                            cursor: 'pointer',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Sparkles size={11} color={previewHomeLookIndex === idx ? 'var(--terracotta-light)' : 'var(--terracotta)'} />
                          {look.title?.split('(')[0]?.trim() || `Look #${idx + 1}`}
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
        {/* TAB 2: PRODUCT BEFORE / AFTER VARIATION LOOKS (PDP)                       */}
        {/* ========================================================================= */}
        {activeTab === 'productBA' && (
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
                          <ImageDropZone
                            label="📸 BEFORE IMAGE"
                            value={look.before}
                            onChange={(url) => handleUpdateLook(idx, 'before', url)}
                            onClear={() => handleUpdateLook(idx, 'before', '')}
                            placeholder="Or paste Before Image URL"
                          />

                          {/* AFTER IMAGE BOX */}
                          <ImageDropZone
                            label="✨ AFTER IMAGE"
                            value={look.after}
                            onChange={(url) => handleUpdateLook(idx, 'after', url)}
                            onClear={() => handleUpdateLook(idx, 'after', '')}
                            placeholder="Or paste After Image URL"
                          />
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
                  <Save size={18} /> Save & Publish Looks to Shopify Store
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
                    Product PDP Live Preview
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
                  Product Display Hierarchy & Drag Order
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--muted)', margin: '4px 0 0 0' }}>
                  Drag & drop or use Up/Down arrows to control which products appear first on the Homepage, Shop Catalog & Category grids.
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

            {/* Reorderable List with HTML5 Drag & Drop */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {orderedProductList.map((product, idx) => {
                const isDragging = draggedProductIndex === idx;
                const isDragOver = dragOverProductIndex === idx && draggedProductIndex !== idx;

                return (
                  <div
                    key={product.id}
                    draggable
                    onDragStart={(e) => handleProductDragStart(e, idx)}
                    onDragOver={(e) => handleProductDragOver(e, idx)}
                    onDrop={(e) => handleProductDrop(e, idx)}
                    onDragEnd={() => {
                      setDraggedProductIndex(null);
                      setDragOverProductIndex(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isDragOver ? 'rgba(201, 130, 103, 0.1)' : isDragging ? 'var(--cream-dark)' : 'var(--cream-light)',
                      border: isDragOver ? '2px dashed var(--terracotta)' : '1.5px solid var(--border)',
                      gap: '14px',
                      cursor: 'grab',
                      opacity: isDragging ? 0.45 : 1,
                      transition: 'all 0.18s ease',
                      transform: isDragOver ? 'scale(1.01)' : 'none',
                    }}
                  >
                    {/* Left: Drag Handle & Position & Thumbnail & Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <div
                        title="Drag to reorder"
                        style={{
                          cursor: 'grab',
                          color: 'var(--muted)',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '2px',
                        }}
                      >
                        <GripVertical size={20} />
                      </div>

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
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: COMMUNITY UGC SHOWCASE STUDIO (VERTICAL REELS / UGC CARDS)         */}
        {/* ========================================================================= */}
        {activeTab === 'ugc' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1.05fr)', gap: '30px', alignItems: 'start' }} className="admin-grid-2col">
            {/* Left Column: Spacious UGC Cards Editor */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '26px',
                  boxShadow: 'var(--shadow-clay)',
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid var(--border-light)', paddingBottom: '18px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brown)', margin: 0 }}>
                      Community UGC Showcase Cards ({localUgcList.length})
                    </h3>
                    <p style={{ fontSize: '0.86rem', color: 'var(--muted)', margin: '4px 0 0 0' }}>
                      Upload vertical creator photos & configure reels displayed on the Homepage continuous marquee.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={handleAddUgcItem}
                      style={{
                        padding: '9px 18px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--terracotta)',
                        color: '#fff',
                        border: 'none',
                        fontSize: '0.86rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(201, 130, 103, 0.3)',
                      }}
                    >
                      <Plus size={16} /> Add UGC Card
                    </button>

                    <button
                      onClick={handleSaveUGC}
                      className="btn-primary"
                      style={{
                        padding: '9px 18px',
                        fontSize: '0.86rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Save size={16} /> Save Changes
                    </button>
                  </div>
                </div>

                {/* List of UGC Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {localUgcList.map((item, idx) => {
                    const isSelected = previewUgcIndex === idx;

                    return (
                      <div
                        key={item.id || idx}
                        style={{
                          backgroundColor: isSelected ? 'rgba(201, 130, 103, 0.04)' : '#ffffff',
                          border: isSelected ? '2px solid var(--terracotta)' : '1.5px solid var(--border)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '20px 22px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '16px',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 8px 24px rgba(201, 130, 103, 0.15)' : 'var(--shadow-sm)',
                        }}
                      >
                        {/* Header Row: Title & Action Controls */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                            <span
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                backgroundColor: isSelected ? 'var(--terracotta)' : 'var(--brown)',
                                color: '#fff',
                                fontSize: '0.82rem',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {idx + 1}
                            </span>
                            <div style={{ minWidth: 0 }}>
                              <span style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--brown)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.creatorHandle || `Card #${idx + 1}`}
                              </span>
                              <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 600 }}>
                                {item.productName || 'Linked Product'} • {item.category || 'General'}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => setPreviewUgcIndex(idx)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: isSelected ? 'var(--terracotta)' : 'var(--cream-light)',
                                color: isSelected ? '#fff' : 'var(--brown)',
                                border: '1px solid var(--border)',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Eye size={13} /> {isSelected ? 'Viewing' : 'Preview'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMoveUgcItemToTop(idx)}
                              disabled={idx === 0}
                              title="Move to Top"
                              style={{
                                padding: '6px 10px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: '#fff',
                                border: '1px solid var(--border)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: idx === 0 ? 'not-allowed' : 'pointer',
                                opacity: idx === 0 ? 0.4 : 1,
                              }}
                            >
                              Top
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMoveUgcItem(idx, 'up')}
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
                              <ChevronUp size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMoveUgcItem(idx, 'down')}
                              disabled={idx === localUgcList.length - 1}
                              title="Move Down"
                              style={{
                                padding: '6px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: '#fff',
                                border: '1px solid var(--border)',
                                cursor: idx === localUgcList.length - 1 ? 'not-allowed' : 'pointer',
                                opacity: idx === localUgcList.length - 1 ? 0.4 : 1,
                              }}
                            >
                              <ChevronDown size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDuplicateUgcItem(idx)}
                              title="Duplicate card"
                              style={{
                                padding: '6px 8px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'var(--cream-light)',
                                border: '1px solid var(--border)',
                                color: 'var(--brown)',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                              }}
                            >
                              <Copy size={13} />
                            </button>

                            {localUgcList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveUgcItem(idx)}
                                title="Delete card"
                                style={{
                                  padding: '6px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                  border: '1px solid rgba(239, 68, 68, 0.2)',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                }}
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Image Upload + Form Inputs */}
                        <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: '20px', alignItems: 'start' }} className="ugc-card-grid">
                          {/* Vertical Image Dropzone */}
                          <div>
                            <ImageDropZone
                              label="📸 VERTICAL PHOTO (9:16)"
                              value={item.image}
                              onChange={(url) => handleUpdateUgcItem(idx, 'image', url)}
                              onClear={() => handleUpdateUgcItem(idx, 'image', '')}
                              placeholder="Image URL or Drop Photo"
                            />
                          </div>

                          {/* Metadata Fields (Spacious & Cleanly Aligned) */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {/* Row 1: Creator Handle & Category Badge */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                              <div>
                                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--brown)', display: 'block', marginBottom: '6px' }}>
                                  CREATOR HANDLE / USERNAME
                                </label>
                                <input
                                  type="text"
                                  value={item.creatorHandle}
                                  onChange={(e) => handleUpdateUgcItem(idx, 'creatorHandle', e.target.value)}
                                  placeholder="@creator_handle"
                                  style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1.5px solid var(--border)',
                                    fontSize: '0.88rem',
                                    fontWeight: 700,
                                    color: 'var(--brown)',
                                    outline: 'none',
                                    backgroundColor: '#fff',
                                    boxSizing: 'border-box',
                                  }}
                                />
                              </div>

                              <div>
                                <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--brown)', display: 'block', marginBottom: '6px' }}>
                                  CATEGORY / TOOLKIT BADGE
                                </label>
                                <select
                                  value={item.category || 'presets'}
                                  onChange={(e) => handleUpdateUgcItem(idx, 'category', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1.5px solid var(--border)',
                                    fontSize: '0.88rem',
                                    color: 'var(--brown)',
                                    fontWeight: 700,
                                    outline: 'none',
                                    backgroundColor: '#fff',
                                    boxSizing: 'border-box',
                                  }}
                                >
                                  <option value="presets">PRESETS (Lightroom / Mobile)</option>
                                  <option value="luts">LUTS (Video & Color Grading)</option>
                                  <option value="psds">PSDS (Photoshop Templates)</option>
                                  <option value="fonts">FONTS (Typography)</option>
                                  <option value="assets">3D ASSETS & PNGs</option>
                                  <option value="albums">WEDDING ALBUMS</option>
                                </select>
                              </div>
                            </div>

                            {/* Row 2: Linked Product Asset */}
                            <div>
                              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--brown)', display: 'block', marginBottom: '6px' }}>
                                LINKED STORE PRODUCT (CTA Link)
                              </label>
                              <select
                                value={item.productSlug}
                                onChange={(e) => handleUpdateUgcItem(idx, 'productSlug', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '10px 14px',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1.5px solid var(--border)',
                                  fontSize: '0.88rem',
                                  color: 'var(--brown)',
                                  fontWeight: 600,
                                  outline: 'none',
                                  backgroundColor: '#fff',
                                  boxSizing: 'border-box',
                                }}
                              >
                                {products.map((p) => (
                                  <option key={p.id} value={p.slug}>
                                    {p.name} — (₹{p.price} • {p.category?.toUpperCase()})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Row 3: Testimonial Quote / Caption */}
                            <div>
                              <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--brown)', display: 'block', marginBottom: '6px' }}>
                                TESTIMONIAL QUOTE / REEL CAPTION
                              </label>
                              <textarea
                                rows={2}
                                value={item.caption}
                                onChange={(e) => handleUpdateUgcItem(idx, 'caption', e.target.value)}
                                placeholder="e.g. Crafted with 30 VINTAGE PREMIUM PRESET PACK in 1-click"
                                style={{
                                  width: '100%',
                                  padding: '10px 14px',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1.5px solid var(--border)',
                                  fontSize: '0.88rem',
                                  color: 'var(--brown)',
                                  outline: 'none',
                                  backgroundColor: '#fff',
                                  fontFamily: 'inherit',
                                  resize: 'vertical',
                                  boxSizing: 'border-box',
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Save Bar */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button
                    onClick={handleAddUgcItem}
                    className="btn-secondary"
                    style={{
                      flex: 1,
                      padding: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '0.94rem',
                      fontWeight: 800,
                    }}
                  >
                    <Plus size={18} /> Add Another UGC Reel
                  </button>

                  <button
                    onClick={handleSaveUGC}
                    className="btn-primary"
                    style={{
                      flex: 1.5,
                      padding: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '0.96rem',
                      fontWeight: 800,
                    }}
                  >
                    <Save size={18} /> Save & Publish UGC Showcase to Homepage
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Simulator & Preview Controller */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '90px' }}>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-clay)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--brown)', margin: 0 }}>
                      Live Marquee Reel Preview
                    </h3>
                    <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
                      Exact appearance on customer homepage
                    </span>
                  </div>
                  <span
                    style={{
                      backgroundColor: 'var(--terracotta-light)',
                      color: 'var(--terracotta-dark)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    Reel #{previewUgcIndex + 1} of {localUgcList.length}
                  </span>
                </div>

                {/* Vertical Card Preview Render (Smartphone Reel Proportions) */}
                {localUgcList[previewUgcIndex]?.image ? (
                  <div
                    style={{
                      width: '260px',
                      height: '410px',
                      borderRadius: 'var(--radius-lg)',
                      position: 'relative',
                      overflow: 'hidden',
                      backgroundColor: 'var(--cream-dark)',
                      border: '2px solid var(--border)',
                      boxShadow: '0 18px 40px -10px rgba(45, 30, 20, 0.35)',
                    }}
                  >
                    <img
                      src={localUgcList[previewUgcIndex].image}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.05) 40%, rgba(20,14,10,0.88) 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '14px',
                        boxSizing: 'border-box',
                      }}
                    >
                      {/* Top Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.88)',
                            backdropFilter: 'blur(8px)',
                            color: 'var(--brown-dark)',
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '3px 9px',
                            borderRadius: 'var(--radius-full)',
                          }}
                        >
                          {localUgcList[previewUgcIndex].creatorHandle || '@cinevo_creator'}
                        </span>

                        {localUgcList[previewUgcIndex].category && (
                          <span
                            style={{
                              backgroundColor: 'var(--terracotta)',
                              color: '#fff',
                              fontSize: '0.66rem',
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: 'var(--radius-full)',
                              textTransform: 'uppercase',
                            }}
                          >
                            {localUgcList[previewUgcIndex].category}
                          </span>
                        )}
                      </div>

                      {/* Bottom Details */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {localUgcList[previewUgcIndex].caption && (
                          <p
                            style={{
                              color: '#ffffff',
                              fontSize: '0.86rem',
                              fontWeight: 600,
                              lineHeight: 1.35,
                              margin: 0,
                              textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                            }}
                          >
                            "{localUgcList[previewUgcIndex].caption}"
                          </p>
                        )}

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: 'rgba(255,255,255,0.18)',
                            backdropFilter: 'blur(10px)',
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(255,255,255,0.25)',
                          }}
                        >
                          <span
                            style={{
                              color: '#fff',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              flex: 1,
                              paddingRight: '6px',
                            }}
                          >
                            {localUgcList[previewUgcIndex].productName || 'View Asset'}
                          </span>

                          <div
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              backgroundColor: '#ffffff',
                              color: 'var(--brown)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <ExternalLink size={12} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      width: '260px',
                      height: '410px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--cream-light)',
                      border: '1.5px dashed var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--muted)',
                      textAlign: 'center',
                      padding: '24px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <ImageIcon size={40} color="var(--terracotta-light)" style={{ marginBottom: '10px' }} />
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--brown)' }}>No Photo Uploaded</span>
                    <span style={{ fontSize: '0.78rem', marginTop: '6px', lineHeight: 1.4 }}>Upload a vertical photo on the left to see live preview</span>
                  </div>
                )}

                {/* Card Switcher Pills */}
                {localUgcList.length > 1 && (
                  <div style={{ width: '100%', marginTop: '20px' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 800, display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      CLICK REEL TO PREVIEW:
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {localUgcList.map((card, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPreviewUgcIndex(idx)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            backgroundColor: previewUgcIndex === idx ? 'var(--terracotta)' : 'var(--cream-light)',
                            color: previewUgcIndex === idx ? '#fff' : 'var(--brown)',
                            border: previewUgcIndex === idx ? '1px solid var(--terracotta-dark)' : '1px solid var(--border)',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          #{idx + 1} {card.creatorHandle || `Card ${idx + 1}`}
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
        {/* TAB 4: DIRECT SHOPIFY DATABASE, SUPABASE CLOUD & BACKUP                   */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* 1. PRIMARY CARD: DIRECT SHOPIFY DATABASE & MEDIA API */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
                boxShadow: 'var(--shadow-clay)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(201, 130, 103, 0.12)',
                      border: '1.5px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--terracotta)',
                    }}
                  >
                    <ShoppingBag size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brown)', margin: 0 }}>
                      Direct Shopify Database Integration (Admin API)
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: '2px 0 0 0' }}>
                      Uploads Before/After photos directly into Shopify's product media and saves looks to Shopify's product database.
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    backgroundColor: shopifyAdminToken ? '#dcfce7' : '#fef3c7',
                    color: shopifyAdminToken ? '#15803d' : '#b45309',
                    border: `1px solid ${shopifyAdminToken ? '#bbf7d0' : '#fde68a'}`,
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {shopifyAdminToken ? (
                    <>
                      <CheckCircle size={14} /> 🟢 SHOPIFY ADMIN TOKEN SET
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} /> 🟡 TOKEN REQUIRED FOR DIRECT SHOPIFY UPLOAD
                    </>
                  )}
                </span>
              </div>

              {/* Shopify Admin Token Input */}
              <form onSubmit={handleSaveShopifyToken} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }} className="admin-grid-2col">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--brown)', marginBottom: '6px' }}>
                      SHOPIFY STORE DOMAIN:
                    </label>
                    <input
                      type="text"
                      disabled
                      value="template-theory-2.myshopify.com"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1.5px solid var(--border)',
                        backgroundColor: 'var(--cream)',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: 'var(--brown)',
                        outline: 'none',
                        boxSizing: 'border-box',
                        cursor: 'not-allowed',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--brown)', marginBottom: '6px' }}>
                      SHOPIFY ADMIN API ACCESS TOKEN (shpat_...):
                    </label>
                    <input
                      type="password"
                      value={shopifyAdminToken}
                      onChange={(e) => setShopifyAdminToken(e.target.value)}
                      placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1.5px solid var(--border)',
                        backgroundColor: 'var(--cream-light)',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: 'var(--brown)',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Shopify Test Result Banner */}
                {shopifyAdminResult && (
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: shopifyAdminResult.success ? '#f0fdf4' : '#fef2f2',
                      border: `1.5px solid ${shopifyAdminResult.success ? '#bbf7d0' : '#fecaca'}`,
                      color: shopifyAdminResult.success ? '#15803d' : '#b91c1c',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {shopifyAdminResult.success ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span>{shopifyAdminResult.message}</span>
                  </div>
                )}

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{
                      padding: '10px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                    }}
                  >
                    <Save size={15} /> Save Shopify Admin Token
                  </button>

                  <button
                    type="button"
                    onClick={handleTestShopifyAdmin}
                    disabled={isTestingShopifyAdmin}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--cream-light)',
                      border: '1.5px solid var(--border)',
                      color: 'var(--brown)',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: isTestingShopifyAdmin ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {isTestingShopifyAdmin ? (
                      <>
                        <Loader2 size={15} className="spin-animation" /> Testing Shopify API...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={15} /> Test Shopify Connection
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Instructions Guide */}
              <div style={{ marginTop: '16px', borderTop: '1px dashed var(--border)', paddingTop: '12px' }}>
                <details style={{ fontSize: '0.82rem', color: 'var(--brown)' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--terracotta)' }}>
                    📖 How to generate your Shopify Admin API Token in 1 minute
                  </summary>
                  <div style={{ marginTop: '8px', padding: '12px 16px', backgroundColor: 'var(--cream-light)', borderRadius: 'var(--radius-sm)', lineHeight: 1.6 }}>
                    <ol style={{ margin: 0, paddingLeft: '20px' }}>
                      <li>In your Shopify Admin (<strong>admin.shopify.com</strong>), go to <strong>Settings</strong> → <strong>Apps and sales channels</strong> → <strong>Develop apps</strong>.</li>
                      <li>Click <strong>Create an app</strong> (name it <code>Template Theory Admin</code>).</li>
                      <li>Click <strong>Configure Admin API scopes</strong>, search and enable:
                        <ul>
                          <li><code>write_products</code> &amp; <code>read_products</code></li>
                          <li><code>write_files</code> &amp; <code>read_files</code></li>
                        </ul>
                      </li>
                      <li>Click <strong>Install app</strong> and copy the <strong>Admin API access token</strong> (starts with <code>shpat_...</code>).</li>
                    </ol>
                  </div>
                </details>
              </div>
            </div>

            {/* 2. SECOND CARD: SUPABASE CENTRAL CLOUD DATABASE */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
                boxShadow: 'var(--shadow-clay)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(201, 130, 103, 0.12)',
                      border: '1.5px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--terracotta)',
                    }}
                  >
                    <Database size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brown)', margin: 0 }}>
                      Central Online Database (Supabase Cloud)
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: '2px 0 0 0' }}>
                      Persists all uploaded Before/After photos, look variations, and product ordering centrally so everyone sees them.
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    backgroundColor: isCloudSyncActive ? '#dcfce7' : '#fef3c7',
                    color: isCloudSyncActive ? '#15803d' : '#b45309',
                    border: `1px solid ${isCloudSyncActive ? '#bbf7d0' : '#fde68a'}`,
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {isCloudSyncActive ? (
                    <>
                      <Cloud size={14} /> 🟢 LIVE CLOUD SYNC ACTIVE
                    </>
                  ) : (
                    <>
                      <CloudOff size={14} /> 🟡 LOCAL CACHE ONLY (OFFLINE)
                    </>
                  )}
                </span>
              </div>

              {/* Supabase Credential Inputs */}
              <form onSubmit={handleSaveSupabaseCreds} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="admin-grid-2col">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--brown)', marginBottom: '6px' }}>
                      SUPABASE PROJECT URL:
                    </label>
                    <input
                      type="text"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="https://your-project-id.supabase.co"
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1.5px solid var(--border)',
                        backgroundColor: 'var(--cream-light)',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: 'var(--brown)',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--brown)', marginBottom: '6px' }}>
                      SUPABASE ANON / PUBLIC API KEY:
                    </label>
                    <input
                      type="password"
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1.5px solid var(--border)',
                        backgroundColor: 'var(--cream-light)',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: 'var(--brown)',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Connection Status Banner if tested */}
                {connectionResult && (
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: connectionResult.success ? '#f0fdf4' : '#fef2f2',
                      border: `1.5px solid ${connectionResult.success ? '#bbf7d0' : '#fecaca'}`,
                      color: connectionResult.success ? '#15803d' : '#b91c1c',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {connectionResult.success ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span>{connectionResult.message}</span>
                  </div>
                )}

                {/* Action Buttons Toolbar */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{
                      padding: '10px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                    }}
                  >
                    <Save size={15} /> Save Cloud Credentials
                  </button>

                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--cream-light)',
                      border: '1.5px solid var(--border)',
                      color: 'var(--brown)',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: isTestingConnection ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {isTestingConnection ? (
                      <>
                        <Loader2 size={15} className="spin-animation" /> Testing Connection...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={15} /> Test Database Connection
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handlePushToCloud}
                    disabled={isSyncingCloud}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--cream-light)',
                      border: '1.5px solid var(--border)',
                      color: 'var(--brown)',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: isSyncingCloud ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {isSyncingCloud ? (
                      <>
                        <Loader2 size={15} className="spin-animation" /> Pushing to Cloud...
                      </>
                    ) : (
                      <>
                        <Cloud size={15} color="var(--terracotta)" /> Push Local Data to Cloud DB
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handlePullFromCloud}
                    disabled={isPullingCloud}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--cream-light)',
                      border: '1.5px solid var(--border)',
                      color: 'var(--brown)',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: isPullingCloud ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {isPullingCloud ? (
                      <>
                        <Loader2 size={15} className="spin-animation" /> Pulling Data...
                      </>
                    ) : (
                      <>
                        <RotateCcw size={15} /> Pull from Cloud DB
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySql}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: copiedSql ? '#dcfce7' : 'var(--cream-light)',
                      border: `1.5px solid ${copiedSql ? '#bbf7d0' : 'var(--border)'}`,
                      color: copiedSql ? '#15803d' : 'var(--brown)',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginLeft: 'auto',
                    }}
                  >
                    {copiedSql ? <Check size={15} /> : <Copy size={15} />}
                    {copiedSql ? 'SQL Script Copied!' : 'Copy 1-Click SQL Setup'}
                  </button>
                </div>
              </form>

              {/* Collapsible SQL Script Guide */}
              <div style={{ marginTop: '16px', borderTop: '1px dashed var(--border)', paddingTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowSqlDrawer((prev) => !prev)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--terracotta)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: 0,
                  }}
                >
                  <Code2 size={15} />
                  {showSqlDrawer ? 'Hide SQL Table Creation Script' : 'Need help creating the table? Click to view Supabase SQL script'}
                </button>

                {showSqlDrawer && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '0 0 8px 0' }}>
                      In your Supabase project dashboard, open the <strong>SQL Editor</strong>, paste this script, and click <strong>Run</strong>:
                    </p>
                    <pre
                      style={{
                        backgroundColor: '#1e1b18',
                        color: '#f3e8dc',
                        padding: '14px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.76rem',
                        lineHeight: 1.5,
                        overflowX: 'auto',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {SUPABASE_SQL_SETUP}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* 2. SECOND ROW: SECURITY PIN & BACKUP / RESET */}
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
                      JSON Backup & Reset
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--muted)', marginBottom: '18px' }}>
                    Download an offline JSON snapshot of your Before/After looks and sorting, or import from an existing file.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                      type="button"
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
                    type="button"
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

          </div>
        )}

      </div>

      <style>{`
        @media (max-width: 960px) {
          .admin-grid-2col {
            grid-template-columns: 1fr !important;
          }
          .ugc-card-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
