import React from 'react';
import { LogOut, Shield, Package, Cpu, BookOpen, Globe, ShoppingBag, Heart, Sun, Moon } from 'lucide-react';
import { InstagramIcon, TikTokIcon } from './SocialIcons';
import { TRANSLATIONS } from '../data/translations';
import { getAssetUrl } from '../data/initialProducts';

export default function Navbar({ 
  isAdminLoggedIn, 
  onLogoutAdmin, 
  adminTab, 
  setAdminTab,
  userTab,
  setUserTab,
  lang,
  setLang,
  onOpenLogoModal,
  cartCount = 0,
  onOpenCartModal,
  favoritesCount = 0,
  onOpenFavorites,
  theme = 'light',
  onToggleTheme
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand Logo & Social Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}
          >
            <div 
              onClick={onOpenLogoModal}
              title="Klik untuk lihat logo full layar"
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
                borderRadius: '6px',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img 
                src={getAssetUrl(theme === 'dark' ? '/Logo-dark.png' : '/Logo.png')} 
                alt="Equa3D Logo" 
                style={{
                  height: '46px',
                  width: 'auto',
                  maxHeight: '46px',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </div>

            <div onClick={() => setUserTab('catalog')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.06em' }}>
                {t.brandSubtitle}
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingLeft: '16px',
            borderLeft: '1px solid #e2e8f0'
          }}>
            {/* Instagram */}
            <a
              href="https://www.instagram.com/equa3d.id?xtok=cHE3M2cxeWd1aHdl"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#e1306c',
                background: '#fcf0f5',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}
              title="Instagram: @equa3d.id"
            >
              <InstagramIcon size={17} color="#e1306c" />
            </a>

            {/* TikTok */}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); alert("TikTok: @equa3d.id (Coming Soon)"); }}
              style={{
                color: '#0f172a',
                background: '#f1f5f9',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}
              title="TikTok: @equa3d.id"
            >
              <TikTokIcon size={17} color="#0f172a" />
            </a>
          </div>
        </div>

        {/* User Navigation Tabs (Catalog & Panduan Bahan PLA vs PETG) */}
        {!isAdminLoggedIn && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
            <button
              onClick={() => setUserTab('catalog')}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                border: 'none',
                background: userTab === 'catalog' ? '#ffffff' : 'transparent',
                color: userTab === 'catalog' ? '#2563eb' : '#64748b',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: userTab === 'catalog' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Package size={15} />
              {lang === 'en' ? 'Product Catalog' : 'Katalog Produk'}
            </button>

            <button
              onClick={() => setUserTab('materials')}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                border: 'none',
                background: userTab === 'materials' ? '#ffffff' : 'transparent',
                color: userTab === 'materials' ? '#2563eb' : '#64748b',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: userTab === 'materials' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <BookOpen size={15} />
              {lang === 'en' ? 'Material Guide' : 'Panduan Bahan'}
            </button>
          </nav>
        )}

        {/* Admin Navigation Tabs (Only visible when Admin is logged in) */}
        {isAdminLoggedIn && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
            <button
              onClick={() => setAdminTab('catalog')}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                border: 'none',
                background: adminTab === 'catalog' ? '#ffffff' : 'transparent',
                color: adminTab === 'catalog' ? '#2563eb' : '#64748b',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: adminTab === 'catalog' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Package size={15} />
              {t.manageCatalog}
            </button>

            <button
              onClick={() => setAdminTab('management')}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                border: 'none',
                background: adminTab === 'management' ? '#ffffff' : 'transparent',
                color: adminTab === 'management' ? '#2563eb' : '#64748b',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: adminTab === 'management' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Cpu size={15} />
              {lang === 'en' ? 'Print Operation & Financials' : 'Fungsi & Manajemen Percetakan'}
            </button>
          </nav>
        )}

        {/* Right Actions: Favorites, Cart, Language Switcher & Admin Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          {/* Favorites Button (Only for Public Users) */}
          {!isAdminLoggedIn && (
            <button
              type="button"
              onClick={onOpenFavorites}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: favoritesCount > 0 ? '#fef2f2' : '#ffffff',
                border: favoritesCount > 0 ? '1px solid #fecaca' : '1px solid #cbd5e1',
                color: favoritesCount > 0 ? '#dc2626' : '#475569',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title={lang === 'en' ? 'View Wishlist / Favorites' : 'Lihat Produk Favorit'}
            >
              <Heart size={16} fill={favoritesCount > 0 ? '#dc2626' : 'none'} color={favoritesCount > 0 ? '#dc2626' : '#64748b'} />
              <span className="nav-btn-text">{t.favoritesTab || (lang === 'en' ? 'Wishlist' : 'Favorit')}</span>
              {favoritesCount > 0 && (
                <span style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  lineHeight: '1.2'
                }}>
                  {favoritesCount}
                </span>
              )}
            </button>
          )}

          {/* Cart Button (Only for Public Users) */}
          {!isAdminLoggedIn && (
            <button
              type="button"
              onClick={onOpenCartModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: cartCount > 0 ? '#eff6ff' : '#ffffff',
                border: cartCount > 0 ? '1px solid #bfdbfe' : '1px solid #cbd5e1',
                color: cartCount > 0 ? '#2563eb' : '#334155',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
              title={lang === 'en' ? 'View Order Cart' : 'Lihat Keranjang Pesanan WA'}
            >
              <ShoppingBag size={17} color={cartCount > 0 ? '#2563eb' : '#475569'} />
              <span className="nav-btn-text">{lang === 'en' ? 'Cart' : 'Keranjang'}</span>
              
              {cartCount > 0 && (
                <span style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  lineHeight: '1.2'
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Language Switcher Dropdown */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-light)',
            borderRadius: '8px',
            padding: '4px 8px'
          }}>
            <Globe size={15} color="var(--text-secondary)" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="id">🇮🇩 ID</option>
              <option value="en">🇬🇧 EN</option>
            </select>
          </div>

          {/* Modern Dark/Light Mode Switcher */}
          <button
            type="button"
            onClick={onToggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: theme === 'dark' ? '#1e293b' : '#f8fafc',
              border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            title={theme === 'dark' ? (t.lightMode || 'Ganti ke Mode Terang') : (t.darkMode || 'Ganti ke Mode Gelap')}
          >
            {theme === 'dark' ? (
              <Sun size={17} color="#fbbf24" />
            ) : (
              <Moon size={17} color="#475569" />
            )}
          </button>

          {/* Admin Status & Logout (Only visible if Admin is currently logged in) */}
          {isAdminLoggedIn && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Shield size={14} color="#2563eb" />
                {t.adminMode}
              </div>
              <button 
                onClick={onLogoutAdmin}
                className="btn-danger"
                title="Logout Admin"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
