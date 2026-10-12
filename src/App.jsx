import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CatalogSection from './components/CatalogSection';
import ProductDetailModal from './components/ProductDetailModal';
import MaterialGuide from './components/MaterialGuide';
import AdminManagement from './components/admin/AdminManagement';
import AdminLoginModal from './components/AdminLoginModal';
import AdminProductModal from './components/AdminProductModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import LogoModal from './components/LogoModal';
import CartModal from './components/CartModal';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Footer from './components/Footer';
import ToastNotification from './components/ToastNotification';
import ShareModal from './components/ShareModal';
import { ShoppingBag } from 'lucide-react';

import { INITIAL_PRODUCTS, parseNumericPrice, formatPriceDisplay } from './data/initialProducts';
import { TRANSLATIONS } from './data/translations';
import { 
  subscribeToCloudProducts, 
  saveCloudProduct, 
  deleteCloudProduct, 
  seedInitialProductsIfEmpty 
} from './firebase';

export default function App() {
  // Theme State ('light' | 'dark')
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('forge3d_theme');
    if (saved) return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('forge3d_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // 1. Language State ('id' | 'en')
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('forge3d_lang') || 'id';
  });

  useEffect(() => {
    localStorage.setItem('forge3d_lang', lang);
  }, [lang]);

  // Clean up legacy localStorage keys to free up storage quota
  useEffect(() => {
    try {
      ['forge3d_products', 'forge3d_products_v1', 'forge3d_products_v2', 'forge3d_products_v3', 'forge3d_products_v4'].forEach(k => {
        localStorage.removeItem(k);
      });
    } catch (e) {}
  }, []);

  // 2. Auth State (Persistent)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('forge3d_admin_auth') === 'true';
  });

  // 3. Products State (Real-Time Cloud Firestore Sync with local fallback)
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('forge3d_products_v5');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (err) {
        console.error("Failed to parse saved products", err);
      }
    }
    return INITIAL_PRODUCTS;
  });

  // Firebase Real-Time Synchronization Effect
  useEffect(() => {
    // 1. Seed initial products to cloud if Firestore collection is empty
    seedInitialProductsIfEmpty(INITIAL_PRODUCTS);

    // 2. Subscribe to real-time changes in Firestore (updates ALL devices instantly)
    const unsubscribe = subscribeToCloudProducts(
      (cloudProducts) => {
        if (Array.isArray(cloudProducts) && cloudProducts.length > 0) {
          setProducts(cloudProducts);
          try {
            localStorage.setItem('forge3d_products_v5', JSON.stringify(cloudProducts));
          } catch {
            // Ignore quota errors
          }
        }
      },
      (err) => {
        console.warn("Firestore cloud sync notice:", err);
      }
    );

    return () => unsubscribe();
  }, []);

  // Save products to localStorage safely
  useEffect(() => {
    try {
      localStorage.setItem('forge3d_products_v5', JSON.stringify(products));
    } catch (err) {
      console.warn("localStorage quota limit reached:", err);
    }
  }, [products]);

  // 4. Favorites / Wishlist State (Persistent Array of Product IDs)
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('forge3d_favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error("Failed to parse favorites", err);
      }
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('forge3d_favorites', JSON.stringify(favorites));
    } catch (err) {
      console.warn("Failed to save favorites to localStorage", err);
    }
  }, [favorites]);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  // Toast Notification State
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'info', actionText = null, onAction = null) => {
    setToast({ message, type, actionText, onAction });
  };

  // Quick Catalog Filter for Favorites
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const handleToggleFavorite = (productId, productTitle = '') => {
    setFavorites((prev) => {
      const isCurrentlyFav = prev.includes(productId);
      if (isCurrentlyFav) {
        showToast(
          productTitle ? `"${productTitle}" ${t.itemRemovedFromFav || 'dihapus dari Favorit.'}` : (t.itemRemovedFromFav || 'Dihapus dari Favorit.'),
          'unfavorite'
        );
        return prev.filter(id => id !== productId);
      } else {
        showToast(
          productTitle ? `"${productTitle}" ${t.itemAddedToFav || 'ditambahkan ke Favorit ❤️'}` : (t.itemAddedToFav || 'Ditambahkan ke Favorit ❤️'),
          'favorite'
        );
        return [...prev, productId];
      }
    });
  };

  // 5. WhatsApp Order Cart State (Persistent)
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('forge3d_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error("Failed to parse cart", err);
      }
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('forge3d_cart', JSON.stringify(cart));
    } catch (err) {
      console.warn("Failed to save cart to localStorage", err);
    }
  }, [cart]);

  const handleAddToCart = (product, selectedColor = '') => {
    const title = product.title || product.title_id || 'Produk';
    setCart((prevCart) => {
      const colorKey = selectedColor || (Array.isArray(product.colorOptions) ? product.colorOptions[0] : '');
      const cartItemId = `${product.id}-${colorKey}`;
      const existingIdx = prevCart.findIndex(item => item.cartItemId === cartItemId);

      if (existingIdx >= 0) {
        const updated = [...prevCart];
        updated[existingIdx].quantity += 1;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            cartItemId,
            product,
            quantity: 1,
            selectedColor: colorKey
          }
        ];
      }
    });

    showToast(
      `"${title}" ${t.itemAddedToCart || 'berhasil ditambahkan ke keranjang!'}`,
      'cart',
      t.viewCart || (lang === 'en' ? 'View Cart' : 'Lihat Keranjang'),
      () => setIsCartModalOpen(true)
    );
  };

  const handleUpdateCartQuantity = (cartItemId, delta) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.cartItemId === cartItemId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const handleRemoveFromCart = (cartItemId) => {
    setCart((prevCart) => prevCart.filter(item => item.cartItemId !== cartItemId));
    showToast(t.itemRemovedFromCart || 'Item dihapus dari keranjang.', 'info');
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Total cart items count & total price
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalPrice = cart.reduce((sum, item) => {
    return sum + parseNumericPrice(item.product.price) * item.quantity;
  }, 0);

  // 6. Tab States: User ('catalog' | 'materials') & Admin ('catalog' | 'management')
  const [userTab, setUserTab] = useState(() => {
    return localStorage.getItem('forge3d_user_tab') || 'catalog';
  });
  const [adminTab, setAdminTab] = useState(() => {
    return localStorage.getItem('forge3d_admin_tab') || 'catalog';
  });

  useEffect(() => {
    try {
      localStorage.setItem('forge3d_user_tab', userTab);
    } catch (e) {}
  }, [userTab]);

  useEffect(() => {
    try {
      localStorage.setItem('forge3d_admin_tab', adminTab);
    } catch (e) {}
  }, [adminTab]);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [shareProduct, setShareProduct] = useState(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [productModalState, setProductModalState] = useState({ isOpen: false, productToEdit: null });
  const [productToDelete, setProductToDelete] = useState(null);

  // Auto-open product detail modal if URL query param contains ?product=...
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const sharedProdId = params.get('product');
      if (sharedProdId) {
        const found = products.find(p => p.id === sharedProdId);
        if (found) {
          setSelectedProduct(found);
        }
      }
    } catch {
      // Ignore URL parse errors
    }
  }, [products]);

  // Auth Handlers
  const handleSuccessLogin = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('forge3d_admin_auth', 'true');
    const lastAdminTab = localStorage.getItem('forge3d_admin_tab') || 'management';
    setAdminTab(lastAdminTab);
  };

  const handleLogoutAdmin = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('forge3d_admin_auth');
    localStorage.removeItem('forge3d_admin_tab');
    setAdminTab('catalog');
    setUserTab('catalog');
  };

  // Product CRUD Handlers with Firebase Cloud Integration
  const handleSaveProduct = async (productData) => {
    // 1. Optimistic Local Update
    setProducts((prevProducts) => {
      const existsIndex = prevProducts.findIndex((p) => p.id === productData.id);
      if (existsIndex >= 0) {
        const updated = [...prevProducts];
        updated[existsIndex] = productData;
        return updated;
      } else {
        return [productData, ...prevProducts];
      }
    });

    showToast("Mengunggah produk & foto ke Firebase Cloud Storage... ☁️", "info");

    // 2. Upload photo files to Firebase Storage & save product to Cloud Firestore
    try {
      await saveCloudProduct(productData);
      showToast(`"${productData.title_id || productData.title}" berhasil di-sync ke Cloud Awan! ☁️✨`, "info");
    } catch (err) {
      console.error("Cloud save notice:", err);
      showToast("Produk tersimpan di lokal (Cloud notice: pastikan aturan Firestore/Storage terbuka).", "info");
    }
  };

  const handleRequestDeleteProduct = (productId) => {
    const target = products.find((p) => p.id === productId);
    if (target) {
      setProductToDelete(target);
    }
  };

  const handleConfirmDeleteProduct = async () => {
    if (productToDelete) {
      const targetId = productToDelete.id;
      setProducts((prev) => prev.filter((p) => p.id !== targetId));
      setProductToDelete(null);

      try {
        await deleteCloudProduct(targetId);
        showToast("Produk berhasil dihapus dari Cloud Awan! ☁️", "info");
      } catch (err) {
        console.error("Cloud delete notice:", err);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      {/* Navbar Header */}
      <Navbar
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onLogoutAdmin={handleLogoutAdmin}
        adminTab={adminTab}
        setAdminTab={setAdminTab}
        userTab={userTab}
        setUserTab={setUserTab}
        lang={lang}
        setLang={setLang}
        onOpenLogoModal={() => setIsLogoModalOpen(true)}
        cartCount={cartCount}
        onOpenCartModal={() => setIsCartModalOpen(true)}
        favoritesCount={favorites.length}
        onOpenFavorites={() => {
          setUserTab('catalog');
          setShowOnlyFavorites(true);
        }}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main View Area */}
      <main style={{ flex: 1 }}>
        {/* User Public Views */}
        {!isAdminLoggedIn && userTab === 'catalog' && (
          <CatalogSection
            products={products}
            onSelectProduct={(prod) => setSelectedProduct(prod)}
            isAdminLoggedIn={isAdminLoggedIn}
            onOpenAddModal={() => setProductModalState({ isOpen: true, productToEdit: null })}
            onEditProduct={(prod) => setProductModalState({ isOpen: true, productToEdit: prod })}
            onDeleteProduct={handleRequestDeleteProduct}
            lang={lang}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={handleAddToCart}
            onShare={(prod) => setShareProduct(prod)}
            showOnlyFavorites={showOnlyFavorites}
            setShowOnlyFavorites={setShowOnlyFavorites}
          />
        )}

        {!isAdminLoggedIn && userTab === 'materials' && (
          <MaterialGuide />
        )}

        {/* Admin Views */}
        {isAdminLoggedIn && adminTab === 'catalog' && (
          <CatalogSection
            products={products}
            onSelectProduct={(prod) => setSelectedProduct(prod)}
            isAdminLoggedIn={isAdminLoggedIn}
            onOpenAddModal={() => setProductModalState({ isOpen: true, productToEdit: null })}
            onEditProduct={(prod) => setProductModalState({ isOpen: true, productToEdit: prod })}
            onDeleteProduct={handleRequestDeleteProduct}
            lang={lang}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onAddToCart={handleAddToCart}
            onShare={(prod) => setShareProduct(prod)}
            showOnlyFavorites={showOnlyFavorites}
            setShowOnlyFavorites={setShowOnlyFavorites}
          />
        )}

        {isAdminLoggedIn && adminTab === 'management' && (
          <AdminManagement catalogProducts={products} />
        )}
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          lang={lang}
          isAdminLoggedIn={isAdminLoggedIn}
          isFav={favorites.includes(selectedProduct.id)}
          onToggleFav={handleToggleFavorite}
          onAddToCart={handleAddToCart}
          onShare={(prod) => setShareProduct(prod)}
        />
      )}

      {/* WhatsApp Cart Modal */}
      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        lang={lang}
      />

      {/* Admin Login Modal */}
      {isAdminModalOpen && (
        <AdminLoginModal
          onClose={() => setIsAdminModalOpen(false)}
          onSuccessLogin={handleSuccessLogin}
        />
      )}

      {/* Admin Add/Edit Product Modal */}
      {productModalState.isOpen && (
        <AdminProductModal
          productToEdit={productModalState.productToEdit}
          onClose={() => setProductModalState({ isOpen: false, productToEdit: null })}
          onSaveProduct={handleSaveProduct}
        />
      )}

      {/* Custom Delete Confirmation Modal */}
      {productToDelete && (
        <DeleteConfirmModal
          productTitle={productToDelete.title || productToDelete.title_id}
          onClose={() => setProductToDelete(null)}
          onConfirmDelete={handleConfirmDeleteProduct}
        />
      )}

      {/* Full Screen Logo Modal */}
      <LogoModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        theme={theme}
      />

      {/* Floating Quick Cart Pill (Public Users, when cart has items) */}
      {!isAdminLoggedIn && cartCount > 0 && (
        <button
          type="button"
          onClick={() => setIsCartModalOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            zIndex: 9990,
            background: '#0f172a',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '50px',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid rgba(255,255,255,0.15)',
            fontWeight: 700,
            fontSize: '0.86rem',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            backdropFilter: 'blur(8px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(15, 23, 42, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.35)';
          }}
          title={lang === 'en' ? 'Open Order Cart' : 'Buka Keranjang Pesanan'}
        >
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            position: 'relative'
          }}>
            <ShoppingBag size={13} />
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-5px',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '0.62rem',
              fontWeight: 800,
              minWidth: '15px',
              height: '15px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 2px'
            }}>
              {cartCount}
            </span>
          </div>
          <span>{lang === 'en' ? 'Order Cart' : 'Keranjang Pesanan'}</span>
          <span style={{ color: '#93c5fd', fontSize: '0.82rem' }}>• {formatPriceDisplay(cartTotalPrice, lang)}</span>
        </button>
      )}

      {/* Floating WhatsApp Action Button (Only for Public Users, Hidden for Admin) */}
      {!isAdminLoggedIn && <FloatingWhatsApp lang={lang} />}

      {/* Toast Notification for instant user feedback */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Share Product Modal */}
      <ShareModal
        isOpen={Boolean(shareProduct)}
        onClose={() => setShareProduct(null)}
        product={shareProduct}
        lang={lang}
        onCopySuccess={(msg) => showToast(msg, 'info')}
      />

      {/* Clean Footer */}
      <Footer
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onLogoutAdmin={handleLogoutAdmin}
        lang={lang}
        onOpenLogoModal={() => setIsLogoModalOpen(true)}
        theme={theme}
      />
    </div>
  );
}
