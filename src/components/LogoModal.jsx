import React from 'react';
import { X, Download } from 'lucide-react';
import { getAssetUrl } from '../data/initialProducts';

export default function LogoModal({ isOpen, onClose, theme = 'light' }) {
  if (!isOpen) return null;

  const logoSrc = getAssetUrl(theme === 'dark' ? '/Logo-dark.png' : '/Logo.png');
  const logoFileName = theme === 'dark' ? 'Equa3D_Logo_Dark.png' : 'Equa3D_Logo.png';

  return (
    <div 
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '92vw',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-50px',
            right: '0',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: '#ffffff',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.2s ease'
          }}
          title="Tutup (Esc)"
        >
          <X size={22} />
        </button>

        {/* Full Screen Logo Image */}
        <img 
          src={logoSrc} 
          alt="Equa3D Logo Full Screen" 
          style={{
            maxWidth: '100%',
            maxHeight: '75vh',
            objectFit: 'contain',
            filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))'
          }}
        />

        {/* Actions */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
          <a
            href={logoSrc}
            download={logoFileName}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
            }}
          >
            <Download size={18} />
            Unduh Logo Transparan (.PNG)
          </a>
        </div>
      </div>
    </div>
  );
}
