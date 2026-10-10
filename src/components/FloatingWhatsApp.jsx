import React from 'react';
import { MessageSquare } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export default function FloatingWhatsApp({ lang = 'id' }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  const defaultWaMessage = encodeURIComponent(
    lang === 'en'
      ? "Hello Equa3D, I would like to inquire about 3D printing products/services."
      : "Halo Equa3D, saya ingin bertanya tentang produk & jasa cetak 3D."
  );

  return (
    <a
      href={`https://wa.me/6282373119291?text=${defaultWaMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
        color: '#ffffff',
        padding: '12px 20px',
        borderRadius: '50px',
        boxShadow: '0 6px 24px rgba(37, 211, 102, 0.45), 0 2px 8px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        fontWeight: 700,
        fontSize: '0.9rem',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.04)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(37, 211, 102, 0.6)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(37, 211, 102, 0.45), 0 2px 8px rgba(0,0,0,0.15)';
      }}
      title={t.contactWaFloating}
    >
      <div style={{
        width: '26px',
        height: '26px',
        borderRadius: '50%',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#25D366'
      }}>
        <MessageSquare size={16} fill="#25D366" color="#25D366" />
      </div>
      <span>{t.contactWaFloating}</span>
    </a>
  );
}
