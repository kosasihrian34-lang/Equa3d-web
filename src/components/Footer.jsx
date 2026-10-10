import React from 'react';
import { Lock } from 'lucide-react';
import { InstagramIcon, TikTokIcon } from './SocialIcons';
import { TRANSLATIONS } from '../data/translations';

export default function Footer({ isAdminLoggedIn, onOpenAdminModal, onLogoutAdmin, lang = 'id', onOpenLogoModal, theme = 'light' }) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  return (
    <footer style={{
      background: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      padding: '32px 24px 24px 24px',
      color: '#64748b',
      fontSize: '0.85rem'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand & Social links */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <img 
              src={theme === 'dark' ? '/Logo-dark.png' : '/Logo.png'} 
              alt="Equa3D Logo" 
              onClick={onOpenLogoModal}
              title="Klik untuk lihat logo full layar"
              style={{
                height: '32px',
                width: 'auto',
                objectFit: 'contain',
                cursor: 'pointer'
              }}
            />
          </div>

          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>© {new Date().getFullYear()} {t.copyright}</span>
            
            {/* Secret Hidden Admin Login Trigger (Clickable Lock Icon) */}
            {!isAdminLoggedIn && (
              <span
                onClick={onOpenAdminModal}
                style={{
                  cursor: 'pointer',
                  opacity: 0.35,
                  display: 'inline-flex',
                  alignItems: 'center',
                  marginLeft: '4px',
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.35'}
                title="Admin Portal"
              >
                <Lock size={12} color="#94a3b8" />
              </span>
            )}
          </div>

          {/* Social Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>{t.socialFollow}</span>
            <a
              href="https://www.instagram.com/equa3d.id?xtok=cHE3M2cxeWd1aHdl"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#e1306c',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.8rem'
              }}
            >
              <InstagramIcon size={16} color="#e1306c" /> @equa3d.id
            </a>

            <a
              href="#"
              onClick={(e) => { e.preventDefault(); alert("TikTok: @equa3d.id (Coming Soon)"); }}
              style={{
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.8rem'
              }}
            >
              <TikTokIcon size={16} color="#0f172a" /> TikTok
            </a>
          </div>
        </div>

        {/* Right Area: Only shows Logout Admin when logged in */}
        {isAdminLoggedIn && (
          <div>
            <button onClick={onLogoutAdmin} className="btn-danger">
              Logout Admin
            </button>
          </div>
        )}
      </div>
    </footer>
  );
}
