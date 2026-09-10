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
        borderRadius: 'var(--radius-xl)',
        padding: '32px 30px',
        boxShadow: 'var(--shadow-clay)',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="pdp-bundle-upsell-box"
    >
      {/* Top Banner Tag */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              backgroundColor: 'var(--terracotta-light)',
              color: 'var(--terracotta-dark)',
              fontSize: '0.78rem',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <Sparkles size={13} />
            Frequently Bought Together
          </span>
        </div>

        {discountPercent > 0 && (
          <span
            style={{
              backgroundColor: 'var(--olive-light)',
              color: 'var(--olive-dark)',
              fontSize: '0.82rem',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Tag size={13} />
            Save {discountPercent}% with Bundle
          </span>
        )}
      </div>

      {/* Heading */}
      <div style={{ marginBottom: '22px' }}>
        <h3
          style={{
            fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)',
            fontWeight: 800,
            color: 'var(--brown)',
            lineHeight: 1.25,
            marginBottom: '6px',
          }}
        >
          Complete Your Creator Toolkit
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.5, maxWidth: '700px' }}>
          Pair this pack with complementary color grading tools and design assets for a complete, cohesive aesthetic.
        </p>
      </div>

      {/* 2-Column Responsive Layout: Left (Product Cards Chain) + Right (Checkout & Pricing Summary) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.45fr 1fr',
          gap: '28px',
          alignItems: 'stretch',
        }}
        className="bundle-main-grid"
      >
        {/* Left Side: Product Cards & Checkboxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'space-between' }}>
          
          {/* Visual Cards Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${allBundleCandidateProducts.length}, 1fr)`,
              gap: '12px',
            }}
            className="bundle-cards-row"
          >
            {allBundleCandidateProducts.map((prod, idx) => {
              const isSelected = selectedIds.includes(prod.id);
              const isCurrent = prod.id === currentProduct.id;

              return (
                <div
                  key={prod.id}
                  onClick={() => toggleProduct(prod.id)}
                  style={{
                    backgroundColor: isSelected ? 'var(--white)' : 'rgba(255,255,255,0.4)',
                    border: isSelected ? '2px solid var(--terracotta)' : '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isSelected ? '0 6px 18px rgba(201, 130, 103, 0.18)' : 'none',
                    opacity: isSelected ? 1 : 0.6,
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.opacity = '0.6';
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '1 / 1',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      backgroundColor: 'var(--cream-dark)',
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
                          top: '6px',
                          left: '6px',
                          backgroundColor: 'rgba(96, 68, 46, 0.92)',
                          color: '#ffffff',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        Main Item
                      </span>
                    )}

                    {/* Checkbox badge on top-right */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? 'var(--terracotta)' : 'rgba(255,255,255,0.85)',
                        border: isSelected ? 'none' : '1.5px solid var(--border)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isSelected ? <Check size={13} strokeWidth={3} /> : null}
                    </div>
                  </div>

                  {/* Title & Price */}
                  <div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--terracotta)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                      }}
                    >
                      {prod.category}
                    </span>
                    <h4
                      style={{
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: 'var(--brown)',
                        lineHeight: 1.25,
                        marginTop: '2px',
                        marginBottom: '4px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        height: '2.5em',
                      }}
                    >
                      {prod.name}
                    </h4>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--brown-dark)' }}>
                      {currencySymbol}{prod.price}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Checkbox Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? 'var(--cream)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      style={{
                        accentColor: 'var(--terracotta)',
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.84rem',
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? 'var(--brown)' : 'var(--muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {isCurrent ? <strong>This item: </strong> : null}
                      {prod.name}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.86rem',
                      fontWeight: 800,
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
        </div>

        {/* Right Side: Total Price Breakdown & Add to Cart Action */}
        <div
          style={{
            backgroundColor: 'var(--white)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 22px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '18px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.86rem', color: 'var(--muted)', fontWeight: 600 }}>
                Selected Products:
              </span>
              <span
                style={{
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  backgroundColor: 'var(--cream-dark)',
                  color: 'var(--brown)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                {selectedProducts.length} of {allBundleCandidateProducts.length}
              </span>
            </div>

            {/* Price Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '14px', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--muted)' }}>
                <span>Items Subtotal</span>
                <span style={{ fontWeight: 700, textDecoration: discountPercent > 0 ? 'line-through' : 'none' }}>
                  {currencySymbol}{rawTotalPrice}
                </span>
              </div>

              {discountPercent > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--terracotta-dark)', fontWeight: 700 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Tag size={13} /> {discountPercent}% Bundle Discount
                  </span>
                  <span>-{currencySymbol}{discountAmount}</span>
                </div>
              )}
            </div>

            {/* Final Bundle Price */}
            <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, display: 'block' }}>
                  Bundle Price:
                </span>
                <span style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--brown-dark)' }}>
                  {currencySymbol}{finalBundlePrice}
                </span>
              </div>

              {discountPercent > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--olive-light)',
                    color: 'var(--olive-dark)',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    padding: '4px 8px',
                    borderRadius: '6px',
                  }}
                >
                  Save {currencySymbol}{discountAmount}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              onClick={handleAddBundleToCart}
              disabled={selectedProducts.length === 0 || isAddingBundle}
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--brown)',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: selectedProducts.length === 0 ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 24px rgba(96, 68, 46, 0.28)',
                transition: 'all 0.2s ease',
                border: 'none',
              }}
              onMouseEnter={(e) => {
                if (selectedProducts.length > 0) {
                  e.currentTarget.style.backgroundColor = 'var(--brown-dark)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--brown)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <ShoppingBag size={19} />
              <span>
                {isAddingBundle
                  ? 'Adding Bundle to Cart...'
                  : `Add Bundle to Cart (${selectedProducts.length} ${selectedProducts.length === 1 ? 'Item' : 'Items'})`}
              </span>
            </button>

            <span style={{ fontSize: '0.76rem', color: 'var(--muted)', textAlign: 'center', fontWeight: 500 }}>
              ⚡ Instant digital download • Lifetime free updates • Commercial license
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .bundle-main-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .bundle-cards-row {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 580px) {
          .bundle-cards-row {
            grid-template-columns: 1fr 1fr 1fr !important;
            gap: 8px !important;
          }
          .pdp-bundle-upsell-box {
            padding: 20px 16px !important;
          }
        }
      `}</style>
    </div>
  );
};
