import React, { useState } from 'react';
import { Calculator, MessageSquare, Sparkles } from 'lucide-react';

export default function PriceEstimator() {
  const [material, setMaterial] = useState('PLA');
  const [weightGrams, setWeightGrams] = useState(150);
  const [layerResolution, setLayerResolution] = useState('0.20mm');
  const [finishing, setFinishing] = useState('raw');
  const [quantity, setQuantity] = useState(1);

  // Material rates per gram (Rp) - Focused strictly on PLA & PETG
  const rates = {
    PLA: 450,
    PETG: 550
  };

  // Resolution multiplier
  const resMultipliers = {
    '0.28mm': 0.9,
    '0.20mm': 1.0,
    '0.12mm': 1.3
  };

  // Finishing flat rate per piece
  const finishingRates = {
    raw: 0,
    sanded: 35000,
    painted: 85000
  };

  // Calculate Subtotals
  const baseMaterialCost = (rates[material] || 450) * weightGrams;
  const resolutionMultiplier = resMultipliers[layerResolution] || 1.0;
  const printCostPerPcs = Math.round((baseMaterialCost * resolutionMultiplier) + (finishingRates[finishing] || 0) + 10000);
  const totalCost = printCostPerPcs * quantity;

  const formattedTotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(totalCost);

  const formattedPerPcs = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(printCostPerPcs);

  const waEstimateMsg = encodeURIComponent(
    `Halo Equa3D, kalkulasi estimasi cetak 3D:\n- Material: ${material}\n- Berat: ${weightGrams}g\n- Resolusi: ${layerResolution}\n- Finishing: ${finishing}\n- Jumlah: ${quantity} pcs\n- Estimasi Biaya: ${formattedTotal}`
  );

  return (
    <section style={{
      maxWidth: '960px',
      margin: '0 auto',
      padding: '32px 24px 80px 24px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: '#eff6ff',
          color: '#2563eb',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '8px'
        }}>
          <Calculator size={15} /> TOOLS ADMIN
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          Estimator Biaya Cetak 3D (PLA & PETG)
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
          Kalkulator estimasi biaya berbasis material PLA/PETG, berat gram, dan resolusi layer.
        </p>
      </div>

      <div className="clean-card" style={{
        padding: '28px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '28px'
      }}>
        {/* Left Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* 1. Material */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              1. Pilih Jenis Material
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { id: 'PLA', label: 'PLA (Silk / Standard)', rate: 'Rp 450/g' },
                { id: 'PETG', label: 'PETG Strong', rate: 'Rp 550/g' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMaterial(m.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: material === m.id ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: material === m.id ? '#eff6ff' : '#ffffff',
                    color: material === m.id ? '#2563eb' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div>{m.label}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{m.rate}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Weight */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                2. Estimasi Berat (Gram)
              </label>
              <span style={{ color: '#2563eb', fontWeight: 800 }}>
                {weightGrams} gram
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="800"
              step="5"
              value={weightGrams}
              onChange={(e) => setWeightGrams(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
            />
          </div>

          {/* 3. Layer Height */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              3. Presisi Layer Height
            </label>
            <select
              className="input-custom"
              value={layerResolution}
              onChange={(e) => setLayerResolution(e.target.value)}
            >
              <option value="0.28mm">0.28mm - Fast Draft Print</option>
              <option value="0.20mm">0.20mm - Standard Balanced (Rekomendasi)</option>
              <option value="0.12mm">0.12mm - Fine High Detail</option>
            </select>
          </div>

          {/* 4. Finishing */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              4. Opsi Finishing
            </label>
            <select
              className="input-custom"
              value={finishing}
              onChange={(e) => setFinishing(e.target.value)}
            >
              <option value="raw">Raw 3D Print (Selesai Cetak)</option>
              <option value="sanded">Amplas & Primer (+ Rp 35.000)</option>
              <option value="painted">Full Hand Painting (+ Rp 85.000)</option>
            </select>
          </div>

          {/* 5. Quantity */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              5. Jumlah Cetak (Pcs)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              className="input-custom"
              value={quantity === 0 || quantity === '0' ? '' : quantity}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                const val = e.target.value.replace(/^0+(?=\d)/, '');
                setQuantity(val === '' ? '' : Math.max(1, parseInt(val) || 1));
              }}
            />
          </div>
        </div>

        {/* Right Output Summary Box */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="#2563eb" />
              Rincian Biaya Cetak
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem', color: '#475569' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Bahan ({material}):</span>
                <span>Rp {rates[material]} x {weightGrams}g</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Layer ({layerResolution}):</span>
                <span>x {resMultipliers[layerResolution]}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Finishing:</span>
                <span>{finishing === 'raw' ? 'Rp 0' : `+ Rp ${finishingRates[finishing].toLocaleString()}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Biaya Per Pcs:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{formattedPerPcs}</span>
              </div>
            </div>

            <div style={{
              margin: '20px 0 16px 0',
              paddingTop: '14px',
              borderTop: '1px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Perkiraan Biaya
              </div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 900,
                color: '#2563eb',
                marginTop: '2px'
              }}>
                {formattedTotal}
              </div>
            </div>
          </div>

          <a
            href={`https://wa.me/6282373119291?text=${waEstimateMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-wa"
            style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
          >
            <MessageSquare size={16} />
            Kirim Hasil Estimasi Ke WA
          </a>
        </div>
      </div>
    </section>
  );
}
