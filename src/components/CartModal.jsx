import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, MessageSquare, ArrowRight } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import { formatPriceDisplay, parseNumericPrice } from '../data/initialProducts';

export default function CartModal({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  lang = 'id'
}) {
  const [customerName, setCustomerName] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Close with Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.id;

  // Calculate item price safely
  const calculateItemPrice = (item) => {
    return parseNumericPrice(item.product.price);
  };

  const totalPrice = cart.reduce((sum, item) => {
    return sum + calculateItemPrice(item) * item.quantity;
  }, 0);

  const formattedTotalPrice = formatPriceDisplay(totalPrice, lang);

  // Generate WhatsApp Message for all cart items
  const handleCheckoutWA = () => {
    if (cart.length === 0) return;

    let itemsListText = cart.map((item, idx) => {
      const itemTitle = item.product.title || item.product.title_id || 'Produk 3D';
      const singlePrice = formatPriceDisplay(calculateItemPrice(item), lang);
      const subtotal = formatPriceDisplay(calculateItemPrice(item) * item.quantity, lang);
      const colorText = item.selectedColor ? ` | Warna: ${item.selectedColor}` : '';
      return `${idx + 1}. *${itemTitle}* (x${item.quantity})\n   - Material: ${item.product.material || 'PLA'}${colorText}\n   - Harga Satuan: ${singlePrice}\n   - Subtotal: ${subtotal}`;
    }).join('\n\n');

    const nameText = customerName.trim() ? `Nama Pemesan: *${customerName.trim()}*\n` : '';
    const notesText = customerNotes.trim() ? `Catatan/Request: _${customerNotes.trim()}_\n` : '';

    const textID = `*PESANAN KERANJANG EQUA3D* 🛒\n--------------------------------\n${nameText}${notesText}*Daftar Produk yang Dipesan:*\n${itemsListText}\n\n================================\n*TOTAL ESTIMASI: ${formattedTotalPrice}*\n================================\n\nHalo Equa3D, saya mau memesan daftar produk cetak 3D di atas. Mohon info ketersediaan antrean cetak & rincian pembayaran. Terima kasih!`;

    const textEN = `*EQUA3D CART ORDER* 🛒\n--------------------------------\n${nameText}${notesText}*Order Items:*\n${itemsListText}\n\n================================\n*ESTIMATED TOTAL: ${formattedTotalPrice}*\n================================\n\nHello Equa3D, I would like to order the 3D print items listed above. Please inform availability and payment details. Thank you!`;

    const finalMsg = encodeURIComponent(lang === 'en' ? textEN : textID);
    window.open(`https://wa.me/6282373119291?text=${finalMsg}`, '_blank');
  };

  return (
    <div className="modal-backdrop">
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '620px',
          padding: '24px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
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

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            background: '#eff6ff',
            color: '#2563eb',
            padding: '10px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShoppingBag size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {t.cartTitle || (lang === 'en' ? 'WhatsApp Order Cart' : 'Keranjang Pesanan WhatsApp')}
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {cart.length} {t.cartCount || (lang === 'en' ? 'items' : 'produk')} • {t.cartSubtitle || (lang === 'en' ? 'Order multiple products at once via WhatsApp' : 'Pesan beberapa produk sekaligus')}
            </div>
          </div>
        </div>

        {/* Cart Item List / Empty State */}
        {cart.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px dashed #cbd5e1',
            margin: '10px 0 20px 0'
          }}>
            <ShoppingBag size={48} color="#cbd5e1" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
              {t.cartEmptyTitle || (lang === 'en' ? 'Your cart is empty' : 'Keranjang Belanja Masih Kosong')}
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '18px' }}>
              {t.cartEmptyDesc || (lang === 'en' 
                ? 'Pick products from the catalog to add them to your multi-item WhatsApp order.'
                : 'Pilih produk dari katalog lalu klik tombol "+ Keranjang" untuk memesan beberapa item sekaligus.')}
            </p>
            <button onClick={onClose} className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
              {t.exploreAllProducts || (lang === 'en' ? 'Explore Catalog' : 'Lihat Katalog Produk')}
            </button>
          </div>
        ) : (
          <>
            {/* Scrollable Item List */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              paddingRight: '4px',
              marginBottom: '16px',
              maxHeight: '340px'
            }}>
              {cart.map((item) => {
                const singlePrice = calculateItemPrice(item);
                const subtotal = singlePrice * item.quantity;

                return (
                  <div 
                    key={item.cartItemId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '12px'
                    }}
                  >
                    {/* Item Image */}
                    <img 
                      src={item.product.image || (item.product.images && item.product.images[0])} 
                      alt={item.product.title || item.product.title_id}
                      style={{
                        width: '64px',
                        height: '64px',
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

                    {/* Item Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: '2px'
                      }}>
                        {item.product.title || item.product.title_id}
                      </h4>

                      <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span>Bahan: <strong style={{ color: '#2563eb' }}>{item.product.material}</strong></span>
                        {item.selectedColor && (
                          <span>• Warna: <strong style={{ color: '#0f172a' }}>{item.selectedColor}</strong></span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                        {formatPriceDisplay(subtotal, lang)}
                      </div>
                    </div>

                    {/* Quantity Selector & Remove Button */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => onRemoveItem(item.cartItemId)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#dc2626',
                          cursor: 'pointer',
                          padding: '2px'
                        }}
                        title={lang === 'en' ? 'Remove Item' : 'Hapus Item'}
                      >
                        <Trash2 size={15} />
                      </button>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '2px 4px'
                      }}>
                        <button
                          onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#475569',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2px'
                          }}
                        >
                          <Minus size={13} />
                        </button>

                        <span style={{ fontSize: '0.82rem', fontWeight: 800, minWidth: '18px', textAlign: 'center', color: '#0f172a' }}>
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#475569',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2px'
                          }}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Customer Information (Optional) */}
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '16px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#1e40af', fontWeight: 700, marginBottom: '3px' }}>
                  {t.customerNameLabel || (lang === 'en' ? 'Your Name (Optional)' : 'Nama Pemesan (Opsional)')}
                </label>
                <input 
                  type="text"
                  placeholder={t.customerNamePlaceholder || (lang === 'en' ? 'e.g. John Doe' : 'Contoh: Rian Kosasih')}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input-custom"
                  style={{ background: '#ffffff', fontSize: '0.8rem', padding: '6px 10px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#1e40af', fontWeight: 700, marginBottom: '3px' }}>
                  {t.customerNotesLabel || (lang === 'en' ? 'Notes / Custom Request' : 'Catatan / Request Khusus')}
                </label>
                <input 
                  type="text"
                  placeholder={t.customerNotesPlaceholder || (lang === 'en' ? 'e.g. Urgent order / color preference' : 'Contoh: Butuh cepat / request warna')}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="input-custom"
                  style={{ background: '#ffffff', fontSize: '0.8rem', padding: '6px 10px' }}
                />
              </div>
            </div>

            {/* Total Summary & Checkout Action */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {t.totalEstimate || (lang === 'en' ? 'Total Order Estimate' : 'Total Estimasi Pesanan')}
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                    {formattedTotalPrice}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClearCart}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#dc2626',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {t.clearCartBtn || (lang === 'en' ? 'Clear Cart' : 'Kosongkan Keranjang')}
                </button>
              </div>

              <button
                type="button"
                onClick={handleCheckoutWA}
                className="btn-wa"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <MessageSquare size={18} />
                {t.orderViaWaBtn || (lang === 'en' ? 'Order All Items via WhatsApp' : 'Pesan Semua via WhatsApp')}
                <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
