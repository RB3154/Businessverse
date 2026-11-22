import { useState } from 'react';
import { branding } from '../../config/branding.config';

interface Props {
  /** Rendered logo height in stage pixels. */
  height: number;
  className?: string;
}

/**
 * The official IMS logo, unaltered. Because it is dark ink on white, it sits
 * on a white plate whose padding preserves clear space around the mark.
 * If the file is missing, a clearly marked placeholder is shown instead.
 */
export function IMSLogo({ height, className = '' }: Props) {
  const [failed, setFailed] = useState(false);
  const pad = Math.round(height * 0.28);

  if (failed || branding.logo.isPlaceholder) {
    return (
      <span className={`logo-placeholder ${className}`} style={{ height: height + pad * 2, padding: `0 ${pad}px` }}>
        IMS LOGO — REPLACE public/assets/branding/ims-logo.svg
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{ background: branding.logo.plateColor, padding: pad, borderRadius: Math.round(height * 0.22) }}
    >
      <img
        src={branding.logo.src}
        alt={branding.logo.alt}
        draggable={false}
        // flexShrink 0: the plate is a flex box and must never squeeze the logo's proportions.
        style={{ height, width: Math.round(height * branding.logo.aspectRatio), display: 'block', flexShrink: 0 }}
        onError={() => {
          console.error(`[Businessverse] IMS logo failed to load from ${branding.logo.src}`);
          setFailed(true);
        }}
      />
    </span>
  );
}
