import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, ShoppingBag, Zap, Sparkles, Tag } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useShopify } from '../../context/ShopifyContext';
import confetti from 'canvas-confetti';

interface ProductBundleUpsellProps {
  currentProduct: Product;
  allProducts: Product[];
}

export const ProductBundleUpsell: React.FC<ProductBundleUpsellProps> = ({
  currentProduct,
  allProducts,
}) => {
  const { addToCart, setIsCartOpen, checkoutWithShopify } = useCart();
  const { currencySymbol } = useShopify();
  const [isAddingBundle, setIsAddingBundle] = useState(false);

  // 1. Smart Algorithmic Cross-Sell Recommendations
  const bundleItems = useMemo(() => {
    // Filter out current product
    const otherProducts = allProducts.filter((p) => p.id !== currentProduct.id);
    if (otherProducts.length === 0) return [];

    // Prioritize complementary categories
    const complementaryCategoryMap: Record<string, string[]> = {
      luts: ['presets', 'psds', 'assets'],
      presets: ['luts', 'psds', 'fonts'],
      psds: ['presets', 'luts', 'fonts'],
      fonts: ['assets', 'psds', 'presets'],
      assets: ['fonts', 'psds', 'luts'],
    };

    const targetCategories = complementaryCategoryMap[currentProduct.category] || ['presets', 'luts'];

    // Pick top complementary products
    const recommendations: Product[] = [];

    // First pick from prime complementary categories
    for (const cat of targetCategories) {
      const match = otherProducts.find(
        (p) => p.category === cat && !recommendations.some((r) => r.id === p.id)
      );
      if (match) recommendations.push(match);
      if (recommendations.length >= 2) break;
    }

    // Fallback if not enough category matches
    if (recommendations.length < 2) {
      for (const p of otherProducts) {
        if (!recommendations.some((r) => r.id === p.id)) {
          recommendations.push(p);
        }
        if (recommendations.length >= 2) break;
      }
    }

    return recommendations.slice(0, 2);
  }, [currentProduct, allProducts]);

  // Track checked state for current product and recommended items
  const [selectedIds, setSelectedIds] = useState<string[]>(() => [
    currentProduct.id,
    ...bundleItems.map((p) => p.id),
  ]);

  // Keep state updated if product changes
  React.useEffect(() => {
    setSelectedIds([currentProduct.id, ...bundleItems.map((p) => p.id)]);
  }, [currentProduct.id, bundleItems]);

  if (bundleItems.length === 0) return null;

  const allBundleCandidateProducts = [currentProduct, ...bundleItems];

  const selectedProducts = allBundleCandidateProducts.filter((p) =>
    selectedIds.includes(p.id)
  );

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Price & Discount Calculations
  const rawTotalPrice = selectedProducts.reduce((sum, p) => sum + p.price, 0);
  
  // Dynamic Discount Tier:
  // 3 items = 25% OFF bundle savings
  // 2 items = 20% OFF bundle savings
  // 1 item = 0% savings
  const discountPercent = selectedProducts.length >= 3 ? 25 : selectedProducts.length === 2 ? 20 : 0;
  const discountAmount = Math.round((rawTotalPrice * discountPercent) / 100);
  const finalBundlePrice = rawTotalPrice - discountAmount;

  const handleAddBundleToCart = () => {
    if (selectedProducts.length === 0) return;
    setIsAddingBundle(true);

    // Trigger celebratory confetti effect
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#c98267', '#60442e', '#7f876a', '#e5d5c1'],
      });
    } catch {
      // Ignore if confetti fails
    }

    // Add all selected products to cart
    selectedProducts.forEach((prod) => {
      addToCart(prod, 1);
    });

    setTimeout(() => {
      setIsAddingBundle(false);
      setIsCartOpen(true);
    }, 400);
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--cream-light)',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 16px',
        boxShadow: 'var(--shadow-clay)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginTop: '4px',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="pdp-bundle-mini-box"
    >
      {/* Header Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              backgroundColor: 'var(--terracotta-light)',
              color: 'var(--terracotta-dark)',
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
            }}
          >
            <Sparkles size={11} />
            Frequently Bought Together
          </span>
        </div>

        {discountPercent > 0 && (
          <span
            style={{
              backgroundColor: 'var(--olive-light)',
              color: 'var(--olive-dark)',
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Tag size={11} />
            Save {discountPercent}% ({currencySymbol}{discountAmount} OFF)
          </span>
        )}
      </div>

      {/* Mini Thumbnails Chain & Checkboxes */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {allBundleCandidateProducts.map((prod, idx) => {
          const isSelected = selectedIds.includes(prod.id);
          const isCurrent = prod.id === currentProduct.id;

          return (
            <React.Fragment key={prod.id}>
              {idx > 0 && (
                <div
                  style={{
                    color: 'var(--muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Plus size={13} strokeWidth={2.5} />
                </div>
              )}

              <div
                onClick={() => toggleProduct(prod.id)}
                title={prod.name}
                style={{
                  position: 'relative',
                  width: '52px',
                  height: '52px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: isSelected ? '2px solid var(--terracotta)' : '1.5px solid var(--border)',
                  opacity: isSelected ? 1 : 0.45,
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.18s ease',
                  boxShadow: isSelected ? '0 3px 10px rgba(201, 130, 103, 0.22)' : 'none',
                }}
              >
                <img
                  src={prod.thumbnail}
                  alt={prod.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {isCurrent && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: 'rgba(96, 68, 46, 0.9)',
                      color: '#ffffff',
                      fontSize: '0.55rem',
                      fontWeight: 800,
                      textAlign: 'center',
                      padding: '1px 0',
                    }}
                  >
                    Main
                  </span>
                )}
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '3px',
                      right: '3px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--terracotta)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                    }}
                  >
                    <Check size={10} strokeWidth={3} />
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}

        {/* Price inline preview */}
        <div style={{ marginLeft: 'auto', textAlign: 'right', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brown-dark)' }}>
              {currencySymbol}{finalBundlePrice}
            </span>
            {discountPercent > 0 && (
              <span
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--muted)',
                  textDecoration: 'line-through',
                }}
              >
                {currencySymbol}{rawTotalPrice}
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600 }}>
            {selectedProducts.length} items bundle
          </span>
        </div>
      </div>

      {/* Mini Checkbox List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {allBundleCandidateProducts.map((prod) => {
          const isSelected = selectedIds.includes(prod.id);
          const isCurrent = prod.id === currentProduct.id;

          return (
            <div
              key={prod.id}
              onClick={() => toggleProduct(prod.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '3px 6px',
                borderRadius: '6px',
                backgroundColor: isSelected ? 'var(--cream)' : 'transparent',
                cursor: 'pointer',
                transition: 'background-color 0.12s ease',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  style={{
                    accentColor: 'var(--terracotta)',
                    width: '14px',
                    height: '14px',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? 'var(--brown)' : 'var(--muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {isCurrent ? <strong>This: </strong> : null}
                  {prod.name}
                </span>
              </div>

              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: isSelected ? 'var(--brown-dark)' : 'var(--muted)',
                  flexShrink: 0,
                }}
              >
                {currencySymbol}{prod.price}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={handleAddBundleToCart}
        disabled={selectedProducts.length === 0 || isAddingBundle}
        style={{
          width: '100%',
          padding: '11px 16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--brown)',
          color: '#ffffff',
          fontSize: '0.88rem',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          cursor: selectedProducts.length === 0 ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 14px rgba(96, 68, 46, 0.22)',
          transition: 'all 0.18s ease',
          border: 'none',
        }}
        onMouseEnter={(e) => {
          if (selectedProducts.length > 0) {
            e.currentTarget.style.backgroundColor = 'var(--brown-dark)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--brown)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <ShoppingBag size={15} />
        <span>
          {isAddingBundle
            ? 'Adding to Cart...'
            : `Add Bundle to Cart (${selectedProducts.length} Items) • ${currencySymbol}${finalBundlePrice}`}
        </span>
      </button>
    </div>
  );
};
