import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, Plus, Trash2, Edit2, Save, Printer, FileText, 
  Image as ImageIcon, Check, X, Cloud, RefreshCw, Upload, 
  Eye, User, Users, Landmark, AlertCircle, ArrowUpRight, 
  ChevronRight, Calendar, Tag, DollarSign, Info, Download
} from 'lucide-react';
import DeleteConfirmModal from '../DeleteConfirmModal';
import {
  subscribeToCapitalFunds,
  saveCloudCapitalFund,
  saveAllCloudCapitalFunds,
  deleteCloudCapitalFund,
  seedCapitalFundsIfEmpty,
  subscribeToCapitalItems,
  saveCloudCapitalItem,
  saveAllCloudCapitalItems,
  deleteCloudCapitalItem,
  seedCapitalItemsIfEmpty
} from '../../firebase';

// Initial default data: serba kosong agar user bisa input data real dari awal
const DEFAULT_FUNDS = [];
const DEFAULT_ITEMS = [];

// Helper to identify previous dummy records
const isDummyFundId = (id) => typeof id === 'string' && (id === 'fund-1' || id === 'fund-2' || id === 'fund-3');
const isDummyItemId = (id) => typeof id === 'string' && (id === 'item-1' || id === 'item-2' || id === 'item-3' || id === 'item-4');

export default function InitialCapital() {
  // Active Tab: 'items' (Belanja Aset) | 'funds' (Pemasukan Uang Modal) - Persisted across refresh
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('forge3d_initial_capital_tab') || 'items';
  });

  useEffect(() => {
    try {
      localStorage.setItem('forge3d_initial_capital_tab', activeTab);
    } catch (e) {}
  }, [activeTab]);

  // Funds State (Bersih dari dummy)
  const [funds, setFunds] = useState(() => {
    const saved = localStorage.getItem('forge3d_initial_capital_funds');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(f => f && !isDummyFundId(f.id));
          return cleaned;
        }
      } catch (e) {}
    }
    return [];
  });

  // Items State (Bersih dari dummy)
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('forge3d_initial_capital_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(it => it && !isDummyItemId(it.id));
          return cleaned;
        }
      } catch (e) {}
    }
    return [];
  });

  // Cloud Sync State
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  // Modals
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [editingFund, setEditingFund] = useState(null);
  const [fundToDelete, setFundToDelete] = useState(null);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [previewReceiptUrl, setPreviewReceiptUrl] = useState(null);
  const [isPreviewPrintOpen, setIsPreviewPrintOpen] = useState(false);

  // Forms
  const todayStr = new Date().toISOString().split('T')[0];

  const [fundForm, setFundForm] = useState({
    date: todayStr,
    source: 'Pribadi',
    funderName: '',
    amount: '',
    notes: ''
  });

  const [itemForm, setItemForm] = useState({
    date: todayStr,
    name: '',
    category: 'Mesin / Hardware',
    fundingSource: 'Pribadi',
    price: '',
    qty: 1,
    receiptPhoto: '',
    notes: ''
  });

  const [isSavingFund, setIsSavingFund] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);

  // Local storage backups
  useEffect(() => {
    try {
      localStorage.setItem('forge3d_initial_capital_funds', JSON.stringify(funds));
    } catch (e) {}
  }, [funds]);

  useEffect(() => {
    try {
      localStorage.setItem('forge3d_initial_capital_items', JSON.stringify(items));
    } catch (e) {}
  }, [items]);

  // Real-time Cloud Sync with Firestore
  useEffect(() => {
    setIsCloudSyncing(true);

    // 1. Subscribe to Funds (Filter out any legacy dummy records)
    const unsubFunds = subscribeToCapitalFunds(async (cloudFunds) => {
      const cleanCloudFunds = Array.isArray(cloudFunds) 
        ? cloudFunds.filter(f => f && !isDummyFundId(f.id))
        : [];

      const localRaw = localStorage.getItem('forge3d_initial_capital_funds');
      let localList = [];
      if (localRaw) {
        try { 
          const parsed = JSON.parse(localRaw);
          if (Array.isArray(parsed)) localList = parsed.filter(f => f && !isDummyFundId(f.id));
        } catch (e) {}
      }

      if (cleanCloudFunds.length > 0) {
        const missingInCloud = localList.filter(locItem => 
          locItem && locItem.id && !cleanCloudFunds.some(cItem => String(cItem.id) === String(locItem.id))
        );

        if (missingInCloud.length > 0) {
          try {
            await saveAllCloudCapitalFunds(missingInCloud);
          } catch (e) {}
          const mergedMap = new Map();
          cleanCloudFunds.forEach(item => mergedMap.set(String(item.id), item));
          missingInCloud.forEach(item => mergedMap.set(String(item.id), item));
          const mergedList = Array.from(mergedMap.values());
          setFunds(mergedList);
          localStorage.setItem('forge3d_initial_capital_funds', JSON.stringify(mergedList));
        } else {
          setFunds(cleanCloudFunds);
          localStorage.setItem('forge3d_initial_capital_funds', JSON.stringify(cleanCloudFunds));
        }
      } else {
        // Cloud is empty, use clean local records if available, otherwise stay clean & empty
        setFunds(localList);
        localStorage.setItem('forge3d_initial_capital_funds', JSON.stringify(localList));
      }
      setIsCloudSyncing(false);
    }, () => setIsCloudSyncing(false));

    // 2. Subscribe to Items (Filter out any legacy dummy records)
    const unsubItems = subscribeToCapitalItems(async (cloudItems) => {
      const cleanCloudItems = Array.isArray(cloudItems)
        ? cloudItems.filter(it => it && !isDummyItemId(it.id))
        : [];

      const localRaw = localStorage.getItem('forge3d_initial_capital_items');
      let localList = [];
      if (localRaw) {
        try {
          const parsed = JSON.parse(localRaw);
          if (Array.isArray(parsed)) localList = parsed.filter(it => it && !isDummyItemId(it.id));
        } catch (e) {}
      }

      if (cleanCloudItems.length > 0) {
        const missingInCloud = localList.filter(locItem => 
          locItem && locItem.id && !cleanCloudItems.some(cItem => String(cItem.id) === String(locItem.id))
        );

        if (missingInCloud.length > 0) {
          try {
            await saveAllCloudCapitalItems(missingInCloud);
          } catch (e) {}
          const mergedMap = new Map();
          cleanCloudItems.forEach(item => mergedMap.set(String(item.id), item));
          missingInCloud.forEach(item => mergedMap.set(String(item.id), item));
          const mergedList = Array.from(mergedMap.values());
          setItems(mergedList);
          localStorage.setItem('forge3d_initial_capital_items', JSON.stringify(mergedList));
        } else {
          setItems(cleanCloudItems);
          localStorage.setItem('forge3d_initial_capital_items', JSON.stringify(cleanCloudItems));
        }
      } else {
        // Cloud is empty, use clean local records if available, otherwise stay clean & empty
        setItems(localList);
        localStorage.setItem('forge3d_initial_capital_items', JSON.stringify(localList));
      }
      setIsCloudSyncing(false);
    }, () => setIsCloudSyncing(false));

    return () => {
      if (unsubFunds) unsubFunds();
      if (unsubItems) unsubItems();
    };
  }, []);

  // Format currency
  const formatRp = (val) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Calculations
  const totalDanaPribadi = funds.filter(f => f.source === 'Pribadi').reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const totalDanaOrtu = funds.filter(f => f.source === 'Orang Tua').reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const totalDanaInvestor = funds.filter(f => f.source === 'Investor').reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const totalModalKeseluruhan = totalDanaPribadi + totalDanaOrtu + totalDanaInvestor;

  const totalBelanjaAset = items.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.qty) || 1)), 0);
  const sisaKasModal = totalModalKeseluruhan - totalBelanjaAset;

  // Percentages
  const pctPribadi = totalModalKeseluruhan > 0 ? Math.round((totalDanaPribadi / totalModalKeseluruhan) * 100) : 0;
  const pctOrtu = totalModalKeseluruhan > 0 ? Math.round((totalDanaOrtu / totalModalKeseluruhan) * 100) : 0;
  const pctInvestor = totalModalKeseluruhan > 0 ? Math.round((totalDanaInvestor / totalModalKeseluruhan) * 100) : 0;

  // Canvas Image Compression helper for receipt photo
  const handleReceiptPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 900;
        const MAX_HEIGHT = 900;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        setItemForm(prev => ({ ...prev, receiptPhoto: compressed }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Manual Cloud Sync
  const handleManualSyncToCloud = async () => {
    setIsCloudSyncing(true);
    setSyncStatusMsg('Sedang menyinkronkan data modal ke Cloud...');
    try {
      await saveAllCloudCapitalFunds(funds);
      await saveAllCloudCapitalItems(items);
      setSyncStatusMsg('Semua data modal & belanja tersinkron!');
      alert(`✅ Berhasil!\n\nSebanyak ${funds.length} data sumber modal dan ${items.length} rincian belanja aset beserta struk telah tersimpan di Cloud Firestore.\nData sekarang otomatis tampil di HP dan perangkat lain tanpa reset.`);
      setTimeout(() => setSyncStatusMsg(''), 4000);
    } catch (err) {
      alert("Gagal sinkron ke Cloud: " + (err.message || "Periksa koneksi internet"));
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Fund Handlers
  const handleOpenAddFund = () => {
    setEditingFund(null);
    setFundForm({
      date: todayStr,
      source: 'Pribadi',
      funderName: '',
      amount: '',
      notes: ''
    });
    setIsFundModalOpen(true);
  };

  const handleOpenEditFund = (f) => {
    setEditingFund(f);
    setFundForm({
      date: f.date || todayStr,
      source: f.source || 'Pribadi',
      funderName: f.funderName || '',
      amount: f.amount || '',
      notes: f.notes || ''
    });
    setIsFundModalOpen(true);
  };

  const handleSaveFund = async (e) => {
    e.preventDefault();
    if (!fundForm.amount) {
      alert("Jumlah uang modal wajib diisi!");
      return;
    }

    setIsSavingFund(true);
    const amountNum = Number(fundForm.amount) || 0;
    const fundData = {
      id: editingFund ? editingFund.id : `fund-${Date.now()}`,
      date: fundForm.date || todayStr,
      source: fundForm.source,
      funderName: fundForm.funderName.trim() || fundForm.source,
      amount: amountNum,
      notes: fundForm.notes.trim()
    };

    try {
      if (editingFund) {
        const updated = funds.map(f => f.id === editingFund.id ? fundData : f);
        setFunds(updated);
        localStorage.setItem('forge3d_initial_capital_funds', JSON.stringify(updated));
        await saveCloudCapitalFund(fundData);
      } else {
        const updated = [...funds, fundData];
        setFunds(updated);
        localStorage.setItem('forge3d_initial_capital_funds', JSON.stringify(updated));
        await saveCloudCapitalFund(fundData);
      }
      setIsFundModalOpen(false);
    } catch (err) {
      console.error("Gagal simpan dana ke Cloud:", err);
      alert("Data tersimpan di lokal (Cloud notice: " + (err.message || "koneksi offline") + ")");
      setIsFundModalOpen(false);
    } finally {
      setIsSavingFund(false);
    }
  };

  const handleConfirmDeleteFund = async () => {
    if (fundToDelete) {
      const delId = fundToDelete.id;
      const updated = funds.filter(f => f.id !== delId);
      setFunds(updated);
      localStorage.setItem('forge3d_initial_capital_funds', JSON.stringify(updated));
      setFundToDelete(null);
      try {
        await deleteCloudCapitalFund(delId);
      } catch (e) {}
    }
  };

  // Item Handlers
  const handleOpenAddItem = () => {
    setEditingItem(null);
    setItemForm({
      date: todayStr,
      name: '',
      category: 'Mesin / Hardware',
      fundingSource: 'Pribadi',
      price: '',
      qty: 1,
      receiptPhoto: '',
      notes: ''
    });
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      date: item.date || todayStr,
      name: item.name || '',
      category: item.category || 'Mesin / Hardware',
      fundingSource: item.fundingSource || 'Pribadi',
      price: item.price || '',
      qty: item.qty || 1,
      receiptPhoto: item.receiptPhoto || '',
      notes: item.notes || ''
    });
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemForm.name || !itemForm.price) {
      alert("Nama barang dan harga satuan wajib diisi!");
      return;
    }

    setIsSavingItem(true);
    const itemData = {
      id: editingItem ? editingItem.id : `item-${Date.now()}`,
      date: itemForm.date || todayStr,
      name: itemForm.name.trim(),
      category: itemForm.category,
      fundingSource: itemForm.fundingSource,
      price: Number(itemForm.price) || 0,
      qty: Number(itemForm.qty) || 1,
      receiptPhoto: itemForm.receiptPhoto || '',
      notes: itemForm.notes.trim()
    };

    try {
      if (editingItem) {
        const updated = items.map(it => it.id === editingItem.id ? itemData : it);
        setItems(updated);
        localStorage.setItem('forge3d_initial_capital_items', JSON.stringify(updated));
        await saveCloudCapitalItem(itemData);
      } else {
        const updated = [...items, itemData];
        setItems(updated);
        localStorage.setItem('forge3d_initial_capital_items', JSON.stringify(updated));
        await saveCloudCapitalItem(itemData);
      }
      setIsItemModalOpen(false);
    } catch (err) {
      console.error("Gagal simpan aset ke Cloud:", err);
      alert("Data tersimpan di lokal (Cloud notice: " + (err.message || "koneksi offline") + ")");
      setIsItemModalOpen(false);
    } finally {
      setIsSavingItem(false);
    }
  };

  const handleConfirmDeleteItem = async () => {
    if (itemToDelete) {
      const delId = itemToDelete.id;
      const updated = items.filter(it => it.id !== delId);
      setItems(updated);
      localStorage.setItem('forge3d_initial_capital_items', JSON.stringify(updated));
      setItemToDelete(null);
      try {
        await deleteCloudCapitalItem(delId);
      } catch (e) {}
    }
  };

  // Trigger Native Landscape Print
  const handlePrintLandscape = () => {
    setIsPreviewPrintOpen(true);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div style={{ background: '#ffffff', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      
      {/* Printable Style Sheet specifically formatted for Landscape PDF */}
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 10mm 12mm 10mm 12mm;
          }
          body * {
            visibility: hidden;
          }
          #printable-pdf-section, #printable-pdf-section * {
            visibility: visible;
          }
          #printable-pdf-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Screen Header Bar */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#eff6ff', color: '#2563eb', padding: '8px', borderRadius: '10px', display: 'flex' }}>
              <Wallet size={22} />
            </div>
            Pencatatan Modal Awal Usaha (Alokasi Dana & Belanja Aset)
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            Catat penerimaan uang modal (Pribadi, Orang Tua, Investor), rincian belanja aset dengan foto struk, dan ekspor laporan PDF landscape resmi.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.74rem',
              fontWeight: 700,
              background: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              padding: '3px 10px',
              borderRadius: '6px'
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              <Cloud size={13} /> Cloud Firestore Terhubung (Real-Time Sinkron Semua Perangkat)
            </span>

            <button
              type="button"
              onClick={handleManualSyncToCloud}
              disabled={isCloudSyncing}
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '6px',
                cursor: isCloudSyncing ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Upload semua data saat ini ke Cloud Firestore agar HP & browser lain ter-update"
            >
              <RefreshCw size={12} style={{ animation: isCloudSyncing ? 'spin 1s linear infinite' : 'none' }} />
              {isCloudSyncing ? 'Menyinkronkan...' : 'Upload/Sinkron Semua Data ke Cloud'}
            </button>

            {syncStatusMsg && (
              <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600 }}>{syncStatusMsg}</span>
            )}
          </div>
        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handlePrintLandscape}
            className="btn-secondary"
            style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', borderColor: '#2563eb', color: '#2563eb' }}
            title="Download atau cetak dokumen PDF Landscape untuk Investor"
          >
            <Printer size={16} /> 📄 Cetak / Download PDF (Landscape)
          </button>

          <button
            onClick={handleOpenAddFund}
            className="btn-secondary"
            style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} color="#2563eb" /> + Masukin Uang Modal
          </button>

          <button
            onClick={handleOpenAddItem}
            className="btn-primary"
            style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px' }}
          >
            <Plus size={16} /> + Catat Belanja & Struk
          </button>
        </div>
      </div>

      {/* KPI Cards: Sumber Modal Breakdown & Sisa Saldo */}
      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        
        {/* Card 1: Total Modal Keseluruhan */}
        <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', color: '#ffffff', borderRadius: '12px', padding: '18px', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.9 }}>
            Total Uang Modal Masuk
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '4px' }}>
            {formatRp(totalModalKeseluruhan)}
          </div>
          <div style={{ fontSize: '0.74rem', opacity: 0.85, marginTop: '4px' }}>
            Akumulasi dari Pribadi + Orang Tua + Investor
          </div>
        </div>

        {/* Card 2: Modal Pribadi */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.76rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>Modal Pribadi</span>
            <span style={{ background: '#e0e7ff', color: '#3730a3', fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>{pctPribadi}%</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#1e293b', marginTop: '4px' }}>
            {formatRp(totalDanaPribadi)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
            {funds.filter(f => f.source === 'Pribadi').length} Setoran dana mandiri
          </div>
        </div>

        {/* Card 3: Modal Orang Tua */}
        <div style={{ background: '#fdf4ff', border: '1px solid #f5d0fe', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.76rem', color: '#86198f', fontWeight: 700, textTransform: 'uppercase' }}>Modal Orang Tua</span>
            <span style={{ background: '#fae8ff', color: '#a21caf', fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>{pctOrtu}%</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#a21caf', marginTop: '4px' }}>
            {formatRp(totalDanaOrtu)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#86198f', marginTop: '2px' }}>
            {funds.filter(f => f.source === 'Orang Tua').length} Bantuan keluarga
          </div>
        </div>

        {/* Card 4: Modal Investor */}
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.76rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>Modal Investor</span>
            <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>{pctInvestor}%</span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#15803d', marginTop: '4px' }}>
            {formatRp(totalDanaInvestor)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#166534', marginTop: '2px' }}>
            {funds.filter(f => f.source === 'Investor').length} Investor penyandang dana
          </div>
        </div>

        {/* Card 5: Realisasi Belanja vs Sisa Kas */}
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.76rem', color: '#92400e', fontWeight: 700, textTransform: 'uppercase' }}>Sisa Kas Modal</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: sisaKasModal >= 0 ? '#15803d' : '#dc2626' }}>
              {sisaKasModal >= 0 ? 'Surplus' : 'Defisit'}
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: sisaKasModal >= 0 ? '#15803d' : '#dc2626', marginTop: '4px' }}>
            {formatRp(sisaKasModal)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#78350f', marginTop: '2px' }}>
            Total Terpakai Belanja: <strong>{formatRp(totalBelanjaAset)}</strong>
          </div>
        </div>
      </div>

      {/* Tabs Navigation: Belanja Aset & Struk vs Sumber Uang Modal */}
      <div className="no-print" style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('items')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'items' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'items' ? '#2563eb' : '#64748b',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '-2px'
          }}
        >
          <FileText size={16} /> Rincian Belanja Aset & Foto Struk ({items.length} Barang)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('funds')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'transparent',
            borderBottom: activeTab === 'funds' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'funds' ? '#2563eb' : '#64748b',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '-2px'
          }}
        >
          <Landmark size={16} /> Riwayat Sumber Dana Modal ({funds.length} Setoran)
        </button>
      </div>

      {/* TAB 1: Rincian Belanja Aset & Foto Struk */}
      {activeTab === 'items' && (
        <div className="no-print">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>
              Daftar seluruh mesin, bahan, dan peralatan modal yang telah dibelanjakan beserta bukti struk untuk pelaporan investor.
            </div>
            <button
              onClick={handleOpenAddItem}
              className="btn-primary"
              style={{ fontSize: '0.82rem', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} /> + Tambah Belanja Aset & Struk
            </button>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#334155', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '12px 10px', width: '45px', textAlign: 'center' }}>No.</th>
                  <th style={{ padding: '12px 10px', width: '90px', textAlign: 'center' }}>Foto Struk</th>
                  <th style={{ padding: '12px 12px' }}>Tanggal</th>
                  <th style={{ padding: '12px 14px', minWidth: '180px' }}>Nama Barang / Aset</th>
                  <th style={{ padding: '12px 12px' }}>Kategori</th>
                  <th style={{ padding: '12px 12px' }}>Sumber Dana</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '12px 12px', textAlign: 'right' }}>Harga Satuan</th>
                  <th style={{ padding: '12px 12px', textAlign: 'right', background: '#eff6ff', color: '#1e40af' }}>Subtotal Belanja</th>
                  <th style={{ padding: '12px 12px', textAlign: 'center', width: '85px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                      Belum ada data belanja aset modal. Klik tombol <strong>+ Tambah Belanja Aset & Struk</strong> untuk mulai mencatat.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => {
                    const subtotal = (Number(item.price) || 0) * (Number(item.qty) || 1);

                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                        <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 700, color: '#64748b' }}>{idx + 1}</td>
                        
                        {/* Struk Foto Thumbnail */}
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          {item.receiptPhoto ? (
                            <div 
                              onClick={() => setPreviewReceiptUrl(item.receiptPhoto)}
                              style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}
                              title="Klik untuk zoom struk"
                            >
                              <img
                                src={item.receiptPhoto}
                                alt="Struk"
                                style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                              />
                              <div style={{
                                position: 'absolute',
                                bottom: '2px',
                                right: '2px',
                                background: 'rgba(15,23,42,0.75)',
                                color: '#ffffff',
                                borderRadius: '4px',
                                padding: '2px',
                                display: 'flex'
                              }}>
                                <Eye size={10} />
                              </div>
                            </div>
                          ) : (
                            <div style={{ width: '48px', height: '48px', background: '#f1f5f9', borderRadius: '8px', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#94a3b8' }} title="Belum ada foto struk">
                              <ImageIcon size={18} />
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '12px', color: '#64748b' }}>{item.date || '-'}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.name}</div>
                          {item.notes && <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{item.notes}</div>}
                        </td>
                        <td style={{ padding: '12px', color: '#475569' }}>
                          <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 600 }}>
                            {item.category}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            background: item.fundingSource === 'Investor' ? '#dcfce7' : item.fundingSource === 'Orang Tua' ? '#fae8ff' : '#eff6ff',
                            color: item.fundingSource === 'Investor' ? '#15803d' : item.fundingSource === 'Orang Tua' ? '#86198f' : '#1d4ed8',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.74rem',
                            fontWeight: 700
                          }}>
                            {item.fundingSource}
                          </span>
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 700 }}>{item.qty} pcs</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#475569' }}>{formatRp(item.price)}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 900, color: '#1e40af', background: '#f8fafc' }}>{formatRp(subtotal)}</td>
                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleOpenEditItem(item)}
                              style={{ background: '#eff6ff', border: 'none', color: '#2563eb', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
                              title="Edit Belanja Aset"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => setItemToDelete(item)}
                              style={{ background: '#fef2f2', border: 'none', color: '#dc2626', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
                              title="Hapus Belanja Aset"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f1f5f9', borderTop: '2px solid #cbd5e1', fontWeight: 900 }}>
                  <td colSpan="8" style={{ padding: '12px 14px', textAlign: 'right', color: '#0f172a' }}>TOTAL KESELURUHAN BELANJA MODAL ASET:</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#2563eb', fontSize: '1rem', background: '#eff6ff' }}>{formatRp(totalBelanjaAset)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Riwayat Pemasukan Uang Modal */}
      {activeTab === 'funds' && (
        <div className="no-print">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>
              Catatan dana modal masuk dari kantong pribadi, bantuan orang tua, dan investor yang terkumpul.
            </div>
            <button
              onClick={handleOpenAddFund}
              className="btn-primary"
              style={{ fontSize: '0.82rem', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} /> + Masukin Uang Modal Baru
            </button>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#334155', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '12px 10px', width: '45px', textAlign: 'center' }}>No.</th>
                  <th style={{ padding: '12px 12px' }}>Tanggal Setor</th>
                  <th style={{ padding: '12px 12px' }}>Kategori Sumber</th>
                  <th style={{ padding: '12px 14px' }}>Nama Penyandang Dana / Identitas</th>
                  <th style={{ padding: '12px 14px' }}>Keterangan / Catatan</th>
                  <th style={{ padding: '12px 12px', textAlign: 'right', background: '#eff6ff', color: '#1e40af' }}>Jumlah Modal (Rp)</th>
                  <th style={{ padding: '12px 12px', textAlign: 'center', width: '85px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {funds.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                      Belum ada data uang modal masuk. Klik tombol <strong>+ Masukin Uang Modal Baru</strong>.
                    </td>
                  </tr>
                ) : (
                  funds.map((f, idx) => (
                    <tr key={f.id} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 700, color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ padding: '12px', color: '#64748b' }}>{f.date || '-'}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          background: f.source === 'Investor' ? '#dcfce7' : f.source === 'Orang Tua' ? '#fae8ff' : '#eff6ff',
                          color: f.source === 'Investor' ? '#15803d' : f.source === 'Orang Tua' ? '#86198f' : '#1d4ed8',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.74rem',
                          fontWeight: 700
                        }}>
                          {f.source}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0f172a' }}>{f.funderName}</td>
                      <td style={{ padding: '12px 14px', color: '#64748b' }}>{f.notes || '-'}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 900, color: '#1e40af', background: '#f8fafc' }}>
                        {formatRp(f.amount)}
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleOpenEditFund(f)}
                            style={{ background: '#eff6ff', border: 'none', color: '#2563eb', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Edit Modal"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => setFundToDelete(f)}
                            style={{ background: '#fef2f2', border: 'none', color: '#dc2626', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Hapus Modal"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f1f5f9', borderTop: '2px solid #cbd5e1', fontWeight: 900 }}>
                  <td colSpan="5" style={{ padding: '12px 14px', textAlign: 'right', color: '#0f172a' }}>TOTAL MODAL MASUK KESELURUHAN:</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#2563eb', fontSize: '1rem', background: '#eff6ff' }}>{formatRp(totalModalKeseluruhan)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINTABLE PDF REPORT VIEW (Formatted for Landscape Print / PDF Download) */}
      {/* ========================================================================= */}
      <div id="printable-pdf-section" style={{ display: isPreviewPrintOpen ? 'block' : 'none' }}>
        <div style={{ padding: '24px', background: '#ffffff', color: '#0f172a', fontFamily: 'sans-serif' }}>
          
          {/* Print Toolbar for Screen only */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '12px 16px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e40af' }}>
              📄 Pratinjau Dokumen PDF Landscape untuk Investor & Pelaporan
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => window.print()}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
              >
                <Printer size={15} /> Cetak / Download PDF Sekarang
              </button>
              <button
                onClick={() => setIsPreviewPrintOpen(false)}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.82rem' }}
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>

          {/* Letterhead Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '14px', marginBottom: '16px' }}>
            <div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                EQUA3D PRINTING
              </h1>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2563eb', marginTop: '2px' }}>
                LAPORAN PERTANGGUNGJAWABAN ALOKASI MODAL AWAL & REALISASI BELANJA ASET
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                Workshop & Percetakan 3D Presisi | Dokumen Resmi Pelaporan Investor & Manajemen
              </div>
            </div>

            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#475569' }}>
              <div><strong>Tanggal Cetak:</strong> {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div><strong>Format:</strong> Landscape PDF Report</div>
              <div><strong>Status:</strong> Terverifikasi Transparan</div>
            </div>
          </div>

          {/* Executive Summary Grid for Investors */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '18px' }}>
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>Total Modal Masuk</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>{formatRp(totalModalKeseluruhan)}</div>
            </div>

            <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>Modal Pribadi ({pctPribadi}%)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e3a8a', marginTop: '2px' }}>{formatRp(totalDanaPribadi)}</div>
            </div>

            <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>Modal Orang Tua ({pctOrtu}%)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#86198f', marginTop: '2px' }}>{formatRp(totalDanaOrtu)}</div>
            </div>

            <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>Modal Investor ({pctInvestor}%)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#15803d', marginTop: '2px' }}>{formatRp(totalDanaInvestor)}</div>
            </div>

            <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px', background: sisaKasModal >= 0 ? '#f0fdf4' : '#fef2f2' }}>
              <div style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>Sisa Kas Modal</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: sisaKasModal >= 0 ? '#15803d' : '#dc2626', marginTop: '2px' }}>{formatRp(sisaKasModal)}</div>
            </div>
          </div>

          {/* Section: Rincian Belanja Aset & Struk */}
          <div style={{ marginBottom: '18px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
              1. Tabel Rincian Belanja Aset & Bukti Struk Pembayaran
            </h4>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.74rem', border: '1px solid #cbd5e1' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', color: '#1e293b', borderBottom: '1px solid #94a3b8' }}>
                  <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', width: '30px', textAlign: 'center' }}>No</th>
                  <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', width: '85px', textAlign: 'center' }}>Bukti Struk</th>
                  <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', width: '75px' }}>Tanggal</th>
                  <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>Nama Barang / Aset</th>
                  <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>Kategori</th>
                  <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1' }}>Sumber Dana</th>
                  <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', width: '40px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '6px 8px', borderRight: '1px solid #cbd5e1', textAlign: 'right' }}>Harga Satuan</th>
                  <th style={{ padding: '6px 8px', textAlign: 'right', background: '#f8fafc' }}>Subtotal (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => {
                  const sub = (Number(it.price) || 0) * (Number(it.qty) || 1);
                  return (
                    <tr key={it.id} style={{ borderBottom: '1px solid #cbd5e1', pageBreakInside: 'avoid' }}>
                      <td style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid #cbd5e1', fontWeight: 700 }}>{idx + 1}</td>
                      <td style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>
                        {it.receiptPhoto ? (
                          <img
                            src={it.receiptPhoto}
                            alt="Struk"
                            style={{ width: '70px', height: '65px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #94a3b8', display: 'block', margin: '0 auto' }}
                          />
                        ) : (
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontStyle: 'italic' }}>Tanpa Struk</span>
                        )}
                      </td>
                      <td style={{ padding: '6px', borderRight: '1px solid #cbd5e1' }}>{it.date || '-'}</td>
                      <td style={{ padding: '6px', borderRight: '1px solid #cbd5e1' }}>
                        <div style={{ fontWeight: 800 }}>{it.name}</div>
                        {it.notes && <div style={{ fontSize: '0.66rem', color: '#64748b' }}>{it.notes}</div>}
                      </td>
                      <td style={{ padding: '6px', borderRight: '1px solid #cbd5e1' }}>{it.category}</td>
                      <td style={{ padding: '6px', borderRight: '1px solid #cbd5e1', fontWeight: 700 }}>{it.fundingSource}</td>
                      <td style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>{it.qty}</td>
                      <td style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #cbd5e1' }}>{formatRp(it.price)}</td>
                      <td style={{ padding: '6px', textAlign: 'right', fontWeight: 800, background: '#fafafa' }}>{formatRp(sub)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f1f5f9', borderTop: '2px solid #0f172a', fontWeight: 900 }}>
                  <td colSpan="8" style={{ padding: '8px', textAlign: 'right' }}>TOTAL REALISASI BELANJA ASET MODAL:</td>
                  <td style={{ padding: '8px', textAlign: 'right', fontSize: '0.88rem', color: '#1e3a8a' }}>{formatRp(totalBelanjaAset)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures for Official Investor Report */}
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', pageBreakInside: 'avoid' }}>
            <div style={{ textAlign: 'center', width: '220px' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Dibuat & Dipertanggungjawabkan Oleh,</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, marginTop: '2px' }}>Pengelola / Founder Equa3D</div>
              <div style={{ height: '48px' }}></div>
              <div style={{ borderBottom: '1px solid #0f172a', fontWeight: 700, fontSize: '0.8rem' }}>( Rian Kosasih )</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Operational Manager</div>
            </div>

            <div style={{ textAlign: 'center', width: '220px' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Mengetahui & Menyetujui,</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, marginTop: '2px' }}>Penyandang Dana / Investor</div>
              <div style={{ height: '48px' }}></div>
              <div style={{ borderBottom: '1px solid #0f172a', fontWeight: 700, fontSize: '0.8rem' }}>( ........................................ )</div>
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Investor Partner</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Input / Edit Pemasukan Uang Modal */}
      {/* ========================================================================= */}
      {isFundModalOpen && (
        <div className="modal-backdrop">
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '520px', padding: '24px', position: 'relative' }}
          >
            <button
              type="button"
              onClick={() => setIsFundModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '8px', color: '#2563eb' }}>
                <Landmark size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  {editingFund ? 'Edit Data Uang Modal' : 'Masukin Uang Modal Baru'}
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Pilih sumber dana (Pribadi, Orang Tua, atau Investor) dan catat nominalnya.
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveFund} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Sumber Dana Modal *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'Pribadi', label: 'Pribadi', color: '#2563eb' },
                    { id: 'Orang Tua', label: 'Orang Tua', color: '#a21caf' },
                    { id: 'Investor', label: 'Investor', color: '#16a34a' }
                  ].map(src => (
                    <button
                      key={src.id}
                      type="button"
                      onClick={() => setFundForm({ ...fundForm, source: src.id })}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '8px',
                        border: fundForm.source === src.id ? `2px solid ${src.color}` : '1px solid #cbd5e1',
                        background: fundForm.source === src.id ? '#f8fafc' : '#ffffff',
                        color: fundForm.source === src.id ? src.color : '#475569',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      {src.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Tanggal Setor Modal
                </label>
                <input
                  type="date"
                  className="input-custom"
                  value={fundForm.date}
                  onChange={e => setFundForm({ ...fundForm, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Nama Penyandang Dana / Identitas
                </label>
                <input
                  type="text"
                  className="input-custom"
                  placeholder="Contoh: Rian Kosasih (Pribadi) / Bpk Hendra (Investor)"
                  value={fundForm.funderName}
                  onChange={e => setFundForm({ ...fundForm, funderName: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Jumlah Nominal Modal (Rp) *
                </label>
                <input
                  type="number"
                  className="input-custom"
                  placeholder="Contoh: 5000000"
                  value={fundForm.amount === '' ? '' : fundForm.amount}
                  onFocus={e => e.target.select()}
                  onClick={e => e.target.select()}
                  onChange={e => setFundForm({ ...fundForm, amount: e.target.value.replace(/^0+(?=\d)/, '') })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Catatan / Keterangan Tambahan
                </label>
                <input
                  type="text"
                  className="input-custom"
                  placeholder="Contoh: Transfer modal awal pengadaan mesin via BCA"
                  value={fundForm.notes}
                  onChange={e => setFundForm({ ...fundForm, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsFundModalOpen(false)}
                  className="btn-secondary"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingFund}
                  className="btn-primary"
                  style={{ opacity: isSavingFund ? 0.7 : 1 }}
                >
                  <Save size={16} /> {isSavingFund ? 'Menyimpan...' : (editingFund ? 'Simpan Perubahan' : 'Setor Modal')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Input / Edit Belanja Aset & Upload Foto Struk */}
      {/* ========================================================================= */}
      {isItemModalOpen && (
        <div className="modal-backdrop">
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '640px', padding: '24px', position: 'relative' }}
          >
            <button
              type="button"
              onClick={() => setIsItemModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '8px', color: '#2563eb' }}>
                <FileText size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  {editingItem ? 'Edit Belanja Aset & Struk' : 'Catat Belanja Aset & Upload Struk'}
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Lengkapi nama barang, harga, sumber dana modal yang dipakai, serta foto struknya.
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveItem} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Tanggal Pembelian
                  </label>
                  <input
                    type="date"
                    className="input-custom"
                    value={itemForm.date}
                    onChange={e => setItemForm({ ...itemForm, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Sumber Dana yang Dipakai *
                  </label>
                  <select
                    className="input-custom"
                    value={itemForm.fundingSource}
                    onChange={e => setItemForm({ ...itemForm, fundingSource: e.target.value })}
                  >
                    <option value="Pribadi">Dana Pribadi</option>
                    <option value="Orang Tua">Dana Orang Tua</option>
                    <option value="Investor">Dana Investor</option>
                    <option value="Kas Modal Bersama">Kas Modal Bersama</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Nama Barang / Aset Modal *
                </label>
                <input
                  type="text"
                  className="input-custom"
                  placeholder="Contoh: Mesin 3D Printer Bambu Lab A1 / Filament PLA"
                  value={itemForm.name}
                  onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Kategori Aset
                  </label>
                  <select
                    className="input-custom"
                    value={itemForm.category}
                    onChange={e => setItemForm({ ...itemForm, category: e.target.value })}
                  >
                    <option value="Mesin / Hardware">Mesin / Hardware</option>
                    <option value="Bahan Baku Awal">Bahan Baku Awal</option>
                    <option value="Peralatan Tools">Peralatan Tools</option>
                    <option value="Perlengkapan Lapak/Finishing">Perlengkapan Lapak/Finishing</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Harga Satuan (Rp) *
                  </label>
                  <input
                    type="number"
                    className="input-custom"
                    placeholder="Contoh: 6500000"
                    value={itemForm.price === '' ? '' : itemForm.price}
                    onFocus={e => e.target.select()}
                    onClick={e => e.target.select()}
                    onChange={e => setItemForm({ ...itemForm, price: e.target.value.replace(/^0+(?=\d)/, '') })}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Jumlah (Qty) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="input-custom"
                    placeholder="1"
                    value={itemForm.qty === '' ? '' : itemForm.qty}
                    onFocus={e => e.target.select()}
                    onClick={e => e.target.select()}
                    onChange={e => setItemForm({ ...itemForm, qty: e.target.value.replace(/^0+(?=\d)/, '') })}
                    required
                  />
                </div>
              </div>

              {/* Subtotal preview */}
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: 700 }}>Subtotal Belanja Barang:</span>
                <span style={{ fontSize: '1.15rem', color: '#1d4ed8', fontWeight: 900 }}>
                  {formatRp((Number(itemForm.price) || 0) * (Number(itemForm.qty) || 1))}
                </span>
              </div>

              {/* Upload Foto Struk */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Foto Bukti Struk Pembayaran / Nota / Invoice
                </label>
                
                <div style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '10px',
                  padding: '14px',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}>
                  {itemForm.receiptPhoto ? (
                    <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                      <img
                        src={itemForm.receiptPhoto}
                        alt="Preview Struk"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                      <button
                        type="button"
                        onClick={() => setItemForm({ ...itemForm, receiptPhoto: '' })}
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          background: '#ef4444',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Hapus foto struk"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8',
                      flexShrink: 0
                    }}>
                      <ImageIcon size={24} />
                      <span style={{ fontSize: '0.65rem', marginTop: '2px' }}>Foto Struk</span>
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <label
                      htmlFor="receipt-upload-input"
                      className="btn-secondary"
                      style={{ padding: '8px 14px', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Upload size={14} /> {itemForm.receiptPhoto ? 'Ganti Foto Struk' : 'Upload Foto Struk / Nota'}
                    </label>
                    <input
                      id="receipt-upload-input"
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptPhotoUpload}
                      style={{ display: 'none' }}
                    />
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                      Format JPG/PNG. Foto dikompresi otomatis sehingga ringan dan langsung tersimpan di Cloud.
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Keterangan Tambahan / Nama Toko
                </label>
                <input
                  type="text"
                  className="input-custom"
                  placeholder="Contoh: Tokopedia Official Store / Nota No. 102938"
                  value={itemForm.notes}
                  onChange={e => setItemForm({ ...itemForm, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="btn-secondary"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingItem}
                  className="btn-primary"
                  style={{ opacity: isSavingItem ? 0.7 : 1 }}
                >
                  <Save size={16} /> {isSavingItem ? 'Menyimpan...' : (editingItem ? 'Simpan Perubahan' : 'Simpan Belanja')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Zoom In Preview Foto Struk */}
      {/* ========================================================================= */}
      {previewReceiptUrl && (
        <div className="modal-backdrop" onClick={() => setPreviewReceiptUrl(null)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '600px', padding: '16px', position: 'relative', textAlign: 'center' }}
          >
            <button
              type="button"
              onClick={() => setPreviewReceiptUrl(null)}
              style={{ position: 'absolute', top: '12px', right: '12px', background: '#000000', color: '#ffffff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
            >
              <X size={16} />
            </button>

            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px', textAlign: 'left' }}>
              🔍 Pratinjau Foto Bukti Struk Pembayaran
            </div>

            <div style={{ maxHeight: '75vh', overflow: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#090d16' }}>
              <img
                src={previewReceiptUrl}
                alt="Bukti Struk Full"
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '6px' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Fund */}
      {fundToDelete && (
        <DeleteConfirmModal
          productTitle={`Pemasukan Modal: ${fundToDelete.funderName} (${formatRp(fundToDelete.amount)})`}
          onClose={() => setFundToDelete(null)}
          onConfirmDelete={handleConfirmDeleteFund}
        />
      )}

      {/* Delete Confirmation Modal for Item */}
      {itemToDelete && (
        <DeleteConfirmModal
          productTitle={`Belanja Aset: ${itemToDelete.name}`}
          onClose={() => setItemToDelete(null)}
          onConfirmDelete={handleConfirmDeleteItem}
        />
      )}
    </div>
  );
}
