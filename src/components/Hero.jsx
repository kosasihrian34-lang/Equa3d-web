import React from 'react';
import { Sparkles, Layers, CheckCircle2, Zap, ArrowRight } from 'lucide-react';

export default function Hero({ onExploreCatalog, onOpenEstimator }) {
  return (
    <section style={{
      position: 'relative',
      padding: '60px 24px 40px 24px',
      maxWidth: '1280px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      {/* Top Tag */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(0, 242, 254, 0.1)',
        border: '1px solid rgba(0, 242, 254, 0.3)',
        padding: '6px 16px',
        borderRadius: '30px',
        color: '#00f2fe',
        fontSize: '0.85rem',
        fontWeight: 700,
        marginBottom: '24px'
      }}>
        <Sparkles size={16} />
        FDM & SLA 3D PRINTING SERVICE STUDIO
      </div>

      {/* Main Title */}
      <h1 style={{
        fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
        fontWeight: 900,
        lineHeight: 1.15,
        marginBottom: '20px',
        maxWidth: '900px',
        margin: '0 auto 20px auto'
      }}>
        Wujudkan Imajinasi Digital Menjadi <br />
        <span className="text-gradient">Fisik Presisi Tinggi</span>
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: '1.05rem',
        color: '#94a3b8',
        maxWidth: '720px',
        margin: '0 auto 32px auto',
        lineHeight: 1.6
      }}>
        Katalog karya hasil cetak 3D printing terbaik kami untuk aksesoris, figurin art, sparepart mekanikal, dan maket arsitektur. Siap di-order langsung atau custom model STL Anda sendiri.
      </p>

      {/* Hero Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '48px'
      }}>
        <button onClick={onExploreCatalog} className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
          Jelajahi Katalog 3D
          <ArrowRight size={18} />
        </button>
        
        <button onClick={onOpenEstimator} className="btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
          <Zap size={18} color="#00f2fe" />
          Hitung Estimator Biaya
        </button>
      </div>

      {/* Stats Counter Bar */}
      <div className="glass-panel" style={{
        padding: '24px 32px',
        maxWidth: '960px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '24px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#00f2fe', fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800 }}>
            0.05mm
          </div>
          <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
            Resolusi Detail Resin SLA
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#7000ff', fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800 }}>
            4+ Jenis
          </div>
          <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
            Material (PLA, PETG, Resin, TPU)
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#10b981', fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800 }}>
            500+ Pcs
          </div>
          <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
            Model Berhasil Dibatalkan & Dicetak
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#f59e0b', fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800 }}>
            100% Lulus
          </div>
          <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
            Quality Control & Ketahanan
          </div>
        </div>
      </div>
    </section>
  );
}
