import React, { useState, useEffect } from 'react';
import { Layers, Settings, TrendingUp, Plus, Trash2 } from 'lucide-react';
import DeleteConfirmModal from '../DeleteConfirmModal';

export default function WeeklyExpenses() {
  const [params, setParams] = useState(() => {
    const saved = localStorage.getItem('forge3d_weekly_params');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      filamentPer1000g: 180000,
      electricityPerHour: 1500,
      overheadPerPcs: 3000
    };
  });

  const [isEditingParams, setIsEditingParams] = useState(false);
  const [tempParams, setTempParams] = useState(params);

  const [jobName, setJobName] = useState('');
  const [weightGrams, setWeightGrams] = useState(120);
  const [printHours, setPrintHours] = useState(8);
  const [quantity, setQuantity] = useState(10);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('forge3d_weekly_expense_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 1, date: 'Minggu #1 Oktober', jobName: 'Keychain Custom batch 20pcs', weightGrams: 15, printHours: 1, quantity: 20, hppTotal: 78000, recommendedSale: 15000 },
      { id: 2, date: 'Minggu #1 Oktober', jobName: 'Lampu Lithophane 5pcs', weightGrams: 220, printHours: 14, quantity: 5, hppTotal: 318000, recommendedSale: 120000 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('forge3d_weekly_params', JSON.stringify(params));
  }, [params]);

  useEffect(() => {
    localStorage.setItem('forge3d_weekly_expense_logs', JSON.stringify(logs));
  }, [logs]);

  const costFilamentPerGram = params.filamentPer1000g / 1000;
  const materialCostPerPcs = weightGrams * costFilamentPerGram;
  const electricityCostPerPcs = printHours * params.electricityPerHour;
  const overheadCostPerPcs = Number(params.overheadPerPcs) || 0;

  const hppPerPcs = Math.round(materialCostPerPcs + electricityCostPerPcs + overheadCostPerPcs);
  const hppTotal = hppPerPcs * quantity;

  const sale30Percent = Math.round(hppPerPcs * 1.30);
  const sale50PercentSehat = Math.round(hppPerPcs * 1.50);
  const sale100Percent = Math.round(hppPerPcs * 2.00);

  const handleSaveParams = (e) => {
    e.preventDefault();
    setParams(tempParams);
    setIsEditingParams(false);
  };

  const handleAddLog = (e) => {
    e.preventDefault();
    if (!jobName) return;

    const newLog = {
      id: Date.now(),
      date: `Minggu Ke-${Math.ceil(new Date().getDate()/7)} ${new Date().toLocaleString('id-ID', { month: 'long' })}`,
      jobName,
      weightGrams: Number(weightGrams),
      printHours: Number(printHours),
      quantity: Number(quantity),
      hppTotal,
      recommendedSale: sale50PercentSehat
    };

    setLogs([newLog, ...logs]);
    setJobName('');
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setLogs(logs.filter(l => l.id !== itemToDelete.id));
      setItemToDelete(null);
    }
  };

  const formatRp = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} color="#2563eb" /> Pencatatan Pengeluaran Cetak Mingguan & Margin Sehat
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
            Hitung HPP aktual berdasarkan berat gram, jam listrik, overhead, dan penentuan margin harga jual sehat.
          </p>
        </div>

        <button 
          onClick={() => { setTempParams(params); setIsEditingParams(!isEditingParams); }}
          className="btn-secondary"
          style={{ fontSize: '0.82rem' }}
        >
          <Settings size={15} /> Edit Parameter Biaya Variabel
        </button>
      </div>

      {isEditingParams && (
        <form onSubmit={handleSaveParams} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.9rem', color: '#1d4ed8', fontWeight: 700, marginBottom: '10px' }}>
            Pengaturan Biaya Variabel Operasional Percetakan
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>Harga Filament per 1000g (1kg)</label>
              <input type="number" className="input-custom" value={tempParams.filamentPer1000g === 0 || tempParams.filamentPer1000g === '0' ? '' : tempParams.filamentPer1000g} onFocus={e => e.target.select()} onChange={e => setTempParams({ ...tempParams, filamentPer1000g: e.target.value.replace(/^0+(?=\d)/, '') })} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>Biaya Listrik per Jam Print</label>
              <input type="number" className="input-custom" value={tempParams.electricityPerHour === 0 || tempParams.electricityPerHour === '0' ? '' : tempParams.electricityPerHour} onFocus={e => e.target.select()} onChange={e => setTempParams({ ...tempParams, electricityPerHour: e.target.value.replace(/^0+(?=\d)/, '') })} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>Biaya Overhead (Lem/Ring/Nozzle) per Pcs</label>
              <input type="number" className="input-custom" value={tempParams.overheadPerPcs === 0 || tempParams.overheadPerPcs === '0' ? '' : tempParams.overheadPerPcs} onFocus={e => e.target.select()} onChange={e => setTempParams({ ...tempParams, overheadPerPcs: e.target.value.replace(/^0+(?=\d)/, '') })} required />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <button type="button" onClick={() => setIsEditingParams(false)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Batal</button>
            <button type="submit" className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Simpan Parameter</button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <form onSubmit={handleAddLog} style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>Input Order Cetak Mingguan</h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Nama Job / Model Cetak</label>
              <input type="text" className="input-custom" placeholder="Contoh: Order Lampu Tidur 5 Pcs" value={jobName} onChange={e => setJobName(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Berat/g Per Pcs</label>
                <input type="number" className="input-custom" value={weightGrams === 0 || weightGrams === '0' ? '' : weightGrams} onFocus={e => e.target.select()} onChange={e => setWeightGrams(e.target.value.replace(/^0+(?=\d)/, ''))} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Waktu/Jam Per Pcs</label>
                <input type="number" step="0.5" className="input-custom" value={printHours === 0 || printHours === '0' ? '' : printHours} onFocus={e => e.target.select()} onChange={e => setPrintHours(e.target.value.replace(/^0+(?=\d)/, ''))} required />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Jumlah Cetak (Pcs)</label>
              <input type="number" min="1" className="input-custom" value={quantity === 0 || quantity === '0' ? '' : quantity} onFocus={e => e.target.select()} onChange={e => setQuantity(e.target.value.replace(/^0+(?=\d)/, ''))} required />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '8px', padding: '10px' }}>
              <Plus size={16} /> Simpan ke Rekap Pengeluaran Mingguan
            </button>
          </div>
        </form>

        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={18} color="#2563eb" /> Rincian HPP & Rekomendasi Margin Sehat
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: '#475569' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Biaya Bahan Baku ({weightGrams}g x Rp {costFilamentPerGram}/g):</span>
                <span>{formatRp(materialCostPerPcs)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Biaya Listrik ({printHours} Jam x Rp {params.electricityPerHour}):</span>
                <span>{formatRp(electricityCostPerPcs)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Biaya Overhead (Lem/Ring/Nozzle):</span>
                <span>{formatRp(overheadCostPerPcs)}</span>
              </div>

              <div style={{ margin: '10px 0', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#0f172a' }}>
                <span>HPP Modal Cetak (Per Pcs):</span>
                <span style={{ color: '#dc2626' }}>{formatRp(hppPerPcs)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#0f172a' }}>
                <span>Total Pengeluaran ({quantity} Pcs):</span>
                <span style={{ color: '#dc2626' }}>{formatRp(hppTotal)}</span>
              </div>
            </div>

            <div style={{ marginTop: '16px', background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>Rekomendasi Harga Jual Per Pcs:</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', textAlign: 'center', fontSize: '0.78rem' }}>
                <div style={{ background: '#f1f5f9', padding: '6px', borderRadius: '6px' }}>
                  <div style={{ color: '#64748b' }}>Standard (30%)</div>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{formatRp(sale30Percent)}</div>
                </div>
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '6px', borderRadius: '6px' }}>
                  <div style={{ color: '#047857', fontWeight: 700 }}>Sehat (50%)</div>
                  <div style={{ fontWeight: 800, color: '#047857' }}>{formatRp(sale50PercentSehat)}</div>
                </div>
                <div style={{ background: '#eff6ff', padding: '6px', borderRadius: '6px' }}>
                  <div style={{ color: '#1d4ed8' }}>High (100%)</div>
                  <div style={{ fontWeight: 800, color: '#1d4ed8' }}>{formatRp(sale100Percent)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>Rekap Log Pengeluaran Cetak Mingguan</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px' }}>Periode</th>
                <th style={{ padding: '8px 12px' }}>Nama Job</th>
                <th style={{ padding: '8px 12px' }}>Spek (g / jam)</th>
                <th style={{ padding: '8px 12px' }}>Qty</th>
                <th style={{ padding: '8px 12px' }}>Total HPP Pengeluaran</th>
                <th style={{ padding: '8px 12px' }}>Rekomendasi Jual (50%)</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', color: '#64748b' }}>{log.date}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>{log.jobName}</td>
                  <td style={{ padding: '10px 12px', color: '#475569' }}>{log.weightGrams}g | {log.printHours} Jam</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{log.quantity} pcs</td>
                  <td style={{ padding: '10px 12px', fontWeight: 800, color: '#dc2626' }}>{formatRp(log.hppTotal)}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 800, color: '#16a34a' }}>{formatRp(log.recommendedSale)} /pcs</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    <button onClick={() => setItemToDelete(log)} style={{ background: '#fef2f2', border: 'none', color: '#dc2626', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {itemToDelete && (
        <DeleteConfirmModal
          productTitle={`Log Pengeluaran: ${itemToDelete.jobName}`}
          onClose={() => setItemToDelete(null)}
          onConfirmDelete={handleConfirmDelete}
        />
      )}
    </div>
  );
}
