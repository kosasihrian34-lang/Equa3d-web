import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, Wallet } from 'lucide-react';
import DeleteConfirmModal from '../DeleteConfirmModal';

export default function InitialCapital() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('forge3d_initial_capital');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 1, name: "Mesin 3D Printer (FDM/Bambu Lab)", category: "Mesin / Hardware", price: 6500000, qty: 1 },
      { id: 2, name: "Filament PLA Stock (5 Spool)", category: "Bahan Baku", price: 900000, qty: 1 },
      { id: 3, name: "Set Nozzle & Sparepart Cadangan", category: "Peralatan", price: 350000, qty: 1 },
      { id: 4, name: "Lem Bed Print & Finishing Tools", category: "Perlengkapan", price: 150000, qty: 1 }
    ];
  });

  const [form, setForm] = useState({ name: '', category: 'Mesin / Hardware', price: '', qty: 1 });
  const [editingId, setEditingId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    localStorage.setItem('forge3d_initial_capital', JSON.stringify(items));
  }, [items]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    if (editingId) {
      setItems(items.map(item => item.id === editingId ? {
        ...item,
        name: form.name,
        category: form.category,
        price: Number(form.price),
        qty: Number(form.qty) || 1
      } : item));
      setEditingId(null);
    } else {
      setItems([...items, {
        id: Date.now(),
        name: form.name,
        category: form.category,
        price: Number(form.price),
        qty: Number(form.qty) || 1
      }]);
    }
    setForm({ name: '', category: 'Mesin / Hardware', price: '', qty: 1 });
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({ name: item.name, category: item.category, price: item.price, qty: item.qty });
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setItems(items.filter(item => item.id !== itemToDelete.id));
      setItemToDelete(null);
    }
  };

  const totalCapital = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const formatRp = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet size={20} color="#2563eb" /> Pencatatan Modal Awal Usaha
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
            Catat inventaris barang, perlengkapan, dan mesin awal percetakan 3D Anda.
          </p>
        </div>

        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '10px 16px', borderRadius: '10px' }}>
          <div style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 600 }}>Total Modal Awal Terdata:</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#2563eb' }}>{formatRp(totalCapital)}</div>
        </div>
      </div>

      {/* Input / Edit Form */}
      <form onSubmit={handleSave} style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Nama Barang / Aset</label>
          <input type="text" className="input-custom" placeholder="Contoh: Mesin 3D Printer Ender" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Kategori Aset</label>
          <select className="input-custom" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            <option value="Mesin / Hardware">Mesin / Hardware</option>
            <option value="Bahan Baku">Bahan Baku (Filament/Resin)</option>
            <option value="Peralatan">Peralatan Tools</option>
            <option value="Perlengkapan">Perlengkapan Lapak/Finishing</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Harga Satuan (Rp)</label>
          <input
            type="number"
            className="input-custom"
            placeholder="Contoh: 150000"
            value={form.price === 0 || form.price === '0' ? '' : form.price}
            onFocus={(e) => e.target.select()}
            onChange={e => setForm({ ...form, price: e.target.value.replace(/^0+(?=\d)/, '') })}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Jumlah (Qty)</label>
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

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '10px' }}>
            {editingId ? <><Save size={15} /> Simpan Edit</> : <><Plus size={15} /> Tambah Modal</>}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', category: 'Mesin / Hardware', price: '', qty: 1 }); }} className="btn-secondary">Batal</button>
          )}
        </div>
      </form>

      {/* Table List */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '10px 12px' }}>Nama Barang</th>
              <th style={{ padding: '10px 12px' }}>Kategori</th>
              <th style={{ padding: '10px 12px' }}>Qty</th>
              <th style={{ padding: '10px 12px' }}>Harga Satuan</th>
              <th style={{ padding: '10px 12px' }}>Subtotal</th>
              <th style={{ padding: '10px 12px', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>{item.name}</td>
                <td style={{ padding: '12px', color: '#64748b' }}>{item.category}</td>
                <td style={{ padding: '12px', fontWeight: 600 }}>{item.qty} pcs</td>
                <td style={{ padding: '12px', color: '#475569' }}>{formatRp(item.price)}</td>
                <td style={{ padding: '12px', fontWeight: 800, color: '#2563eb' }}>{formatRp(item.price * item.qty)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <button onClick={() => handleEdit(item)} style={{ background: '#eff6ff', border: 'none', color: '#2563eb', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', marginRight: '6px' }}><Edit2 size={14} /></button>
                  <button onClick={() => setItemToDelete(item)} style={{ background: '#fef2f2', border: 'none', color: '#dc2626', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirm Modal */}
      {itemToDelete && (
        <DeleteConfirmModal
          productTitle={`Aset: ${itemToDelete.name}`}
          onClose={() => setItemToDelete(null)}
          onConfirmDelete={handleConfirmDelete}
        />
      )}
    </div>
  );
}
