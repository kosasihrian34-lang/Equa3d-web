import React, { useState, useEffect } from 'react';
import { Palette, Plus, Trash2, Settings } from 'lucide-react';
import DeleteConfirmModal from '../DeleteConfirmModal';

export default function MultiColorCalculator() {
  const [colorRates, setColorRates] = useState(() => {
    const saved = localStorage.getItem('forge3d_color_rates');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      color1: 600,
      color2: 800,
      color3: 1000,
      color4: 1200
    };
  });

  const [isEditingRates, setIsEditingRates] = useState(false);
  const [tempRates, setTempRates] = useState(colorRates);

  const [additionalCosts, setAdditionalCosts] = useState(() => {
    const saved = localStorage.getItem('forge3d_additional_costs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 1, name: "Biaya Listrik & Wear Machine", price: 5000, enabled: true },
      { id: 2, name: "Lem Bed Print & Cleaning Tape", price: 2000, enabled: true },
      { id: 3, name: "Dus Packing & Bubble Wrap", price: 4000, enabled: true }
    ];
  });

  const [selectedColorTier, setSelectedColorTier] = useState('color1');
  const [weightGrams, setWeightGrams] = useState(100);
  const [quantity, setQuantity] = useState(1);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [newCostName, setNewCostName] = useState('');
  const [newCostPrice, setNewCostPrice] = useState('');

  useEffect(() => {
    localStorage.setItem('forge3d_color_rates', JSON.stringify(colorRates));
  }, [colorRates]);

  useEffect(() => {
    localStorage.setItem('forge3d_additional_costs', JSON.stringify(additionalCosts));
  }, [additionalCosts]);

  const ratePerGram = colorRates[selectedColorTier] || 600;
  const baseColorPrintCost = weightGrams * ratePerGram;

  const totalAdditionalCostsPerPcs = additionalCosts
    .filter(c => c.enabled)
    .reduce((sum, c) => sum + Number(c.price), 0);

  const costPerPcs = baseColorPrintCost + totalAdditionalCostsPerPcs;
  const grandTotalCost = costPerPcs * quantity;

  const handleSaveRates = (e) => {
    e.preventDefault();
    setColorRates(tempRates);
    setIsEditingRates(false);
  };

  const handleAddAdditionalCost = (e) => {
    e.preventDefault();
    if (!newCostName || !newCostPrice) return;

    setAdditionalCosts([
      ...additionalCosts,
      { id: Date.now(), name: newCostName, price: Number(newCostPrice), enabled: true }
    ]);
    setNewCostName('');
    setNewCostPrice('');
  };

  const handleToggleCost = (id) => {
    setAdditionalCosts(additionalCosts.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setAdditionalCosts(additionalCosts.filter(c => c.id !== itemToDelete.id));
      setItemToDelete(null);
    }
  };

  const formatRp = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={20} color="#2563eb" /> Kalkulator Cetak Custom Multi-Warna
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
            Hitung harga berdasarkan tier warna (1-4 warna) dan biaya modal tambahan (listrik, lem, packing).
          </p>
        </div>

        <button 
          onClick={() => { setTempRates(colorRates); setIsEditingRates(!isEditingRates); }}
          className="btn-secondary"
          style={{ fontSize: '0.82rem' }}
        >
          <Settings size={15} /> Edit Tarif Per Gram Warna
        </button>
      </div>

      {isEditingRates && (
        <form onSubmit={handleSaveRates} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.9rem', color: '#1d4ed8', fontWeight: 700, marginBottom: '10px' }}>
            Edit Tarif per Gram Berdasarkan Jumlah Warna (Rp / Gram)
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>1 Warna (Rp/g)</label>
              <input type="number" className="input-custom" value={tempRates.color1 === 0 || tempRates.color1 === '0' ? '' : tempRates.color1} onFocus={e => e.target.select()} onChange={e => setTempRates({ ...tempRates, color1: e.target.value.replace(/^0+(?=\d)/, '') })} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>2 Warna (Rp/g)</label>
              <input type="number" className="input-custom" value={tempRates.color2 === 0 || tempRates.color2 === '0' ? '' : tempRates.color2} onFocus={e => e.target.select()} onChange={e => setTempRates({ ...tempRates, color2: e.target.value.replace(/^0+(?=\d)/, '') })} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>3 Warna (Rp/g)</label>
              <input type="number" className="input-custom" value={tempRates.color3 === 0 || tempRates.color3 === '0' ? '' : tempRates.color3} onFocus={e => e.target.select()} onChange={e => setTempRates({ ...tempRates, color3: e.target.value.replace(/^0+(?=\d)/, '') })} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>4 Warna (Rp/g)</label>
              <input type="number" className="input-custom" value={tempRates.color4 === 0 || tempRates.color4 === '0' ? '' : tempRates.color4} onFocus={e => e.target.select()} onChange={e => setTempRates({ ...tempRates, color4: e.target.value.replace(/^0+(?=\d)/, '') })} required />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <button type="button" onClick={() => setIsEditingRates(false)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Batal</button>
            <button type="submit" className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Simpan Tarif Warna</button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>1. Pilih Tier Warna & Berat Gram</h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            {[
              { id: 'color1', label: '1 Warna', rate: colorRates.color1 },
              { id: 'color2', label: '2 Warna', rate: colorRates.color2 },
              { id: 'color3', label: '3 Warna', rate: colorRates.color3 },
              { id: 'color4', label: '4 Warna', rate: colorRates.color4 }
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedColorTier(c.id)}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: selectedColorTier === c.id ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  background: selectedColorTier === c.id ? '#eff6ff' : '#ffffff',
                  color: selectedColorTier === c.id ? '#2563eb' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div>{c.label}</div>
                <div style={{ fontSize: '0.72rem', color: selectedColorTier === c.id ? '#1d4ed8' : '#64748b' }}>
                  Rp {c.rate} / gram
                </div>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Berat Model (Gram)</label>
                <span style={{ color: '#2563eb', fontWeight: 800 }}>{weightGrams} gram</span>
              </div>
              <input
                type="range"
                min="10"
                max="800"
                step="5"
                value={weightGrams}
                onChange={e => setWeightGrams(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Jumlah Cetak (Pcs)</label>
              <input type="number" min="1" className="input-custom" value={quantity === 0 || quantity === '0' ? '' : quantity} onFocus={e => e.target.select()} onChange={e => setQuantity(e.target.value.replace(/^0+(?=\d)/, ''))} />
            </div>
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
            2. Biaya Modal Tambahan (Listrik, Lem, Packaging, dll)
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', maxHeight: '180px', overflowY: 'auto' }}>
            {additionalCosts.map((cost) => (
              <div key={cost.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={cost.enabled}
                    onChange={() => handleToggleCost(cost.id)}
                    style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                  <span style={{ color: cost.enabled ? '#0f172a' : '#94a3b8', textDecoration: cost.enabled ? 'none' : 'line-through' }}>{cost.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, color: cost.enabled ? '#2563eb' : '#94a3b8' }}>{formatRp(cost.price)}</span>
                  <button onClick={() => setItemToDelete(cost)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddAdditionalCost} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '6px' }}>
            <input type="text" className="input-custom" placeholder="Nama Biaya (misal: Tape)" value={newCostName} onChange={e => setNewCostName(e.target.value)} style={{ padding: '6px 10px', fontSize: '0.8rem' }} required />
            <input type="number" className="input-custom" placeholder="Harga Rp" value={newCostPrice} onFocus={e => e.target.select()} onChange={e => setNewCostPrice(e.target.value.replace(/^0+(?=\d)/, ''))} style={{ padding: '6px 10px', fontSize: '0.8rem' }} required />
            <button type="submit" className="btn-primary" style={{ padding: '6px 10px' }}><Plus size={14} /></button>
          </form>
        </div>
      </div>

      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase' }}>
            Rincian Kalkulasi Cetak Multi-Warna
          </div>
          <div style={{ fontSize: '0.88rem', color: '#334155', marginTop: '4px' }}>
            Base Warna ({weightGrams}g x Rp {ratePerGram}/g = {formatRp(baseColorPrintCost)}) + Tambahan ({formatRp(totalAdditionalCostsPerPcs)})
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Total Biaya Modal Per Pcs / Total {quantity} Pcs</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#2563eb' }}>
            {formatRp(costPerPcs)} <span style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 600 }}>({formatRp(grandTotalCost)})</span>
          </div>
        </div>
      </div>

      {itemToDelete && (
        <DeleteConfirmModal
          productTitle={`Biaya Tambahan: ${itemToDelete.name}`}
          onClose={() => setItemToDelete(null)}
          onConfirmDelete={handleConfirmDelete}
        />
      )}
    </div>
  );
}
