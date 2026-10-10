import React, { useState, useEffect } from 'react';
import { ShoppingBag, FileSpreadsheet, Plus, Trash2, Calendar, DollarSign, Download, CheckCircle, Clock } from 'lucide-react';
import DeleteConfirmModal from '../DeleteConfirmModal';

export default function DailySalesReport({ catalogProducts = [] }) {
  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem('forge3d_daily_sales');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const today = new Date().toISOString().split('T')[0];
    return [
      { id: 1, date: today, productName: 'Gantungan Kunci / Keychain Custom Nama', category: 'Keychain & Aksesoris', qty: 5, unitPrice: 15000, totalPrice: 75000, paymentMethod: 'QRIS', status: 'Selesai & Lunas' },
      { id: 2, date: today, productName: 'Lampu Tidur 3D Lithophane Foto Custom', category: 'Dekorasi & Lampu Lithophane', qty: 1, unitPrice: 145000, totalPrice: 145000, paymentMethod: 'Transfer Bank', status: 'Proses Print' }
    ];
  });

  const [itemToDelete, setItemToDelete] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    date: todayStr,
    productName: '',
    category: 'Keychain & Aksesoris',
    qty: 1,
    unitPrice: 15000,
    paymentMethod: 'QRIS',
    status: 'Selesai & Lunas'
  });

  useEffect(() => {
    localStorage.setItem('forge3d_daily_sales', JSON.stringify(sales));
  }, [sales]);

  // Auto-fill price when catalog product is selected
  const handleProductSelect = (e) => {
    const val = e.target.value;
    const found = catalogProducts.find(p => (p.title || p.title_id) === val);
    if (found) {
      setForm(prev => ({
        ...prev,
        productName: found.title || found.title_id,
        category: found.category || found.category_id || 'Katalog 3D',
        unitPrice: found.price
      }));
    } else {
      setForm(prev => ({ ...prev, productName: val }));
    }
  };

  const handleAddSale = (e) => {
    e.preventDefault();
    if (!form.productName || !form.unitPrice) return;

    const qty = Number(form.qty) || 1;
    const unitPrice = Number(form.unitPrice) || 0;

    const newSale = {
      id: Date.now(),
      date: form.date,
      productName: form.productName,
      category: form.category,
      qty,
      unitPrice,
      totalPrice: qty * unitPrice,
      paymentMethod: form.paymentMethod,
      status: form.status
    };

    setSales([newSale, ...sales]);
    setForm(prev => ({ ...prev, productName: '', qty: 1 }));
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setSales(sales.filter(s => s.id !== itemToDelete.id));
      setItemToDelete(null);
    }
  };

  // Real-time Export to Spreadsheet (CSV format for Google Sheets / MS Excel)
  const handleExportCSV = () => {
    if (sales.length === 0) {
      alert("Belum ada data penjualan untuk dieksport.");
      return;
    }

    const headers = ["ID Transaksi", "Tanggal", "Nama Produk 3D", "Kategori", "Jumlah (Pcs)", "Harga Satuan (Rp)", "Total Omset (Rp)", "Metode Pembayaran", "Status Pesanan"];
    
    const rows = sales.map(s => [
      s.id,
      s.date,
      `"${s.productName.replace(/"/g, '""')}"`,
      `"${s.category}"`,
      s.qty,
      s.unitPrice,
      s.totalPrice,
      `"${s.paymentMethod}"`,
      `"${s.status}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Penjualan_3D_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats Calculations
  const todaySales = sales.filter(s => s.date === todayStr);
  const totalOmsetToday = todaySales.reduce((sum, s) => sum + s.totalPrice, 0);
  const totalPcsToday = todaySales.reduce((sum, s) => sum + s.qty, 0);

  const formatRp = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} color="#2563eb" /> Laporan Penjualan & Produksi Harian
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
            Catat penjualan barang harian dan eksport laporan secara real-time ke format Spreadsheet (Excel / Google Sheets).
          </p>
        </div>

        {/* Realtime Export Spreadsheet Button */}
        <button
          onClick={handleExportCSV}
          className="btn-wa"
          style={{ background: '#16a34a', padding: '10px 18px', fontSize: '0.88rem' }}
        >
          <FileSpreadsheet size={18} />
          Eksport Ke Spreadsheet (Real-Time CSV)
        </button>
      </div>

      {/* Today Stats Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 700 }}>Total Omset Hari Ini ({todayStr}):</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#2563eb', marginTop: '2px' }}>{formatRp(totalOmsetToday)}</div>
        </div>

        <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 700 }}>Total Barang Terjual Hari Ini:</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#16a34a', marginTop: '2px' }}>{totalPcsToday} Pcs</div>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700 }}>Total Transaksi Terdata:</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>{sales.length} Transaksi</div>
        </div>
      </div>

      {/* Input Sale Form */}
      <form onSubmit={handleAddSale} style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Tanggal Transaksi</label>
          <input type="date" className="input-custom" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Pilih Produk / Ketik Custom</label>
          <input
            type="text"
            list="catalog-list"
            className="input-custom"
            placeholder="Pilih dari katalog atau ketik..."
            value={form.productName}
            onChange={handleProductSelect}
            required
          />
          <datalist id="catalog-list">
            {catalogProducts.map(p => (
              <option key={p.id} value={p.title || p.title_id} />
            ))}
          </datalist>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Jumlah (Pcs)</label>
          <input
            type="number"
            min="1"
            className="input-custom"
            value={form.qty === 0 || form.qty === '0' ? '' : form.qty}
            onFocus={(e) => e.target.select()}
            onChange={e => setForm({ ...form, qty: e.target.value.replace(/^0+(?=\d)/, '') })}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Harga Satuan (Rp)</label>
          <input
            type="number"
            className="input-custom"
            value={form.unitPrice === 0 || form.unitPrice === '0' ? '' : form.unitPrice}
            onFocus={(e) => e.target.select()}
            onChange={e => setForm({ ...form, unitPrice: e.target.value.replace(/^0+(?=\d)/, '') })}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Metode Bayar</label>
          <select className="input-custom" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
            <option value="QRIS">QRIS</option>
            <option value="Transfer Bank">Transfer Bank</option>
            <option value="Cash / Tunai">Cash / Tunai</option>
            <option value="Tokopedia / Shopee">Tokopedia / Shopee</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Status Pesanan</label>
          <select className="input-custom" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="Selesai & Lunas">Selesai & Lunas</option>
            <option value="Proses Print">Proses Print</option>
            <option value="Dikirim / Kurir">Dikirim / Kurir</option>
          </select>
        </div>

        <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '10px' }}>
            <Plus size={16} /> Tambahkan Penjualan Hari Ini
          </button>
        </div>
      </form>

      {/* Sales History Table */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Tabel Laporan Penjualan Real-Time</h4>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px' }}>Tanggal</th>
                <th style={{ padding: '8px 12px' }}>Nama Produk 3D</th>
                <th style={{ padding: '8px 12px' }}>Kategori</th>
                <th style={{ padding: '8px 12px' }}>Qty</th>
                <th style={{ padding: '8px 12px' }}>Harga Satuan</th>
                <th style={{ padding: '8px 12px' }}>Total Omset</th>
                <th style={{ padding: '8px 12px' }}>Pembayaran</th>
                <th style={{ padding: '8px 12px' }}>Status</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', color: '#64748b' }}>{item.date}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>{item.productName}</td>
                  <td style={{ padding: '10px 12px', color: '#64748b' }}>{item.category}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>{item.qty} pcs</td>
                  <td style={{ padding: '10px 12px', color: '#475569' }}>{formatRp(item.unitPrice)}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 900, color: '#2563eb' }}>{formatRp(item.totalPrice)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{item.paymentMethod}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      background: item.status.includes('Lunas') ? '#ecfdf5' : item.status.includes('Proses') ? '#eff6ff' : '#fffbeb',
                      color: item.status.includes('Lunas') ? '#047857' : item.status.includes('Proses') ? '#1d4ed8' : '#b45309',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    <button onClick={() => setItemToDelete(item)} style={{ background: '#fef2f2', border: 'none', color: '#dc2626', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal Popup */}
      {itemToDelete && (
        <DeleteConfirmModal
          productTitle={`Transaksi: ${itemToDelete.productName}`}
          onClose={() => setItemToDelete(null)}
          onConfirmDelete={handleConfirmDelete}
        />
      )}
    </div>
  );
}
