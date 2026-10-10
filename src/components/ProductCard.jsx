import React from 'react';
import { Eye, MessageSquare, Edit, Trash2, Layers, ShieldCheck, Cpu, Video, Heart, ShoppingBag, Share2 } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import { getLocalizedProduct, formatPriceDisplay } from '../data/initialProducts';

export default function ProductCard({ 
  product, 
  onSelectProduct, 
  isAdminLoggedIn, 
  onEditProduct, 
  onDeleteProduct,
  lang = 'id',
  isFav = false,
  onToggleFav,
  onAddToCart,
  onShare
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;
  const localizedProd = getLocalizedProduct(product, lang);

  const isVideoUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    return url.startsWith('data:video/') || url.match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i) || url.includes('/videos/');
  };

  const getBadgeClass = (material) => {
    const mat = (material || '').toLowerCase();
    if (mat.includes('pla')) return 'badge-pla';
    if (mat.includes('petg')) return 'badge-petg';
    return 'badge-pla';
  };

  const formattedPrice = formatPriceDisplay(localizedProd.price, lang);

  const waMessage = encodeURIComponent(
    lang === 'en' 
      ? `Hello Equa3D, I am interested in ordering:\n*${localizedProd.title}*\n- Material: ${localizedProd.material}\n- Price: ${formattedPrice}\nIs this item available for printing?`
      : `Halo Equa3D, saya berminat memesan produk katalog:\n*${localizedProd.title}*\n- Bahan: ${localizedProd.material}\n- Harga: ${formattedPrice}\nMohon info ketersediaan stok & pengiriman!`
  );

  return (
    <div className="product-card">
      {/* Admin Overlay Actions */}
      {isAdminLoggedIn && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 10,
          display: 'flex',
          gap: '6px',
          background: '#ffffff',
          padding: '4px 8px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <button 
            onClick={(e) => { e.stopPropagation(); onEditProduct(localizedProd); }}
            style={{
              background: '#eff6ff',
              border: 'none',
              color: '#2563eb',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            title="Edit Produk (Admin)"
          >
            <Edit size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDeleteProduct(localizedProd.id); }}
            style={{
              background: '#fef2f2',
              border: 'none',
              color: '#dc2626',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
            title="Hapus Produk (Admin)"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Image / Video Container */}
      <div 
        className="product-image-container"
        onClick={() => onSelectProduct(localizedProd)}
        style={{ cursor: 'pointer', background: '#000000', position: 'relative' }}
      >
        {isVideoUrl(localizedProd.image) ? (
          <video 
            src={localizedProd.image} 
            muted 
            loop 
            autoPlay 
            playsInline 
            className="product-image"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <img 
            src={localizedProd.image} 
            alt={localizedProd.title} 
            className="product-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80';
            }}
          />
        )}

        {/* Top-Right Action Overlay: Share & Favorite */}
        {!isAdminLoggedIn && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 12,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {/* Share Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShare && onShare(product);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.88)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                color: '#475569',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                transition: 'all 0.2s ease'
              }}
              title={lang === 'en' ? "Share Product" : "Bagikan Produk"}
            >
              <Share2 size={15} color="#475569" />
            </button>

            {/* Favorite Heart Button */}
            <button
              type="button"
              onClick={(e) => { 
                e.stopPropagation(); 
                onToggleFav && onToggleFav(product.id, localizedProd.title); 
              }}
              style={{
                background: isFav ? '#fef2f2' : 'rgba(255, 255, 255, 0.88)',
                border: isFav ? '1px solid #fecaca' : '1px solid rgba(255, 255, 255, 0.6)',
                color: isFav ? '#dc2626' : '#64748b',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                transition: 'all 0.2s ease'
              }}
              title={isFav ? (lang === 'en' ? "Remove from Favorites" : "Hapus dari Favorit") : (lang === 'en' ? "Add to Favorites" : "Tambah ke Favorit")}
            >
              <Heart 
                size={16} 
                className={isFav ? "heart-pop" : ""}
                fill={isFav ? '#dc2626' : 'none'} 
                color={isFav ? '#dc2626' : '#475569'} 
              />
            </button>
          </div>
        )}
        
        {/* Filament Badge */}
        <div style={{ position: 'absolute', bottom: '10px', left: '10px' }}>
          <span className={`badge-filament ${getBadgeClass(localizedProd.material)}`}>
            <Cpu size={12} />
            {localizedProd.material}
          </span>
        </div>

        {/* Featured Tag */}
        {localizedProd.isFeatured && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: '#0f172a',
            color: '#ffffff',
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '3px 8px',
            borderRadius: '6px',
            letterSpacing: '0.05em'
          }}>
            FEATURED
          </div>
        )}

        {/* Video Badge Tag */}
        {isVideoUrl(localizedProd.image) && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: isAdminLoggedIn ? '80px' : '50px',
            background: 'rgba(15, 23, 42, 0.85)',
            color: '#ffffff',
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '3px 8px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backdropFilter: 'blur(4px)'
          }}>
            <Video size={12} color="#60a5fa" /> VIDEO 3D
          </div>
        )}
      </div>

      {/* Card Info */}
      <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div 
          className="category-text"
          style={{ 
            fontSize: '0.75rem', 
            color: 'var(--primary-blue)', 
            fontWeight: 700, 
            textTransform: 'uppercase',
            marginBottom: '4px'
          }}
        >
          {localizedProd.category}
        </div>

        <h3 
          onClick={() => onSelectProduct(localizedProd)}
          style={{ 
            fontSize: '1rem', 
            fontWeight: 700, 
            color: '#0f172a',
            marginBottom: '8px',
            lineHeight: 1.35,
            cursor: 'pointer',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {localizedProd.title}
        </h3>

        {/* Technical Summary Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px', fontSize: '0.75rem', color: '#64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', padding: '3px 8px', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
            <Layers size={12} color="#475569" />
            <span>{localizedProd.infill}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', padding: '3px 8px', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
            <ShieldCheck size={12} color="#16a34a" />
            <span>{(localizedProd.resolution || '0.20mm').split(' ')[0]}</span>
          </div>
        </div>

        {/* Price & Action Buttons */}
        <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.estimatedPrice}</div>
            <div style={{ 
              fontSize: '1.15rem', 
              fontWeight: 800, 
              color: '#0f172a' 
            }}>
              {formattedPrice}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button 
              onClick={() => onSelectProduct(localizedProd)} 
              className="btn-secondary"
              style={{ flex: 1, padding: '8px 10px', fontSize: '0.82rem', justifyContent: 'center' }}
            >
              <Eye size={15} />
              {t.viewDetail}
            </button>

            {!isAdminLoggedIn && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onAddToCart && onAddToCart(product); }}
                  className="btn-primary"
                  style={{ 
                    padding: '8px 11px', 
                    justifyContent: 'center', 
                    background: '#2563eb',
                    flexShrink: 0 
                  }}
                  title={lang === 'en' ? 'Add to Order Cart' : 'Tambah ke Keranjang'}
                >
                  <ShoppingBag size={16} />
                </button>

                <a 
                  href={`https://wa.me/6282373119291?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-wa"
                  style={{ 
                    padding: '8px 11px', 
                    justifyContent: 'center',
                    flexShrink: 0 
                  }}
                  title={t.orderWa}
                >
                  <MessageSquare size={16} />
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
