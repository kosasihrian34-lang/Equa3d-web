import React, { useState } from 'react';
import InitialCapital from './InitialCapital';
import WeeklyExpenses from './WeeklyExpenses';
import RevenueBreakdown from './RevenueBreakdown';
import MultiColorCalculator from './MultiColorCalculator';
import DailySalesReport from './DailySalesReport';
import RiskComplexityCalculator from './RiskComplexityCalculator';
import CatalogPriceCalculator from './CatalogPriceCalculator';
import { ChevronDown, Shield } from 'lucide-react';

export default function AdminManagement({ catalogProducts = [] }) {
  const [activeSubModule, setActiveSubModule] = useState('catalog-price-calc');

  return (
    <section style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '24px 24px 80px 24px'
    }}>
      {/* Sub-Module Selector Dropdown Bar */}
      <div className="clean-card" style={{
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        background: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: '#eff6ff',
            padding: '8px',
            borderRadius: '8px',
            color: '#2563eb'
          }}>
            <Shield size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              Fungsi & Manajemen Operasional Percetakan
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Pilih kalkulator harga jual katalog, pencatatan modal, pengeluaran mingguan, proyeksi omset, atau kalkulator matriks risiko.
            </div>
          </div>
        </div>

        {/* Dropdown Menu Selector */}
        <div style={{ position: 'relative', minWidth: '320px' }}>
          <select
            value={activeSubModule}
            onChange={(e) => setActiveSubModule(e.target.value)}
            className="input-custom"
            style={{
              paddingRight: '36px',
              fontWeight: 700,
              color: '#0f172a',
              cursor: 'pointer',
              border: '2px solid #2563eb',
              background: '#f8fafc'
            }}
          >
            <option value="catalog-price-calc">Kalkulator Harga Jual Katalog</option>
            <option value="daily-sales-report">Laporan Penjualan & Produksi Harian (Spreadsheet Sync)</option>
            <option value="risk-complexity-calc">Kalkulator Matrix & Risiko Print 3D (Smart Pricing)</option>
            <option value="initial-capital">Pencatatan Modal Awal</option>
            <option value="weekly-expenses">Pencatatan Pengeluaran Cetak Mingguan</option>
            <option value="revenue-breakdown">Perhitungan Omset Mingguan & Bulanan</option>
            <option value="multi-color-calc">Kalkulator Cetak Custom Multi-Warna</option>
          </select>
          <ChevronDown size={16} color="#2563eb" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Render Active Sub-Module */}
      {activeSubModule === 'catalog-price-calc' && <CatalogPriceCalculator />}
      {activeSubModule === 'daily-sales-report' && <DailySalesReport catalogProducts={catalogProducts} />}
      {activeSubModule === 'risk-complexity-calc' && <RiskComplexityCalculator />}
      {activeSubModule === 'initial-capital' && <InitialCapital />}
      {activeSubModule === 'weekly-expenses' && <WeeklyExpenses />}
      {activeSubModule === 'revenue-breakdown' && <RevenueBreakdown />}
      {activeSubModule === 'multi-color-calc' && <MultiColorCalculator />}
    </section>
  );
}
