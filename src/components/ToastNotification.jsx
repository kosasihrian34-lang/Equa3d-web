import React, { useEffect } from 'react';
import { CheckCircle2, Heart, ShoppingBag, X, ArrowRight } from 'lucide-react';

export default function ToastNotification({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const getIcon = () => {
    if (toast.type === 'favorite') {
      return <Heart size={18} fill="#ef4444" color="#ef4444" />;
    }
    if (toast.type === 'unfavorite') {
      return <Heart size={18} color="#94a3b8" />;
    }
    if (toast.type === 'cart') {
      return <ShoppingBag size={18} color="#2563eb" />;
    }
    return <CheckCircle2 size={18} color="#16a34a" />;
  };

  const getBorderColor = () => {
    if (toast.type === 'favorite') return '#fecaca';
    if (toast.type === 'cart') return '#bfdbfe';
    return '#e2e8f0';
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: '#ffffff',
        border: `1px solid ${getBorderColor()}`,
        borderRadius: '12px',
        padding: '10px 16px',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.18), 0 8px 10px -6px rgba(15, 23, 42, 0.08)',
        animation: 'slideUpToast 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        maxWidth: '92vw',
        backdropFilter: 'blur(8px)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {getIcon()}
      </div>

      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {toast.message}
      </div>

      {toast.actionText && toast.onAction && (
        <button
          type="button"
          onClick={() => {
            toast.onAction();
            onClose();
          }}
          style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#2563eb',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0,
            transition: 'background 0.15s ease'
          }}
        >
          {toast.actionText}
          <ArrowRight size={13} />
        </button>
      )}

      <button
        type="button"
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0
        }}
        title="Tutup"
      >
        <X size={15} />
      </button>
    </div>
  );
}
