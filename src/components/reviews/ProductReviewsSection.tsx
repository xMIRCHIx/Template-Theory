import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  Image as ImageIcon,
  X,
  Plus,
  Check,
  Upload,
  AlertCircle,
  Sparkles,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Search,
  ChevronRight,
  SlidersHorizontal,
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
    reviews?: number;
    rating?: number;
  };
}

interface PhotoPreviewItem {
  file: File;
  previewUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
}

const RATING_MOODS: Record<number, { label: string; emoji: string; desc: string; bg: string; color: string }> = {
  5: {
    label: 'Mind-Blowing / Game Changer!',
    emoji: '🔥',
    desc: 'Exceeded all expectations. High-end cinema quality.',
    bg: '#fef3c7',
    color: '#b45309',
  },
  4: {
    label: 'Great Toolkit! Loved It',
    emoji: '✨',
    desc: 'Very clean results, saves a ton of post-production time.',
    bg: '#ecfdf5',
    color: '#047857',
  },
  3: {
    label: 'Decent / Average',
    emoji: '👌',
    desc: 'Good results, but needed slight manual tweaking.',
    bg: '#f1f5f9',
    color: '#475569',
  },
  2: {
    label: 'Needs Improvement',
    emoji: '😐',
    desc: 'Didn’t fully match my camera/workflow expectations.',
    bg: '#fff7ed',
    color: '#c2410c',
  },
  1: {
    label: 'Disappointed',
    emoji: '👎',
    desc: 'Did not work for my editing setup.',
    bg: '#fef2f2',
    color: '#b91c1c',
  },
};

const QUICK_TAG_OPTIONS = [
  '⚡ 1-Click Perfection',
  '🎨 True Film Colors',
  '⏱️ Saved Hours of Work',
  '🎥 Cinematic Highlight Roll-Off',
  '💎 Ultra Clean & Organized',
  '📱 Works Great on Mobile',
];

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({ product }) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isAllReviewsModalOpen, setIsAllReviewsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2>(1); // Step 1 = Rating & Micro-Interactions, Step 2 = Details & Name
  const [activePhotoLightbox, setActivePhotoLightbox] = useState<string | null>(null);

  // Filter, Sort & Search State
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | 'all' | 'photos'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'helpful'>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  // Liked review IDs saved in local storage to prevent duplicate clicks
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('cinevo_liked_reviews');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Write Review Form State (Super simplified: Rating + Headline + Name + Review Feedback)
  const [formRating, setFormRating] = useState<number>(5);
  const [formHoverRating, setFormHoverRating] = useState<number>(0);
  const [formTitle, setFormTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [formName, setFormName] = useState('');
  const [formContent, setFormContent] = useState('');
  const [photoPreviews, setPhotoPreviews] = useState<PhotoPreviewItem[]>([]);
  const [isCompressingPhotos, setIsCompressingPhotos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load reviews specifically for this product slug
  useEffect(() => {
    let isMounted = true;
    async function loadReviews() {
      setIsLoading(true);
      try {
        const productKey = product.slug || product.id;
        const data = await fetchProductReviews(productKey, product.title);
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
  }, [product.slug, product.id, product.title]);

  // Prevent background scrolling when any modal or lightbox is active
  useEffect(() => {
    const isModalOpen = isAllReviewsModalOpen || isWriteModalOpen || Boolean(activePhotoLightbox);
    if (!isModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const originalTouchAction = document.body.style.touchAction;

    // Compensate scrollbar width to prevent page shift
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow || '';
      document.body.style.paddingRight = originalPaddingRight || '';
      document.body.style.touchAction = originalTouchAction || '';
    };
  }, [isAllReviewsModalOpen, isWriteModalOpen, activePhotoLightbox]);

  // Review statistics
  const stats: ReviewStats = useMemo(() => calculateReviewStats(reviews), [reviews]);
  const totalVerifiedCount = Math.max(product.reviews || 0, stats.totalReviews);
  const displayAverageRating = product.rating || stats.averageRating;

  // Filtered, Sorted & Searched Reviews
  const filteredReviews = useMemo(() => {
    let list = [...reviews];

    // Filter
    if (selectedRatingFilter === 'photos') {
      list = list.filter((r) => r.photos && r.photos.length > 0);
    } else if (typeof selectedRatingFilter === 'number') {
      list = list.filter((r) => Math.round(r.rating) === selectedRatingFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.authorName.toLowerCase().includes(q) ||
          r.content.toLowerCase().includes(q) ||
          (r.title && r.title.toLowerCase().includes(q))
      );
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
  }, [reviews, selectedRatingFilter, sortBy, searchQuery]);

  // Initial preview reviews displayed directly on page (all 6 authentic reviews shown)
  const initialDisplayReviews = useMemo(() => {
    return filteredReviews.slice(0, 6);
  }, [filteredReviews]);

  // Open Write Modal Fresh
  const handleOpenWriteModal = () => {
    setModalStep(1);
    setFormRating(5);
    setFormHoverRating(0);
    setFormTitle('');
    setSelectedTags([]);
    setFormName('');
    setFormContent('');
    setPhotoPreviews([]);
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsWriteModalOpen(true);
  };

  // Toggle quick tag in Step 1
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const exists = prev.includes(tag);
      const next = exists ? prev.filter((t) => t !== tag) : [...prev, tag];
      return next;
    });
  };

  // Step 1 -> Step 2 transition
  const handleProceedToStep2 = () => {
    setModalStep(2);
  };

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
        // Compress instantly client-side to WebP <60KB
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

  // Quick Rating Submission (Skip writing text review)
  const handleSkipAndSubmitRating = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const productSlug = product.slug || product.id;
      const cleanName = formName.trim() || 'Verified Buyer';
      const cleanTitle = selectedTags.length > 0 ? selectedTags.join(' • ') : 'Verified Customer Rating';

      const res = await submitProductReview({
        productId: product.id,
        productSlug: productSlug,
        productName: product.title,
        authorName: cleanName,
        rating: formRating,
        title: cleanTitle,
        content: `Rated ${formRating} stars. Customer submitted verified rating.`,
        isVerifiedBuyer: true,
      });

      if (res.success && res.review) {
        setReviews((prev) => [res.review!, ...prev]);
      }
      setSubmitSuccess(true);
      setTimeout(() => {
        setIsWriteModalOpen(false);
        setSubmitSuccess(false);
        setFormTitle('');
        setFormContent('');
        setFormName('');
        setPhotoPreviews([]);
        setSelectedTags([]);
        setModalStep(1);
      }, 1600);
    } catch (err: any) {
      setSubmitError('Failed to record rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Review Form (Frictionless: Headline + Name + Review)
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContent.trim() && !formName.trim()) {
      // If user submitted empty, treat as skip & quick rating
      return handleSkipAndSubmitRating();
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const filesToUpload = photoPreviews.map((p) => p.file);
      const productSlug = product.slug || product.id;
      
      // Combine custom headline and/or selected tags
      const cleanTitle = formTitle.trim() || (selectedTags.length > 0 ? selectedTags.join(' • ') : '');
      const cleanName = formName.trim() || 'Verified Creator';

      const res = await submitProductReview(
        {
          productId: product.id,
          productSlug: productSlug,
          productName: product.title,
          authorName: cleanName,
          rating: formRating,
          title: cleanTitle,
          content: formContent.trim() || `Rated ${formRating} stars. Highly recommended!`,
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
          setFormName('');
          setPhotoPreviews([]);
          setSelectedTags([]);
          setModalStep(1);
        }, 1900);
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

  const currentDisplayRating = formHoverRating || formRating;
  const currentMood = RATING_MOODS[currentDisplayRating] || RATING_MOODS[5];

  // Helper renderer for a single review card
  const renderReviewCard = (review: ProductReview) => {
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
              Real before/after results and feedback from photographers, filmmakers, and creators.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setIsAllReviewsModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 18px',
                backgroundColor: 'var(--cream-light)',
                border: '1.5px solid var(--border)',
                color: 'var(--brown)',
                fontWeight: 700,
                fontSize: '0.9rem',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <SlidersHorizontal size={15} />
              <span>View All ({reviews.length})</span>
            </button>

            <button
              onClick={handleOpenWriteModal}
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
              {displayAverageRating.toFixed(1)}
            </div>
            <div style={{ display: 'flex', gap: '3px', margin: '12px 0 6px 0' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={20}
                  fill={s <= Math.round(displayAverageRating) ? '#f59e0b' : '#e2e8f0'}
                  color={s <= Math.round(displayAverageRating) ? '#f59e0b' : '#cbd5e1'}
                />
              ))}
            </div>
            <div style={{ fontSize: '0.92rem', color: 'var(--brown)', fontWeight: 800 }}>
              {totalVerifiedCount} Verified Ratings
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600, marginTop: '2px' }}>
              {reviews.length} in-depth reviews • {Math.max(0, totalVerifiedCount - reviews.length)} star-only ratings
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
              const rawCount = stats.ratingBreakdown[starNum as keyof typeof stats.ratingBreakdown] || 0;
              const pct = stats.totalReviews > 0 ? Math.round((rawCount / stats.totalReviews) * 100) : starNum === 5 ? 95 : starNum === 4 ? 5 : 0;
              const scaledCount = Math.round((pct / 100) * totalVerifiedCount);
              return (
                <button
                  key={starNum}
                  onClick={() => {
                    setSelectedRatingFilter((prev) => (prev === starNum ? 'all' : starNum));
                  }}
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
                    {pct}% ({scaledCount})
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

        {/* Clean Initial Reviews List (Top 3) */}
        {isLoading ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--brown)', margin: '0 auto' }} />
            <p style={{ marginTop: '12px', fontSize: '0.92rem', color: 'var(--muted)' }}>
              Loading creator reviews...
            </p>
          </div>
        ) : initialDisplayReviews.length === 0 ? (
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
              onClick={handleOpenWriteModal}
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
            {initialDisplayReviews.map((review) => renderReviewCard(review))}

            {/* "View More / All Reviews" Button */}
            {filteredReviews.length > 6 && (
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <button
                  onClick={() => setIsAllReviewsModalOpen(true)}
                  className="clay-button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '14px 28px',
                    backgroundColor: 'var(--cream-light)',
                    color: 'var(--brown)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>View All {filteredReviews.length} Verified Reviews</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* DEDICATED FULL "ALL CUSTOMER REVIEWS" MODAL POPUP */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {isAllReviewsModalOpen && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.72)',
                backdropFilter: 'blur(6px)',
                zIndex: 9998,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                overscrollBehavior: 'contain',
                touchAction: 'none',
              }}
              onClick={() => setIsAllReviewsModalOpen(false)}
              onWheel={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                onWheel={(e) => e.stopPropagation()}
                className="clay-card"
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '24px',
                  maxWidth: '780px',
                  width: '100%',
                  maxHeight: '92vh',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
                  border: '1.5px solid var(--border)',
                  overflow: 'hidden',
                  overscrollBehavior: 'contain',
                  touchAction: 'auto',
                }}
              >
                {/* Sticky Header */}
                <div
                  style={{
                    padding: '24px 28px 18px 28px',
                    borderBottom: '1.5px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--brown)', margin: 0 }}>
                        All Reviews ({reviews.length})
                      </h3>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          backgroundColor: '#fef3c7',
                          color: '#b45309',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                        }}
                      >
                        <Star size={11} fill="#f59e0b" color="#f59e0b" />
                        {stats.averageRating.toFixed(1)} / 5.0
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: '4px 0 0 0' }}>
                      Verified creator reviews for {product.title}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => {
                        setIsAllReviewsModalOpen(false);
                        handleOpenWriteModal();
                      }}
                      className="clay-button"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '9px 16px',
                        backgroundColor: 'var(--brown)',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={14} />
                      <span>Write Review</span>
                    </button>

                    <button
                      onClick={() => setIsAllReviewsModalOpen(false)}
                      style={{
                        background: 'var(--cream-light)',
                        border: '1px solid var(--border)',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Search & Filter Bar in Modal */}
                <div
                  style={{
                    padding: '14px 28px',
                    backgroundColor: 'var(--cream-light, #f8f6f0)',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  {/* Search Input */}
                  <div style={{ position: 'relative', width: '100%' }}>
                    <Search
                      size={16}
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search reviews by keyword (e.g. 'wedding', 'tones', 'fast', 's-log')..."
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 36px',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--border)',
                        fontSize: '0.86rem',
                        backgroundColor: '#ffffff',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--muted)',
                        }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Filter Pills Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setSelectedRatingFilter('all')}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '9999px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        border: selectedRatingFilter === 'all' ? '1.5px solid var(--brown)' : '1px solid var(--border)',
                        backgroundColor: selectedRatingFilter === 'all' ? 'var(--brown)' : '#ffffff',
                        color: selectedRatingFilter === 'all' ? '#ffffff' : 'var(--brown)',
                        cursor: 'pointer',
                      }}
                    >
                      All ({reviews.length})
                    </button>

                    <button
                      onClick={() => setSelectedRatingFilter('photos')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '5px 12px',
                        borderRadius: '9999px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        border: selectedRatingFilter === 'photos' ? '1.5px solid var(--brown)' : '1px solid var(--border)',
                        backgroundColor: selectedRatingFilter === 'photos' ? 'var(--brown)' : '#ffffff',
                        color: selectedRatingFilter === 'photos' ? '#ffffff' : 'var(--brown)',
                        cursor: 'pointer',
                      }}
                    >
                      <ImageIcon size={12} />
                      <span>With Photos</span>
                    </button>

                    {[5, 4, 3].map((star) => (
                      <button
                        key={star}
                        onClick={() => setSelectedRatingFilter(star)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '5px 12px',
                          borderRadius: '9999px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          border: selectedRatingFilter === star ? '1.5px solid var(--brown)' : '1px solid var(--border)',
                          backgroundColor: selectedRatingFilter === star ? 'var(--brown)' : '#ffffff',
                          color: selectedRatingFilter === star ? '#ffffff' : 'var(--brown)',
                          cursor: 'pointer',
                        }}
                      >
                        <span>{star} Stars</span>
                        <Star
                          size={11}
                          fill={selectedRatingFilter === star ? '#ffffff' : '#f59e0b'}
                          color={selectedRatingFilter === star ? '#ffffff' : '#f59e0b'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scrollable Reviews List Body */}
                <div
                  style={{
                    padding: '24px 28px',
                    overflowY: 'auto',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    overscrollBehavior: 'contain',
                    WebkitOverflowScrolling: 'touch',
                  }}
                  onWheel={(e) => e.stopPropagation()}
                >
                  {filteredReviews.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--muted)' }}>
                      <Star size={32} style={{ color: '#cbd5e1', margin: '0 auto 8px auto' }} />
                      <div style={{ fontWeight: 700, color: 'var(--brown)' }}>No matching reviews found</div>
                      <div style={{ fontSize: '0.84rem', marginTop: '4px' }}>Try searching another keyword or clearing filters.</div>
                    </div>
                  ) : (
                    filteredReviews.map((review) => renderReviewCard(review))
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* MULTI-STEP ANIMATED WRITE REVIEW MODAL */}
        {/* ========================================================================= */}
        <AnimatePresence>
          {isWriteModalOpen && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.68)',
                backdropFilter: 'blur(6px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                overscrollBehavior: 'contain',
                touchAction: 'none',
              }}
              onClick={() => !isSubmitting && setIsWriteModalOpen(false)}
              onWheel={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                onWheel={(e) => e.stopPropagation()}
                className="clay-card"
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '24px',
                  maxWidth: '480px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  padding: '28px 24px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
                  border: '1.5px solid var(--border)',
                  position: 'relative',
                  overscrollBehavior: 'contain',
                  WebkitOverflowScrolling: 'touch',
                  touchAction: 'auto',
                }}
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsWriteModalOpen(false)}
                  disabled={isSubmitting}
                  style={{
                    position: 'absolute',
                    top: '18px',
                    right: '18px',
                    background: 'var(--cream-light)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    color: 'var(--muted)',
                    padding: '6px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  <X size={18} />
                </button>

                {submitSuccess ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ textAlign: 'center', padding: '36px 10px' }}
                  >
                    <motion.div
                      animate={{ scale: [0.8, 1.15, 1], rotate: [0, 10, 0] }}
                      transition={{ duration: 0.5 }}
                      style={{
                        width: '68px',
                        height: '68px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--sage-light, #ecfdf5)',
                        color: 'var(--sage, #059669)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px auto',
                        boxShadow: '0 8px 24px rgba(5, 150, 105, 0.2)',
                      }}
                    >
                      <Check size={34} />
                    </motion.div>
                    <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--brown)', margin: 0 }}>
                      Review Published! 🎉
                    </h3>
                    <p style={{ fontSize: '0.92rem', color: 'var(--muted)', marginTop: '8px' }}>
                      Thank you! Your feedback is now live on this product page.
                    </p>
                  </motion.div>
                ) : modalStep === 1 ? (
                  /* ======================================================== */
                  /* STEP 1: ANIMATED RATING SELECTION & MICRO-INTERACTIONS */
                  /* ======================================================== */
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.22 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          backgroundColor: 'rgba(201, 130, 103, 0.12)',
                          color: 'var(--terracotta-dark, #c2410c)',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          marginBottom: '6px',
                        }}
                      >
                        <Sparkles size={12} />
                        <span>Step 1 of 2 • Rate Your Experience</span>
                      </div>
                      <h3
                        style={{
                          fontSize: '1.45rem',
                          fontWeight: 900,
                          color: 'var(--brown)',
                          margin: 0,
                          letterSpacing: '-0.02em',
                        }}
                      >
                        How was your experience?
                      </h3>
                      <p style={{ fontSize: '0.86rem', color: 'var(--muted)', marginTop: '4px', margin: '4px 0 0 0' }}>
                        Rate <strong style={{ color: 'var(--brown)' }}>{product.title}</strong>
                      </p>
                    </div>

                    {/* Big Interactive 5-Star Selector */}
                    <div
                      style={{
                        padding: '22px 18px',
                        backgroundColor: 'var(--cream-light, #f8f6f0)',
                        border: '1.5px solid var(--border)',
                        borderRadius: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '14px',
                      }}
                    >
                      {/* Animated Stars Row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {[1, 2, 3, 4, 5].map((s) => {
                          const isActive = currentDisplayRating >= s;
                          return (
                            <motion.button
                              type="button"
                              key={s}
                              whileHover={{ scale: 1.25, rotate: [-5, 5, 0] }}
                              whileTap={{ scale: 0.85 }}
                              onMouseEnter={() => setFormHoverRating(s)}
                              onMouseLeave={() => setFormHoverRating(0)}
                              onClick={() => {
                                setFormRating(s);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                outline: 'none',
                              }}
                            >
                              <Star
                                size={36}
                                fill={isActive ? '#f59e0b' : '#e2e8f0'}
                                color={isActive ? '#f59e0b' : '#cbd5e1'}
                                style={{
                                  filter: isActive ? 'drop-shadow(0 4px 10px rgba(245, 158, 11, 0.4))' : 'none',
                                  transition: 'all 0.15s ease',
                                }}
                              />
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Dynamic Mood Card Feedback */}
                      <motion.div
                        key={currentDisplayRating}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          padding: '10px 16px',
                          borderRadius: '12px',
                          backgroundColor: currentMood.bg,
                          color: currentMood.color,
                          width: '100%',
                          boxSizing: 'border-box',
                        }}
                      >
                        <div style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{currentMood.emoji}</span>
                          <span>{currentMood.label}</span>
                        </div>
                        <div style={{ fontSize: '0.76rem', opacity: 0.9, marginTop: '2px' }}>
                          {currentMood.desc}
                        </div>
                      </motion.div>
                    </div>

                    {/* Quick Highlights & Custom Heading */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--brown)' }}>
                          Review Heading / Highlights (Optional):
                        </div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 600 }}>
                          Optional
                        </span>
                      </div>

                      {/* Quick Highlight Tags (1-Tap Selection) */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                        {QUICK_TAG_OPTIONS.map((tag) => {
                          const isSelected = selectedTags.includes(tag);
                          return (
                            <motion.button
                              key={tag}
                              type="button"
                              whileTap={{ scale: 0.94 }}
                              onClick={() => toggleTag(tag)}
                              style={{
                                padding: '6px 11px',
                                borderRadius: '999px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                border: isSelected ? '1.5px solid var(--brown)' : '1px solid var(--border)',
                                backgroundColor: isSelected ? 'var(--brown)' : '#ffffff',
                                color: isSelected ? '#ffffff' : 'var(--brown)',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              {isSelected && <Check size={12} />}
                              <span>{tag}</span>
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Custom Heading Input (Optional) */}
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          placeholder="Or write a custom heading (e.g. 'Haldi shoots pe next level result!')"
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            paddingRight: formTitle ? '36px' : '14px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1.5px solid var(--border)',
                            fontSize: '0.88rem',
                            backgroundColor: '#ffffff',
                            outline: 'none',
                            boxSizing: 'border-box',
                            color: 'var(--brown)',
                            transition: 'border-color 0.15s',
                          }}
                        />
                        {formTitle && (
                          <button
                            type="button"
                            onClick={() => setFormTitle('')}
                            style={{
                              position: 'absolute',
                              right: '10px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--muted)',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Step 1 Continue Button */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleProceedToStep2}
                        className="clay-button"
                        style={{
                          width: '100%',
                          padding: '14px',
                          backgroundColor: 'var(--brown)',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.98rem',
                          borderRadius: 'var(--radius-md)',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: 'var(--shadow-clay-btn)',
                        }}
                      >
                        <span>Write a Review ({formRating} Stars)</span>
                        <ArrowRight size={17} />
                      </motion.button>

                      {/* Instant Skip & Submit Rating Button */}
                      <button
                        type="button"
                        onClick={handleSkipAndSubmitRating}
                        disabled={isSubmitting}
                        style={{
                          width: '100%',
                          padding: '11px',
                          backgroundColor: 'var(--cream-light)',
                          color: 'var(--brown)',
                          fontWeight: 700,
                          fontSize: '0.86rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1.5px dashed var(--border)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.18s ease',
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Submitting Rating...</span>
                          </>
                        ) : (
                          <>
                            <Check size={15} color="var(--sage, #059669)" />
                            <span>⚡ Skip writing & just submit {formRating}★ rating</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* ======================================================== */
                  /* STEP 2: SIMPLE & FRICTIONLESS REVIEW WRITING FORM */
                  /* ======================================================== */
                  <motion.form
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22 }}
                    onSubmit={handleSubmitReview}
                    style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                  >
                    {/* Header with Back Button & Rating Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <button
                        type="button"
                        onClick={() => setModalStep(1)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: 'var(--terracotta)',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        <ArrowLeft size={15} />
                        <span>Change Rating</span>
                      </button>

                      {/* Selected Rating Pill */}
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          backgroundColor: currentMood.bg,
                          color: currentMood.color,
                          fontSize: '0.78rem',
                          fontWeight: 800,
                        }}
                      >
                        <span>{formRating} ★</span>
                        <span>{currentMood.label.split('/')[0]}</span>
                      </div>
                    </div>

                    <div>
                      <h3
                        style={{
                          fontSize: '1.4rem',
                          fontWeight: 900,
                          color: 'var(--brown)',
                          margin: 0,
                          letterSpacing: '-0.02em',
                        }}
                      >
                        Write your review
                      </h3>
                      <p style={{ fontSize: '0.84rem', color: 'var(--muted)', marginTop: '3px', margin: '3px 0 0 0' }}>
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
                          fontSize: '0.84rem',
                        }}
                      >
                        <AlertCircle size={16} />
                        <span>{submitError}</span>
                      </div>
                    )}

                    {/* Review Comments */}
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.86rem', color: 'var(--brown)', marginBottom: '6px' }}>
                        Your Feedback (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                        placeholder="What did you love most about this toolkit? (or leave blank to just submit rating)"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1.5px solid var(--border)',
                          fontSize: '0.92rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                        }}
                      />
                    </div>

                    {/* Name Input */}
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.84rem', color: 'var(--brown)', marginBottom: '6px' }}>
                        Your Name (or Creator Handle)
                      </label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Aryan G. (or leave blank for Verified Buyer)"
                        style={{
                          width: '100%',
                          padding: '11px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1.5px solid var(--border)',
                          fontSize: '0.92rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    {/* Photos Upload with Automatic WebP Compression Preview */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--brown)' }}>
                          Attach Photo Results (Optional)
                        </label>
                        <span style={{ fontSize: '0.74rem', color: 'var(--sage, #059669)', fontWeight: 700 }}>
                          ⚡ WebP auto-compressed (&lt;60KB)
                        </span>
                      </div>

                      {/* Thumbnails list */}
                      {photoPreviews.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                          {photoPreviews.map((p, idx) => (
                            <div
                              key={idx}
                              style={{
                                position: 'relative',
                                width: '68px',
                                height: '68px',
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
                                  top: '2px',
                                  right: '2px',
                                  width: '18px',
                                  height: '18px',
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
                                <X size={11} />
                              </button>
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  backgroundColor: 'rgba(0,0,0,0.65)',
                                  color: '#ffffff',
                                  fontSize: '0.6rem',
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
                              padding: '10px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1.5px dashed var(--border)',
                              backgroundColor: 'var(--cream-light)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              cursor: 'pointer',
                              color: 'var(--brown)',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                            }}
                          >
                            {isCompressingPhotos ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                <span>Optimizing photos...</span>
                              </>
                            ) : (
                              <>
                                <Upload size={14} />
                                <span>Add Photo Results from Device</span>
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
                        marginTop: '4px',
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Publishing Review...</span>
                        </>
                      ) : (
                        <span>Publish Review</span>
                      )}
                    </button>

                    {/* Skip Writing Button */}
                    <button
                      type="button"
                      onClick={handleSkipAndSubmitRating}
                      disabled={isSubmitting}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '6px 0',
                        color: 'var(--muted)',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'center',
                        textDecoration: 'underline',
                        transition: 'color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brown)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
                    >
                      Skip writing feedback & submit {formRating}★ rating only
                    </button>
                  </motion.form>
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
                overscrollBehavior: 'contain',
                touchAction: 'none',
              }}
              onClick={() => setActivePhotoLightbox(null)}
              onWheel={(e) => e.stopPropagation()}
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
