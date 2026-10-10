import React, { useState, useEffect, useMemo } from 'react';
import { X, Layers, Clock, Box, ShieldCheck, MessageSquare, ChevronLeft, ChevronRight, Video, ZoomIn, Heart, ShoppingBag, Share2 } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import { getLocalizedProduct, formatPriceDisplay } from '../data/initialProducts';

export default function ProductDetailModal({ 
  product, 
  onClose, 
  lang = 'id', 
  isAdminLoggedIn = false,
  isFav = false,
  onToggleFav,
  onAddToCart,
  onShare
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;
  const localizedProd = getLocalizedProduct(product || {}, lang);
  const colorOpts = Array.isArray(localizedProd?.colorOptions) ? localizedProd.colorOptions : [];

  const [selectedColor, setSelectedColor] = useState(colorOpts[0] || '');
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Sync selectedColor when product changes
  useEffect(() => {
    if (colorOpts.length > 0) {
      setSelectedColor(colorOpts[0]);
    } else {
      setSelectedColor('');
    }
    setActiveImgIdx(0);
  }, [product?.id]);

  // Extract images array (fallback to single image or default placeholder)
  const imageList = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(localizedProd.images) && localizedProd.images.length > 0) {
      return localizedProd.images;
    }
    if (localizedProd.image) {
      return [localizedProd.image];
    }
    return ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'];
  }, [localizedProd?.images, localizedProd?.image, product]);

  const isVideoUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    return url.startsWith('data:video/') || url.match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i) || url.includes('/videos/');
  };

  // Keyboard shortcuts (ESC to close fullscreen, Arrow Left/Right to navigate photos)
  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isZoomed) {
        setIsZoomed(false);
      } else if (e.key === 'ArrowRight' && imageList.length > 1) {
        e.preventDefault();
        setActiveImgIdx((prev) => (prev + 1) % imageList.length);
      } else if (e.key === 'ArrowLeft' && imageList.length > 1) {
        e.preventDefault();
        setActiveImgIdx((prev) => (prev - 1 + imageList.length) % imageList.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed, imageList.length, product]);

  if (!product) return null;

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setActiveImgIdx((prev) => (prev + 1) % imageList.length);
  };

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setActiveImgIdx((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const formattedPrice = formatPriceDisplay(localizedProd.price, lang);

  const waMessage = encodeURIComponent(
    lang === 'en'
      ? `Hello Equa3D, I am interested in ordering catalog item:\n*${localizedProd.title}*\n- Material: ${localizedProd.material}\n- Infill: ${localizedProd.infill}\n- Resolution: ${localizedProd.resolution}\n- Dimensions: ${localizedProd.dimensions}\n- Color: ${selectedColor || 'Default'}\n- Price: ${formattedPrice}\nIs this ready to print? Thank you!`
      : `Halo Equa3D, saya berminat dengan katalog item:\n*${localizedProd.title}*\n- Bahan: ${localizedProd.material}\n- Infill: ${localizedProd.infill}\n- Resolusi: ${localizedProd.resolution}\n- Dimensi: ${localizedProd.dimensions}\n- Warna: ${selectedColor || 'Default'}\n- Harga: ${formattedPrice}\nApakah stok item ini ready / butuh berapa hari PO? Terima kasih!`
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '880px',
          padding: '0',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Close, Share & Favorite Top Buttons */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 20, display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!isAdminLoggedIn && (
            <>
              {/* Share Button */}
              <button
                type="button"
                onClick={() => onShare && onShare(product)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  transition: 'all 0.15s ease'
                }}
                title={lang === 'en' ? "Share Product" : "Bagikan Produk"}
              >
                <Share2 size={16} />
              </button>

              {/* Favorite Button */}
              <button
                type="button"
                onClick={() => onToggleFav && onToggleFav(product.id, localizedProd.title)}
                style={{
                  background: isFav ? '#fef2f2' : '#ffffff',
                  border: isFav ? '1px solid #fecaca' : '1px solid #cbd5e1',
                  color: isFav ? '#dc2626' : '#0f172a',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
                title={isFav ? (lang === 'en' ? "Remove from Favorites" : "Hapus dari Favorit") : (lang === 'en' ? "Add to Favorites" : "Tambah ke Favorit")}
              >
                <Heart 
                  size={17} 
                  className={isFav ? "heart-pop" : ""}
                  fill={isFav ? '#dc2626' : 'none'} 
                  color={isFav ? '#dc2626' : '#0f172a'} 
                />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          alignItems: 'stretch'
        }}>
          {/* Product Image Section with Multi-Image Slider */}
          <div style={{
            background: '#f8fafc',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: '1px solid #f1f5f9',
            position: 'relative'
          }}>
            {/* Main Active Image Display with Fullscreen Click */}
            <div 
              onClick={() => setIsZoomed(true)}
              style={{
                width: '100%',
                height: '340px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: 'zoom-in'
              }}
              title="Klik untuk perbesar / Layar Penuh (Fullscreen)"
            >
              {isVideoUrl(imageList[activeImgIdx] || imageList[0]) ? (
                <video
                  src={imageList[activeImgIdx] || imageList[0]}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    maxWidth: '100%',
                    maxHeight: '340px',
                    borderRadius: '8px',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <img 
                  src={imageList[activeImgIdx] || imageList[0]} 
                  alt={`${localizedProd.title} - Media ${activeImgIdx + 1}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '340px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    transition: 'opacity 0.2s ease'
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80';
                  }}
                />
              )}

              {/* Zoom / Fullscreen Badge Hint */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsZoomed(true); }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(15, 23, 42, 0.75)',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backdropFilter: 'blur(4px)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }}
              >
                <ZoomIn size={13} /> Fullscreen
              </button>

              {/* Multi-Image Overlay Controls if > 1 image */}
              {imageList.length > 1 && (
                <>
                  {/* Photo Counter Pill */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    backdropFilter: 'blur(4px)'
                  }}>
                    {activeImgIdx + 1} / {imageList.length}
                  </div>

                  {/* Previous Arrow */}
                  <button
                    onClick={handlePrev}
                    style={{
                      position: 'absolute',
                      left: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transition: 'transform 0.15s ease'
                    }}
                    title="Foto Sebelumnya"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {/* Next Arrow */}
                  <button
                    onClick={handleNext}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transition: 'transform 0.15s ease'
                    }}
                    title="Foto Selanjutnya"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip Gallery (Horizontal) */}
            {imageList.length > 1 && (
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '16px',
                maxWidth: '100%',
                overflowX: 'auto',
                padding: '4px'
              }}>
                {imageList.map((mediaUrl, idx) => {
                  const isVid = isVideoUrl(mediaUrl);
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveImgIdx(idx)}
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        border: activeImgIdx === idx ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        opacity: activeImgIdx === idx ? 1 : 0.65,
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                        background: '#000000',
                        position: 'relative'
                      }}
                    >
                      {isVid ? (
                        <video src={mediaUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted preload="metadata" />
                      ) : (
                        <img 
                          src={mediaUrl} 
                          alt={`Thumbnail ${idx + 1}`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      )}
                      {isVid && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Video size={14} color="#ffffff" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{
                background: '#eff6ff',
                color: '#2563eb',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                {localizedProd.category}
              </span>
              <span style={{
                background: '#f1f5f9',
                color: '#475569',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                Material: {localizedProd.material}
              </span>
            </div>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px', lineHeight: 1.3 }}>
              {localizedProd.title}
            </h2>

            <p style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '20px' }}>
              {localizedProd.description}
            </p>

            {/* Technical Specifications Grid */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '14px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Layers size={13} color="#2563eb" /> {t.infillLabel}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                  {localizedProd.infill}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={13} color="#16a34a" /> {t.resolutionLabel}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                  {localizedProd.resolution}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} color="#b45309" /> {t.printTimeLabel}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                  {localizedProd.printTime} ({localizedProd.weightGrams}g)
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Box size={13} color="#64748b" /> {t.dimensionsLabel}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                  {localizedProd.dimensions}
                </div>
              </div>
            </div>

            {/* Interactive Color Options */}
            {colorOpts.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>
                  {t.colorOptionsLabel}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {colorOpts.map((clr, idx) => {
                    const isSelected = selectedColor === clr;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedColor(clr)}
                        style={{
                          background: isSelected ? '#eff6ff' : '#ffffff',
                          border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          color: isSelected ? '#2563eb' : '#334155',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {clr} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price & Action Button */}
            <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.estimatedPrice}</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                    {formattedPrice}
                  </div>
                </div>
              </div>

              {!isAdminLoggedIn && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => onAddToCart && onAddToCart(product, selectedColor)}
                    className="btn-primary"
                    style={{ padding: '12px', fontSize: '0.88rem', justifyContent: 'center', background: '#2563eb' }}
                  >
                    <ShoppingBag size={17} />
                    {t.addToCart || '+ Keranjang'}
                  </button>

                  <a
                    href={`https://wa.me/6282373119291?text=${waMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-wa"
                    style={{ padding: '12px', fontSize: '0.88rem', justifyContent: 'center' }}
                  >
                    <MessageSquare size={17} />
                    {t.orderWa}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Fullscreen Lightbox Modal Overlay */}
      {isZoomed && (
        <div 
          onClick={() => setIsZoomed(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            background: 'rgba(0, 0, 0, 0.94)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          {/* Top Control Bar */}
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '20px',
              left: '24px',
              right: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 100000
            }}
          >
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 700,
              backdropFilter: 'blur(4px)'
            }}>
              {activeImgIdx + 1} / {imageList.length} • {localizedProd.title}
            </div>

            <button
              onClick={() => setIsZoomed(false)}
              style={{
                background: '#ffffff',
                border: 'none',
                color: '#0f172a',
                padding: '8px 18px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
              }}
            >
              <X size={18} />
              Tutup / Exit (ESC)
            </button>
          </div>

          {/* Previous Arrow in Fullscreen */}
          {imageList.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(6px)',
                zIndex: 100000
              }}
              title="Foto/Video Sebelumnya"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Center High-Res Media Element */}
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '92vw',
              maxHeight: '82vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isVideoUrl(imageList[activeImgIdx] || imageList[0]) ? (
              <video
                src={imageList[activeImgIdx] || imageList[0]}
                controls
                autoPlay
                loop
                playsInline
                style={{
                  maxWidth: '92vw',
                  maxHeight: '82vh',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
                }}
              />
            ) : (
              <img
                src={imageList[activeImgIdx] || imageList[0]}
                alt={`${localizedProd.title} Fullscreen`}
                style={{
                  maxWidth: '92vw',
                  maxHeight: '82vh',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
                  cursor: 'zoom-out'
                }}
                onClick={() => setIsZoomed(false)}
              />
            )}
          </div>

          {/* Next Arrow in Fullscreen */}
          {imageList.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              style={{
                position: 'absolute',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(6px)',
                zIndex: 100000
              }}
              title="Foto/Video Selanjutnya"
            >
              <ChevronRight size={28} />
            </button>
          )}

          <div style={{
            position: 'absolute',
            bottom: '16px',
            color: '#cbd5e1',
            fontSize: '0.8rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <span>Gunakan panah <strong>◄ / ►</strong> di keyboard untuk geser foto</span>
            <span>•</span>
            <span>Tekan <strong>ESC</strong> atau klik luar untuk keluar</span>
          </div>
        </div>
      )}
    </div>
  );
}
