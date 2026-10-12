import React, { useState } from 'react';
import { Copy, Check, Sparkles, AlertTriangle, Zap, DollarSign, Calculator } from 'lucide-react';

export default function RiskComplexityCalculator() {
  const [modelName, setModelName] = useState('Custom 3D Model Project');
  const [material, setMaterial] = useState('PLA');
  const [customRate, setCustomRate] = useState(450);
  const [weightGrams, setWeightGrams] = useState(120);
  const [printHours, setPrintHours] = useState(6);
  const [electricityHourlyRate, setElectricityHourlyRate] = useState(2500); // Rp 2.500/jam Listrik & Penyusutan

  // Complexity & Failure Risk Level: low (5%), medium (15%), high (30%)
  const [complexityLevel, setComplexityLevel] = useState('medium');

  // Additional Services
  const [removeSupport, setRemoveSupport] = useState(true);
  const [isRushOrder, setIsRushOrder] = useState(false);

  // Target Profit Margin %
  const [targetMargin, setTargetMargin] = useState(50); // 50% profit margin

  // Copy status state
  const [copied, setCopied] = useState(false);

  // Material Rate lookup
  const getRate = () => {
    if (material === 'PLA') return 450;
    if (material === 'PETG') return 550;
    return Number(customRate) || 450;
  };

  const ratePerGram = getRate();

  // Calculations
  const costMaterial = weightGrams * ratePerGram;
  const costElectricity = printHours * electricityHourlyRate;
  const rawHpp = costMaterial + costElectricity;

  // Failure Risk Allocations
  const riskPercentages = {
    low: 5,
    medium: 15,
    high: 30
  };

  const riskPercent = riskPercentages[complexityLevel] || 15;
  const riskCostAlloc = Math.round(rawHpp * (riskPercent / 100));

  // Addons
  const supportCost = removeSupport ? 10000 : 0;
  
  // Total Production HPP (Base HPP + Risk Cushion + Addons)
  const totalHpp = rawHpp + riskCostAlloc + supportCost;

  // Profit Calculation
  const profitMarginPercent = Number(targetMargin) || 50;
  const calculatedPriceBeforeRush = totalHpp * (1 + profitMarginPercent / 100);
  const rushFee = isRushOrder ? calculatedPriceBeforeRush * 0.25 : 0;

  // Recommended Final Selling Price (Rounded to nearest 1,000 IDR)
  const finalSellingPrice = Math.ceil((calculatedPriceBeforeRush + rushFee) / 1000) * 1000;
  const netProfit = finalSellingPrice - totalHpp;

  // Formatter
  const formatRupiah = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  // Draft WA Quotation Message Text
  const waQuotationText = `Halo Kak, berikut rincian resmi penawaran cetak 3D Equa3D:
📌 *Model*: ${modelName}
- Material: ${material} (${weightGrams} gram)
- Estimasi Lama Print: ${printHours} Jam
- Tingkat Detail/Kompleksitas: ${complexityLevel === 'low' ? 'Mudah / Datar' : complexityLevel === 'medium' ? 'Sedang (Standard Support)' : 'Tinggi / Overhang Detail'}
- Finishing: ${removeSupport ? 'Pembersihan Support Cleaned' : 'Raw Print'}
-----------------------------
💰 *Total Harga*: ${formatRupiah(finalSellingPrice)}
*(Sudah termasuk garansi cetak ulang gratis jika ada kegagalan produksi)*`;

  const handleCopyQuotation = () => {
    navigator.clipboard.writeText(waQuotationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {/* Left Input Matrix Form */}
        <div className="clean-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
            <Calculator size={16} color="#2563eb" /> 1. Parameter Produksi & Cetak
          </h4>

          {/* Model Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Nama Pesanan / Deskripsi Model 3D
            </label>
            <input
              type="text"
              className="input-custom"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="Contoh: Gearbox Custom / Statuet Character"
            />
          </div>

          {/* Material & Weight Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Jenis Material Filamen
              </label>
              <select className="input-custom" value={material} onChange={(e) => setMaterial(e.target.value)}>
                <option value="PLA">PLA (Rp 450/g)</option>
                <option value="PETG">PETG (Rp 550/g)</option>
                <option value="CUSTOM">Custom Rate</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Estimasi Berat (Gram)
              </label>
              <input
                type="number"
                min="1"
                className="input-custom"
                placeholder="150"
                value={weightGrams === '' ? '' : weightGrams}
                onFocus={(e) => e.target.select()}
                onClick={(e) => e.target.select()}
                onChange={(e) => setWeightGrams(e.target.value.replace(/^0+(?=\d)/, ''))}
              />
            </div>
          </div>

          {/* Custom rate if selected */}
          {material === 'CUSTOM' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Tarif Custom per Gram (Rp)
              </label>
              <input
                type="number"
                className="input-custom"
                placeholder="0"
                value={customRate === '' ? '' : customRate}
                onFocus={(e) => e.target.select()}
                onClick={(e) => e.target.select()}
                onChange={(e) => setCustomRate(e.target.value.replace(/^0+(?=\d)/, ''))}
              />
            </div>
          )}

          {/* Print Hours & Electricity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Estimasi Print (Jam)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.5"
                className="input-custom"
                placeholder="8"
                value={printHours === '' ? '' : printHours}
                onFocus={(e) => e.target.select()}
                onClick={(e) => e.target.select()}
                onChange={(e) => setPrintHours(e.target.value.replace(/^0+(?=\d)/, ''))}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Listrik & Mesin (Rp/Jam)
              </label>
              <input
                type="number"
                className="input-custom"
                placeholder="1500"
                value={electricityHourlyRate === '' ? '' : electricityHourlyRate}
                onFocus={(e) => e.target.select()}
                onClick={(e) => e.target.select()}
                onChange={(e) => setElectricityHourlyRate(e.target.value.replace(/^0+(?=\d)/, ''))}
              />
            </div>
          </div>

          {/* Complexity & Failure Risk Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
              2. Tingkat Kompleksitas & Risiko Fail Print
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { id: 'low', title: 'Mudah / Low', risk: '+5% Failure', color: '#16a34a', bg: '#f0fdf4' },
                { id: 'medium', title: 'Sedang / Mid', risk: '+15% Failure', color: '#b45309', bg: '#fffbeb' },
                { id: 'high', title: 'Rumit / High', risk: '+30% Failure', color: '#dc2626', bg: '#fef2f2' }
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setComplexityLevel(lvl.id)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '8px',
                    border: complexityLevel === lvl.id ? `2px solid ${lvl.color}` : '1px solid #cbd5e1',
                    background: complexityLevel === lvl.id ? lvl.bg : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: lvl.color }}>{lvl.title}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>{lvl.risk}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Addon checkboxes & Target Margin */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="removeSupport"
                checked={removeSupport}
                onChange={(e) => setRemoveSupport(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
              />
              <label htmlFor="removeSupport" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                Pembersihan Support & Deburring (+ Rp 10.000)
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="isRushOrder"
                checked={isRushOrder}
                onChange={(e) => setIsRushOrder(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
              />
              <label htmlFor="isRushOrder" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#dc2626', cursor: 'pointer' }}>
                Layanan Kilat Priority (+25% Biaya Rush)
              </label>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                  Target Margin Laba Bersih (%)
                </label>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2563eb' }}>
                  {targetMargin}%
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="150"
                step="5"
                value={targetMargin}
                onChange={(e) => setTargetMargin(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Right Smart Output Card & Quotation Generator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Summary Box */}
          <div className="clean-card" style={{ padding: '24px', background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="#2563eb" /> Matriks Harga & Keuntungan Real
            </h4>

            {/* Production Cost Breakdown Table */}
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: '#475569' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Bahan Baku Filamen:</span>
                <span>{formatRupiah(costMaterial)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Listrik & Mesin ({printHours} jam):</span>
                <span>{formatRupiah(costElectricity)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: complexityLevel === 'high' ? '#dc2626' : '#b45309' }}>
                <span>Alokasi Cadangan Risiko Fail ({riskPercent}%):</span>
                <span>+ {formatRupiah(riskCostAlloc)}</span>
              </div>
              {removeSupport && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Pembersihan Support:</span>
                  <span>+ Rp 10.000</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '6px', fontWeight: 700, color: '#0f172a' }}>
                <span>Total HPP Modal Real:</span>
                <span>{formatRupiah(totalHpp)}</span>
              </div>
            </div>

            {/* Highlighted Final Price & Net Profit */}
            <div style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Rekomendasi Harga Jual Ke Klien
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1e3a8a', marginTop: '2px' }}>
                {formatRupiah(finalSellingPrice)}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#16a34a', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <DollarSign size={15} /> Estimasi Laba Bersih Real: {formatRupiah(netProfit)} ({Math.round((netProfit / totalHpp) * 100)}% ROI)
              </div>
            </div>

            {/* Quick Action: Copy Quotation */}
            <button
              onClick={handleCopyQuotation}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.88rem',
                background: copied ? '#16a34a' : '#2563eb',
                transition: 'background 0.2s ease'
              }}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Teks Penawaran Berhasil Disalin!' : 'Salin Draf Penawaran Harga Ke WA'}
            </button>
          </div>

          {/* Quotation Preview Card */}
          <div className="clean-card" style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
              Preview Teks Penawaran WA Klien:
            </div>
            <pre style={{
              whiteSpace: 'pre-wrap',
              fontSize: '0.78rem',
              color: '#334155',
              fontFamily: 'sans-serif',
              background: '#ffffff',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              lineHeight: 1.5
            }}>
              {waQuotationText}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
