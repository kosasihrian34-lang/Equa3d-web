import React, { useState, useEffect } from 'react';
import { 
  Search, Clock, Printer, Sparkles, PackageCheck, CheckCircle2, 
  XCircle, ArrowRight, Copy, Check, MessageCircle, AlertCircle, 
  Calendar, Layers, ShieldCheck, RefreshCw, ChevronRight, Tag
} from 'lucide-react';
import { 
  ORDER_STATUSES, 
  ORDER_STEP_LIST, 
  CATEGORY_CODES, 
  normalizeOrderCode, 
  calculateSlicerCountdown,
  formatDurationDisplay 
} from '../data/customOrderConstants';

export const OrderTracking = ({ 
  orders = [], 
  initialCode = '', 
  lang = 'id',
  onBackToCatalog 
}) => {
  const [searchInput, setSearchInput] = useState(initialCode || '');
  const [activeOrder, setActiveOrder] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [nowTick, setNowTick] = useState(Date.now());

  // Split mode helper (dropdown prefix + number input)
  const [selectedPrefix, setSelectedPrefix] = useState('KY');
  const [numberInput, setNumberInput] = useState('');

  // Keep live second-by-second countdown tick
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-search if initialCode provided or URL query param
  useEffect(() => {
    if (initialCode) {
      handleSearch(initialCode);
    }
  }, [initialCode, orders]);

  const handleSearch = (codeToSearch = searchInput) => {
    const cleanCode = normalizeOrderCode(codeToSearch);
    if (!cleanCode) return;

    setHasSearched(true);
    const found = orders.find(o => {
      const ordCode = normalizeOrderCode(o.orderCode || o.id);
      return ordCode === cleanCode;
    });

    setActiveOrder(found || null);
  };

  const handleSearchBySplit = () => {
    if (!numberInput.trim()) return;
    const combined = `${selectedPrefix}-${numberInput.trim().padStart(3, '0')}`;
    setSearchInput(combined);
    handleSearch(combined);
  };

  const handleCopyCode = (code) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Live timer calculation for current active order
  const countdownData = activeOrder ? calculateSlicerCountdown(activeOrder) : null;
  const currentStatusObj = activeOrder ? (ORDER_STATUSES[activeOrder.status] || ORDER_STATUSES.queued) : null;

  // Format date helper
  const formatDate = (isoString) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' WIB';
    } catch {
      return isoString;
    }
  };

  // WhatsApp quick contact
  const handleContactAdminWA = () => {
    if (!activeOrder) return;
    const phone = "6282129598282"; // Equa3D admin contact
    const text = encodeURIComponent(
      `Halo Equa3D! Saya ingin konfirmasi progres pesanan saya:\n\n` +
      `📌 *No. Order:* ${activeOrder.orderCode || activeOrder.id}\n` +
      `👤 *Nama:* ${activeOrder.customerName || '-'}\n` +
      `📦 *Item:* ${activeOrder.itemTitle || '-'}\n` +
      `📊 *Status saat ini:* ${currentStatusObj?.label_id || activeOrder.status}\n\n` +
      `Mohon informasinya ya min. Terima kasih!`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <section style={{
      maxWidth: '1080px',
      margin: '0 auto',
      padding: '28px 20px 80px 20px',
      color: 'var(--text-primary)'
    }}>
      {/* Hero Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(37, 99, 235, 0.08)',
          border: '1px solid rgba(37, 99, 235, 0.2)',
          color: '#2563eb',
          padding: '6px 14px',
          borderRadius: '50px',
          fontSize: '0.82rem',
          fontWeight: 700,
          marginBottom: '14px'
        }}>
          <Clock size={15} />
          {lang === 'en' ? 'Live Order & 3D Print Slicer Tracking' : 'Pelacakan Real-Time Pesanan PO & Cetak Slicer'}
        </div>

        <h1 style={{
          fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)',
          fontWeight: 900,
          color: '#0f172a',
          lineHeight: 1.25,
          marginBottom: '12px'
        }}>
          {lang === 'en' ? 'Track Your 3D Print Order' : 'Lacak Status Pesanan Custom & PO'}
        </h1>
        <p style={{
          fontSize: '0.96rem',
          color: '#64748b',
          maxWidth: '640px',
          margin: '0 auto'
        }}>
          {lang === 'en'
            ? 'Enter your order code to monitor queue status, real-time slicer printing countdown, and ready-to-pickup status.'
            : 'Masukkan kode kategori dan nomor order Anda untuk memantau antrean, sisa jam cetak real-time dari slicer, hingga pesanan siap diambil.'}
        </p>
      </div>

      {/* Search Box Card */}
      <div className="clean-card" style={{
        padding: '24px',
        marginBottom: '32px',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        border: '1px solid #e2e8f0'
      }}>
        {/* Method 1: Single Input with Auto-formatting */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#1e293b',
            marginBottom: '8px'
          }}>
            {lang === 'en' ? 'Enter Order Code (e.g. KY-001):' : 'Ketik Kode Order (Contoh: KY-001):'}
          </label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 240px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Misal: KY-001 atau ky001"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="input-custom"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  border: '2px solid #cbd5e1',
                  borderRadius: '10px'
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => handleSearch()}
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              <Search size={18} />
              {lang === 'en' ? 'Track Order' : 'Lacak Pesanan'}
            </button>
          </div>
        </div>

        {/* Method 2: Split Category & Order Number */}
        <div style={{
          paddingTop: '16px',
          borderTop: '1px dashed #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
            {lang === 'en' ? 'Or select by category:' : 'Atau pilih per kategori katalog:'}
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={selectedPrefix}
              onChange={(e) => setSelectedPrefix(e.target.value)}
              className="input-custom"
              style={{
                padding: '6px 12px',
                fontWeight: 700,
                fontSize: '0.85rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1'
              }}
            >
              {CATEGORY_CODES.map(cat => (
                <option key={cat.code} value={cat.code}>
                  [{cat.code}] {cat.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="No. (misal: 1)"
              value={numberInput}
              onChange={(e) => setNumberInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchBySplit()}
              style={{
                width: '110px',
                padding: '6px 10px',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '8px',
                border: '1px solid #cbd5e1'
              }}
            />
            <button
              type="button"
              onClick={handleSearchBySplit}
              style={{
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cek
            </button>
          </div>
        </div>

        {/* Quick Demo Chips */}
        <div style={{
          marginTop: '16px',
          paddingTop: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
            💡 Coba sampel demo:
          </span>
          {['KY-001', 'KY-002', 'DK-001', 'MC-001'].map(demoCode => (
            <button
              key={demoCode}
              type="button"
              onClick={() => {
                setSearchInput(demoCode);
                handleSearch(demoCode);
              }}
              style={{
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {demoCode}
            </button>
          ))}
        </div>
      </div>

      {/* Tracking Result View */}
      {activeOrder && (
        <div className="clean-card" style={{
          padding: '28px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Top Banner: Order Code & Current Status Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            paddingBottom: '20px',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Nomor Pelacakan Order:
                </span>
                <span style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontWeight: 900,
                  fontSize: '1rem',
                  letterSpacing: '0.06em'
                }}>
                  {activeOrder.orderCode || activeOrder.id}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(activeOrder.orderCode || activeOrder.id)}
                  title="Salin Kode Order"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: copiedCode ? '#10b981' : '#64748b',
                    padding: '4px'
                  }}
                >
                  {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Atas Nama: <strong style={{ color: '#0f172a' }}>{activeOrder.customerName || 'Pelanggan'}</strong>
                {activeOrder.createdAt && (
                  <span> • Dibuat: {formatDate(activeOrder.createdAt)}</span>
                )}
              </div>
            </div>

            {/* Status Pill Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '50px',
              background: currentStatusObj.badgeBg,
              border: `1px solid ${currentStatusObj.badgeBorder}`,
              color: currentStatusObj.color,
              fontWeight: 800,
              fontSize: '0.88rem'
            }}>
              {activeOrder.status === 'printing' && (
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#2563eb',
                  display: 'inline-block',
                  boxShadow: '0 0 0 3px rgba(37,99,235,0.3)',
                  animation: 'pulse 1.5s infinite'
                }} />
              )}
              {currentStatusObj.label_id}
            </div>
          </div>

          {/* REAL-TIME SLICER PRINTING DASHBOARD (Only when printing or timer configured) */}
          {activeOrder.status === 'printing' && (
            <div style={{
              margin: '24px 0',
              padding: '24px',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              borderRadius: '14px',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(15,23,42,0.25)',
              position: 'relative'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    background: 'rgba(37,99,235,0.3)',
                    padding: '8px',
                    borderRadius: '8px',
                    color: '#60a5fa'
                  }}>
                    <Printer size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                      Mesin 3D Printer Aktif
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                      Proses Cetak Slicer Sedang Berjalan
                    </div>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(255,255,255,0.08)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#93c5fd',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  Total Waktu Slicer: {formatDurationDisplay(activeOrder.printDurationHours, activeOrder.printDurationMinutes)}
                </div>
              </div>

              {/* Digital Countdown Timer Box */}
              {countdownData && !countdownData.isFinished ? (
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '10px',
                    marginBottom: '12px',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      Estimasi Sisa Waktu Cetak:
                    </span>
                    <span style={{
                      fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
                      fontWeight: 900,
                      fontFamily: 'monospace',
                      color: '#38bdf8',
                      letterSpacing: '0.04em'
                    }}>
                      {countdownData.formattedTime}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      color: '#cbd5e1',
                      marginBottom: '6px',
                      fontWeight: 600
                    }}>
                      <span>Progres Pencetakan Layer</span>
                      <strong style={{ color: '#38bdf8' }}>{countdownData.percentDone}% Selesai</strong>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '10px',
                      background: 'rgba(255,255,255,0.15)',
                      borderRadius: '50px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${countdownData.percentDone}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #2563eb, #38bdf8)',
                        borderRadius: '50px',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>

                  {/* Start & Estimated End Times */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    padding: '12px 14px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: '#cbd5e1'
                  }}>
                    <div>
                      <span style={{ color: '#94a3b8' }}>Waktu Mulai: </span>
                      <strong>{formatDate(activeOrder.printStartedAt)}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8' }}>Perkiraan Selesai: </span>
                      <strong style={{ color: '#38bdf8' }}>{formatDate(countdownData.estimatedEndTime)}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '16px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <CheckCircle2 size={24} color="#34d399" />
                  <div>
                    <div style={{ fontWeight: 800, color: '#34d399', fontSize: '0.95rem' }}>
                      Pencetakan Layer Slicer Selesai!
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#e2e8f0' }}>
                      Model telah selesai dicetak dari mesin. Saat ini sedang proses pendinginan sebelum dilepas dari bed cetak dan masuk ke tahap Finishing.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEPPER / TIMELINE VIEW */}
          <div style={{ margin: '28px 0' }}>
            <h3 style={{
              fontSize: '0.95rem',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Layers size={18} color="#2563eb" />
              Alur Tahapan Produksi Pesanan:
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${ORDER_STEP_LIST.length}, 1fr)`,
              gap: '8px',
              position: 'relative'
            }}>
              {ORDER_STEP_LIST.map((stepItem, idx) => {
                const currentStepNum = currentStatusObj?.step || 1;
                const isPassed = stepItem.step < currentStepNum || (currentStatusObj.id === 'completed' && stepItem.id === 'completed');
                const isCurrent = stepItem.id === activeOrder.status || (activeOrder.status === 'printing' && stepItem.id === 'printing');

                let circleBg = '#f1f5f9';
                let circleColor = '#94a3b8';
                let borderColor = '#e2e8f0';

                if (isCurrent) {
                  circleBg = '#2563eb';
                  circleColor = '#ffffff';
                  borderColor = '#2563eb';
                } else if (isPassed) {
                  circleBg = '#10b981';
                  circleColor = '#ffffff';
                  borderColor = '#10b981';
                }

                return (
                  <div key={stepItem.id} style={{
                    textAlign: 'center',
                    padding: '8px 4px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {/* Circle Step Number / Icon */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: circleBg,
                      color: circleColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      border: `2px solid ${borderColor}`,
                      transition: 'all 0.3s ease',
                      boxShadow: isCurrent ? '0 0 0 4px rgba(37,99,235,0.2)' : 'none'
                    }}>
                      {isPassed ? <Check size={18} /> : (idx + 1)}
                    </div>

                    <div style={{
                      fontSize: '0.78rem',
                      fontWeight: isCurrent ? 800 : 600,
                      color: isCurrent ? '#0f172a' : isPassed ? '#10b981' : '#64748b',
                      lineHeight: 1.2
                    }}>
                      {stepItem.title_id}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanation box for current status */}
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              borderRadius: '8px',
              background: currentStatusObj.badgeBg,
              border: `1px solid ${currentStatusObj.badgeBorder}`,
              color: '#1e293b',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <ShieldCheck size={18} color={currentStatusObj.color} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong>Status Terkini: {currentStatusObj.label_id}</strong>
                <div style={{ color: '#475569', marginTop: '2px' }}>
                  {currentStatusObj.desc_id}
                </div>
              </div>
            </div>
          </div>

          {/* ITEM SPECIFICATIONS CARD */}
          <div style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            marginBottom: '24px'
          }}>
            <h4 style={{
              fontSize: '0.88rem',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Rincian Spesifikasi Pesanan:
            </h4>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px',
              fontSize: '0.85rem'
            }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>Nama Item / Model 3D:</span>
                <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{activeOrder.itemTitle || '-'}</strong>
              </div>

              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>Kategori Katalog:</span>
                <span style={{ fontWeight: 700, color: '#2563eb' }}>
                  [{activeOrder.categoryCode || 'CS'}] {activeOrder.categoryName || 'Custom'}
                </span>
              </div>

              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>Jumlah & Bahan:</span>
                <strong style={{ color: '#0f172a' }}>
                  {activeOrder.quantity || 1} Pcs • {activeOrder.material || 'PLA'}
                </strong>
              </div>

              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>Warna Filament / Finishing:</span>
                <strong style={{ color: '#0f172a' }}>{activeOrder.color || 'Standar'}</strong>
              </div>

              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>Metode Penyerahan:</span>
                <strong style={{ color: '#0f172a' }}>{activeOrder.pickupMethod || 'Diambil di Workshop'}</strong>
              </div>

              {activeOrder.notes && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.78rem' }}>Catatan Khusus Pengerjaan:</span>
                  <div style={{
                    padding: '8px 12px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    color: '#334155',
                    marginTop: '4px'
                  }}>
                    {activeOrder.notes}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: WhatsApp & Track Another */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <button
              type="button"
              onClick={handleContactAdminWA}
              style={{
                background: '#25D366',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(37,211,102,0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              <MessageCircle size={18} />
              Tanya Admin via WhatsApp
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveOrder(null);
                setSearchInput('');
              }}
              style={{
                background: 'transparent',
                color: '#64748b',
                border: '1px solid #cbd5e1',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer'
              }}
            >
              Cari Nomor Order Lain
            </button>
          </div>
        </div>
      )}

      {/* Not Found View */}
      {hasSearched && !activeOrder && (
        <div className="clean-card" style={{
          textAlign: 'center',
          padding: '40px 24px',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px dashed #cbd5e1'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#fee2e2',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <AlertCircle size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            Kode Pesanan "{searchInput.toUpperCase()}" Tidak Ditemukan
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '480px', margin: '0 auto 20px auto' }}>
            Pastikan kode order yang Anda masukkan sudah benar (misal: <strong>KY-001</strong> untuk Keychain nomor 1, atau <strong>DK-001</strong> untuk Dekorasi). Jika baru saja memesan, mohon tunggu admin menginput pesanan ke sistem.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                setSearchInput('KY-001');
                handleSearch('KY-001');
              }}
              style={{
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer'
              }}
            >
              Coba Lacak KY-001 (Sampel Aktif)
            </button>
          </div>
        </div>
      )}

      {/* Guide Card for Users */}
      <div style={{
        marginTop: '40px',
        padding: '20px 24px',
        background: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px'
      }}>
        <Tag size={22} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
            Panduan Format Kode Order & Kategori:
          </h4>
          <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
            Kode pesanan terdiri dari <strong>2 huruf kode kategori katalog</strong> diikuti <strong>nomor urut order</strong> Anda (contoh: <strong>KY-001</strong> untuk Keychain pesanan #001). Kode order resmi diberikan langsung oleh Admin Equa3D saat pemesanan disepakati via WhatsApp.
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderTracking;
