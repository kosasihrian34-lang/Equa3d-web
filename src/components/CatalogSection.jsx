import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { CATEGORIES_BILINGUAL, MATERIALS, getLocalizedProduct, parseNumericPrice } from '../data/initialProducts';
import { TRANSLATIONS } from '../data/translations';
import { Search, Plus, PackageX, Heart, Package } from 'lucide-react';

export default function CatalogSection({
  products,
  onSelectProduct,
  isAdminLoggedIn,
  onOpenAddModal,
  onEditProduct,
  onDeleteProduct,
  lang = 'id',
  favorites = [],
  onToggleFavorite,
  onAddToCart,
  onShare,
  showOnlyFavorites: propShowOnlyFavorites,
  setShowOnlyFavorites: propSetShowOnlyFavorites
}) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [selectedMaterial, setSelectedMaterial] = useState('Semua Bahan');
  const [sortBy, setSortBy] = useState('featured');
  const [localShowOnlyFavorites, setLocalShowOnlyFavorites] = useState(false);

  const showOnlyFavorites = propShowOnlyFavorites !== undefined ? propShowOnlyFavorites : localShowOnlyFavorites;
  const setShowOnlyFavorites = propSetShowOnlyFavorites || setLocalShowOnlyFavorites;

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.map(p => getLocalizedProduct(p, lang)).filter((prod) => {
      const matchFav = !showOnlyFavorites || favorites.includes(prod.id);

      const matchSearch = prod.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.material.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = selectedCategory === 'Semua Kategori' || 
        prod.category_id === selectedCategory || 
        prod.category === selectedCategory ||
        ((selectedCategory === 'Custom' || selectedCategory === 'Costum') && 
         (prod.category === 'Custom' || prod.category === 'Costum' || prod.category_id === 'Custom' || prod.category_id === 'Costum'));
      const matchMaterial = selectedMaterial === 'Semua Bahan' || prod.material.toLowerCase().includes(selectedMaterial.toLowerCase());

      return matchFav && matchSearch && matchCategory && matchMaterial;
    }).sort((a, b) => {
      if (sortBy === 'featured') return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      if (sortBy === 'price-low') return parseNumericPrice(a.price) - parseNumericPrice(b.price);
      if (sortBy === 'price-high') return parseNumericPrice(b.price) - parseNumericPrice(a.price);
      return 0;
    });
  }, [products, searchTerm, selectedCategory, selectedMaterial, sortBy, showOnlyFavorites, favorites, lang]);

  return (
    <section style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '32px 24px 80px 24px'
    }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            {t.catalogTitle}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
            {t.catalogSubtitle}
          </p>
        </div>

        {/* Admin Add Button */}
        {isAdminLoggedIn && (
          <button 
            onClick={onOpenAddModal}
            className="btn-primary"
            style={{ padding: '10px 18px' }}
          >
            <Plus size={18} />
            {t.addProduct}
          </button>
        )}
      </div>

      {/* Quick Filter Tabs: Semua Produk vs Favorit Saya */}
      {!isAdminLoggedIn && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: '10px',
          width: 'fit-content'
        }}>
          <button
            type="button"
            onClick={() => setShowOnlyFavorites(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '7px',
              border: 'none',
              background: !showOnlyFavorites ? '#ffffff' : 'transparent',
              color: !showOnlyFavorites ? '#0f172a' : '#64748b',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              boxShadow: !showOnlyFavorites ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Package size={16} color={!showOnlyFavorites ? '#2563eb' : '#64748b'} />
            <span>{t.allProductsTab || 'Semua Produk'}</span>
            <span style={{
              background: !showOnlyFavorites ? '#eff6ff' : '#e2e8f0',
              color: !showOnlyFavorites ? '#2563eb' : '#64748b',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '1px 7px',
              borderRadius: '10px'
            }}>
              {products.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowOnlyFavorites(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '7px',
              border: 'none',
              background: showOnlyFavorites ? '#ffffff' : 'transparent',
              color: showOnlyFavorites ? '#dc2626' : '#64748b',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              boxShadow: showOnlyFavorites ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Heart size={16} fill={showOnlyFavorites ? '#dc2626' : 'none'} color={showOnlyFavorites ? '#dc2626' : '#64748b'} />
            <span>{t.favoritesTab || 'Favorit Saya'}</span>
            <span style={{
              background: showOnlyFavorites ? '#fef2f2' : '#e2e8f0',
              color: showOnlyFavorites ? '#dc2626' : '#64748b',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '1px 7px',
              borderRadius: '10px'
            }}>
              {favorites.length}
            </span>
          </button>
        </div>
      )}

      {/* Search & Filters Bar */}
      <div className="clean-card" style={{ padding: '16px 20px', marginBottom: '28px', background: '#ffffff' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '12px',
          alignItems: 'center'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="input-custom"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              className="input-custom"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              {CATEGORIES_BILINGUAL.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {lang === 'en' ? cat.en : cat.id}
                </option>
              ))}
            </select>
          </div>

          {/* Material Filter */}
          <div>
            <select
              className="input-custom"
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              {MATERIALS.map((mat) => (
                <option key={mat} value={mat}>
                  {mat === 'Semua Bahan' ? t.allMaterials : `Bahan / Material: ${mat}`}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              className="input-custom"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="featured">{t.sortFeatured}</option>
              <option value="price-low">{t.sortPriceLow}</option>
              <option value="price-high">{t.sortPriceHigh}</option>
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid #f1f5f9',
          fontSize: '0.82rem',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              {t.showing} <strong style={{ color: '#0f172a' }}>{filteredProducts.length}</strong> {t.productsCountLabel}
              {showOnlyFavorites && <span style={{ color: '#dc2626', fontWeight: 700 }}> ({t.favoritesTab || 'Favorit'})</span>}
            </div>
          </div>

          {(searchTerm || selectedCategory !== 'Semua Kategori' || selectedMaterial !== 'Semua Bahan' || showOnlyFavorites) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Semua Kategori');
                setSelectedMaterial('Semua Bahan');
                setShowOnlyFavorites(false);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#dc2626',
                fontSize: '0.82rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {t.resetFilter}
            </button>
          )}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              isAdminLoggedIn={isAdminLoggedIn}
              onEditProduct={onEditProduct}
              onDeleteProduct={onDeleteProduct}
              lang={lang}
              isFav={favorites.includes(product.id)}
              onToggleFav={onToggleFavorite}
              onAddToCart={onAddToCart}
              onShare={onShare}
            />
          ))}
        </div>
      ) : showOnlyFavorites && favorites.length === 0 ? (
        /* Empty Favorites Specific State */
        <div className="clean-card" style={{
          padding: '48px 24px',
          textAlign: 'center',
          maxWidth: '480px',
          margin: '40px auto'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <Heart size={32} color="#dc2626" />
          </div>
          <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, marginBottom: '6px' }}>
            {t.emptyFavoritesTitle || 'Belum Ada Produk Favorit'}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '20px' }}>
            {t.emptyFavoritesDesc || 'Klik ikon hati ❤️ pada kartu produk di katalog untuk menyimpan barang favorit Anda di sini.'}
          </p>
          <button
            type="button"
            onClick={() => setShowOnlyFavorites(false)}
            className="btn-primary"
            style={{ padding: '9px 20px', fontSize: '0.88rem' }}
          >
            <Package size={16} />
            {t.exploreAllProducts || 'Lihat Semua Produk'}
          </button>
        </div>
      ) : (
        /* Empty Search/Filter State */
        <div className="clean-card" style={{
          padding: '48px 24px',
          textAlign: 'center',
          maxWidth: '460px',
          margin: '40px auto'
        }}>
          <PackageX size={44} color="#94a3b8" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '6px' }}>
            {t.noProductsFound}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '16px' }}>
            {t.noProductsSub}
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('Semua Kategori');
              setSelectedMaterial('Semua Bahan');
              setShowOnlyFavorites(false);
            }}
            className="btn-secondary"
          >
            {t.resetFilter}
          </button>
        </div>
      )}
    </section>
  );
}
