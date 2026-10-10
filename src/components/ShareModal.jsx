import React, { useState, useEffect } from 'react';
import { X, Copy, Check, MessageSquare, Share2, ExternalLink } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import { formatPriceDisplay, getLocalizedProduct } from '../data/initialProducts';

export default function ShareModal({
  isOpen,
  onClose,
  product,
  lang = 'id',
  onCopySuccess
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCopied(false);
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;
  const localizedProd = getLocalizedProduct(product, lang);
  const formattedPrice = formatPriceDisplay(localizedProd.price, lang);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const shareUrl = `${origin}${pathname}?product=${product.id}`;

  const textID = `Lihat produk cetak 3D berkualitas dari Equa3D:
*${localizedProd.title}*
- Bahan: ${localizedProd.material}
- Estimasi Harga: ${formattedPrice}

Cek detail foto & spesifikasinya di sini:
${shareUrl}`;

  const textEN = `Check out this quality 3D printed product from Equa3D:
*${localizedProd.title}*
- Material: ${localizedProd.material}
- Estimated Price: ${formattedPrice}

View photos & technical specifications here:
${shareUrl}`;

  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(lang === 'en' ? textEN : textID)}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        if (onCopySuccess) onCopySuccess(t.linkCopied);
        setTimeout(() => setCopied(false), 2500);
      }).catch(() => {
        fallbackCopy();
      });
    } else {
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    const input = document.getElementById('share-link-input');
    if (input) {
      input.select();
      document.execCommand('copy');
      setCopied(true);
      if (onCopySuccess) onCopySuccess(t.linkCopied);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: localizedProd.title,
          text: lang === 'en' ? textEN : textID,
          url: shareUrl
        });
      } catch (err) {
        // User cancelled or share failed
      }
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '24px',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            background: '#eff6ff',
            color: '#2563eb',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Share2 size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {t.shareProduct || 'Bagikan Produk'}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {t.shareDescription || 'Bagikan link produk 3D ini ke teman, keluarga, atau klien Anda.'}
            </p>
          </div>
        </div>

        {/* Product Mini Preview Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-light)',
          borderRadius: '10px',
          padding: '10px 12px',
          marginBottom: '18px'
        }}>
          <img
            src={localizedProd.image}
            alt={localizedProd.title}
            style={{
              width: '54px',
              height: '54px',
              objectFit: 'cover',
              borderRadius: '8px',
              background: '#000000',
              flexShrink: 0
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80';
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {localizedProd.title}
            </h4>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Material: <strong>{localizedProd.material}</strong> • {formattedPrice}
            </div>
          </div>
        </div>

        {/* Copy Link Input Bar */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Link Produk:
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              id="share-link-input"
              type="text"
              readOnly
              value={shareUrl}
              className="input-custom"
              style={{ fontSize: '0.82rem', padding: '8px 10px', color: 'var(--text-secondary)' }}
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="btn-primary"
              style={{
                padding: '8px 14px',
                fontSize: '0.82rem',
                flexShrink: 0,
                background: copied ? '#16a34a' : '#2563eb'
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? (t.copied || 'Tersalin!') : (t.copyLink || 'Salin Link')}</span>
            </button>
          </div>
        </div>

        {/* Share Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Share to WhatsApp */}
          <a
            href={waShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-wa"
            style={{
              padding: '10px 14px',
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textDecoration: 'none'
            }}
          >
            <MessageSquare size={17} />
            <span>{t.shareToWa || 'Bagikan ke WhatsApp'}</span>
            <ExternalLink size={14} style={{ opacity: 0.8 }} />
          </a>

          {/* Native Web Share API if supported */}
          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="btn-secondary"
              style={{
                padding: '10px 14px',
                fontSize: '0.86rem',
                justifyContent: 'center'
              }}
            >
              <Share2 size={16} />
              <span>{t.shareNative || 'Bagikan via Aplikasi Lain'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
