import React, { useState, useEffect } from 'react';
import { DollarSign, PieChart, Plus, Trash2 } from 'lucide-react';
import DeleteConfirmModal from '../DeleteConfirmModal';

export default function RevenueBreakdown() {
  const [weeklyGrossRevenue, setWeeklyGrossRevenue] = useState(3500000);
  const [periodTitle, setPeriodTitle] = useState('Minggu Ke-1');
  const [itemToDelete, setItemToDelete] = useState(null);

  const allocations = [
    { label: "Laba Bersih (Net Profit)", percent: 35, color: "#16a34a", bg: "#f0fdf4" },
    { label: "Bahan Baku (Filament/Resin)", percent: 30, color: "#2563eb", bg: "#eff6ff" },
    { label: "Operasional Cetak", percent: 15, color: "#b45309", bg: "#fffbeb" },
    { label: "Sewa Lapak / Tempat", percent: 10, color: "#7e22ce", bg: "#faf5ff" },
    { label: "Perawatan Mesin 3D", percent: 5, color: "#dc2626", bg: "#fef2f2" },
    { label: "Software / Subscribe", percent: 5, color: "#475569", bg: "#f8fafc" }
  ];

  const [revenueLogs, setRevenueLogs] = useState(() => {
    const saved = localStorage.getItem('forge3d_revenue_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 1, period: 'Minggu #1 Oktober', gross: 3500000, netProfit: 1225000, rawMaterial: 1050000, ops: 525000 },
      { id: 2, period: 'Minggu #2 Oktober', gross: 4200000, netProfit: 1470000, rawMaterial: 1260000, ops: 630000 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('forge3d_revenue_logs', JSON.stringify(revenueLogs));
  }, [revenueLogs]);

  const gross = Number(weeklyGrossRevenue) || 0;
  const netProfit = gross * 0.35;
  const monthlyGrossProjection = gross * 4;
  const monthlyNetProfitProjection = netProfit * 4;

  const handleAddLog = (e) => {
    e.preventDefault();
    if (!gross) return;

    const newLog = {
      id: Date.now(),
      period: periodTitle || `Minggu Ke-${revenueLogs.length + 1}`,
      gross,
      netProfit,
      rawMaterial: gross * 0.30,
      ops: gross * 0.15
    };

    setRevenueLogs([newLog, ...revenueLogs]);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setRevenueLogs(revenueLogs.filter(l => l.id !== itemToDelete.id));
      setItemToDelete(null);
    }
  };

  const formatRp = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={20} color="#2563eb" /> Perhitungan Omset Mingguan & Proyeksi Bulanan
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
            Alokasi persentase omset kotor untuk bahan baku, operasional, sewa lapak, perawatan mesin, subscribe, & laba bersih.
          </p>
        </div>
      </div>

      <form onSubmit={handleAddLog} style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Nama Periode Minggu</label>
          <input type="text" className="input-custom" value={periodTitle} onChange={e => setPeriodTitle(e.target.value)} required />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Omset Kotor Mingguan (Rp)</label>
          <input
            type="number"
            step="50000"
            className="input-custom"
            value={weeklyGrossRevenue === 0 || weeklyGrossRevenue === '0' ? '' : weeklyGrossRevenue}
            onFocus={(e) => e.target.select()}
            onChange={e => setWeeklyGrossRevenue(e.target.value.replace(/^0+(?=\d)/, ''))}
            required
          />
        </div>

        <div>
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '10px' }}>
            <Plus size={16} /> Simpan Catatan Omset Minggu Ini
          </button>
        </div>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '18px' }}>
          <div style={{ fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase' }}>Omset Kotor Mingguan</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#2563eb', margin: '4px 0' }}>{formatRp(gross)}</div>
          <div style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 700, marginTop: '8px' }}>
            Laba Bersih (35%): <strong>{formatRp(netProfit)}</strong> / minggu
          </div>
        </div>

        <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '18px' }}>
          <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>Proyeksi Omset 1 Bulan (Minggu x 4)</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#16a34a', margin: '4px 0' }}>{formatRp(monthlyGrossProjection)}</div>
          <div style={{ fontSize: '0.82rem', color: '#047857', fontWeight: 700, marginTop: '8px' }}>
            Proyeksi Laba Bersih 1 Bulan: <strong>{formatRp(monthlyNetProfitProjection)}</strong> / bulan
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
          Rincian Alokasi Persentase Keuangan ({formatRp(gross)})
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {allocations.map((alloc, idx) => {
            const amount = (gross * alloc.percent) / 100;
            return (
              <div key={idx} style={{ background: alloc.bg, border: `1px solid ${alloc.color}30`, borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: alloc.color }}>
                  {alloc.label} ({alloc.percent}%)
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: alloc.color, marginTop: '4px' }}>
                  {formatRp(amount)}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                  Proyeksi Bulanan: {formatRp(amount * 4)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>Riwayat Pencatatan Omset</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px' }}>Periode</th>
                <th style={{ padding: '8px 12px' }}>Omset Kotor Mingguan</th>
                <th style={{ padding: '8px 12px' }}>Alokasi Bahan (30%)</th>
                <th style={{ padding: '8px 12px' }}>Laba Bersih Mingguan (35%)</th>
                <th style={{ padding: '8px 12px' }}>Proyeksi Laba 1 Bulan</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {revenueLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>{log.period}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 800, color: '#2563eb' }}>{formatRp(log.gross)}</td>
                  <td style={{ padding: '10px 12px', color: '#475569' }}>{formatRp(log.rawMaterial)}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 800, color: '#16a34a' }}>{formatRp(log.netProfit)}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 800, color: '#047857' }}>{formatRp(log.netProfit * 4)}</td>
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
          productTitle={`Omset Periode: ${itemToDelete.period}`}
          onClose={() => setItemToDelete(null)}
          onConfirmDelete={handleConfirmDelete}
        />
      )}
    </div>
  );
}
