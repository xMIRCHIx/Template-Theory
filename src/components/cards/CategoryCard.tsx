import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CategoryInfo } from '../../types';

interface CategoryCardProps {
  category: CategoryInfo;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <motion.div
      whileHover={{ y: -7, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      style={{ height: '100%' }}
    >
      <Link
        to={`/collections/${category.slug}`}
        style={{
          textDecoration: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '26px 20px',
          backgroundColor: 'var(--cream-light)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-clay)',
          transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="category-card-interactive"
      >
        {/* Subtle Ambient Background Glow on Hover */}
        <div
          className="cat-bg-glow"
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            width: '120px',
            height: '120px',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(201, 130, 103, 0.2) 0%, transparent 70%)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
          }}
        />

        {/* 3D Clay Icon Container */}
        <motion.div
          style={{
            width: '105px',
            height: '105px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            position: 'relative',
          }}
          className="cat-icon-wrap"
        >
          <img
            src={category.iconImage}
            alt={category.title}
            loading="lazy"
            decoding="async"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 14px 22px rgba(96, 68, 46, 0.18))',
              transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), filter 0.35s ease',
            }}
            className="cat-3d-img"
          />
        </motion.div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--brown)',
            marginBottom: '4px',
            transition: 'color 0.2s ease',
          }}
          className="cat-title"
        >
          {category.title}
        </h3>

        {/* Subtitle / Description */}
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--muted)',
            lineHeight: 1.4,
          }}
        >
          {category.subtitle}
        </p>

        <style>{`
          .category-card-interactive:hover {
            box-shadow: 0 16px 36px rgba(96, 68, 46, 0.14), 0 0 0 1px rgba(201, 130, 103, 0.5) !important;
            border-color: rgba(201, 130, 103, 0.5) !important;
          }
          .category-card-interactive:hover .cat-bg-glow {
            opacity: 1;
          }
          .category-card-interactive:hover .cat-3d-img {
            transform: scale(1.14) rotate(-3deg) translateY(-4px);
            filter: drop-shadow(0 20px 28px rgba(201, 130, 103, 0.32));
          }
          .category-card-interactive:hover .cat-title {
            color: var(--terracotta-dark);
          }
        `}</style>
      </Link>
    </motion.div>
  );
};
