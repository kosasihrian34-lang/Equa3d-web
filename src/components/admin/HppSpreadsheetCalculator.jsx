import React, { useState, useEffect, useRef } from 'react';
import { 
  FileSpreadsheet, Plus, Trash2, Copy, Download, Sparkles, 
  RefreshCw, DollarSign, Clock, HelpCircle, Check, 
  Share2, ArrowDown, ChevronDown, ChevronUp, Sliders, Info,
  Calculator, Layers, Box, AlertTriangle
} from 'lucide-react';
import DeleteConfirmModal from '../DeleteConfirmModal';

// Initial graduation souvenir presets matching real 3D printing & souvenir workshops
const INITIAL_ROWS = [
  {
    id: 1,
    name: 'Souvenir Wisuda 3D Box Pigura (Karakter Toga)',
    weight: 38, // gram
    costPerGram: 200, // Rp / gram
    printHours: 2.8, // jam
    electricityPerHour: 200, // Rp / jam
    otherCostsDesc: 'Bingkai 3D Box Mika 15x20 + Tatakan + Pita',
    otherCosts: 22000, // Rp bingkai & aksesoris
    sellingPrice: 65000, // Rp harga jual satuan
    quantity: 25, // pcs order
    notes: 'Souvenir wisuda kampus batch A'
  },
  {
    id: 2,
    name: 'Gantungan Kunci Wisuda Nama Custom + Toga',
    weight: 9,
    costPerGram: 200,
    printHours: 0.5,
    electricityPerHour: 200,
    otherCostsDesc: 'Ring gantungan tebal + plastik sealer kemasan',
    otherCosts: 2500,
    sellingPrice: 12000,
    quantity: 50,
    notes: 'Keychain wisuda custom nama masing-masing wisudawan'
  },
  {
    id: 3,
    name: 'Plakat Akrilik 3D Wisuda + Dudukan Kayu',
    weight: 32,
    costPerGram: 200,
    printHours: 2.2,
    electricityPerHour: 200,
    otherCostsDesc: 'Tatakan kayu jati belanda + stiker plat emas + box kardus',
    otherCosts: 18000,
    sellingPrice: 60000,
    quantity: 30,
    notes: 'Plakat wisuda sekolah / universitas'
  },
  {
    id: 4,
    name: 'Bingkai Lampu Lithophane 3D Foto Wisuda',
    weight: 90,
    costPerGram: 200,
    printHours: 7.5,
    electricityPerHour: 200,
    otherCostsDesc: 'Bingkai kayu 3D + Strip LED USB 5V + Adaptor',
    otherCosts: 35000,
    sellingPrice: 150000,
    quantity: 10,
    notes: 'Kado wisuda eksklusif foto berlampu'
  }
];

// Quick templates for fast addition of souvenir orders
const SOUVENIR_TEMPLATES = [
  {
    name: 'Souvenir Karakter Wisuda 3D + Bingkai Box',
    weight: 38,
    costPerGram: 200,
    printHours: 2.8,
    electricityPerHour: 200,
    otherCostsDesc: 'Bingkai 3D Box Mika + Dudukan',
    otherCosts: 22000,
    sellingPrice: 65000,
    quantity: 30,
    notes: 'Karakter wisuda toga lengkap dengan pigura 3D'
  },
  {
    name: 'Gantungan Kunci Wisuda Nama & Topi Toga',
    weight: 8,
    costPerGram: 200,
    printHours: 0.45,
    electricityPerHour: 200,
    otherCostsDesc: 'Ring gantungan + plastik kemasan sealer',
    otherCosts: 2000,
    sellingPrice: 10000,
    quantity: 50,
    notes: 'Ganci souvenir massal untuk 1 angkatan wisuda'
  },
  {
    name: 'Medali Wisuda 3D Custom + Tali Sablon',
    weight: 18,
    costPerGram: 200,
    printHours: 1.1,
    electricityPerHour: 200,
    otherCostsDesc: 'Tali medali sablon wisuda + ring segitiga',
    otherCosts: 6500,
    sellingPrice: 25000,
    quantity: 40,
    notes: 'Medali wisuda anak TK/SD/Universitas'
  },
  {
    name: 'Plakat Stand Akrilik 3D Wisuda Kayu',
    weight: 30,
    costPerGram: 200,
    printHours: 2.0,
    electricityPerHour: 200,
    otherCostsDesc: 'Dudukan balok kayu + plat stiker gold',
    otherCosts: 18000,
    sellingPrice: 60000,
    quantity: 25,
    notes: 'Plakat kenang-kenangan wisuda berlogo instansi'
  },
  {
    name: 'Miniatur Patung Wisuda 3D Kemasan Tabung Mika',
    weight: 45,
    costPerGram: 200,
    printHours: 3.2,
    electricityPerHour: 200,
    otherCostsDesc: 'Tabung mika silinder + pita satin emas',
    otherCosts: 12000,
    sellingPrice: 55000,
    quantity: 20,
    notes: 'Patung wisudawan 3D eksklusif'
  }
];

export default function HppSpreadsheetCalculator({ catalogProducts = [] }) {
  // 1. Spreadsheet Rows State
  const [rows, setRows] = useState(() => {
    const saved = localStorage.getItem('equa3d_hpp_spreadsheet_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Gagal membaca data spreadsheet HPP dari localStorage", e);
      }
    }
    return INITIAL_ROWS;
  });

  // 2. Global Default Settings (auto-applied when adding new row)
  const [defaultSettings, setDefaultSettings] = useState(() => {
    const saved = localStorage.getItem('equa3d_hpp_default_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      costPerGram: 200,
      electricityPerHour: 200,
      defaultMarginPercent: 50
    };
  });

  // Show/Hide settings drawer
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [activeCellInfo, setActiveCellInfo] = useState({
    col: 'D',
    colName: 'Subtotal Bahan Filament',
    formula: '= Berat (gram) × Harga Filament/gr',
    example: '38 gr × Rp 200 = Rp 7.600'
  });

  // Delete modal state
  const [rowToDelete, setRowToDelete] = useState(null);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('equa3d_hpp_spreadsheet_data', JSON.stringify(rows));
    } catch (e) {
      console.warn("Storage quota error:", e);
    }
  }, [rows]);

  useEffect(() => {
    try {
      localStorage.setItem('equa3d_hpp_default_settings', JSON.stringify(defaultSettings));
    } catch (e) {}
  }, [defaultSettings]);

  // Currency Formatter
  const formatRp = (val) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatNumber = (val, maxDec = 2) => {
    const num = Number(val) || 0;
    return num.toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxDec
    });
  };

  // Helper row formula calculations
  const computeRow = (row) => {
    const weight = Math.max(0, parseFloat(row.weight) || 0);
    const costPerGram = Math.max(0, parseFloat(row.costPerGram) || 0);
    const subtotalFilament = weight * costPerGram;

    const printHours = Math.max(0, parseFloat(row.printHours) || 0);
    const electricityPerHour = Math.max(0, parseFloat(row.electricityPerHour) || 0);
    const subtotalElectricity = printHours * electricityPerHour;

    const otherCosts = Math.max(0, parseFloat(row.otherCosts) || 0);
    const totalHppUnit = Math.round(subtotalFilament + subtotalElectricity + otherCosts);

    const sellingPrice = Math.max(0, parseFloat(row.sellingPrice) || 0);
    const profitUnit = Math.round(sellingPrice - totalHppUnit);
    const marginPercent = sellingPrice > 0 ? ((sellingPrice - totalHppUnit) / sellingPrice) * 100 : 0;
    const markupPercent = totalHppUnit > 0 ? ((sellingPrice - totalHppUnit) / totalHppUnit) * 100 : 0;

    const quantity = Math.max(1, parseInt(row.quantity, 10) || 1);
    const totalOrderHpp = totalHppUnit * quantity;
    const totalOrderRevenue = sellingPrice * quantity;
    const totalOrderProfit = profitUnit * quantity;

    return {
      weight,
      costPerGram,
      subtotalFilament,
      printHours,
      electricityPerHour,
      subtotalElectricity,
      otherCosts,
      totalHppUnit,
      sellingPrice,
      profitUnit,
      marginPercent,
      markupPercent,
      quantity,
      totalOrderHpp,
      totalOrderRevenue,
      totalOrderProfit
    };
  };

  // Update a single cell in a row
  const handleCellChange = (id, field, value) => {
    setRows(prevRows => prevRows.map(r => {
      if (r.id !== id) return r;
      return { ...r, [field]: value };
    }));
  };

  // Add a new empty row
  const handleAddRow = () => {
    const newId = Date.now();
    const newRow = {
      id: newId,
      name: `Souvenir Wisuda Item #${rows.length + 1}`,
      weight: 25,
      costPerGram: defaultSettings.costPerGram,
      printHours: 1.5,
      electricityPerHour: defaultSettings.electricityPerHour,
      otherCostsDesc: 'Bingkai / Kemasan Wisuda',
      otherCosts: 15000,
      sellingPrice: 45000,
      quantity: 20,
      notes: ''
    };
    setRows([...rows, newRow]);
  };

  // Duplicate an existing row
  const handleDuplicateRow = (row) => {
    const newRow = {
      ...row,
      id: Date.now(),
      name: `${row.name} (Salinan)`,
    };
    setRows([...rows, newRow]);
  };

  // Delete confirm
  const handleConfirmDelete = () => {
    if (rowToDelete) {
      setRows(rows.filter(r => r.id !== rowToDelete.id));
      setRowToDelete(null);
    }
  };

  // Add from Souvenir Template
  const handleAddFromTemplate = (template) => {
    const newRow = {
      ...template,
      id: Date.now(),
      costPerGram: template.costPerGram || defaultSettings.costPerGram,
      electricityPerHour: template.electricityPerHour || defaultSettings.electricityPerHour
    };
    setRows([...rows, newRow]);
  };

  // Reset to initial sample data
  const handleResetToDefault = () => {
    if (window.confirm("Muat ulang contoh data souvenir wisuda? Data yang sudah diubah saat ini akan diganti dengan contoh bawaan.")) {
      setRows(INITIAL_ROWS);
    }
  };

  // Export to CSV spreadsheet
  const handleExportCSV = () => {
    if (rows.length === 0) {
      alert("Spreadsheet masih kosong. Tambahkan baris terlebih dahulu!");
      return;
    }

    const headers = [
      "No",
      "Nama Item / Souvenir Wisuda",
      "Keterangan Bingkai / Tambahan",
      "Berat Filament (Gram)",
      "Harga Filament/gr (Rp)",
      "Subtotal Bahan (Rp)",
      "Lama Print (Jam)",
      "Biaya Listrik/jam (Rp)",
      "Subtotal Listrik (Rp)",
      "Biaya Bingkai & Lain (Rp)",
      "Total HPP per Pcs (Rp)",
      "Harga Jual per Pcs (Rp)",
      "Laba Bersih per Pcs (Rp)",
      "Margin (%)",
      "Jumlah Order (Qty)",
      "Total HPP Order (Rp)",
      "Total Omset Order (Rp)",
      "Total Laba Bersih Order (Rp)",
      "Catatan"
    ];

    const csvRows = rows.map((r, idx) => {
      const calc = computeRow(r);
      return [
        idx + 1,
        `"${(r.name || '').replace(/"/g, '""')}"`,
        `"${(r.otherCostsDesc || '').replace(/"/g, '""')}"`,
        calc.weight,
        calc.costPerGram,
        calc.subtotalFilament,
        calc.printHours,
        calc.electricityPerHour,
        calc.subtotalElectricity,
        calc.otherCosts,
        calc.totalHppUnit,
        calc.sellingPrice,
        calc.profitUnit,
        calc.marginPercent.toFixed(1) + "%",
        calc.quantity,
        calc.totalOrderHpp,
        calc.totalOrderRevenue,
        calc.totalOrderProfit,
        `"${(r.notes || '').replace(/"/g, '""')}"`
      ];
    });

    // Add Total summary row to CSV
    const totalQty = rows.reduce((acc, r) => acc + (parseInt(r.quantity, 10) || 1), 0);
    const totalFilamentCost = rows.reduce((acc, r) => acc + (computeRow(r).subtotalFilament * computeRow(r).quantity), 0);
    const totalElectricityCost = rows.reduce((acc, r) => acc + (computeRow(r).subtotalElectricity * computeRow(r).quantity), 0);
    const totalOtherCost = rows.reduce((acc, r) => acc + (computeRow(r).otherCosts * computeRow(r).quantity), 0);
    const grandHpp = rows.reduce((acc, r) => acc + computeRow(r).totalOrderHpp, 0);
    const grandRevenue = rows.reduce((acc, r) => acc + computeRow(r).totalOrderRevenue, 0);
    const grandProfit = rows.reduce((acc, r) => acc + computeRow(r).totalOrderProfit, 0);

    csvRows.push([
      "TOTAL",
      "KESELURUHAN ESTIMASI ORDER SOUVENIR",
      "-",
      "-",
      "-",
      totalFilamentCost,
      "-",
      "-",
      totalElectricityCost,
      totalOtherCost,
      "-",
      "-",
      "-",
      "-",
      totalQty,
      grandHpp,
      grandRevenue,
      grandProfit,
      "-"
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...csvRows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Equa3D_HPP_Souvenir_Wisuda_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Quotation for WhatsApp
  const handleCopyWhatsAppQuote = () => {
    if (rows.length === 0) return;

    let text = `🎓 *PENAWARAN ORDER SOUVENIR WISUDA — EQUA3D PRINTING*\n`;
    text += `Tanggal: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}\n`;
    text += `--------------------------------------------------\n\n`;

    rows.forEach((r, idx) => {
      const calc = computeRow(r);
      text += `*${idx + 1}. ${r.name}*\n`;
      if (r.otherCostsDesc) {
        text += `   Include: ${r.otherCostsDesc}\n`;
      }
      text += `   - Jumlah: ${calc.quantity} pcs\n`;
      text += `   - Harga Satuan: ${formatRp(calc.sellingPrice)}\n`;
      text += `   - Subtotal: ${formatRp(calc.totalOrderRevenue)}\n\n`;
    });

    const grandRevenue = rows.reduce((acc, r) => acc + computeRow(r).totalOrderRevenue, 0);
    const totalPcs = rows.reduce((acc, r) => acc + (parseInt(r.quantity, 10) || 1), 0);

    text += `--------------------------------------------------\n`;
    text += `📦 *Total Kuantitas:* ${totalPcs} Pcs Souvenir\n`;
    text += `💰 *TOTAL ESTIMASI ORDER:* ${formatRp(grandRevenue)}\n`;
    text += `⚡ *Bahan Cetak:* 3D Print Premium High Detail + Finishing\n`;
    text += `📞 Hubungi kami untuk penyesuaian desain & jadwal pengerjaan.\n`;
    text += `_Equa3D Studio — Solusi Cetak 3D & Souvenir Terpercaya_`;

    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 3000);
  };

  // Grand summary calculations across all rows
  const summary = rows.reduce((acc, r) => {
    const calc = computeRow(r);
    acc.totalItems += 1;
    acc.totalQuantity += calc.quantity;
    acc.totalWeightGrams += (calc.weight * calc.quantity);
    acc.totalPrintHours += (calc.printHours * calc.quantity);
    acc.totalFilamentCost += (calc.subtotalFilament * calc.quantity);
    acc.totalElectricityCost += (calc.subtotalElectricity * calc.quantity);
    acc.totalOtherCost += (calc.otherCosts * calc.quantity);
    acc.grandTotalHpp += calc.totalOrderHpp;
    acc.grandTotalRevenue += calc.totalOrderRevenue;
    acc.grandTotalProfit += calc.totalOrderProfit;
    return acc;
  }, {
    totalItems: 0,
    totalQuantity: 0,
    totalWeightGrams: 0,
    totalPrintHours: 0,
    totalFilamentCost: 0,
    totalElectricityCost: 0,
    totalOtherCost: 0,
    grandTotalHpp: 0,
    grandTotalRevenue: 0,
    grandTotalProfit: 0
  });

  const overallMarginPercent = summary.grandTotalRevenue > 0 
    ? ((summary.grandTotalProfit / summary.grandTotalRevenue) * 100) 
    : 0;

  // Filtered rows
  const filteredRows = searchFilter.trim() === ''
    ? rows
    : rows.filter(r => (r.name || '').toLowerCase().includes(searchFilter.toLowerCase()) || (r.otherCostsDesc || '').toLowerCase().includes(searchFilter.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Header Ribbon (Excel Green Accent Style) */}
      <div className="clean-card" style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, #0d5f30 0%, #107c41 50%, #16a34a 100%)',
        color: '#ffffff',
        borderRadius: '14px',
        boxShadow: '0 8px 24px -6px rgba(16, 124, 65, 0.35)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Excel grid lines background */}
        <div style={{
          position: 'absolute',
          right: '-40px',
          top: '-40px',
          width: '260px',
          height: '260px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(8px)',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileSpreadsheet size={30} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
                  Spreadsheet Kalkulator HPP Cetak & Souvenir Wisuda
                </h1>
                <span style={{
                  background: '#fef08a',
                  color: '#854d0e',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  Excel-Like Auto Formula
                </span>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.9)', margin: 0, maxWidth: '650px', lineHeight: 1.4 }}>
                Hitung otomatis <strong>Harga Pokok Produksi (HPP)</strong> souvenir wisuda, bingkai pigura 3D, dan aksesoris. 
                Rumus otomatis menghitung <em>[Berat × Filament] + [Waktu × Listrik (Rp {defaultSettings.electricityPerHour}/jam)] + [Bingkai/Mika]</em>.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: showSettingsDrawer ? '#ffffff' : 'rgba(255, 255, 255, 0.18)',
                color: showSettingsDrawer ? '#107c41' : '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Atur tarif dasar listrik dan filament"
            >
              <Sliders size={16} />
              <span>Pengaturan Tarif Dasar</span>
              {showSettingsDrawer ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            <button
              onClick={handleExportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                color: '#107c41',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                transition: 'all 0.15s ease'
              }}
              title="Download format Excel (.CSV) untuk Microsoft Excel atau Google Spreadsheet"
            >
              <Download size={16} />
              <span>Ekspor ke Excel</span>
            </button>

            <button
              onClick={handleCopyWhatsAppQuote}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: copiedQuote ? '#dcfce7' : 'rgba(255, 255, 255, 0.22)',
                color: copiedQuote ? '#15803d' : '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Salin penawaran harga souvenir wisuda dalam format teks rapi untuk WhatsApp"
            >
              {copiedQuote ? <Check size={16} /> : <Share2 size={16} />}
              <span>{copiedQuote ? 'Tersalin!' : 'Salin Quote WA'}</span>
            </button>
          </div>
        </div>

        {/* 2. Global Default Settings Drawer (Collapsible) */}
        {showSettingsDrawer && (
          <div style={{
            marginTop: '18px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.25)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            background: 'rgba(0, 0, 0, 0.15)',
            padding: '16px',
            borderRadius: '10px'
          }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f0fdf4', display: 'block', marginBottom: '6px' }}>
                ⚡ Tarif Listrik per Jam (Default)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>Rp</span>
                <input
                  type="number"
                  value={defaultSettings.electricityPerHour}
                  onChange={(e) => setDefaultSettings(prev => ({ ...prev, electricityPerHour: parseFloat(e.target.value) || 0 }))}
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 34px',
                    borderRadius: '7px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    background: '#ffffff'
                  }}
                  placeholder="200"
                />
              </div>
              <div style={{ fontSize: '0.72rem', color: '#bbf7d0', marginTop: '4px' }}>
                *Daya 3D printer ~150-250W berkisar Rp 200 - Rp 500/jam
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f0fdf4', display: 'block', marginBottom: '6px' }}>
                🧵 Harga Filament per Gram (Default)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>Rp</span>
                <input
                  type="number"
                  value={defaultSettings.costPerGram}
                  onChange={(e) => setDefaultSettings(prev => ({ ...prev, costPerGram: parseFloat(e.target.value) || 0 }))}
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 34px',
                    borderRadius: '7px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    background: '#ffffff'
                  }}
                  placeholder="200"
                />
              </div>
              <div style={{ fontSize: '0.72rem', color: '#bbf7d0', marginTop: '4px' }}>
                *Rp 200.000 / 1kg spool = Rp 200/gram
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  if (window.confirm(`Terapkan tarif listrik Rp ${defaultSettings.electricityPerHour}/jam & filament Rp ${defaultSettings.costPerGram}/gr ke SELURUH baris di tabel?`)) {
                    setRows(prev => prev.map(r => ({
                      ...r,
                      electricityPerHour: defaultSettings.electricityPerHour,
                      costPerGram: defaultSettings.costPerGram
                    })));
                  }
                }}
                style={{
                  padding: '9px 14px',
                  borderRadius: '7px',
                  border: '1px solid rgba(255,255,255,0.4)',
                  background: 'rgba(255,255,255,0.25)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={14} />
                <span>Terapkan ke Semua Baris</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '14px'
      }}>
        {/* Total Quantity */}
        <div className="clean-card" style={{ padding: '16px 18px', background: 'var(--bg-card)', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Order Wisuda
            </span>
            <Box size={18} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {summary.totalQuantity} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>pcs</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Dari {summary.totalItems} jenis souvenir wisuda
          </div>
        </div>

        {/* Total Modal HPP Keseluruhan */}
        <div className="clean-card" style={{ padding: '16px 18px', background: 'var(--bg-card)', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Modal HPP
            </span>
            <DollarSign size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#d97706' }}>
            {formatRp(summary.grandTotalHpp)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Bahan + Listrik + Bingkai
          </div>
        </div>

        {/* Total Omset Proyeksi */}
        <div className="clean-card" style={{ padding: '16px 18px', background: 'var(--bg-card)', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Omset Order
            </span>
            <Calculator size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#059669' }}>
            {formatRp(summary.grandTotalRevenue)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
            Harga jual × Kuantitas order
          </div>
        </div>

        {/* Estimasi Laba Bersih */}
        <div className="clean-card" style={{ padding: '16px 18px', background: 'var(--bg-card)', borderLeft: '4px solid #16a34a' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
              Estimasi Laba Bersih
            </span>
            <Sparkles size={18} color="#16a34a" />
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#16a34a' }}>
            {formatRp(summary.grandTotalProfit)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700, marginTop: '4px' }}>
            Margin Bersih: {overallMarginPercent.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* 3. Toolbar: Formula Bar (fx) & Quick Presets & Search */}
      <div className="clean-card" style={{
        padding: '14px 18px',
        background: 'var(--bg-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Formula Bar (Excel fx Bar) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--bg-subtle)',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{
            background: '#107c41',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.78rem',
            padding: '3px 9px',
            borderRadius: '5px',
            fontStyle: 'italic',
            letterSpacing: '0.04em'
          }}>
            fx
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', flex: 1, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, color: '#107c41' }}>
              Kolom {activeCellInfo.col} ({activeCellInfo.colName}):
            </span>
            <code style={{ background: 'var(--bg-card)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-light)', color: '#0f172a', fontWeight: 600 }}>
              {activeCellInfo.formula}
            </code>
            <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
              Misal: {activeCellInfo.example}
            </span>
          </div>
        </div>

        {/* Action Row: Add Row, Presets Dropdown, Search, Reset */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Left: Add Row & Preset Templates */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleAddRow}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#107c41',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(16, 124, 65, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <Plus size={16} />
              <span>Tambah Baris Baru (+ Row)</span>
            </button>

            {/* Template Presets Dropdown */}
            <div style={{ position: 'relative' }}>
              <select
                onChange={(e) => {
                  const idx = parseInt(e.target.value, 10);
                  if (!isNaN(idx) && SOUVENIR_TEMPLATES[idx]) {
                    handleAddFromTemplate(SOUVENIR_TEMPLATES[idx]);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="input-custom"
                style={{
                  padding: '7px 12px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid #107c41',
                  color: '#107c41',
                  background: '#f0fdf4',
                  borderRadius: '8px'
                }}
              >
                <option value="" disabled>🎓 + Pilih Template Souvenir Wisuda...</option>
                {SOUVENIR_TEMPLATES.map((tmpl, idx) => (
                  <option key={idx} value={idx}>
                    {tmpl.name} (3D Print + Bingkai)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Search Filter & Reset */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="text"
              placeholder="Cari item souvenir / bingkai..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                width: '210px'
              }}
            />

            <button
              onClick={handleResetToDefault}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-light)',
                padding: '7px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
              title="Reset ke contoh data souvenir wisuda awal"
            >
              <RefreshCw size={13} />
              <span>Reset Contoh</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. The Excel Spreadsheet Table */}
      <div className="clean-card" style={{
        padding: '0',
        background: 'var(--bg-card)',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
          <table style={{
            width: '100%',
            minWidth: '1480px',
            borderCollapse: 'collapse',
            fontSize: '0.84rem',
            textAlign: 'left'
          }}>
            {/* Table Header: Column Letters (A, B, C...) + Titles */}
            <thead>
              {/* Row 1: Column Letters */}
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.72rem', fontWeight: 800 }}>
                <th style={{ padding: '4px 8px', textAlign: 'center', width: '38px', borderRight: '1px solid #e2e8f0' }}>#</th>
                <th style={{ padding: '4px 10px', width: '250px', borderRight: '1px solid #e2e8f0' }}>A</th>
                <th style={{ padding: '4px 8px', width: '85px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>B</th>
                <th style={{ padding: '4px 8px', width: '110px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>C</th>
                <th style={{ padding: '4px 8px', width: '120px', textAlign: 'right', borderRight: '1px solid #e2e8f0', background: '#ecfdf5', color: '#047857' }}>D [fx]</th>
                <th style={{ padding: '4px 8px', width: '85px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>E</th>
                <th style={{ padding: '4px 8px', width: '105px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>F</th>
                <th style={{ padding: '4px 8px', width: '110px', textAlign: 'right', borderRight: '1px solid #e2e8f0', background: '#ecfdf5', color: '#047857' }}>G [fx]</th>
                <th style={{ padding: '4px 10px', width: '200px', borderRight: '1px solid #e2e8f0' }}>H (Rincian & Biaya)</th>
                <th style={{ padding: '4px 8px', width: '125px', textAlign: 'right', borderRight: '1px solid #e2e8f0', background: '#fef3c7', color: '#92400e' }}>I [fx]</th>
                <th style={{ padding: '4px 8px', width: '125px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>J</th>
                <th style={{ padding: '4px 8px', width: '115px', textAlign: 'right', borderRight: '1px solid #e2e8f0', background: '#ecfdf5', color: '#047857' }}>K [fx]</th>
                <th style={{ padding: '4px 8px', width: '75px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>L</th>
                <th style={{ padding: '4px 8px', width: '120px', textAlign: 'right', borderRight: '1px solid #e2e8f0', background: '#fef3c7', color: '#92400e' }}>M [fx]</th>
                <th style={{ padding: '4px 8px', width: '125px', textAlign: 'right', borderRight: '1px solid #e2e8f0', background: '#f0fdf4', color: '#15803d' }}>N [fx]</th>
                <th style={{ padding: '4px 8px', width: '125px', textAlign: 'right', borderRight: '1px solid #e2e8f0', background: '#dcfce7', color: '#15803d' }}>O [fx]</th>
                <th style={{ padding: '4px 8px', textAlign: 'center', width: '80px' }}>AKSI</th>
              </tr>

              {/* Row 2: Human Readable Column Names */}
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', color: '#1e293b', fontWeight: 800 }}>
                <th style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>Row</th>
                
                <th style={{ padding: '10px 10px', borderRight: '1px solid #e2e8f0' }}>
                  Nama Item / Souvenir Wisuda
                </th>

                <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }} title="Berat cetak 3D dalam satuan gram">
                  Berat (gr)
                </th>

                <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }} title="Harga filament satuan per gram">
                  Filament/gr
                </th>

                <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e2e8f0', background: '#e6fcf1', color: '#065f46' }} title="Rumus: Berat × Harga Filament">
                  Subtotal Bahan
                </th>

                <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }} title="Waktu pengerjaan printer dalam jam (desimal diperbolehkan)">
                  Waktu (Jam)
                </th>

                <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }} title="Tarif listrik printer per jam">
                  Listrik/Jam
                </th>

                <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e2e8f0', background: '#e6fcf1', color: '#065f46' }} title="Rumus: Jam Print × Tarif Listrik">
                  Subtotal Listrik
                </th>

                <th style={{ padding: '10px 10px', borderRight: '1px solid #e2e8f0' }} title="Biaya tambahan lain seperti bingkai pigura, mika, pita, dll">
                  Bingkai & Tambahan (Rp)
                </th>

                <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e2e8f0', background: '#fef08a', color: '#854d0e' }} title="Rumus: Bahan + Listrik + Bingkai">
                  Total HPP Satuan
                </th>

                <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }} title="Harga jual yang Anda tentukan ke customer">
                  Harga Jual/Pcs
                </th>

                <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e2e8f0', background: '#e6fcf1', color: '#065f46' }} title="Rumus: Harga Jual - Total HPP">
                  Laba / Margin
                </th>

                <th style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }} title="Jumlah pesanan souvenir wisuda">
                  Qty (Pcs)
                </th>

                <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e2e8f0', background: '#fef08a', color: '#854d0e' }} title="Rumus: HPP Satuan × Qty">
                  Total HPP Order
                </th>

                <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e2e8f0', background: '#ecfdf5', color: '#065f46' }} title="Rumus: Harga Jual × Qty">
                  Total Omset
                </th>

                <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e2e8f0', background: '#bbf7d0', color: '#14532d' }} title="Rumus: Laba Satuan × Qty">
                  Total Laba Bersih
                </th>

                <th style={{ padding: '10px 8px', textAlign: 'center' }}>
                  Aksi
                </th>
              </tr>
            </thead>

            {/* Table Body (Inline Editable Cells) */}
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="17" style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <FileSpreadsheet size={32} color="#cbd5e1" style={{ margin: '0 auto' }} />
                    </div>
                    Tidak ada baris yang cocok dengan pencarian "{searchFilter}".
                  </td>
                </tr>
              ) : (
                filteredRows.map((r, idx) => {
                  const calc = computeRow(r);
                  const isHovered = false;

                  return (
                    <tr 
                      key={r.id} 
                      style={{ 
                        borderBottom: '1px solid #e2e8f0',
                        background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                      onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#fafafa'}
                    >
                      {/* Row Number */}
                      <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 700, color: '#64748b', background: '#f8fafc', borderRight: '1px solid #e2e8f0' }}>
                        {idx + 1}
                      </td>

                      {/* Col A: Item Name */}
                      <td style={{ padding: '6px 8px', borderRight: '1px solid #e2e8f0' }}>
                        <input
                          type="text"
                          value={r.name}
                          onChange={(e) => handleCellChange(r.id, 'name', e.target.value)}
                          onFocus={() => setActiveCellInfo({
                            col: 'A',
                            colName: 'Nama Item / Komponen Souvenir',
                            formula: 'Input Teks Nama Produk / Souvenir Wisuda',
                            example: `"${r.name}"`
                          })}
                          placeholder="Nama Souvenir Wisuda..."
                          style={{
                            width: '100%',
                            border: '1px solid transparent',
                            background: 'transparent',
                            padding: '6px 8px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            color: '#0f172a',
                            fontSize: '0.84rem'
                          }}
                          onMouseEnter={(e) => e.target.style.borderColor = '#cbd5e1'}
                          onMouseLeave={(e) => e.target.style.borderColor = 'transparent'}
                        />
                      </td>

                      {/* Col B: Weight (gram) */}
                      <td style={{ padding: '6px 6px', borderRight: '1px solid #e2e8f0', textAlign: 'right' }}>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={r.weight}
                          onChange={(e) => handleCellChange(r.id, 'weight', e.target.value)}
                          onFocus={() => setActiveCellInfo({
                            col: 'B',
                            colName: 'Berat Filament',
                            formula: 'Input Angka Berat Cetak (Gram)',
                            example: `${r.weight} gr`
                          })}
                          style={{
                            width: '100%',
                            textAlign: 'right',
                            border: '1px solid transparent',
                            background: 'transparent',
                            padding: '6px 4px',
                            borderRadius: '4px',
                            fontWeight: 600,
                            color: '#0f172a',
                            fontSize: '0.84rem'
                          }}
                          onMouseEnter={(e) => e.target.style.borderColor = '#cbd5e1'}
                          onMouseLeave={(e) => e.target.style.borderColor = 'transparent'}
                        />
                      </td>

                      {/* Col C: Cost per Gram */}
                      <td style={{ padding: '6px 6px', borderRight: '1px solid #e2e8f0', textAlign: 'right' }}>
                        <input
                          type="number"
                          step="10"
                          min="0"
                          value={r.costPerGram}
                          onChange={(e) => handleCellChange(r.id, 'costPerGram', e.target.value)}
                          onFocus={() => setActiveCellInfo({
                            col: 'C',
                            colName: 'Harga Filament per Gram',
                            formula: 'Input Biaya Filament per gram (Rp)',
                            example: `Rp ${r.costPerGram}/gr`
                          })}
                          style={{
                            width: '100%',
                            textAlign: 'right',
                            border: '1px solid transparent',
                            background: 'transparent',
                            padding: '6px 4px',
                            borderRadius: '4px',
                            fontWeight: 600,
                            color: '#0f172a',
                            fontSize: '0.84rem'
                          }}
                          onMouseEnter={(e) => e.target.style.borderColor = '#cbd5e1'}
                          onMouseLeave={(e) => e.target.style.borderColor = 'transparent'}
                        />
                      </td>

                      {/* Col D [fx]: Subtotal Bahan Filament */}
                      <td 
                        onClick={() => setActiveCellInfo({
                          col: 'D',
                          colName: 'Subtotal Bahan Filament',
                          formula: '= B × C (Berat × Harga Filament/gr)',
                          example: `${calc.weight} gr × Rp ${calc.costPerGram} = ${formatRp(calc.subtotalFilament)}`
                        })}
                        style={{
                          padding: '8px 10px',
                          textAlign: 'right',
                          fontWeight: 700,
                          color: '#047857',
                          background: '#ecfdf5',
                          borderRight: '1px solid #e2e8f0',
                          cursor: 'pointer'
                        }}
                        title="Klik untuk lihat rumus [fx]"
                      >
                        {formatRp(calc.subtotalFilament)}
                      </td>

                      {/* Col E: Print Hours */}
                      <td style={{ padding: '6px 6px', borderRight: '1px solid #e2e8f0', textAlign: 'right' }}>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={r.printHours}
                          onChange={(e) => handleCellChange(r.id, 'printHours', e.target.value)}
                          onFocus={() => setActiveCellInfo({
                            col: 'E',
                            colName: 'Lama Pengerjaan / Print',
                            formula: 'Input Jam Print (Desimal, misal 2.5 = 2 jam 30 menit)',
                            example: `${r.printHours} Jam`
                          })}
                          style={{
                            width: '100%',
                            textAlign: 'right',
                            border: '1px solid transparent',
                            background: 'transparent',
                            padding: '6px 4px',
                            borderRadius: '4px',
                            fontWeight: 600,
                            color: '#0f172a',
                            fontSize: '0.84rem'
                          }}
                          onMouseEnter={(e) => e.target.style.borderColor = '#cbd5e1'}
                          onMouseLeave={(e) => e.target.style.borderColor = 'transparent'}
                        />
                      </td>

                      {/* Col F: Electricity per Hour */}
                      <td style={{ padding: '6px 6px', borderRight: '1px solid #e2e8f0', textAlign: 'right' }}>
                        <input
                          type="number"
                          step="10"
                          min="0"
                          value={r.electricityPerHour}
                          onChange={(e) => handleCellChange(r.id, 'electricityPerHour', e.target.value)}
                          onFocus={() => setActiveCellInfo({
                            col: 'F',
                            colName: 'Tarif Listrik per Jam',
                            formula: 'Input Biaya Listrik Printer per Jam (Rp, default 200)',
                            example: `Rp ${r.electricityPerHour}/jam`
                          })}
                          style={{
                            width: '100%',
                            textAlign: 'right',
                            border: '1px solid transparent',
                            background: 'transparent',
                            padding: '6px 4px',
                            borderRadius: '4px',
                            fontWeight: 600,
                            color: '#0f172a',
                            fontSize: '0.84rem'
                          }}
                          onMouseEnter={(e) => e.target.style.borderColor = '#cbd5e1'}
                          onMouseLeave={(e) => e.target.style.borderColor = 'transparent'}
                        />
                      </td>

                      {/* Col G [fx]: Subtotal Listrik */}
                      <td 
                        onClick={() => setActiveCellInfo({
                          col: 'G',
                          colName: 'Subtotal Listrik',
                          formula: '= E × F (Lama Print × Biaya Listrik/jam)',
                          example: `${calc.printHours} jam × Rp ${calc.electricityPerHour} = ${formatRp(calc.subtotalElectricity)}`
                        })}
                        style={{
                          padding: '8px 10px',
                          textAlign: 'right',
                          fontWeight: 700,
                          color: '#047857',
                          background: '#ecfdf5',
                          borderRight: '1px solid #e2e8f0',
                          cursor: 'pointer'
                        }}
                        title="Klik untuk lihat rumus [fx]"
                      >
                        {formatRp(calc.subtotalElectricity)}
                      </td>

                      {/* Col H: Other Costs (Bingkai, Mika, Stiker dll) */}
                      <td style={{ padding: '4px 6px', borderRight: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <input
                            type="text"
                            value={r.otherCostsDesc || ''}
                            onChange={(e) => handleCellChange(r.id, 'otherCostsDesc', e.target.value)}
                            placeholder="Contoh: Bingkai 3D Box + Mika"
                            style={{
                              width: '100%',
                              border: '1px solid transparent',
                              background: 'transparent',
                              padding: '2px 4px',
                              fontSize: '0.74rem',
                              color: '#64748b'
                            }}
                            title="Keterangan bingkai / bahan tambahan"
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>Rp</span>
                            <input
                              type="number"
                              step="500"
                              min="0"
                              value={r.otherCosts}
                              onChange={(e) => handleCellChange(r.id, 'otherCosts', e.target.value)}
                              onFocus={() => setActiveCellInfo({
                                col: 'H',
                                colName: 'Biaya Bingkai & Tambahan Lain-lain',
                                formula: 'Input Biaya Bingkai Pigura, Mika, Pita, Akrilik dll (Rp)',
                                example: `Rp ${formatNumber(r.otherCosts)} (${r.otherCostsDesc || 'Bingkai'})`
                              })}
                              style={{
                                width: '100%',
                                textAlign: 'right',
                                border: '1px solid #e2e8f0',
                                background: '#ffffff',
                                padding: '4px 6px',
                                borderRadius: '4px',
                                fontWeight: 700,
                                color: '#0f172a',
                                fontSize: '0.82rem'
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Col I [fx]: Total HPP Satuan */}
                      <td 
                        onClick={() => setActiveCellInfo({
                          col: 'I',
                          colName: 'Total HPP Satuan',
                          formula: '= D + G + H (Bahan + Listrik + Bingkai)',
                          example: `${formatRp(calc.subtotalFilament)} + ${formatRp(calc.subtotalElectricity)} + ${formatRp(calc.otherCosts)} = ${formatRp(calc.totalHppUnit)}`
                        })}
                        style={{
                          padding: '8px 10px',
                          textAlign: 'right',
                          fontWeight: 800,
                          color: '#92400e',
                          background: '#fef3c7',
                          borderRight: '1px solid #e2e8f0',
                          cursor: 'pointer'
                        }}
                        title="Klik untuk lihat rumus [fx]"
                      >
                        {formatRp(calc.totalHppUnit)}
                      </td>

                      {/* Col J: Selling Price */}
                      <td style={{ padding: '6px 6px', borderRight: '1px solid #e2e8f0', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>Rp</span>
                          <input
                            type="number"
                            step="1000"
                            min="0"
                            value={r.sellingPrice}
                            onChange={(e) => handleCellChange(r.id, 'sellingPrice', e.target.value)}
                            onFocus={() => setActiveCellInfo({
                              col: 'J',
                              colName: 'Harga Jual Satuan',
                              formula: 'Input Harga Jual Satuan ke Pembeli (Rp)',
                              example: formatRp(r.sellingPrice)
                            })}
                            style={{
                              width: '100%',
                              textAlign: 'right',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              padding: '5px 6px',
                              borderRadius: '4px',
                              fontWeight: 700,
                              color: '#0f172a',
                              fontSize: '0.84rem'
                            }}
                          />
                        </div>
                      </td>

                      {/* Col K [fx]: Laba / Margin */}
                      <td 
                        onClick={() => setActiveCellInfo({
                          col: 'K',
                          colName: 'Laba & Margin Bersih per Pcs',
                          formula: '= J - I (Harga Jual - Total HPP)',
                          example: `${formatRp(calc.sellingPrice)} - ${formatRp(calc.totalHppUnit)} = ${formatRp(calc.profitUnit)} (${calc.marginPercent.toFixed(1)}%)`
                        })}
                        style={{
                          padding: '8px 10px',
                          textAlign: 'right',
                          fontWeight: 700,
                          color: calc.profitUnit >= 0 ? '#047857' : '#dc2626',
                          background: calc.profitUnit >= 0 ? '#ecfdf5' : '#fef2f2',
                          borderRight: '1px solid #e2e8f0',
                          cursor: 'pointer'
                        }}
                        title="Klik untuk lihat rumus [fx]"
                      >
                        <div>{formatRp(calc.profitUnit)}</div>
                        <div style={{ fontSize: '0.7rem', color: calc.profitUnit >= 0 ? '#059669' : '#b91c1c', fontWeight: 800 }}>
                          {calc.marginPercent.toFixed(1)}%
                        </div>
                      </td>

                      {/* Col L: Quantity (Qty Pcs) */}
                      <td style={{ padding: '6px 6px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <input
                          type="number"
                          min="1"
                          value={r.quantity}
                          onChange={(e) => handleCellChange(r.id, 'quantity', e.target.value)}
                          onFocus={() => setActiveCellInfo({
                            col: 'L',
                            colName: 'Jumlah Order (Qty)',
                            formula: 'Input Total Pcs Order Souvenir Wisuda',
                            example: `${r.quantity} Pcs`
                          })}
                          style={{
                            width: '100%',
                            textAlign: 'center',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            padding: '5px 4px',
                            borderRadius: '4px',
                            fontWeight: 800,
                            color: '#0f172a',
                            fontSize: '0.84rem'
                          }}
                        />
                      </td>

                      {/* Col M [fx]: Total HPP Order */}
                      <td 
                        onClick={() => setActiveCellInfo({
                          col: 'M',
                          colName: 'Total HPP Order',
                          formula: '= I × L (Total HPP Satuan × Qty)',
                          example: `${formatRp(calc.totalHppUnit)} × ${calc.quantity} pcs = ${formatRp(calc.totalOrderHpp)}`
                        })}
                        style={{
                          padding: '8px 10px',
                          textAlign: 'right',
                          fontWeight: 800,
                          color: '#92400e',
                          background: '#fef3c7',
                          borderRight: '1px solid #e2e8f0',
                          cursor: 'pointer'
                        }}
                        title="Klik untuk lihat rumus [fx]"
                      >
                        {formatRp(calc.totalOrderHpp)}
                      </td>

                      {/* Col N [fx]: Total Omset Order */}
                      <td 
                        onClick={() => setActiveCellInfo({
                          col: 'N',
                          colName: 'Total Omset Order',
                          formula: '= J × L (Harga Jual × Qty)',
                          example: `${formatRp(calc.sellingPrice)} × ${calc.quantity} pcs = ${formatRp(calc.totalOrderRevenue)}`
                        })}
                        style={{
                          padding: '8px 10px',
                          textAlign: 'right',
                          fontWeight: 800,
                          color: '#047857',
                          background: '#f0fdf4',
                          borderRight: '1px solid #e2e8f0',
                          cursor: 'pointer'
                        }}
                        title="Klik untuk lihat rumus [fx]"
                      >
                        {formatRp(calc.totalOrderRevenue)}
                      </td>

                      {/* Col O [fx]: Total Laba Bersih Order */}
                      <td 
                        onClick={() => setActiveCellInfo({
                          col: 'O',
                          colName: 'Total Laba Bersih Order',
                          formula: '= K × L (Laba Satuan × Qty)',
                          example: `${formatRp(calc.profitUnit)} × ${calc.quantity} pcs = ${formatRp(calc.totalOrderProfit)}`
                        })}
                        style={{
                          padding: '8px 10px',
                          textAlign: 'right',
                          fontWeight: 800,
                          color: '#15803d',
                          background: '#dcfce7',
                          borderRight: '1px solid #e2e8f0',
                          cursor: 'pointer'
                        }}
                        title="Klik untuk lihat rumus [fx]"
                      >
                        {formatRp(calc.totalOrderProfit)}
                      </td>

                      {/* Col P: Actions */}
                      <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <button
                            onClick={() => handleDuplicateRow(r)}
                            style={{
                              background: '#f1f5f9',
                              border: 'none',
                              color: '#475569',
                              padding: '5px',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                            title="Duplikat baris ini"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={() => setRowToDelete(r)}
                            style={{
                              background: '#fee2e2',
                              border: 'none',
                              color: '#dc2626',
                              padding: '5px',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                            title="Hapus baris ini"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Table Footer: SUM(...) Totals like Excel */}
            <tfoot>
              <tr style={{ background: '#f1f5f9', borderTop: '2px solid #cbd5e1', fontWeight: 800, color: '#0f172a' }}>
                <td style={{ padding: '12px 6px', textAlign: 'center', background: '#e2e8f0', borderRight: '1px solid #cbd5e1' }}>Σ</td>
                
                <td style={{ padding: '12px 10px', borderRight: '1px solid #cbd5e1' }}>
                  <div style={{ fontSize: '0.86rem', color: '#1e293b' }}>
                    TOTAL KESELURUHAN ({summary.totalItems} Items)
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                    Estimasi kebutuhan: {formatNumber(summary.totalWeightGrams / 1000, 2)} kg filament & ~{formatNumber(summary.totalPrintHours, 1)} jam mesin
                  </div>
                </td>

                <td style={{ padding: '12px 6px', textAlign: 'right', borderRight: '1px solid #cbd5e1', fontSize: '0.8rem' }}>
                  {formatNumber(summary.totalWeightGrams)}g
                </td>

                <td style={{ padding: '12px 6px', textAlign: 'right', borderRight: '1px solid #cbd5e1', color: '#64748b', fontSize: '0.78rem' }}>
                  -
                </td>

                <td style={{ padding: '12px 10px', textAlign: 'right', borderRight: '1px solid #cbd5e1', background: '#ecfdf5', color: '#047857' }}>
                  {formatRp(summary.totalFilamentCost)}
                </td>

                <td style={{ padding: '12px 6px', textAlign: 'right', borderRight: '1px solid #cbd5e1', fontSize: '0.8rem' }}>
                  {formatNumber(summary.totalPrintHours, 1)}h
                </td>

                <td style={{ padding: '12px 6px', textAlign: 'right', borderRight: '1px solid #cbd5e1', color: '#64748b', fontSize: '0.78rem' }}>
                  -
                </td>

                <td style={{ padding: '12px 10px', textAlign: 'right', borderRight: '1px solid #cbd5e1', background: '#ecfdf5', color: '#047857' }}>
                  {formatRp(summary.totalElectricityCost)}
                </td>

                <td style={{ padding: '12px 10px', textAlign: 'right', borderRight: '1px solid #cbd5e1' }}>
                  {formatRp(summary.totalOtherCost)}
                </td>

                <td style={{ padding: '12px 10px', textAlign: 'right', borderRight: '1px solid #cbd5e1', background: '#fef3c7', color: '#92400e' }}>
                  -
                </td>

                <td style={{ padding: '12px 10px', textAlign: 'right', borderRight: '1px solid #cbd5e1', color: '#64748b' }}>
                  -
                </td>

                <td style={{ padding: '12px 10px', textAlign: 'right', borderRight: '1px solid #cbd5e1', background: '#ecfdf5', color: '#047857' }}>
                  -
                </td>

                {/* Total Quantity */}
                <td style={{ padding: '12px 6px', textAlign: 'center', borderRight: '1px solid #cbd5e1', background: '#e0f2fe', color: '#0369a1', fontWeight: 900 }}>
                  {summary.totalQuantity}
                </td>

                {/* Grand Total HPP */}
                <td style={{ padding: '12px 10px', textAlign: 'right', borderRight: '1px solid #cbd5e1', background: '#fef3c7', color: '#92400e', fontSize: '0.9rem' }}>
                  {formatRp(summary.grandTotalHpp)}
                </td>

                {/* Grand Total Omset */}
                <td style={{ padding: '12px 10px', textAlign: 'right', borderRight: '1px solid #cbd5e1', background: '#f0fdf4', color: '#15803d', fontSize: '0.92rem' }}>
                  {formatRp(summary.grandTotalRevenue)}
                </td>

                {/* Grand Total Profit */}
                <td style={{ padding: '12px 10px', textAlign: 'right', borderRight: '1px solid #cbd5e1', background: '#bbf7d0', color: '#14532d', fontSize: '0.95rem' }}>
                  {formatRp(summary.grandTotalProfit)}
                </td>

                <td style={{ padding: '12px 8px', textAlign: 'center', background: '#e2e8f0' }}>
                  -
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Quick Add Bottom Bar */}
        <div style={{
          padding: '12px 16px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <button
            onClick={handleAddRow}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              color: '#107c41',
              border: '1px dashed #107c41',
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Plus size={15} />
            <span>+ Tambah Baris Kosong (Row #{rows.length + 1})</span>
          </button>

          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            💡 <strong>Tips:</strong> Klik angka mana saja untuk langsung mengedit nilai seperti di Excel. Perubahan disimpan otomatis di memori browser.
          </div>
        </div>
      </div>

      {/* 5. Package Bundling Breakdown & Quotation Helper */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px'
      }}>
        {/* Card 1: Penjelasan Rumus & Variabel */}
        <div className="clean-card" style={{ padding: '20px', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ background: '#eff6ff', color: '#2563eb', padding: '6px', borderRadius: '6px' }}>
              <Calculator size={18} />
            </div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Struktur Rumus Excel di Balik Sistem
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <div style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: '6px' }}>
              <strong style={{ color: '#0f172a' }}>1. Biaya Bahan Filament:</strong>
              <div style={{ color: '#047857', fontWeight: 600, marginTop: '2px' }}>
                Subtotal Filament = Berat (gr) × Harga Filament/gr
              </div>
            </div>

            <div style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: '6px' }}>
              <strong style={{ color: '#0f172a' }}>2. Biaya Operasional Listrik:</strong>
              <div style={{ color: '#047857', fontWeight: 600, marginTop: '2px' }}>
                Subtotal Listrik = Lama Print (jam) × Tarif Listrik/jam (Rp {defaultSettings.electricityPerHour})
              </div>
            </div>

            <div style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: '6px' }}>
              <strong style={{ color: '#0f172a' }}>3. Total Modal HPP Satuan:</strong>
              <div style={{ color: '#d97706', fontWeight: 700, marginTop: '2px' }}>
                HPP Satuan = Subtotal Filament + Subtotal Listrik + Bingkai/Aksesoris
              </div>
            </div>

            <div style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: '6px' }}>
              <strong style={{ color: '#0f172a' }}>4. Laba Bersih & Margin:</strong>
              <div style={{ color: '#16a34a', fontWeight: 700, marginTop: '2px' }}>
                Laba Bersih = (Harga Jual - HPP) × Kuantitas Order
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: WhatsApp Quote Preview */}
        <div className="clean-card" style={{ padding: '20px', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '6px', borderRadius: '6px' }}>
                <Share2 size={18} />
              </div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Format Chat WhatsApp (Quotation Wisuda)
              </h3>
            </div>
            <button
              onClick={handleCopyWhatsAppQuote}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: copiedQuote ? '#16a34a' : '#107c41',
                color: '#ffffff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {copiedQuote ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedQuote ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>
          </div>

          <div style={{
            background: 'var(--bg-subtle)',
            padding: '12px 14px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '0.78rem',
            lineHeight: 1.5,
            color: 'var(--text-primary)',
            maxHeight: '190px',
            overflowY: 'auto',
            whiteSpace: 'pre-line'
          }}>
            {`🎓 *PENAWARAN SOUVENIR WISUDA — EQUA3D*
Total Item: ${summary.totalItems} Jenis | Total: ${summary.totalQuantity} Pcs
Total Nilai Order: ${formatRp(summary.grandTotalRevenue)}

Kebutuhan: Cetak 3D + Bingkai/Finishing Lengkap. Siap dikirim ke panitia wisuda.`}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '8px' }}>
            Klik tombol "Salin Teks" di atas untuk membagikan rincian harga ke pembeli via WhatsApp.
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {rowToDelete && (
        <DeleteConfirmModal
          productTitle={rowToDelete.name}
          onClose={() => setRowToDelete(null)}
          onConfirmDelete={handleConfirmDelete}
        />
      )}

    </div>
  );
}
