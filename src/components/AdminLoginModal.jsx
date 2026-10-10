import React, { useState } from 'react';
import { X, Lock, User, Key, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminLoginModal({ onClose, onSuccessLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Secure Admin Auth check
    if (username.trim() === 'Equa3D' && password === 'Rikos4848?') {
      onSuccessLogin();
      onClose();
    } else {
      setErrorMsg('Username atau Password salah. Periksa kembali kredensial Anda.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '28px',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px auto'
          }}>
            <Lock size={22} color="#2563eb" />
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            Login Admin Studio
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '2px' }}>
            Masuk untuk mengelola katalog produk dan fitur admin.
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLoginSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 600, marginBottom: '4px' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="input-custom"
                placeholder="Masukkan Username Admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '34px' }}
                autoComplete="off"
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 600, marginBottom: '4px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Key size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                className="input-custom"
                placeholder="Masukkan Password Admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '34px' }}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '11px', marginTop: '6px', fontSize: '0.9rem' }}
          >
            <ShieldCheck size={16} />
            Masuk Sebagai Admin
          </button>
        </form>
      </div>
    </div>
  );
}
