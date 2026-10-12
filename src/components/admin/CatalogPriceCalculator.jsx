import React, { useState, useEffect } from 'react';
import { 
  Calculator, Plus, Trash2, Edit2, Save, Image as ImageIcon, 
  Layers, ChevronDown, ChevronRight, Upload, X, DollarSign, 
  FileSpreadsheet, Sparkles, AlertCircle, Info, Copy, Check, Cloud, RefreshCw
} from 'lucide-react';
import DeleteConfirmModal from '../DeleteConfirmModal';
import { 
  subscribeToCatalogCalculatorItems, 
  saveCloudCatalogCalculatorItem, 
  saveAllCloudCatalogCalculatorItems,
  deleteCloudCatalogCalculatorItem, 
  seedCatalogCalculatorIfEmpty 
} from '../../firebase';

// Initial sample data matches user's Excel spreadsheet
const INITIAL_ITEMS = [
  {
    id: 1,
    name: 'Gym Keychain',
    category: 'Single', // 'Single' or 'MultiPart'
    photo: '',
    sellingPrice: 8000,
    parts: [
      {
        id: 'p1',
        name: 'Gym Keychain',
        weight: 4.33,
        time: '27m',
        costPerGram: 200,
        otherCost: 1000
      }
    ]
  },
  {
    id: 2,
    name: 'Lampu Bulan (Assembly)',
    category: 'MultiPart',
    photo: '',
    sellingPrice: 170000,
    parts: [
      {
        id: 'p2-1',
        name: 'Kaki Lampu Bulan',
        weight: 69.47,
        time: '5h13m',
        costPerGram: 200,
        otherCost: 0
      },
      {
        id: 'p2-2',
        name: 'Dudukan Lampu Bulan',
        weight: 10.62,
        time: '39m',
        costPerGram: 200,
        otherCost: 25000 // Dudukan / modul elektronik / adaptor
      },
      {
        id: 'p2-3',
        name: 'Lampu Bulan (Sphere)',
        weight: 232.20,
        time: '1d4h54m',
        costPerGram: 200,
        otherCost: 0
      }
    ]
  },
  {
    id: 3,
    name: 'Hexa Medal Frame',
    category: 'Single',
    photo: '',
    sellingPrice: 35000,
    parts: [
      {
        id: 'p3',
        name: 'Hexa Medal Frame',
        weight: 41.43,
        time: '1h13m',
        costPerGram: 200,
        otherCost: 0
      }
    ]
  }
];

export default function CatalogPriceCalculator() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('equa3d_catalog_calculator_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse saved calculator items", e);
      }
    }
    return INITIAL_ITEMS;
  });

  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  // Modal / Form state for Add/Edit item
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [expandedItems, setExpandedItems] = useState({ 2: true }); // Default expand item 2

  // Real-time Cloud Sync with Firestore
  useEffect(() => {
    setIsCloudSyncing(true);

    // Subscribe to Firestore changes in real-time
    const unsubscribe = subscribeToCatalogCalculatorItems(async (cloudItems) => {
      setIsCloudSyncing(false);

      // Check current browser localStorage
      const localRaw = localStorage.getItem('equa3d_catalog_calculator_items');
      let localList = [];
      if (localRaw) {
        try { localList = JSON.parse(localRaw); } catch (e) {}
      }

      if (Array.isArray(cloudItems) && cloudItems.length > 0) {
        // Find if this browser has items in localStorage that are NOT yet in Cloud Firestore
        const missingInCloud = localList.filter(locItem => 
          locItem && locItem.id && !cloudItems.some(cItem => String(cItem.id) === String(locItem.id))
        );

        if (missingInCloud.length > 0) {
          console.log("Auto-uploading unsynced local items to Firestore:", missingInCloud);
          setSyncStatusMsg(`Mengunggah ${missingInCloud.length} barang lokal ke Cloud...`);
          try {
            await saveAllCloudCatalogCalculatorItems(missingInCloud);
            setSyncStatusMsg('Sinkronisasi cloud selesai!');
            setTimeout(() => setSyncStatusMsg(''), 3000);
          } catch (e) {
            console.warn("Auto-upload error:", e);
          }
          // Merge local and cloud items without duplicates
          const mergedMap = new Map();
          cloudItems.forEach(item => mergedMap.set(String(item.id), item));
          missingInCloud.forEach(item => mergedMap.set(String(item.id), item));
          const mergedList = Array.from(mergedMap.values()).sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
          setItems(mergedList);
          localStorage.setItem('equa3d_catalog_calculator_items', JSON.stringify(mergedList));
        } else {
          const sorted = [...cloudItems].sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
          setItems(sorted);
          localStorage.setItem('equa3d_catalog_calculator_items', JSON.stringify(sorted));
        }
      } else {
        // Firestore collection is completely empty! Seed from local or default
        const listToSeed = localList.length > 0 ? localList : INITIAL_ITEMS;
        seedCatalogCalculatorIfEmpty(listToSeed);
      }
    }, (err) => {
      console.warn("Firestore listener fallback to localStorage:", err);
      setIsCloudSyncing(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Manual trigger to force upload all current items to Cloud Firestore
  const handleManualSyncToCloud = async () => {
    setIsCloudSyncing(true);
    setSyncStatusMsg('Sedang menyinkronkan...');
    try {
      await saveAllCloudCatalogCalculatorItems(items);
      setSyncStatusMsg(`Tersinkron ${items.length} barang`);
      alert(`✅ Berhasil!\n\nSebanyak ${items.length} data barang kalkulator telah tersimpan di Cloud Firestore.\nData sekarang otomatis tampil di HP dan browser lain tanpa reset.`);
      setTimeout(() => setSyncStatusMsg(''), 4000);
    } catch (err) {
      console.error("Manual sync error:", err);
      alert("Gagal sinkron ke Cloud: " + (err.message || "Periksa koneksi internet"));
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'Single', // 'Single' or 'MultiPart'
    photo: '',
    sellingPrice: '',
    parts: [
      {
        id: 'p-init',
        name: 'Bagian Utama',
        weight: '',
        time: '',
        costPerGram: 200,
        otherCost: 0
      }
    ]
  });

  // Save to localStorage as offline fallback
  useEffect(() => {
    try {
      localStorage.setItem('equa3d_catalog_calculator_items', JSON.stringify(items));
    } catch (e) {
      console.warn("Storage full or quota exceeded:", e);
    }
  }, [items]);

  // Format currency
  const formatRp = (val) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Format percentage
  const formatPercent = (val) => {
    const num = Number(val) || 0;
    return `${num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
  };

  // Helper to calculate cost for a single part: (Weight * CostPerGram) + OtherCost
  const calculatePartModal = (part) => {
    const weight = parseFloat(part.weight) || 0;
    const costPerGram = parseFloat(part.costPerGram) || 0;
    const otherCost = parseFloat(part.otherCost) || 0;
    return (weight * costPerGram) + otherCost;
  };

  // Helper to calculate total modal for an entire item
  const calculateTotalModal = (item) => {
    if (!item.parts || item.parts.length === 0) return 0;
    return item.parts.reduce((sum, p) => sum + calculatePartModal(p), 0);
  };

  // Helper to calculate total weight for an entire item
  const calculateTotalWeight = (item) => {
    if (!item.parts || item.parts.length === 0) return 0;
    return item.parts.reduce((sum, p) => sum + (parseFloat(p.weight) || 0), 0);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Single',
      photo: '',
      sellingPrice: '',
      parts: [
        {
          id: `p-${Date.now()}-1`,
          name: '',
          weight: '',
          time: '',
          costPerGram: 200,
          otherCost: ''
        }
      ]
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category || (item.parts.length > 1 ? 'MultiPart' : 'Single'),
      photo: item.photo || '',
      sellingPrice: item.sellingPrice || '',
      parts: item.parts.map(p => ({
        ...p,
        weight: p.weight === 0 || p.weight === '0' ? '' : p.weight,
        otherCost: p.otherCost === 0 || p.otherCost === '0' ? '' : p.otherCost
      }))
    });
    setIsModalOpen(true);
  };

  // Add Part in Modal
  const handleAddPart = () => {
    const nextIdx = formData.parts.length + 1;
    setFormData(prev => ({
      ...prev,
      parts: [
        ...prev.parts,
        {
          id: `p-${Date.now()}-${nextIdx}`,
          name: `Bagian ${nextIdx}`,
          weight: '',
          time: '',
          costPerGram: 200,
          otherCost: ''
        }
      ]
    }));
  };

  // Remove Part in Modal
  const handleRemovePart = (partIdx) => {
    if (formData.parts.length <= 1) {
      alert("Barang harus memiliki minimal 1 bagian/part print.");
      return;
    }
    setFormData(prev => ({
      ...prev,
      parts: prev.parts.filter((_, idx) => idx !== partIdx)
    }));
  };

  // Update Part Value in Modal
  const handlePartChange = (idx, field, value) => {
    setFormData(prev => {
      const updatedParts = [...prev.parts];
      updatedParts[idx] = {
        ...updatedParts[idx],
        [field]: value
      };
      return { ...prev, parts: updatedParts };
    });
  };

  // Handle Image Upload with Canvas compression
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
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

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setFormData(prev => ({ ...prev, photo: compressedDataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Submit Modal
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Nama Barang wajib diisi!");
      return;
    }

    setIsSaving(true);
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;
    const parts = formData.parts.map((p, idx) => ({
      id: p.id || `p-${Date.now()}-${idx}`,
      name: p.name.trim() || `Part ${idx + 1}`,
      weight: parseFloat(p.weight) || 0,
      time: p.time.trim() || '-',
      costPerGram: parseFloat(p.costPerGram) || 200,
      otherCost: parseFloat(p.otherCost) || 0
    }));

    try {
      if (editingItem) {
        const updatedItem = {
          ...editingItem,
          name: formData.name,
          category: parts.length > 1 ? 'MultiPart' : 'Single',
          photo: formData.photo,
          sellingPrice,
          parts
        };
        const updatedList = items.map(it => it.id === editingItem.id ? updatedItem : it);
        setItems(updatedList);
        localStorage.setItem('equa3d_catalog_calculator_items', JSON.stringify(updatedList));
        
        // Save to Cloud Firestore
        await saveCloudCatalogCalculatorItem(updatedItem);
      } else {
        const newItem = {
          id: Date.now(),
          name: formData.name,
          category: parts.length > 1 ? 'MultiPart' : 'Single',
          photo: formData.photo,
          sellingPrice,
          parts
        };
        const updatedList = [...items, newItem];
        setItems(updatedList);
        localStorage.setItem('equa3d_catalog_calculator_items', JSON.stringify(updatedList));
        if (parts.length > 1) {
          setExpandedItems(prev => ({ ...prev, [newItem.id]: true }));
        }

        // Save to Cloud Firestore
        await saveCloudCatalogCalculatorItem(newItem);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Gagal menyimpan ke Cloud Firestore:", err);
      alert("Catatan: Terjadi kendala saat menyimpan ke Cloud Firestore (" + (err.message || "koneksi offline") + "). Data tetap tersimpan di browser ini.");
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle expand parts
  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      const delId = itemToDelete.id;
      const filtered = items.filter(it => it.id !== delId);
      setItems(filtered);
      localStorage.setItem('equa3d_catalog_calculator_items', JSON.stringify(filtered));
      setItemToDelete(null);
      try {
        await deleteCloudCatalogCalculatorItem(delId);
      } catch (err) {
        console.warn("Gagal hapus dari Cloud:", err);
      }
    }
  };

  // Real-time Export to Excel / CSV
  const handleExportCSV = () => {
    if (items.length === 0) {
      alert("Belum ada data kalkulator untuk diekspor.");
      return;
    }

    const headers = [
      "No",
      "Nama Barang / Part",
      "Tipe",
      "Berat (gr)",
      "Waktu Cetak",
      "Modal/gr (Rp)",
      "Modal Lain (Rp)",
      "Estimasi Modal/pcs (Rp)",
      "Total Modal Merge (Rp)",
      "Estimasi Harga Jual (Rp)",
      "Untung (Rp)",
      "Margin Untung (%)"
    ];

    const rows = [];
    items.forEach((item, index) => {
      const totalModal = calculateTotalModal(item);
      const untung = (item.sellingPrice || 0) - totalModal;
      const margin = totalModal > 0 ? (untung / totalModal) * 100 : 0;

      if (item.parts.length === 1) {
        const p = item.parts[0];
        const partModal = calculatePartModal(p);
        rows.push([
          index + 1,
          `"${item.name.replace(/"/g, '""')}"`,
          "Single Item",
          p.weight,
          `"${p.time}"`,
          p.costPerGram,
          p.otherCost,
          Math.round(partModal),
          Math.round(totalModal),
          item.sellingPrice,
          Math.round(untung),
          `${margin.toFixed(2)}%`
        ]);
      } else {
        // MultiPart: list each part, and show merged row
        item.parts.forEach((p, pIdx) => {
          const partModal = calculatePartModal(p);
          rows.push([
            pIdx === 0 ? index + 1 : "",
            `"${item.name} - Part: ${p.name.replace(/"/g, '""')}"`,
            "Assembly Part",
            p.weight,
            `"${p.time}"`,
            p.costPerGram,
            p.otherCost || 0,
            Math.round(partModal),
            pIdx === 0 ? Math.round(totalModal) : "",
            pIdx === 0 ? item.sellingPrice : "",
            pIdx === 0 ? Math.round(untung) : "",
            pIdx === 0 ? `${margin.toFixed(2)}%` : ""
          ]);
        });
      }
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const todayStr = new Date().toISOString().split('T')[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `Kalkulator_Harga_Jual_Katalog_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Global summaries
  const totalBarang = items.length;
  const totalModalSemua = items.reduce((sum, it) => sum + calculateTotalModal(it), 0);
  const totalPotensiOmset = items.reduce((sum, it) => sum + (Number(it.sellingPrice) || 0), 0);
  const totalPotensiUntung = totalPotensiOmset - totalModalSemua;
  const rataRataMargin = totalModalSemua > 0 ? (totalPotensiUntung / totalModalSemua) * 100 : 0;

  return (
    <div style={{ background: '#ffffff', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#eff6ff', color: '#2563eb', padding: '8px', borderRadius: '10px', display: 'flex' }}>
              <Calculator size={22} />
            </div>
            Kalkulator Harga Jual Katalog (Perhitungan Excel & Assembly Multi-Part)
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            Perhitungan modal per gram, biaya lain/komponen, total modal assembly barang ber-part (seperti Lampu Bulan), serta margin laba bersih.
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
              <Cloud size={13} /> Cloud Firestore Terhubung ({items.length} Barang)
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

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCSV}
            className="btn-secondary"
            style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FileSpreadsheet size={16} color="#16a34a" /> Eksport Excel (CSV)
          </button>
          
          <button
            onClick={handleOpenAddModal}
            className="btn-primary"
            style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px' }}
          >
            <Plus size={16} /> Tambah Barang / Hitungan Baru
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Model Terdata</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{totalBarang} Produk</div>
          <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>Termasuk model single & assembly multi-part</div>
        </div>

        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.76rem', color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase' }}>Akumulasi Total Modal HPP</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#2563eb', marginTop: '4px' }}>{formatRp(totalModalSemua)}</div>
          <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 600, marginTop: '2px' }}>Total modal bahan baku + part tambahan</div>
        </div>

        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.76rem', color: '#15803d', fontWeight: 700, textTransform: 'uppercase' }}>Potensi Omset Penjualan</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#16a34a', marginTop: '4px' }}>{formatRp(totalPotensiOmset)}</div>
          <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600, marginTop: '2px' }}>Rata-rata Margin Laba: {formatPercent(rataRataMargin)}</div>
        </div>

        <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.76rem', color: '#a16207', fontWeight: 700, textTransform: 'uppercase' }}>Total Potensi Untung Bersih</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#ca8a04', marginTop: '4px' }}>{formatRp(totalPotensiUntung)}</div>
          <div style={{ fontSize: '0.75rem', color: '#854d0e', fontWeight: 600, marginTop: '2px' }}>Harga Jual dikurangi Total Modal Merge</div>
        </div>
      </div>

      {/* Main Excel-like Table View */}
      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#334155', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ padding: '12px 10px', width: '45px', textAlign: 'center' }}>No.</th>
              <th style={{ padding: '12px 10px', width: '80px', textAlign: 'center' }}>Foto</th>
              <th style={{ padding: '12px 14px', minWidth: '200px' }}>Nama Barang / Bagian</th>
              <th style={{ padding: '12px 10px', textAlign: 'right' }}>Berat (gr)</th>
              <th style={{ padding: '12px 10px', textAlign: 'center' }}>Waktu</th>
              <th style={{ padding: '12px 10px', textAlign: 'right' }}>Modal/gr</th>
              <th style={{ padding: '12px 10px', textAlign: 'right' }}>Modal Lain</th>
              <th style={{ padding: '12px 12px', textAlign: 'right', background: '#f1f5f9' }}>Estimasi Modal/pcs</th>
              <th style={{ padding: '12px 12px', textAlign: 'right', background: '#eff6ff', color: '#1e40af' }}>Total Modal (Merge Item)</th>
              <th style={{ padding: '12px 12px', textAlign: 'right', background: '#f0fdf4', color: '#166534' }}>Estimasi Harga Jual</th>
              <th style={{ padding: '12px 12px', textAlign: 'right' }}>Untung</th>
              <th style={{ padding: '12px 12px', textAlign: 'right' }}>Margin Untung (%)</th>
              <th style={{ padding: '12px 12px', textAlign: 'center', width: '90px' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="13" style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                  Belum ada data kalkulator harga. Klik tombol <strong>+ Tambah Barang Baru</strong> di atas untuk mulai mencatat.
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const totalModal = calculateTotalModal(item);
                const sellingPrice = Number(item.sellingPrice) || 0;
                const untung = sellingPrice - totalModal;
                const marginPercent = totalModal > 0 ? (untung / totalModal) * 100 : 0;
                const isMultiPart = item.parts && item.parts.length > 1;
                const isExpanded = isMultiPart ? (expandedItems[item.id] !== false) : true;

                if (!isMultiPart) {
                  // Single Item Row
                  const part = item.parts[0] || { weight: 0, time: '-', costPerGram: 200, otherCost: 0 };
                  const partModal = calculatePartModal(part);

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0', background: index % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 700, color: '#64748b' }}>{index + 1}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        {item.photo ? (
                          <img 
                            src={item.photo} 
                            alt={item.name} 
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                          />
                        ) : (
                          <div style={{ width: '48px', height: '48px', background: '#f1f5f9', borderRadius: '8px', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#94a3b8' }}>
                            <ImageIcon size={18} />
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>{item.name}</div>
                        <span style={{ fontSize: '0.7rem', background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          Single Print
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 600 }}>{part.weight} gr</td>
                      <td style={{ padding: '12px 10px', textAlign: 'center', color: '#475569' }}>{part.time || '-'}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#475569' }}>{formatRp(part.costPerGram)}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#475569' }}>{part.otherCost ? formatRp(part.otherCost) : 'Rp0'}</td>
                      <td style={{ padding: '12px 12px', textAlign: 'right', background: '#f8fafc', fontWeight: 700 }}>{formatRp(partModal)}</td>
                      <td style={{ padding: '12px 12px', textAlign: 'right', background: '#eff6ff', fontWeight: 800, color: '#1e40af' }}>{formatRp(totalModal)}</td>
                      <td style={{ padding: '12px 12px', textAlign: 'right', background: '#f0fdf4', fontWeight: 900, color: '#15803d', fontSize: '0.9rem' }}>{formatRp(sellingPrice)}</td>
                      <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 800, color: untung >= 0 ? '#16a34a' : '#dc2626' }}>
                        {formatRp(untung)}
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'right' }}>
                        <span style={{
                          background: marginPercent >= 100 ? '#ecfdf5' : marginPercent >= 50 ? '#eff6ff' : '#fffbeb',
                          color: marginPercent >= 100 ? '#047857' : marginPercent >= 50 ? '#1d4ed8' : '#b45309',
                          fontWeight: 800,
                          fontSize: '0.78rem',
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}>
                          {formatPercent(marginPercent)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            style={{ background: '#eff6ff', border: 'none', color: '#2563eb', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Edit Data Barang"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => setItemToDelete(item)}
                            style={{ background: '#fef2f2', border: 'none', color: '#dc2626', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Hapus Barang"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                } else {
                  // MultiPart Assembly (like Lampu Bulan with 3 parts)
                  return (
                    <React.Fragment key={item.id}>
                      {item.parts.map((part, pIdx) => {
                        const partModal = calculatePartModal(part);
                        const isFirstPart = pIdx === 0;

                        return (
                          <tr
                            key={part.id || pIdx}
                            style={{
                              borderBottom: pIdx === item.parts.length - 1 ? '2px solid #cbd5e1' : '1px dashed #e2e8f0',
                              background: '#fdfdfe'
                            }}
                          >
                            {/* Merged No column */}
                            {isFirstPart && (
                              <td
                                rowSpan={item.parts.length}
                                style={{
                                  padding: '12px 10px',
                                  textAlign: 'center',
                                  fontWeight: 700,
                                  color: '#64748b',
                                  verticalAlign: 'top',
                                  borderRight: '1px solid #e2e8f0',
                                  background: '#fafafa'
                                }}
                              >
                                {index + 1}
                              </td>
                            )}

                            {/* Merged Photo column */}
                            {isFirstPart && (
                              <td
                                rowSpan={item.parts.length}
                                style={{
                                  padding: '10px 8px',
                                  textAlign: 'center',
                                  verticalAlign: 'top',
                                  borderRight: '1px solid #e2e8f0',
                                  background: '#fafafa'
                                }}
                              >
                                {item.photo ? (
                                  <img 
                                    src={item.photo} 
                                    alt={item.name} 
                                    style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                                  />
                                ) : (
                                  <div style={{ width: '56px', height: '56px', background: '#f1f5f9', borderRadius: '8px', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#94a3b8' }}>
                                    <ImageIcon size={20} />
                                  </div>
                                )}
                              </td>
                            )}

                            {/* Part Name with parent indicator */}
                            <td style={{ padding: '10px 14px' }}>
                              {isFirstPart && (
                                <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontWeight: 900, color: '#0f172a', fontSize: '0.9rem' }}>{item.name}</span>
                                  <span style={{ fontSize: '0.68rem', background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                                    Assembly ({item.parts.length} Parts)
                                  </span>
                                </div>
                              )}
                              <div style={{ paddingLeft: '12px', borderLeft: '3px solid #3b82f6', color: '#334155', fontWeight: 600, fontSize: '0.82rem' }}>
                                ↳ Part #{pIdx + 1}: <strong style={{ color: '#0f172a' }}>{part.name}</strong>
                              </div>
                            </td>

                            <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 600 }}>{part.weight} gr</td>
                            <td style={{ padding: '10px 10px', textAlign: 'center', color: '#475569' }}>{part.time || '-'}</td>
                            <td style={{ padding: '10px 10px', textAlign: 'right', color: '#475569' }}>{formatRp(part.costPerGram)}</td>
                            <td style={{ padding: '10px 10px', textAlign: 'right', color: '#475569' }}>{part.otherCost ? formatRp(part.otherCost) : 'Rp0'}</td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', background: '#f8fafc', fontWeight: 700 }}>{formatRp(partModal)}</td>

                            {/* Merged Total Modal */}
                            {isFirstPart && (
                              <td
                                rowSpan={item.parts.length}
                                style={{
                                  padding: '12px',
                                  textAlign: 'right',
                                  background: '#eff6ff',
                                  fontWeight: 900,
                                  color: '#1e40af',
                                  fontSize: '0.95rem',
                                  verticalAlign: 'middle',
                                  borderRight: '1px solid #bfdbfe'
                                }}
                              >
                                {formatRp(totalModal)}
                                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>
                                  Total {calculateTotalWeight(item).toFixed(1)} gr
                                </div>
                              </td>
                            )}

                            {/* Merged Estimasi Harga Jual */}
                            {isFirstPart && (
                              <td
                                rowSpan={item.parts.length}
                                style={{
                                  padding: '12px',
                                  textAlign: 'right',
                                  background: '#f0fdf4',
                                  fontWeight: 900,
                                  color: '#15803d',
                                  fontSize: '0.95rem',
                                  verticalAlign: 'middle',
                                  borderRight: '1px solid #bbf7d0'
                                }}
                              >
                                {formatRp(sellingPrice)}
                              </td>
                            )}

                            {/* Merged Untung */}
                            {isFirstPart && (
                              <td
                                rowSpan={item.parts.length}
                                style={{
                                  padding: '12px',
                                  textAlign: 'right',
                                  fontWeight: 900,
                                  color: untung >= 0 ? '#16a34a' : '#dc2626',
                                  fontSize: '0.95rem',
                                  verticalAlign: 'middle',
                                  borderRight: '1px solid #e2e8f0'
                                }}
                              >
                                {formatRp(untung)}
                              </td>
                            )}

                            {/* Merged Margin Untung */}
                            {isFirstPart && (
                              <td
                                rowSpan={item.parts.length}
                                style={{
                                  padding: '12px',
                                  textAlign: 'right',
                                  verticalAlign: 'middle',
                                  borderRight: '1px solid #e2e8f0'
                                }}
                              >
                                <span style={{
                                  background: marginPercent >= 100 ? '#ecfdf5' : marginPercent >= 50 ? '#eff6ff' : '#fffbeb',
                                  color: marginPercent >= 100 ? '#047857' : marginPercent >= 50 ? '#1d4ed8' : '#b45309',
                                  fontWeight: 800,
                                  fontSize: '0.82rem',
                                  padding: '4px 10px',
                                  borderRadius: '6px'
                                }}>
                                  {formatPercent(marginPercent)}
                                </span>
                              </td>
                            )}

                            {/* Merged Actions */}
                            {isFirstPart && (
                              <td
                                rowSpan={item.parts.length}
                                style={{
                                  padding: '12px 10px',
                                  textAlign: 'center',
                                  verticalAlign: 'middle'
                                }}
                              >
                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                  <button
                                    onClick={() => handleOpenEditModal(item)}
                                    style={{ background: '#eff6ff', border: 'none', color: '#2563eb', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
                                    title="Edit Data Barang Assembly"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={() => setItemToDelete(item)}
                                    style={{ background: '#fef2f2', border: 'none', color: '#dc2626', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer' }}
                                    title="Hapus Barang"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                }
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Info Notice Box */}
      <div style={{ marginTop: '20px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <Info size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.8rem', color: '#1e3a8a', lineHeight: 1.5 }}>
          <strong>Petunjuk Rumus Perhitungan:</strong>
          <br />• <strong>Estimasi Modal / pcs</strong> = (Berat gr × Modal/gr) + Modal Lain.
          <br />• <strong>Total Modal (Merge Item)</strong> = Penjumlahan seluruh part jika barang ber-part / assembly (seperti Lampu Bulan yang terdiri dari Kaki, Dudukan, dan Lampu).
          <br />• <strong>Untung</strong> = Estimasi Harga Jual - Total Modal (Merge Item).
          <br />• <strong>Margin Untung (%)</strong> = (Untung / Total Modal) × 100%. Semua isian harga dan modal dibuat manual agar fleksibel untuk tim percetakan.
        </div>
      </div>

      {/* Add / Edit Modal Popup */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '820px',
              padding: '24px',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '8px', color: '#2563eb' }}>
                {editingItem ? <Edit2 size={20} /> : <Plus size={20} />}
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  {editingItem ? 'Edit Data Barang Kalkulator' : 'Tambah Barang & Perhitungan Baru'}
                </h2>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Masukkan nama barang, 1 foto sampel produk, harga jual, dan rincian bagian/part print 3D.
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveItem}>
              {/* Product Info Section */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Nama Barang / Produk Katalog *
                    </label>
                    <input
                      type="text"
                      className="input-custom"
                      placeholder="Contoh: Lampu Bulan / Gym Keychain / Hexa Medal Frame"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Estimasi Harga Jual (Rp) *
                      </label>
                      <input
                        type="number"
                        className="input-custom"
                        placeholder="Contoh: 170000"
                        value={formData.sellingPrice === '' ? '' : formData.sellingPrice}
                        onFocus={(e) => e.target.select()}
                        onClick={(e) => e.target.select()}
                        onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value.replace(/^0+(?=\d)/, '') })}
                        required
                      />
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                        Isian manual admin untuk harga jual ke pembeli.
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Tipe Produk
                      </label>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.parts.length > 1) {
                              if (window.confirm("Mengubah ke Single Item akan menyisakan 1 part saja. Lanjutkan?")) {
                                setFormData(prev => ({ ...prev, category: 'Single', parts: [prev.parts[0]] }));
                              }
                            } else {
                              setFormData(prev => ({ ...prev, category: 'Single' }));
                            }
                          }}
                          style={{
                            flex: 1,
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: formData.parts.length <= 1 ? '2px solid #2563eb' : '1px solid #cbd5e1',
                            background: formData.parts.length <= 1 ? '#eff6ff' : '#ffffff',
                            color: formData.parts.length <= 1 ? '#2563eb' : '#475569',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                        >
                          Single Part
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (formData.parts.length === 1) {
                              handleAddPart();
                            }
                            setFormData(prev => ({ ...prev, category: 'MultiPart' }));
                          }}
                          style={{
                            flex: 1,
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: formData.parts.length > 1 ? '2px solid #2563eb' : '1px solid #cbd5e1',
                            background: formData.parts.length > 1 ? '#eff6ff' : '#ffffff',
                            color: formData.parts.length > 1 ? '#2563eb' : '#475569',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                        >
                          Assembly (Multi-Part)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Foto Sample Produk */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px', textAlign: 'center' }}>
                    1 Foto Sampel
                  </label>
                  <div style={{
                    width: '100%',
                    height: '115px',
                    borderRadius: '10px',
                    border: '2px dashed #cbd5e1',
                    background: '#f8fafc',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                    {formData.photo ? (
                      <>
                        <img 
                          src={formData.photo} 
                          alt="Sample" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, photo: '' }); }}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #f87171',
                            borderRadius: '50%',
                            width: '22px',
                            height: '22px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          title="Hapus foto"
                        >
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <label htmlFor="photo-upload-input" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '8px', textAlign: 'center' }}>
                        <Upload size={22} color="#64748b" />
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>
                          Upload Foto
                        </span>
                      </label>
                    )}
                    <input 
                      id="photo-upload-input" 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      style={{ display: 'none' }} 
                    />
                  </div>
                </div>
              </div>

              {/* Parts & Assembly Breakdown Section */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Layers size={16} color="#2563eb" /> Rincian Part / Bagian Print
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Untuk barang assembly (seperti Lampu Bulan: Kaki, Dudukan, Lampu), tambahkan masing-masing part di bawah.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddPart}
                    className="btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Plus size={14} /> + Tambah Bagian Part
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {formData.parts.map((part, pIdx) => {
                    const currentPartModal = calculatePartModal(part);

                    return (
                      <div
                        key={part.id || pIdx}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '10px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                        }}
                      >
                        {/* Row 1: Input Fields Grid */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(140px, 1.4fr) repeat(4, minmax(95px, 1fr))',
                          gap: '10px'
                        }}>
                          {/* Part Name */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                              Nama Part #{pIdx + 1}
                            </label>
                            <input
                              type="text"
                              className="input-custom"
                              placeholder="Misal: Kaki / Dudukan"
                              value={part.name}
                              onChange={(e) => handlePartChange(pIdx, 'name', e.target.value)}
                              style={{ padding: '8px 10px', fontSize: '0.82rem' }}
                              required
                            />
                          </div>

                          {/* Weight */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                              Berat (gr)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              className="input-custom"
                              placeholder="0"
                              value={part.weight === '' ? '' : part.weight}
                              onFocus={(e) => e.target.select()}
                              onClick={(e) => e.target.select()}
                              onChange={(e) => handlePartChange(pIdx, 'weight', e.target.value.replace(/^0+(?=\d)/, ''))}
                              style={{ padding: '8px 10px', fontSize: '0.82rem' }}
                              required
                            />
                          </div>

                          {/* Print Time */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                              Waktu Cetak
                            </label>
                            <input
                              type="text"
                              className="input-custom"
                              placeholder="Misal: 27m / 1h"
                              value={part.time}
                              onChange={(e) => handlePartChange(pIdx, 'time', e.target.value)}
                              style={{ padding: '8px 10px', fontSize: '0.82rem' }}
                            />
                          </div>

                          {/* Cost / gram */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                              Modal/gr (Rp)
                            </label>
                            <input
                              type="number"
                              className="input-custom"
                              placeholder="200"
                              value={part.costPerGram === '' ? '' : part.costPerGram}
                              onFocus={(e) => e.target.select()}
                              onClick={(e) => e.target.select()}
                              onChange={(e) => handlePartChange(pIdx, 'costPerGram', e.target.value.replace(/^0+(?=\d)/, ''))}
                              style={{ padding: '8px 10px', fontSize: '0.82rem' }}
                              required
                            />
                          </div>

                          {/* Other Cost */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                              Modal Lain (Rp)
                            </label>
                            <input
                              type="number"
                              className="input-custom"
                              placeholder="0"
                              value={part.otherCost === '' ? '' : part.otherCost}
                              onFocus={(e) => e.target.select()}
                              onClick={(e) => e.target.select()}
                              onChange={(e) => handlePartChange(pIdx, 'otherCost', e.target.value.replace(/^0+(?=\d)/, ''))}
                              style={{ padding: '8px 10px', fontSize: '0.82rem' }}
                            />
                          </div>
                        </div>

                        {/* Row 2: Subtotal & Delete Action Bar */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '8px',
                          borderTop: '1px dashed #e2e8f0'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                              Subtotal Modal Part #{pIdx + 1}:
                            </span>
                            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e40af', background: '#eff6ff', padding: '3px 8px', borderRadius: '6px' }}>
                              {formatRp(currentPartModal)}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemovePart(pIdx)}
                            disabled={formData.parts.length <= 1}
                            style={{
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              color: formData.parts.length <= 1 ? '#cbd5e1' : '#dc2626',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: formData.parts.length <= 1 ? 'not-allowed' : 'pointer'
                            }}
                            title="Hapus part ini"
                          >
                            <Trash2 size={13} /> Hapus Part
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Calculation Summary Preview in Modal */}
                {(() => {
                  const tempTotalModal = formData.parts.reduce((sum, p) => sum + calculatePartModal(p), 0);
                  const tempSelling = parseFloat(formData.sellingPrice) || 0;
                  const tempProfit = tempSelling - tempTotalModal;
                  const tempMargin = tempTotalModal > 0 ? (tempProfit / tempTotalModal) * 100 : 0;

                  return (
                    <div style={{ marginTop: '16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 700, textTransform: 'uppercase' }}>
                          Total Modal ({formData.parts.length} Part Digabung):
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1d4ed8' }}>
                          {formatRp(tempTotalModal)}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700, textTransform: 'uppercase' }}>
                          Estimasi Untung Bersih:
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#16a34a' }}>
                          {formatRp(tempProfit)}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                          Margin Untung:
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: tempMargin >= 100 ? '#15803d' : '#2563eb' }}>
                          {formatPercent(tempMargin)}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                  style={{ padding: '10px 18px' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSaving}
                  style={{ padding: '10px 22px', opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'wait' : 'pointer' }}
                >
                  <Save size={16} /> {isSaving ? 'Menyimpan ke Cloud...' : (editingItem ? 'Simpan Perubahan' : 'Simpan Barang Baru')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Popup */}
      {itemToDelete && (
        <DeleteConfirmModal
          productTitle={`Barang: ${itemToDelete.name}`}
          onClose={() => setItemToDelete(null)}
          onConfirmDelete={handleConfirmDelete}
        />
      )}
    </div>
  );
}
