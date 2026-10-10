import React from 'react';
import { BookOpen, CheckCircle } from 'lucide-react';

export default function MaterialGuide() {
  const materials = [
    {
      name: "PLA & PLA Silk / Matte",
      type: "FDM Filament",
      colorClass: "badge-pla",
      badge: "Paling Populer & Estetis",
      strength: "Sedang (Baik)",
      flexibility: "Kaku",
      heatRes: "55°C",
      finish: "Mengkilap Silk / Smooth Matte",
      description: "Bahan organik ramah lingkungan dari pati jagung. Sangat ideal untuk gantungan kunci, bingkai foto, lampu tidur lithophane, dan hiasan dekorasi karena variasi warna yang banyak dan hasil permukaan halus.",
      bestFor: ["Gantungan Kunci / Keychain", "Lampu Tidur Lithophane 3D", "Bingkai Foto & Dekorasi", "Figurin & Aksesoris"]
    },
    {
      name: "PETG (Polyethylene Terephthalate)",
      type: "FDM Filament",
      colorClass: "badge-petg",
      badge: "Kuat & Tahan Benturan",
      strength: "Sangat Tinggi",
      flexibility: "Sedikit Lentur (Tahan Pecah)",
      heatRes: "75°C",
      finish: "Matte / Semi Gloss Industrial",
      description: "Filament berbahan lebih ulet dan tahan banting dibanding PLA. Sangat cocok untuk sparepart mesin, bracket, gantungan kunci outdoor yang sering jatuh, dan komponen teknis.",
      bestFor: ["Roda Gigi & Sparepart Mesin", "Keychain Heavy-Duty", "Bracket & Hanger", "Wadah & Tool Organizers"]
    }
  ];

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
          <BookOpen size={15} /> KNOWLEDGE BASE ADMIN
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          Panduan Bahan PLA & PETG
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
          Perbandingan karakteristik material cetak utama PLA vs PETG.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        {materials.map((mat, idx) => (
          <div key={idx} className="clean-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span className={`badge-filament ${mat.colorClass}`}>
                {mat.type}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 700 }}>
                {mat.badge}
              </span>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              {mat.name}
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, marginBottom: '16px' }}>
              {mat.description}
            </p>

            <div style={{
              background: '#f8fafc',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              marginBottom: '16px',
              border: '1px solid #f1f5f9'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Kekuatan Mekanis:</span>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>{mat.strength}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Kelenturan:</span>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>{mat.flexibility}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Ketahanan Suhu:</span>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>{mat.heatRes}</span>
              </div>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <div style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 700, marginBottom: '6px' }}>
                Aplikasi Penggunaan Terbaik:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {mat.bestFor.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                    <CheckCircle size={14} color="#16a34a" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
