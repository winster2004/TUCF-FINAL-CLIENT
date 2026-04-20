import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md';
  className?: string;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', className = '' }) => {
  const isSmall = size === 'sm';

  return (
    <span className={`brand-logo ${isSmall ? 'brand-logo-sm' : 'brand-logo-md'} ${className}`.trim()}>
      <span className="brand-logo-wordmark" aria-label="TUCF">
        <span className="brand-logo-letter brand-logo-letter-cool">T</span>
        <span className="brand-logo-letter brand-logo-letter-cool">U</span>
        <span className="brand-logo-letter brand-logo-letter-warm">C</span>
        <span className="brand-logo-letter brand-logo-letter-warm">F</span>
      </span>
      <span className="brand-logo-tagline">Take Your Career Forward</span>
    </span>
  );
};

export default BrandLogo;
