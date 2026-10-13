import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Clock, Printer, Sparkles, PackageCheck, CheckCircle2, 
  Trash2, Edit3, Play, Square, MessageCircle, ExternalLink, AlertCircle,
  Filter, Calendar, User, Phone, Check, RefreshCw, X, ChevronRight, Hash
} from 'lucide-react';
import { 
  ORDER_STATUSES, 
  ORDER_STEP_LIST, 
  CATEGORY_CODES, 
  normalizeOrderCode, 
  calculateSlicerCountdown, 
  formatDurationDisplay 
} from '../../data/customOrderConstants';

export default function CustomOrderManagement({ 
  orders = [], 
  onSaveOrder, 
  onDeleteOrder 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [nowTick, setNowTick] = useState(Date.now());

  // Modal State (Add or Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  // Slicer Quick Modal State
  const [slicerModalOrder, setSlicerModalOrder] = useState(null);
  const [inputSlicerHours, setInputSlicerHours] = useState(8);
  const [inputSlicerMinutes, setInputSlicerMinutes] = useState(0);

  // Keep live second-by-second tick for admin timers
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Form State for Adding/Editing Order
  const [formData, setFormData] = useState({
    categoryCode: 'KY',
    orderNumber: '001',
    customerName: '',
    customerPhone: '',
    itemTitle: '',
    quantity: 1,
    material: 'PLA+',
    color: '',
    notes: '',
    pickupMethod: 'Diambil di Workshop',
    estimatedPrice: '',
    status: 'queued',
    printDurationHours: 8,
    printDurationMinutes: 0
  });

  // Calculate next order number suggestion based on selected category code
  const getNextOrderNumber = (prefix) => {
    const existing = orders.filter(o => o.categoryCode === prefix || (o.orderCode && o.orderCode.startsWith(prefix)));
    if (existing.length === 0) return '001';
    
    const nums = existing.map(o => {
      const match = (o.orderCode || o.id || '').match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    }).filter(n => !isNaN(n));

    const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
    return String(maxNum + 1).padStart(3, '0');
  };

  const handleOpenAddModal = () => {
    const nextNum = getNextOrderNumber('KY');
    setEditingOrder(null);
    setFormData({
      categoryCode: 'KY',
      orderNumber: nextNum,
      customerName: '',
      customerPhone: '',
      itemTitle: '',
      quantity: 1,
      material: 'PLA+',
      color: '',
      notes: '',
      pickupMethod: 'Diambil di Workshop',
      estimatedPrice: '',
      status: 'queued',
      printDurationHours: 8,
      printDurationMinutes: 0
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (order) => {
    setEditingOrder(order);
    setFormData({
      categoryCode: order.categoryCode || 'KY',
      orderNumber: order.orderNumber || (order.orderCode ? order.orderCode.split('-')[1] : '001'),
      customerName: order.customerName || '',
      customerPhone: order.customerPhone || '',
      itemTitle: order.itemTitle || '',
      quantity: order.quantity || 1,
      material: order.material || 'PLA+',
      color: order.color || '',
      notes: order.notes || '',
      pickupMethod: order.pickupMethod || 'Diambil di Workshop',
      estimatedPrice: order.estimatedPrice || '',
      status: order.status || 'queued',
      printDurationHours: order.printDurationHours || 0,
      printDurationMinutes: order.printDurationMinutes || 0
    });
    setIsModalOpen(true);
  };

  const handleCategoryChange = (newCode) => {
    const nextNum = editingOrder ? formData.orderNumber : getNextOrderNumber(newCode);
    setFormData(prev => ({
      ...prev,
      categoryCode: newCode,
      orderNumber: nextNum
    }));
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.itemTitle.trim()) {
      alert('Mohon isi nama barang atau judul pesanan.');
      return;
    }

    const catObj = CATEGORY_CODES.find(c => c.code === formData.categoryCode) || CATEGORY_CODES[0];
    const cleanNum = String(formData.orderNumber).padStart(3, '0');
    const orderCode = `${formData.categoryCode}-${cleanNum}`;

    const orderPayload = {
      id: editingOrder ? editingOrder.id : orderCode,
      orderCode,
      categoryCode: formData.categoryCode,
      categoryName: catObj.name,
      orderNumber: cleanNum,
      customerName: formData.customerName.trim() || 'Pelanggan',
      customerPhone: formData.customerPhone.trim(),
      itemTitle: formData.itemTitle.trim(),
      quantity: Number(formData.quantity) || 1,
      material: formData.material,
      color: formData.color.trim() || 'Standar',
      notes: formData.notes.trim(),
      pickupMethod: formData.pickupMethod,
      estimatedPrice: Number(formData.estimatedPrice) || 0,
      status: formData.status,
      printDurationHours: Number(formData.printDurationHours) || 0,
      printDurationMinutes: Number(formData.printDurationMinutes) || 0,
      printStartedAt: editingOrder ? editingOrder.printStartedAt : (formData.status === 'printing' ? new Date().toISOString() : null),
      createdAt: editingOrder ? editingOrder.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveOrder(orderPayload);
    setIsModalOpen(false);
  };

  // Instant Status Change from list view
  const handleQuickStatusChange = (order, newStatus) => {
    const isNowPrinting = newStatus === 'printing';
    const isWasPrinting = order.status === 'printing';

    const updated = {
      ...order,
      status: newStatus,
      // If switching to printing and no start time set, set to now
      printStartedAt: isNowPrinting && !order.printStartedAt ? new Date().toISOString() : order.printStartedAt,
      updatedAt: new Date().toISOString()
    };

    onSaveOrder(updated);
  };

  // Quick Start Slicer Printing Timer
  const handleOpenSlicerModal = (order) => {
    setSlicerModalOrder(order);
    setInputSlicerHours(order.printDurationHours || 8);
    setInputSlicerMinutes(order.printDurationMinutes || 0);
  };

  const handleStartSlicerPrint = () => {
    if (!slicerModalOrder) return;

    const updated = {
      ...slicerModalOrder,
      status: 'printing',
      printDurationHours: Number(inputSlicerHours) || 0,
      printDurationMinutes: Number(inputSlicerMinutes) || 0,
      printStartedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveOrder(updated);
    setSlicerModalOrder(null);
  };

  const handleStopOrFinishPrinting = (order, moveToFinishing = true) => {
    const updated = {
      ...order,
      status: moveToFinishing ? 'finishing' : 'queued',
      updatedAt: new Date().toISOString()
    };
    onSaveOrder(updated);
  };

  // Send WhatsApp update message to customer
  const handleSendWAUpdate = (order) => {
    if (!order.customerPhone) {
      alert('Nomor telepon WhatsApp pelanggan belum diisi.');
      return;
    }

    let cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);

    const statusObj = ORDER_STATUSES[order.status] || ORDER_STATUSES.queued;
    const countdown = calculateSlicerCountdown(order);

    let progressNote = '';
    if (order.status === 'printing' && countdown && !countdown.isFinished) {
      progressNote = `⏳ Estimasi sisa waktu cetak: *${countdown.formattedTime}* (${countdown.percentDone}% Selesai).\n`;
    }

    const message = encodeURIComponent(
      `Halo Kak *${order.customerName}*,\n\n` +
      `Kabar terbaru mengenai pesanan 3D Printing Anda di *Equa3D*:\n\n` +
      `📦 *Item:* ${order.itemTitle}\n` +
      `🏷️ *Kode Order:* ${order.orderCode || order.id}\n` +
      `📊 *Status:* ${statusObj.label_id}\n` +
      progressNote +
      `\nKakak dapat memantau status pengerjaan secara real-time langsung melalui website kami pada menu *Lacak Pesanan* dengan memasukkan kode *${order.orderCode || order.id}*.\n\n` +
      `Terima kasih! 🙏`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  // Filtered orders list
  const filteredOrders = orders.filter(o => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchCategory = categoryFilter === 'all' || o.categoryCode === categoryFilter;
    const term = searchTerm.toLowerCase();
    const matchSearch = !term || 
      (o.orderCode && o.orderCode.toLowerCase().includes(term)) ||
      (o.customerName && o.customerName.toLowerCase().includes(term)) ||
      (o.itemTitle && o.itemTitle.toLowerCase().includes(term)) ||
      (o.notes && o.notes.toLowerCase().includes(term));

    return matchStatus && matchCategory && matchSearch;
  });

  // Summary Metrics
  const totalCount = orders.length;
  const printingCount = orders.filter(o => o.status === 'printing').length;
  const queuedCount = orders.filter(o => o.status === 'queued').length;
  const readyCount = orders.filter(o => o.status === 'ready').length;

  return (
    <div style={{ color: '#0f172a' }}>
      {/* Top Banner & Quick Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="clean-card" style={{ padding: '16px 20px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Pesanan PO</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{totalCount}</div>
        </div>

        <div className="clean-card" style={{ padding: '16px 20px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Printer size={15} /> Sedang Dicetak (Slicer Aktif)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1d4ed8' }}>{printingCount}</div>
        </div>

        <div className="clean-card" style={{ padding: '16px 20px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={15} /> Menunggu Antrean
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#b45309' }}>{queuedCount}</div>
        </div>

        <div className="clean-card" style={{ padding: '16px 20px', background: '#d1fae5', border: '1px solid #a7f3d0', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PackageCheck size={15} /> Siap Diambil / Diantar
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#047857' }}>{readyCount}</div>
        </div>
      </div>

      {/* Control Action Bar */}
      <div className="clean-card" style={{
        padding: '18px 20px',
        marginBottom: '24px',
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Search & Filters */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', flex: '1 1 300px' }}>
          <div style={{ position: 'relative', minWidth: '220px', flex: '1' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Cari kode (KY-001), pelanggan, item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-custom"
              style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-custom"
            style={{ fontSize: '0.85rem', fontWeight: 600, width: 'auto' }}
          >
            <option value="all">Semua Status</option>
            {Object.values(ORDER_STATUSES).map(s => (
              <option key={s.id} value={s.id}>{s.label_id}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-custom"
            style={{ fontSize: '0.85rem', fontWeight: 600, width: 'auto' }}
          >
            <option value="all">Semua Kategori</option>
            {CATEGORY_CODES.map(c => (
              <option key={c.code} value={c.code}>[{c.code}] {c.name}</option>
            ))}
          </select>
        </div>

        {/* Add Order Button */}
        <button
          type="button"
          onClick={handleOpenAddModal}
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
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
            boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
          }}
        >
          <Plus size={18} />
          Tambah Pesanan PO Baru
        </button>
      </div>

      {/* Orders List / Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredOrders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 20px',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px dashed #cbd5e1',
            color: '#64748b'
          }}>
            Belum ada pesanan PO yang sesuai dengan filter pencarian.
          </div>
        ) : (
          filteredOrders.map(order => {
            const statusObj = ORDER_STATUSES[order.status] || ORDER_STATUSES.queued;
            const countdown = calculateSlicerCountdown(order);

            return (
              <div 
                key={order.id || order.orderCode} 
                className="clean-card"
                style={{
                  padding: '20px 24px',
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: order.status === 'printing' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  boxShadow: order.status === 'printing' ? '0 8px 24px rgba(37,99,235,0.1)' : '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Header row: Order Code, Customer, & Quick Status Dropdown */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '14px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #f1f5f9'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{
                      background: '#0f172a',
                      color: '#ffffff',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontWeight: 900,
                      fontSize: '1rem',
                      letterSpacing: '0.05em'
                    }}>
                      {order.orderCode || order.id}
                    </span>

                    <span style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}>
                      [{order.categoryCode}] {order.categoryName}
                    </span>

                    <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
                      Pemesan: <strong style={{ color: '#0f172a' }}>{order.customerName}</strong>
                      {order.customerPhone && (
                        <span style={{ color: '#2563eb', marginLeft: '6px' }}>({order.customerPhone})</span>
                      )}
                    </span>
                  </div>

                  {/* Status Dropdown Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Status:</span>
                    <select
                      value={order.status}
                      onChange={(e) => handleQuickStatusChange(order, e.target.value)}
                      className="input-custom"
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        color: statusObj.color,
                        background: statusObj.badgeBg,
                        border: `1px solid ${statusObj.badgeBorder}`,
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      {Object.values(ORDER_STATUSES).map(s => (
                        <option key={s.id} value={s.id}>{s.label_id}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Content Row: Item Details & Live Slicer Timer Panel */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '16px',
                  alignItems: 'start'
                }}>
                  {/* Left: Item Specifications */}
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                      {order.itemTitle}
                    </h4>

                    <div style={{ fontSize: '0.84rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>
                        Jumlah: <strong>{order.quantity} Pcs</strong> • Bahan: <strong>{order.material}</strong> • Warna: <strong>{order.color || '-'}</strong>
                      </div>
                      <div>
                        Penyerahan: <strong>{order.pickupMethod}</strong>
                        {order.estimatedPrice > 0 && (
                          <span> • Biaya: <strong>Rp {Number(order.estimatedPrice).toLocaleString('id-ID')}</strong></span>
                        )}
                      </div>
                      {order.notes && (
                        <div style={{ marginTop: '4px', padding: '6px 10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#334155' }}>
                          💬 <em>{order.notes}</em>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Slicer Timer Control Box */}
                  <div style={{
                    background: order.status === 'printing' ? '#0f172a' : '#f8fafc',
                    color: order.status === 'printing' ? '#ffffff' : '#0f172a',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Printer size={16} color={order.status === 'printing' ? '#60a5fa' : '#2563eb'} />
                        Waktu Slicer 3D:
                      </div>
                      <span style={{ fontSize: '0.78rem', color: order.status === 'printing' ? '#94a3b8' : '#64748b' }}>
                        Total: {formatDurationDisplay(order.printDurationHours, order.printDurationMinutes)}
                      </span>
                    </div>

                    {order.status === 'printing' && countdown ? (
                      <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'monospace', color: '#38bdf8', marginBottom: '6px' }}>
                          {countdown.isFinished ? '✅ Cetak Selesai!' : `Sisa: ${countdown.formattedTime}`}
                        </div>

                        {/* Progress Bar */}
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
                          <div style={{ width: `${countdown.percentDone}%`, height: '100%', background: '#38bdf8', transition: 'width 0.5s ease' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => handleStopOrFinishPrinting(order, true)}
                            style={{
                              background: '#10b981',
                              color: '#ffffff',
                              border: 'none',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Check size={14} /> Selesai Cetak (Lanjut QC)
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenSlicerModal(order)}
                            style={{
                              background: 'rgba(255,255,255,0.15)',
                              color: '#ffffff',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Ubah Durasi
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenSlicerModal(order)}
                          style={{
                            background: '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Play size={14} /> Set Jam Slicer & Mulai Cetak
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions: WhatsApp Notification, Edit, Delete */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid #f1f5f9'
                }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {order.customerPhone && (
                      <button
                        type="button"
                        onClick={() => handleSendWAUpdate(order)}
                        style={{
                          background: '#f0fdf4',
                          color: '#16a34a',
                          border: '1px solid #bbf7d0',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <MessageCircle size={15} /> Kirim Update Status ke WA Pelanggan
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(order)}
                      style={{
                        background: '#f8fafc',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Edit3 size={14} /> Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus pesanan "${order.orderCode || order.id}"?`)) {
                          onDeleteOrder(order.id || order.orderCode);
                        }
                      }}
                      style={{
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: ADD / EDIT CUSTOM ORDER */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="clean-card" style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '640px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
                {editingOrder ? `Edit Pesanan ${editingOrder.orderCode}` : 'Buat Pesanan Custom / PO Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Category & Order Code Generator */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                    Kategori Katalog:
                  </label>
                  <select
                    value={formData.categoryCode}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="input-custom"
                    style={{ fontWeight: 700 }}
                  >
                    {CATEGORY_CODES.map(c => (
                      <option key={c.code} value={c.code}>[{c.code}] {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                    Nomor Urut Order:
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 900, color: '#2563eb' }}>{formData.categoryCode}-</span>
                    <input
                      type="number"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                      placeholder="001"
                      className="input-custom"
                      style={{ fontWeight: 800 }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                    Nama Pelanggan:
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Contoh: Budi Santoso"
                    className="input-custom"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                    Nomor WhatsApp:
                  </label>
                  <input
                    type="text"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    placeholder="081234567890"
                    className="input-custom"
                  />
                </div>
              </div>

              {/* Item Details */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                  Nama Item / Model 3D:
                </label>
                <input
                  type="text"
                  value={formData.itemTitle}
                  onChange={(e) => setFormData({ ...formData, itemTitle: e.target.value })}
                  placeholder="Contoh: Keychain Logo Custom Nama 'BUDI'"
                  className="input-custom"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                    Jumlah (Pcs):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="input-custom"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                    Material:
                  </label>
                  <select
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="input-custom"
                  >
                    <option value="PLA">PLA</option>
                    <option value="PLA+">PLA+</option>
                    <option value="PETG">PETG</option>
                    <option value="ABS">ABS</option>
                    <option value="TPU (Flexible)">TPU (Flexible)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                    Warna Filament:
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="Contoh: Hitam & Gold"
                    className="input-custom"
                  />
                </div>
              </div>

              {/* Slicer Duration Inputs */}
              <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, marginBottom: '6px', color: '#1e293b' }}>
                  ⏱️ Estimasi Waktu Cetak Slicer:
                </label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number"
                      min="0"
                      value={formData.printDurationHours}
                      onChange={(e) => setFormData({ ...formData, printDurationHours: e.target.value })}
                      style={{ width: '80px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    />
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Jam</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={formData.printDurationMinutes}
                      onChange={(e) => setFormData({ ...formData, printDurationMinutes: e.target.value })}
                      style={{ width: '80px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                    />
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Menit</span>
                  </div>
                </div>
              </div>

              {/* Initial Status & Notes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                    Status Awal:
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-custom"
                    style={{ fontWeight: 700 }}
                  >
                    {Object.values(ORDER_STATUSES).map(s => (
                      <option key={s.id} value={s.id}>{s.label_id}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                    Estimasi Harga (Rp):
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedPrice}
                    onChange={(e) => setFormData({ ...formData, estimatedPrice: e.target.value })}
                    placeholder="Contoh: 35000"
                    className="input-custom"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: '#334155' }}>
                  Catatan Pengerjaan:
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Infill 100%, pasang gantungan rantai biji lada..."
                  className="input-custom"
                  rows="2"
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {editingOrder ? 'Simpan Perubahan' : 'Buat Pesanan PO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK MODAL: SET JAM SLICER & MULAI CETAK */}
      {slicerModalOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="clean-card" style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '8px', color: '#2563eb' }}>
                <Printer size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
                  Mulai Cetak 3D di Mesin
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {slicerModalOrder.orderCode} • {slicerModalOrder.itemTitle}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '16px' }}>
              Masukkan hasil estimasi waktu cetak dari software slicer (Bambu Studio / Cura / PrusaSlicer). Timer hitung mundur real-time akan langsung berjalan di sisi pelanggan.
            </p>

            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              background: '#f8fafc',
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                  Jam:
                </label>
                <input
                  type="number"
                  min="0"
                  value={inputSlicerHours}
                  onChange={(e) => setInputSlicerHours(e.target.value)}
                  style={{ width: '90px', padding: '8px 12px', fontSize: '1.1rem', fontWeight: 900, borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                  Menit:
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={inputSlicerMinutes}
                  onChange={(e) => setInputSlicerMinutes(e.target.value)}
                  style={{ width: '90px', padding: '8px 12px', fontSize: '1.1rem', fontWeight: 900, borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 700, paddingTop: '16px' }}>
                = {formatDurationDisplay(inputSlicerHours, inputSlicerMinutes)}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSlicerModalOrder(null)}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleStartSlicerPrint}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Play size={16} /> Mulai Cetak Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
