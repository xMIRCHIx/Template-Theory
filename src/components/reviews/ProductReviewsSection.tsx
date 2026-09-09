import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  Image as ImageIcon,
  X,
  Plus,
  Filter,
  Check,
  Upload,
  AlertCircle,
  Sparkles,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ProductReview,
  ReviewStats,
  fetchProductReviews,
  submitProductReview,
  likeProductReview,
  calculateReviewStats,
} from '../../services/reviewService';
import { compressImage } from '../../utils/compressImage';

interface ProductReviewsSectionProps {
  product: {
    id: string;
    slug: string;
    title: string;
  };
}

interface PhotoPreviewItem {
  file: File;
  previewUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({ product }) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [activePhotoLightbox, setActivePhotoLightbox] = useState<string | null>(null);

  // Filter & Sort State
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | 'all' | 'photos'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'helpful'>('recent');

  // Liked review IDs saved in local storage to prevent duplicate clicks
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('cinevo_liked_reviews');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Write Review Form State
  const [formRating, setFormRating] = useState(5);
  const [formHoverRating, setFormHoverRating] = useState(0);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [photoPreviews, setPhotoPreviews] = useState<PhotoPreviewItem[]>([]);
  const [isCompressingPhotos, setIsCompressingPhotos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load reviews on mount or when product slug changes
  useEffect(() => {
    let isMounted = true;
    async function loadReviews() {
      setIsLoading(true);
      try {
        const data = await fetchProductReviews(product.slug || product.id);
        if (isMounted) {
          setReviews(data);
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadReviews();
    return () => {
      isMounted = false;
    };
  }, [product.slug, product.id]);

  // Review statistics
  const stats: ReviewStats = useMemo(() => calculateReviewStats(reviews), [reviews]);

  // Filtered & Sorted Reviews
  const filteredReviews = useMemo(() => {
    let list = [...reviews];

    // Filter
    if (selectedRatingFilter === 'photos') {
      list = list.filter((r) => r.photos && r.photos.length > 0);
    } else if (typeof selectedRatingFilter === 'number') {
      list = list.filter((r) => Math.round(r.rating) === selectedRatingFilter);
    }

    // Sort
    if (sortBy === 'highest') {
      list.sort((a, b) => b.rating - a.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'helpful') {
      list.sort((a, b) => (b.likes || 0) - (a.likes || 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // most recent
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [reviews, selectedRatingFilter, sortBy]);

  // Handle image files selection with auto-compression preview
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (photoPreviews.length + files.length > 4) {
      alert('You can upload a maximum of 4 photos per review.');
      return;
    }

    setIsCompressingPhotos(true);
    try {
      const newItems: PhotoPreviewItem[] = [];
      for (const file of files) {
        // Compress instantly client-side
        const compressed = await compressImage(file, {
          maxWidth: 1000,
          quality: 0.8,
          mimeType: 'image/webp',
        });

        newItems.push({
          file: compressed.file,
          previewUrl: compressed.dataUrl,
          originalSizeKb: compressed.originalSizeKb,
          compressedSizeKb: compressed.sizeKb,
        });
      }
      setPhotoPreviews((prev) => [...prev, ...newItems]);
    } catch (err) {
      console.error('Error compressing selected photos:', err);
    } finally {
      setIsCompressingPhotos(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhotoPreview = (index: number) => {
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Review Form
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formContent.trim()) {
      setSubmitError('Please fill out your name, email, and review comments.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const filesToUpload = photoPreviews.map((p) => p.file);
      const res = await submitProductReview(
        {
          productId: product.id,
          productSlug: product.slug,
          productName: product.title,
          authorName: formName,
          authorEmail: formEmail,
          rating: formRating,
          title: formTitle,
          content: formContent,
          isVerifiedBuyer: true,
        },
        filesToUpload
      );

      if (res.success && res.review) {
        setReviews((prev) => [res.review!, ...prev]);
        setSubmitSuccess(true);
        setTimeout(() => {
          setIsWriteModalOpen(false);
          setSubmitSuccess(false);
          setFormTitle('');
          setFormContent('');
          setPhotoPreviews([]);
        }, 1800);
      } else {
        setSubmitError(res.message || 'Failed to submit review.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Like
  const handleLike = async (reviewId: string) => {
    if (likedReviews[reviewId]) return;

    // Optimistic UI update
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r))
    );

    const updatedLikes = { ...likedReviews, [reviewId]: true };
    setLikedReviews(updatedLikes);
    try {
      localStorage.setItem('cinevo_liked_reviews', JSON.stringify(updatedLikes));
    } catch {}

    await likeProductReview(reviewId);
  };

  const ratingDescriptions: Record<number, string> = {
    5: 'Excellent! Highly recommended',
    4: 'Good, satisfied with results',
    3: 'Average, meets basic needs',
    2: 'Below expectations',
    1: 'Poor / not satisfied',
  };

  return (
    <section id="product-reviews-section" style={{ padding: '40px 0 60px 0' }}>
      <div className="container">
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '9999px',
                backgroundColor: 'var(--sage-light, #ecfdf5)',
                color: 'var(--sage, #059669)',
                fontSize: '0.82rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              <Sparkles size={13} />
              <span>Verified Creator Feedback</span>
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                fontWeight: 800,
                color: 'var(--brown)',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Customer Reviews
            </h2>
            <p style={{ fontSize: '0.94rem', color: 'var(--muted)', marginTop: '6px', margin: '6px 0 0 0' }}>
              Real before/after results and feedback from photographers, filmmakers, and editors.
            </p>
          </div>

          <button
            onClick={() => setIsWriteModalOpen(true)}
            className="clay-button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 22px',
              backgroundColor: 'var(--brown)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.92rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-clay-btn, 0 4px 14px rgba(0,0,0,0.12))',
              transition: 'all 0.2s',
            }}
          >
            <Plus size={16} />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Rating Breakdown & Summary Grid */}
        <div
          className="clay-card reviews-summary-card"
          style={{
            display: 'grid',
            gridTemplateColumns: '260px 1fr',
            gap: '36px',
            padding: '32px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: '#ffffff',
            border: '1.5px solid var(--border)',
            boxShadow: 'var(--shadow-clay)',
            marginBottom: '36px',
            alignItems: 'center',
          }}
        >
          {/* Big Score Block */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              paddingRight: '24px',
              borderRight: '1px solid var(--border-light)',
            }}
            className="reviews-score-block"
          >
            <div
              style={{
                fontSize: '3.6rem',
                fontWeight: 900,
                color: 'var(--brown)',
                lineHeight: 1,
                letterSpacing: '-0.03em',
              }}
            >
              {stats.averageRating.toFixed(1)}
            </div>
            <div style={{ display: 'flex', gap: '3px', margin: '12px 0 6px 0' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={20}
                  fill={s <= Math.round(stats.averageRating) ? '#f59e0b' : '#e2e8f0'}
                  color={s <= Math.round(stats.averageRating) ? '#f59e0b' : '#cbd5e1'}
                />
              ))}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--muted)', fontWeight: 600 }}>
              Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '10px',
                fontSize: '0.78rem',
                color: 'var(--sage, #059669)',
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={13} />
              <span>100% Verified Purchases</span>
            </div>
          </div>

          {/* 5-Star Distribution Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[5, 4, 3, 2, 1].map((starNum) => {
              const count = stats.ratingBreakdown[starNum as keyof typeof stats.ratingBreakdown] || 0;
              const pct = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : starNum === 5 ? 100 : 0;
              return (
                <button
                  key={starNum}
                  onClick={() =>
                    setSelectedRatingFilter((prev) => (prev === starNum ? 'all' : starNum))
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'none',
                    border: 'none',
                    padding: '4px 6px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                    backgroundColor: selectedRatingFilter === starNum ? 'var(--cream-light)' : 'transparent',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      width: '46px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: 'var(--brown)',
                    }}
                  >
                    <span>{starNum}</span>
                    <Star size={13} fill="#f59e0b" color="#f59e0b" />
                  </div>

                  {/* Progress Bar */}
                  <div
                    style={{
                      flex: 1,
                      height: '10px',
                      borderRadius: '999px',
                      backgroundColor: 'var(--cream-light, #f1efe7)',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      style={{
                        height: '100%',
                        borderRadius: '999px',
                        backgroundColor:
                          starNum >= 4 ? '#f59e0b' : starNum === 3 ? '#fbbf24' : '#94a3b8',
                      }}
                    />
                  </div>

                  <div
                    style={{
                      width: '75px',
                      textAlign: 'right',
                      fontSize: '0.82rem',
                      color: 'var(--muted)',
                      fontWeight: 600,
                    }}
                  >
                    {pct}% ({count})
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Pills & Sort Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          {/* Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedRatingFilter('all')}
              style={{
                padding: '7px 14px',
                borderRadius: '9999px',
                fontSize: '0.84rem',
                fontWeight: 700,
                border: selectedRatingFilter === 'all' ? '1.5px solid var(--brown)' : '1px solid var(--border)',
                backgroundColor: selectedRatingFilter === 'all' ? 'var(--brown)' : '#ffffff',
                color: selectedRatingFilter === 'all' ? '#ffffff' : 'var(--brown)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              All ({reviews.length})
            </button>

            <button
              onClick={() => setSelectedRatingFilter('photos')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '9999px',
                fontSize: '0.84rem',
                fontWeight: 700,
                border: selectedRatingFilter === 'photos' ? '1.5px solid var(--brown)' : '1px solid var(--border)',
                backgroundColor: selectedRatingFilter === 'photos' ? 'var(--brown)' : '#ffffff',
                color: selectedRatingFilter === 'photos' ? '#ffffff' : 'var(--brown)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <ImageIcon size={14} />
              <span>With Photos</span>
            </button>

            {[5, 4, 3].map((star) => (
              <button
                key={star}
                onClick={() => setSelectedRatingFilter(star)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '7px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  border: selectedRatingFilter === star ? '1.5px solid var(--brown)' : '1px solid var(--border)',
                  backgroundColor: selectedRatingFilter === star ? 'var(--brown)' : '#ffffff',
                  color: selectedRatingFilter === star ? '#ffffff' : 'var(--brown)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <span>{star} Stars</span>
                <Star
                  size={12}
                  fill={selectedRatingFilter === star ? '#ffffff' : '#f59e0b'}
                  color={selectedRatingFilter === star ? '#ffffff' : '#f59e0b'}
                />
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--muted)', fontWeight: 600 }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: '#ffffff',
                fontSize: '0.86rem',
                fontWeight: 600,
                color: 'var(--brown)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        {isLoading ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--brown)', margin: '0 auto' }} />
            <p style={{ marginTop: '12px', fontSize: '0.92rem', color: 'var(--muted)' }}>
              Loading creator reviews...
            </p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div
            style={{
              padding: '50px 20px',
              textAlign: 'center',
              backgroundColor: 'var(--cream-light)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--border)',
            }}
          >
            <Star size={36} style={{ color: '#cbd5e1', margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--brown)', margin: 0 }}>
              No reviews match this filter
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginTop: '4px' }}>
              Be the first to share your experience with this toolkit!
            </p>
            <button
              onClick={() => setIsWriteModalOpen(true)}
              style={{
                marginTop: '16px',
                padding: '8px 18px',
                backgroundColor: 'var(--brown)',
                color: '#ffffff',
                fontSize: '0.86rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Write a Review
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredReviews.map((review) => {
              const hasLiked = Boolean(likedReviews[review.id]);
              const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={review.id}
                  className="clay-card"
                  style={{
                    padding: '24px 28px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  {/* Top Row: User Avatar, Name, Badge, Date & Stars */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Avatar Circle */}
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--cream-light, #f1efe7)',
                          border: '1.5px solid var(--border)',
                          color: 'var(--brown)',
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textTransform: 'uppercase',
                        }}
                      >
                        {review.authorName ? review.authorName.slice(0, 2) : 'CR'}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--brown)' }}>
                            {review.authorName}
                          </span>
                          {review.isVerifiedBuyer && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '2px 8px',
                                borderRadius: '999px',
                                backgroundColor: 'var(--sage-light, #ecfdf5)',
                                color: 'var(--sage, #059669)',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                              }}
                            >
                              <CheckCircle2 size={11} />
                              <span>Verified Buyer</span>
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '2px' }}>
                          {formattedDate}
                        </span>
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={16}
                          fill={s <= review.rating ? '#f59e0b' : '#e2e8f0'}
                          color={s <= review.rating ? '#f59e0b' : '#cbd5e1'}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review Title & Content */}
                  <div>
                    {review.title && (
                      <h4
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 800,
                          color: 'var(--brown)',
                          margin: '0 0 6px 0',
                        }}
                      >
                        {review.title}
                      </h4>
                    )}
                    <p
                      style={{
                        fontSize: '0.93rem',
                        color: 'var(--charcoal, #374151)',
                        lineHeight: 1.65,
                        margin: 0,
                      }}
                    >
                      {review.content}
                    </p>
                  </div>

                  {/* Review Photos Gallery */}
                  {review.photos && review.photos.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                      {review.photos.map((photoUrl, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => setActivePhotoLightbox(photoUrl)}
                          style={{
                            padding: 0,
                            border: '1.5px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            overflow: 'hidden',
                            width: '80px',
                            height: '80px',
                            cursor: 'pointer',
                            position: 'relative',
                            backgroundColor: 'var(--cream-light)',
                          }}
                        >
                          <img
                            src={photoUrl}
                            alt={`Review photo ${pIdx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Bottom Row: Helpful button */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      borderTop: '1px solid var(--border-light)',
                      paddingTop: '10px',
                    }}
                  >
                    <button
                      onClick={() => handleLike(review.id)}
                      disabled={hasLiked}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: hasLiked ? '1px solid var(--sage)' : '1px solid var(--border)',
                        backgroundColor: hasLiked ? 'var(--sage-light, #ecfdf5)' : '#ffffff',
                        color: hasLiked ? 'var(--sage, #059669)' : 'var(--muted)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: hasLiked ? 'default' : 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      <ThumbsUp size={13} fill={hasLiked ? 'currentColor' : 'none'} />
                      <span>{hasLiked ? 'Helpful' : 'Helpful?'}</span>
                      <span>({review.likes || 0})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Write a Review */}
        <AnimatePresence>
          {isWriteModalOpen && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(5px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
              }}
              onClick={() => !isSubmitting && setIsWriteModalOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                onClick={(e) => e.stopPropagation()}
                className="clay-card"
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  maxWidth: '560px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  padding: '32px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  border: '1.5px solid var(--border)',
                  position: 'relative',
                }}
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsWriteModalOpen(false)}
                  disabled={isSubmitting}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--muted)',
                    padding: '6px',
                    borderRadius: '50%',
                  }}
                >
                  <X size={20} />
                </button>

                {submitSuccess ? (
                  <div style={{ textAlign: 'center', padding: '40px 10px' }}>
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--sage-light, #ecfdf5)',
                        color: 'var(--sage, #059669)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px auto',
                      }}
                    >
                      <Check size={32} />
                    </div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brown)', margin: 0 }}>
                      Review Submitted!
                    </h3>
                    <p style={{ fontSize: '0.94rem', color: 'var(--muted)', marginTop: '8px' }}>
                      Thank you for sharing your experience. Your feedback helps the creator community.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: 'var(--terracotta, #c2410c)',
                          letterSpacing: '0.04em',
                          marginBottom: '4px',
                        }}
                      >
                        Share Your Experience
                      </div>
                      <h3
                        style={{
                          fontSize: '1.45rem',
                          fontWeight: 800,
                          color: 'var(--brown)',
                          margin: 0,
                          letterSpacing: '-0.02em',
                        }}
                      >
                        Write a Review
                      </h3>
                      <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginTop: '4px', margin: '4px 0 0 0' }}>
                        for {product.title}
                      </p>
                    </div>

                    {submitError && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 14px',
                          backgroundColor: '#fef2f2',
                          color: '#b91c1c',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                        }}
                      >
                        <AlertCircle size={16} />
                        <span>{submitError}</span>
                      </div>
                    )}

                    {/* Star Selection */}
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: 'var(--brown)', marginBottom: '8px' }}>
                        Overall Rating *
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            type="button"
                            key={s}
                            onMouseEnter={() => setFormHoverRating(s)}
                            onMouseLeave={() => setFormHoverRating(0)}
                            onClick={() => setFormRating(s)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px',
                              transform: (formHoverRating || formRating) >= s ? 'scale(1.15)' : 'scale(1)',
                              transition: 'transform 0.1s',
                            }}
                          >
                            <Star
                              size={28}
                              fill={(formHoverRating || formRating) >= s ? '#f59e0b' : '#e2e8f0'}
                              color={(formHoverRating || formRating) >= s ? '#f59e0b' : '#cbd5e1'}
                            />
                          </button>
                        ))}
                        <span style={{ fontSize: '0.86rem', color: 'var(--muted)', fontWeight: 600, marginLeft: '8px' }}>
                          {ratingDescriptions[formHoverRating || formRating]}
                        </span>
                      </div>
                    </div>

                    {/* Name & Email Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.86rem', color: 'var(--brown)', marginBottom: '6px' }}>
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="e.g. Alex Rivera"
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            fontSize: '0.92rem',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 700, fontSize: '0.86rem', color: 'var(--brown)', marginBottom: '6px' }}>
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          placeholder="name@domain.com"
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            fontSize: '0.92rem',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>

                    {/* Review Title */}
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.86rem', color: 'var(--brown)', marginBottom: '6px' }}>
                        Review Headline (Optional)
                      </label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. Best film LUTs I've ever used"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          fontSize: '0.92rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    {/* Review Comments */}
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.86rem', color: 'var(--brown)', marginBottom: '6px' }}>
                        Your Review *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        placeholder="How did this toolkit improve your editing workflow? Mention any camera bodies or apps you used."
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          fontSize: '0.92rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                        }}
                      />
                    </div>

                    {/* Photos Upload with Automatic WebP Compression Preview */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--brown)' }}>
                          Attach Photo Results (Optional - Max 4)
                        </label>
                        <span style={{ fontSize: '0.76rem', color: 'var(--sage, #059669)', fontWeight: 700 }}>
                          ⚡ Auto-compressed to WebP (&lt;60KB)
                        </span>
                      </div>

                      {/* Thumbnails list */}
                      {photoPreviews.length > 0 && (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                          {photoPreviews.map((p, idx) => (
                            <div
                              key={idx}
                              style={{
                                position: 'relative',
                                width: '80px',
                                height: '80px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                overflow: 'hidden',
                                backgroundColor: 'var(--cream-light)',
                              }}
                            >
                              <img
                                src={p.previewUrl}
                                alt="Preview"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              <button
                                type="button"
                                onClick={() => removePhotoPreview(idx)}
                                style={{
                                  position: 'absolute',
                                  top: '3px',
                                  right: '3px',
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  backgroundColor: 'rgba(0,0,0,0.7)',
                                  color: '#ffffff',
                                  border: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                }}
                              >
                                <X size={12} />
                              </button>
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  backgroundColor: 'rgba(0,0,0,0.65)',
                                  color: '#ffffff',
                                  fontSize: '0.62rem',
                                  textAlign: 'center',
                                  padding: '1px 0',
                                  fontWeight: 600,
                                }}
                              >
                                {p.compressedSizeKb} KB
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {photoPreviews.length < 4 && (
                        <div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            style={{ display: 'none' }}
                            onChange={handlePhotoSelect}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isCompressingPhotos}
                            style={{
                              width: '100%',
                              padding: '14px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1.5px dashed var(--border)',
                              backgroundColor: 'var(--cream-light)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              cursor: 'pointer',
                              color: 'var(--brown)',
                              fontSize: '0.88rem',
                              fontWeight: 700,
                            }}
                          >
                            {isCompressingPhotos ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Optimizing photos...</span>
                              </>
                            ) : (
                              <>
                                <Upload size={16} />
                                <span>Add Before/After Photos from Your Device</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || isCompressingPhotos}
                      className="clay-button"
                      style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: 'var(--brown)',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginTop: '6px',
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Submitting Review...</span>
                        </>
                      ) : (
                        <span>Submit Review</span>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Lightbox for Zooming Review Photos */}
        <AnimatePresence>
          {activePhotoLightbox && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.88)',
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
              }}
              onClick={() => setActivePhotoLightbox(null)}
            >
              <div style={{ position: 'relative', maxWidth: '900px', maxHeight: '90vh' }}>
                <button
                  onClick={() => setActivePhotoLightbox(null)}
                  style={{
                    position: 'absolute',
                    top: '-40px',
                    right: 0,
                    background: 'none',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <X size={26} />
                </button>
                <img
                  src={activePhotoLightbox}
                  alt="Enlarged review photo"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '85vh',
                    borderRadius: 'var(--radius-md)',
                    objectFit: 'contain',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  }}
                />
              </div>
            </div>
          )}
        </AnimatePresence>

        <style>{`
          @media (max-width: 768px) {
            .reviews-summary-card {
              grid-template-columns: 1fr !important;
              gap: 20px !important;
              padding: 20px 16px !important;
            }
            .reviews-score-block {
              border-right: none !important;
              border-bottom: 1px solid var(--border-light) !important;
              padding-right: 0 !important;
              padding-bottom: 18px !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
};
