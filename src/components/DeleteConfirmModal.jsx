import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

export default function DeleteConfirmModal({ productTitle, onClose, onConfirmDelete }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '24px',
          position: 'relative',
          textAlign: 'center'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Warning Icon Header */}
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '12px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto'
        }}>
          <AlertTriangle size={26} />
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          Hapus Produk Katalog?
        </h3>

        <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '20px' }}>
          Apakah Anda yakin ingin menghapus produk <strong style={{ color: '#0f172a' }}>"{productTitle}"</strong> dari katalog? Tindakan ini tidak dapat dibatalkan.
        </p>

        {/* Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ width: '100%', padding: '10px' }}
          >
            Batal
          </button>
          
          <button
            onClick={onConfirmDelete}
            className="btn-danger"
            style={{
              width: '100%',
              padding: '10px',
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Trash2 size={16} />
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
