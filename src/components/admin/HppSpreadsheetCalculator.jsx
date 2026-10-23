import React, { useState, useEffect, useRef } from 'react';
import { 
  FileSpreadsheet, Plus, Trash2, Copy, Download, Sparkles, 
  RefreshCw, DollarSign, Clock, HelpCircle, Check, 
  Share2, ArrowDown, ChevronDown, ChevronUp, Sliders, Info,
  Calculator, Layers, Box, AlertTriangle, X, Edit3, Tag
} from 'lucide-react';
import DeleteConfirmModal from '../DeleteConfirmModal';

// Helper to parse time strings like "1:20", "01:20", "1j 20m", "1h 20m", "80m", or decimal "1.5"
export const parseTimeString = (val) => {
  if (val === undefined || val === null || val === '') {
    return { hours: 0, minutes: 0, decimalHours: 0, timeStr: '0:00', displayLabel: '0 jam 0 mnt' };
  }
  
  if (typeof val === 'number') {
    const hours = Math.floor(Math.max(0, val));
    const minutes = Math.round((Math.max(0, val) - hours) * 60);
    return {
      hours,
      minutes,
      decimalHours: Math.max(0, val),
      timeStr: `${hours}:${String(minutes).padStart(2, '0')}`,
      displayLabel: `${hours} jam ${minutes} mnt`
    };
  }

  const str = String(val).trim().toLowerCase();
  
  // Format "1:20" or "01:20"
  if (str.includes(':')) {
    const parts = str.split(':');
    const hours = Math.max(0, parseInt(parts[0], 10) || 0);
    const minutes = Math.min(59, Math.max(0, parseInt(parts[1], 10) || 0));
    const decimalHours = hours + (minutes / 60);
    return {
      hours,
      minutes,
      decimalHours,
      timeStr: `${hours}:${String(minutes).padStart(2, '0')}`,
      displayLabel: `${hours} jam ${minutes} mnt`
    };
  }
  
  // Format "1h 20m" or "1j 20m" or "1jam 20menit"
  const hMatch = str.match(/(\d+)\s*(h|j|jam)/);
  const mMatch = str.match(/(\d+)\s*(m|mnt|menit)/);
  if (hMatch || mMatch) {
    const hours = hMatch ? Math.max(0, parseInt(hMatch[1], 10) || 0) : 0;
    const minutes = mMatch ? Math.min(59, Math.max(0, parseInt(mMatch[1], 10) || 0)) : 0;
    const decimalHours = hours + (minutes / 60);
    return {
      hours,
      minutes,
      decimalHours,
      timeStr: `${hours}:${String(minutes).padStart(2, '0')}`,
      displayLabel: `${hours} jam ${minutes} mnt`
    };
  }

  // Format "80m" (only minutes)
  if (str.endsWith('m') || str.endsWith('mnt') || str.endsWith('menit')) {
    const totalMin = Math.max(0, parseInt(str, 10) || 0);
    const hours = Math.floor(totalMin / 60);
    const minutes = totalMin % 60;
    return {
      hours,
      minutes,
      decimalHours: totalMin / 60,
      timeStr: `${hours}:${String(minutes).padStart(2, '0')}`,
      displayLabel: `${hours} jam ${minutes} mnt`
    };
  }

  // Fallback decimal number like "1.33" or "2"
  const num = Math.max(0, parseFloat(str) || 0);
  const hours = Math.floor(num);
  const minutes = Math.round((num - hours) * 60);
  return {
    hours,
    minutes,
    decimalHours: num,
    timeStr: `${hours}:${String(minutes).padStart(2, '0')}`,
    displayLabel: `${hours} jam ${minutes} mnt`
  };
};

// Initial graduation souvenir presets matching real 3D printing & souvenir workshops
const INITIAL_ROWS = [
  {
    id: 1,
    name: 'Souvenir Wisuda 3D Box Pigura (Karakter Toga)',
    weight: 38, // gram
    costPerGram: 200, // Rp / gram
    timeStr: '2:48', // 2 jam 48 menit = 2.8 jam
    electricityPerHour: 200, // Rp / jam
    additionalItems: [
      { id: 'add-1-1', name: 'Bingkai 3D Box Mika 15x20', cost: 18000 },
      { id: 'add-1-2', name: 'Cat Akrilik & Finishing Warna', cost: 2500 },
      { id: 'add-1-3', name: 'Stiker Plat Nama Emas & Pita', cost: 1500 }
    ],
    sellingPrice: 65000, // Rp harga jual satuan
    quantity: 25, // pcs order
    notes: 'Souvenir wisuda kampus batch A'
  },
  {
    id: 2,
    name: 'Gantungan Kunci Wisuda Nama Custom + Toga',
    weight: 9,
    costPerGram: 200,
    timeStr: '0:30', // 30 menit = 0.5 jam
    electricityPerHour: 200,
    additionalItems: [
      { id: 'add-2-1', name: 'Ring Gantungan Kunci Tebal', cost: 1500 },
      { id: 'add-2-2', name: 'Plastik Sealer & Kertas Ucapan', cost: 1000 }
    ],
    sellingPrice: 12000,
    quantity: 50,
    notes: 'Keychain wisuda custom nama masing-masing wisudawan'
  },
  {
    id: 3,
    name: 'Plakat Akrilik 3D Wisuda + Dudukan Kayu',
    weight: 32,
    costPerGram: 200,
    timeStr: '2:12', // 2 jam 12 menit = 2.2 jam
    electricityPerHour: 200,
    additionalItems: [
      { id: 'add-3-1', name: 'Tatakan Kayu Jati Belanda', cost: 12000 },
      { id: 'add-3-2', name: 'Cat Clear Finishing Glossy', cost: 2000 },
      { id: 'add-3-3', name: 'Stiker Plat Emas & Box Kardus', cost: 4000 }
    ],
    sellingPrice: 60000,
    quantity: 30,
    notes: 'Plakat wisuda sekolah / universitas'
  },
  {
    id: 4,
    name: 'Bingkai Lampu Lithophane 3D Foto Wisuda',
    weight: 90,
    costPerGram: 200,
    timeStr: '7:30', // 7 jam 30 menit = 7.5 jam
    electricityPerHour: 200,
    additionalItems: [
      { id: 'add-4-1', name: 'Bingkai Kayu 3D Minimalis', cost: 22000 },
      { id: 'add-4-2', name: 'Modul Strip LED USB 5V + Saklar', cost: 11000 },
      { id: 'add-4-3', name: 'Lem Baut & Perekat Panas', cost: 2000 }
    ],
    sellingPrice: 150000,
    quantity: 10,
    notes: 'Kado wisuda eksklusif foto berlampu'
  }
];

// Common quick chips for graduation souvenir accessories
const POPULAR_ACCESSORIES = [
  { name: 'Cat Akrilik & Kuas Finishing', cost: 2500 },
  { name: 'Bingkai 3D Box Mika 15x20', cost: 18000 },
  { name: 'Stiker Plat Nama Emas / Gold', cost: 1500 },
  { name: 'Ring Gantungan Kunci Tebal', cost: 1500 },
  { name: 'Kemasan Box Mika & Pita', cost: 3000 },
  { name: 'Lem Cyanoacrylate / Baut', cost: 500 },
  { name: 'Tatakan Kayu Pinus / Mahoni', cost: 12000 },
  { name: 'Tali Medali Wisuda Sablon', cost: 4500 },
  { name: 'Kertas Ucapan Wisuda Laminasi', cost: 800 }
];

// Quick templates for fast addition of souvenir orders
const SOUVENIR_TEMPLATES = [
  {
    name: 'Souvenir Karakter Wisuda 3D + Bingkai Box',
    weight: 38,
    costPerGram: 200,
    timeStr: '2:48',
    electricityPerHour: 200,
    additionalItems: [
      { id: 'tmpl-1-1', name: 'Bingkai 3D Box Mika 15x20', cost: 18000 },
      { id: 'tmpl-1-2', name: 'Cat Finishing Toga & Wajah', cost: 2500 },
      { id: 'tmpl-1-3', name: 'Stiker Nama Emas & Dudukan', cost: 1500 }
    ],
    sellingPrice: 65000,
    quantity: 30,
    notes: 'Karakter wisuda toga lengkap dengan pigura 3D'
  },
  {
    name: 'Gantungan Kunci Wisuda Nama & Topi Toga',
    weight: 8,
    costPerGram: 200,
    timeStr: '0:27', // 27 menit
    electricityPerHour: 200,
    additionalItems: [
      { id: 'tmpl-2-1', name: 'Ring Gantungan Kunci Tebal', cost: 1500 },
      { id: 'tmpl-2-2', name: 'Kemasan Plastik Sealer', cost: 500 }
    ],
    sellingPrice: 10000,
    quantity: 50,
    notes: 'Ganci souvenir massal untuk 1 angkatan wisuda'
  },
  {
    name: 'Medali Wisuda 3D Custom + Tali Sablon',
    weight: 18,
    costPerGram: 200,
    timeStr: '1:06', // 1 jam 6 menit
    electricityPerHour: 200,
    additionalItems: [
      { id: 'tmpl-3-1', name: 'Tali Medali Sablon Wisuda', cost: 4500 },
      { id: 'tmpl-3-2', name: 'Ring Gantungan Segitiga Medali', cost: 1000 },
      { id: 'tmpl-3-3', name: 'Cat Emas / Pewarna Akrilik', cost: 1000 }
    ],
    sellingPrice: 25000,
    quantity: 40,
    notes: 'Medali wisuda anak TK/SD/Universitas'
  },
  {
    name: 'Plakat Stand Akrilik 3D Wisuda Kayu',
    weight: 30,
    costPerGram: 200,
    timeStr: '2:00', // 2 jam pas
    electricityPerHour: 200,
    additionalItems: [
      { id: 'tmpl-4-1', name: 'Tatakan Kayu Jati Belanda', cost: 12000 },
      { id: 'tmpl-4-2', name: 'Stiker Plat Nama Gold', cost: 2500 },
      { id: 'tmpl-4-3', name: 'Cat Clear Finishing', cost: 1500 },
      { id: 'tmpl-4-4', name: 'Box Kardus Plakat', cost: 2000 }
    ],
    sellingPrice: 60000,
    quantity: 25,
    notes: 'Plakat kenang-kenangan wisuda berlogo instansi'
  },
  {
    name: 'Miniatur Patung Wisuda 3D Tabung Mika',
    weight: 45,
    costPerGram: 200,
    timeStr: '3:12', // 3 jam 12 menit
    electricityPerHour: 200,
    additionalItems: [
      { id: 'tmpl-5-1', name: 'Tabung Mika Silinder', cost: 7500 },
      { id: 'tmpl-5-2', name: 'Cat Akrilik Detail Wajah & Selempang', cost: 3000 },
      { id: 'tmpl-5-3', name: 'Pita Emas & Label Nama', cost: 1500 }
    ],
    sellingPrice: 55000,
    quantity: 20,
    notes: 'Patung wisudawan 3D eksklusif'
  }
];

export default function HppSpreadsheetCalculator({ catalogProducts = [] }) {
  // 1. Spreadsheet Rows State
  const [rows, setRows] = useState(() => {
    const saved = localStorage.getItem('equa3d_hpp_spreadsheet_data_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Gagal membaca data spreadsheet HPP dari localStorage", e);
      }
    }
    // Fallback or migrate older v1 data
    const legacy = localStorage.getItem('equa3d_hpp_spreadsheet_data');
    if (legacy) {
      try {
        const parsedLegacy = JSON.parse(legacy);
        if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
          return parsedLegacy.map(r => {
            const parsedTime = parseTimeString(r.timeStr || r.printHours || 1.5);
            const items = Array.isArray(r.additionalItems) && r.additionalItems.length > 0
              ? r.additionalItems
              : [{ id: 'init-1', name: r.otherCostsDesc || 'Bingkai / Bahan Tambahan', cost: r.otherCosts || 0 }];
            return {
              ...r,
              timeStr: parsedTime.timeStr,
              additionalItems: items
            };
          });
        }
      } catch (e) {}
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
  
  // Formula Bar (fx) State
  const [activeCellInfo, setActiveCellInfo] = useState({
    col: 'E',
    colName: 'Lama Pengerjaan / Print (Jam : Menit)',
    formula: 'Input Jam : Menit (Contoh: 1:20 = 1 jam 20 menit)',
    example: '1:20 per 60 menit = 1.33 jam × Rp 200/jam'
  });

  // Modal State for Manual Additional Items (Bingkai, Cat, Stiker, Lem, dll)
  const [editingAdditionalRow, setEditingAdditionalRow] = useState(null);
  const [tempAdditionalList, setTempAdditionalList] = useState([]);

  // Delete modal state
  const [rowToDelete, setRowToDelete] = useState(null);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('equa3d_hpp_spreadsheet_data_v2', JSON.stringify(rows));
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

    // Time calculation per 60 minutes
    const parsedTime = parseTimeString(row.timeStr !== undefined ? row.timeStr : row.printHours);
    const decimalHours = parsedTime.decimalHours;
    const electricityPerHour = Math.max(0, parseFloat(row.electricityPerHour) || 0);
    const subtotalElectricity = Math.round(decimalHours * electricityPerHour);

    // Additional costs calculation (sum of all manual additional items: Bingkai, Cat, Stiker, dll)
    let totalOtherCosts = 0;
    if (Array.isArray(row.additionalItems) && row.additionalItems.length > 0) {
      totalOtherCosts = row.additionalItems.reduce((acc, item) => acc + (parseFloat(item.cost) || 0), 0);
    } else {
      totalOtherCosts = Math.max(0, parseFloat(row.otherCosts) || 0);
    }

    const totalHppUnit = Math.round(subtotalFilament + subtotalElectricity + totalOtherCosts);

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
      timeStr: parsedTime.timeStr,
      displayLabel: parsedTime.displayLabel,
      hours: parsedTime.hours,
      minutes: parsedTime.minutes,
      decimalHours,
      electricityPerHour,
      subtotalElectricity,
      otherCosts: totalOtherCosts,
      additionalItems: row.additionalItems || [],
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

  // Handle Time input change (support 1:20, 1h20m, 80m, or stepper)
  const handleTimeChange = (id, newTimeInput) => {
    setRows(prevRows => prevRows.map(r => {
      if (r.id !== id) return r;
      return { ...r, timeStr: newTimeInput };
    }));
  };

  // Quick adjust time (+10m, -10m, +1h)
  const handleQuickAdjustTime = (id, minutesDelta) => {
    setRows(prevRows => prevRows.map(r => {
      if (r.id !== id) return r;
      const parsed = parseTimeString(r.timeStr);
      const totalMinutes = Math.max(0, (parsed.hours * 60) + parsed.minutes + minutesDelta);
      const newHours = Math.floor(totalMinutes / 60);
      const newMinutes = totalMinutes % 60;
      return {
        ...r,
        timeStr: `${newHours}:${String(newMinutes).padStart(2, '0')}`
      };
    }));
  };

  // Open Additional Items Modal
  const handleOpenAdditionalModal = (row) => {
    setEditingAdditionalRow(row);
    if (Array.isArray(row.additionalItems) && row.additionalItems.length > 0) {
      setTempAdditionalList(JSON.parse(JSON.stringify(row.additionalItems)));
    } else {
      setTempAdditionalList([
        { id: `add-${Date.now()}-1`, name: row.otherCostsDesc || 'Bingkai 3D Box', cost: row.otherCosts || 15000 }
      ]);
    }
  };

  // Save Additional Items Modal
  const handleSaveAdditionalModal = () => {
    if (!editingAdditionalRow) return;

    // Filter out completely blank rows
    const cleanedList = tempAdditionalList.filter(item => (item.name && item.name.trim() !== '') || (parseFloat(item.cost) > 0));
    const totalCost = cleanedList.reduce((acc, item) => acc + (parseFloat(item.cost) || 0), 0);
    const summaryDesc = cleanedList.map(item => item.name).filter(Boolean).join(', ');

    setRows(prevRows => prevRows.map(r => {
      if (r.id !== editingAdditionalRow.id) return r;
      return {
        ...r,
        additionalItems: cleanedList,
        otherCosts: totalCost,
        otherCostsDesc: summaryDesc
      };
    }));

    setEditingAdditionalRow(null);
  };

  // Add Item to temp additional list
  const handleAddTempAdditionalItem = (name = '', cost = 0) => {
    setTempAdditionalList([
      ...tempAdditionalList,
      { id: `add-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, name, cost }
    ]);
  };

  // Remove item from temp additional list
  const handleRemoveTempAdditionalItem = (id) => {
    setTempAdditionalList(tempAdditionalList.filter(item => item.id !== id));
  };

  // Add a new empty row
  const handleAddRow = () => {
    const newId = Date.now();
    const newRow = {
      id: newId,
      name: `Souvenir Wisuda Item #${rows.length + 1}`,
      weight: 25,
      costPerGram: defaultSettings.costPerGram,
      timeStr: '1:30', // 1 jam 30 menit
      electricityPerHour: defaultSettings.electricityPerHour,
      additionalItems: [
        { id: `add-${newId}-1`, name: 'Bingkai 3D Box Mika', cost: 15000 },
        { id: `add-${newId}-2`, name: 'Cat Finishing Warna', cost: 2000 }
      ],
      otherCosts: 17000,
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
      additionalItems: Array.isArray(row.additionalItems) 
        ? row.additionalItems.map(item => ({ ...item, id: `add-${Date.now()}-${Math.random().toString(36).substring(2, 5)}` }))
        : []
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
      electricityPerHour: template.electricityPerHour || defaultSettings.electricityPerHour,
      additionalItems: Array.isArray(template.additionalItems)
        ? template.additionalItems.map(item => ({ ...item, id: `tmpl-${Date.now()}-${Math.random().toString(36).substring(2, 5)}` }))
        : []
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
      "Rincian Bingkai, Cat & Tambahan (Kolom H)",
      "Berat Filament (Gram)",
      "Harga Filament/gr (Rp)",
      "Subtotal Bahan (Rp)",
      "Waktu Print (Jam:Menit)",
      "Desimal Jam (per 60)",
      "Biaya Listrik/jam (Rp)",
      "Subtotal Listrik (Rp)",
      "Total Biaya Bingkai & Cat (Rp)",
      "Total HPP Satuan (Rp)",
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
      const itemsDetail = Array.isArray(r.additionalItems) && r.additionalItems.length > 0
        ? r.additionalItems.map(i => `${i.name} (Rp ${i.cost})`).join(' + ')
        : (r.otherCostsDesc || '-');

      return [
        idx + 1,
        `"${(r.name || '').replace(/"/g, '""')}"`,
        `"${itemsDetail.replace(/"/g, '""')}"`,
        calc.weight,
        calc.costPerGram,
        calc.subtotalFilament,
        `"${calc.timeStr} (${calc.displayLabel})"`,
        calc.decimalHours.toFixed(2),
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
      const itemsList = Array.isArray(r.additionalItems) && r.additionalItems.length > 0
        ? r.additionalItems.map(i => i.name).join(', ')
        : (r.otherCostsDesc || '');

      text += `*${idx + 1}. ${r.name}*\n`;
      text += `   - Waktu Cetak: ${calc.timeStr} (${calc.displayLabel})\n`;
      if (itemsList) {
        text += `   - Rincian Tambahan: ${itemsList}\n`;
      }
      text += `   - Jumlah Order: ${calc.quantity} pcs\n`;
      text += `   - Harga Satuan: ${formatRp(calc.sellingPrice)}\n`;
      text += `   - Subtotal: ${formatRp(calc.totalOrderRevenue)}\n\n`;
    });

    const grandRevenue = rows.reduce((acc, r) => acc + computeRow(r).totalOrderRevenue, 0);
    const totalPcs = rows.reduce((acc, r) => acc + (parseInt(r.quantity, 10) || 1), 0);

    text += `--------------------------------------------------\n`;
    text += `📦 *Total Kuantitas:* ${totalPcs} Pcs Souvenir\n`;
    text += `💰 *TOTAL ESTIMASI ORDER:* ${formatRp(grandRevenue)}\n`;
    text += `⚡ *Bahan:* 3D Print Premium + Finishing Lengkap\n`;
    text += `📞 Hubungi kami untuk konfirmasi dan penyesuaian desain wisuda.\n`;
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
    acc.totalPrintHours += (calc.decimalHours * calc.quantity);
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
    : rows.filter(r => {
        const query = searchFilter.toLowerCase();
        const nameMatch = (r.name || '').toLowerCase().includes(query);
        const descMatch = (r.otherCostsDesc || '').toLowerCase().includes(query);
        const itemMatch = Array.isArray(r.additionalItems) && r.additionalItems.some(i => (i.name || '').toLowerCase().includes(query));
        return nameMatch || descMatch || itemMatch;
      });

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
              <p style={{ fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.9)', margin: 0, maxWidth: '680px', lineHeight: 1.4 }}>
                Input waktu fleksibel format <strong>1:20 (1 jam 20 menit)</strong> per 60 menit dan rincian manual <strong>Bingkai, Cat, Stiker, Lem</strong> dalam satu kolom rapi. Rumus menghitung otomatis semua biaya HPP dan profit!
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
            Bahan + Listrik + Bingkai & Cat
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
              {activeCellInfo.example}
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
              placeholder="Cari souvenir, bingkai, cat..."
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
            minWidth: '1540px',
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
                <th style={{ padding: '4px 8px', width: '140px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>E</th>
                <th style={{ padding: '4px 8px', width: '105px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }}>F</th>
                <th style={{ padding: '4px 8px', width: '110px', textAlign: 'right', borderRight: '1px solid #e2e8f0', background: '#ecfdf5', color: '#047857' }}>G [fx]</th>
                <th style={{ padding: '4px 10px', width: '250px', borderRight: '1px solid #e2e8f0', background: '#fffbeb', color: '#92400e' }}>H (Bingkai & Cat Manual)</th>
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

                <th style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }} title="Waktu pengerjaan printer dalam format Jam:Menit (contoh 1:20 = 1 jam 20 menit per 60)">
                  Waktu (Jam:Menit)
                </th>

                <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e2e8f0' }} title="Tarif listrik printer per jam">
                  Listrik/Jam
                </th>

                <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e2e8f0', background: '#e6fcf1', color: '#065f46' }} title="Rumus: Jam Print (desimal per 60) × Tarif Listrik">
                  Subtotal Listrik
                </th>

                <th style={{ padding: '10px 10px', borderRight: '1px solid #e2e8f0', background: '#fef3c7', color: '#854d0e' }} title="Rincian manual biaya tambahan: Bingkai, Cat, Stiker, Lem, Kemasan dll dalam satu kolom">
                  Bingkai & Tambahan (Manual)
                </th>

                <th style={{ padding: '10px 8px', textAlign: 'right', borderRight: '1px solid #e2e8f0', background: '#fef08a', color: '#854d0e' }} title="Rumus: Bahan (D) + Listrik (G) + Tambahan (H)">
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

                      {/* Col E: Print Time in Jam:Menit (misal 1:20 = 1 jam 20 menit) */}
                      <td style={{ padding: '6px 6px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Clock size={13} color="#107c41" />
                            <input
                              type="text"
                              value={r.timeStr !== undefined ? r.timeStr : calc.timeStr}
                              onChange={(e) => handleTimeChange(r.id, e.target.value)}
                              onFocus={() => setActiveCellInfo({
                                col: 'E',
                                colName: 'Lama Pengerjaan / Print (Jam : Menit)',
                                formula: `Input format Jam:Menit (contoh 1:20). Nilai desimal: ${calc.decimalHours.toFixed(2)} jam (per 60 menit)`,
                                example: `${calc.timeStr} = ${calc.displayLabel} (≈ ${calc.decimalHours.toFixed(2)} jam)`
                              })}
                              placeholder="1:20"
                              style={{
                                width: '68px',
                                textAlign: 'center',
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                padding: '4px 6px',
                                borderRadius: '5px',
                                fontWeight: 800,
                                color: '#0f172a',
                                fontSize: '0.86rem'
                              }}
                              title="Ketik format Jam:Menit, contoh '1:20' untuk 1 jam 20 menit"
                            />
                            
                            {/* Stepper shortcuts */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                              <button
                                type="button"
                                onClick={() => handleQuickAdjustTime(r.id, 10)}
                                style={{
                                  border: 'none',
                                  background: '#e2e8f0',
                                  color: '#334155',
                                  fontSize: '0.62rem',
                                  padding: '1px 3px',
                                  borderRadius: '3px',
                                  cursor: 'pointer',
                                  lineHeight: 1
                                }}
                                title="Tambah 10 menit"
                              >
                                +10m
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickAdjustTime(r.id, -10)}
                                style={{
                                  border: 'none',
                                  background: '#e2e8f0',
                                  color: '#334155',
                                  fontSize: '0.62rem',
                                  padding: '1px 3px',
                                  borderRadius: '3px',
                                  cursor: 'pointer',
                                  lineHeight: 1
                                }}
                                title="Kurang 10 menit"
                              >
                                -10m
                              </button>
                            </div>
                          </div>

                          {/* Human readable label */}
                          <div style={{ fontSize: '0.68rem', color: '#047857', fontWeight: 700 }}>
                            {calc.displayLabel} <span style={{ color: '#64748b', fontWeight: 500 }}>({calc.decimalHours.toFixed(2)}j)</span>
                          </div>
                        </div>
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
                          formula: `= Jam Print (desimal per 60) × Tarif Listrik`,
                          example: `${calc.decimalHours.toFixed(2)} jam × Rp ${calc.electricityPerHour} = ${formatRp(calc.subtotalElectricity)}`
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

                      {/* Col H: Bingkai & Tambahan Manual (Bingkai, Cat, Stiker, Lem dll dalam 1 kolom) */}
                      <td style={{ padding: '6px 8px', borderRight: '1px solid #e2e8f0', background: '#fffbeb' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                            <div style={{ fontWeight: 800, color: '#92400e', fontSize: '0.88rem' }}>
                              {formatRp(calc.otherCosts)}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenAdditionalModal(r)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                background: '#fef3c7',
                                border: '1px solid #fde68a',
                                color: '#92400e',
                                padding: '3px 7px',
                                borderRadius: '5px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              title="Buka menu input manual rincian bingkai, cat, stiker, dll"
                            >
                              <Edit3 size={11} />
                              <span>{Array.isArray(r.additionalItems) && r.additionalItems.length > 0 ? `Atur (${r.additionalItems.length})` : '+ Tambah'}</span>
                            </button>
                          </div>

                          {/* Preview tags of components */}
                          <div 
                            onClick={() => handleOpenAdditionalModal(r)}
                            style={{ 
                              fontSize: '0.72rem', 
                              color: '#78350f', 
                              lineHeight: 1.3,
                              cursor: 'pointer',
                              maxHeight: '36px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title="Klik untuk melihat dan mengedit semua item tambahan"
                          >
                            {Array.isArray(r.additionalItems) && r.additionalItems.length > 0 ? (
                              r.additionalItems.map(i => `${i.name} (Rp ${formatNumber(i.cost)})`).join(' • ')
                            ) : (
                              <span style={{ color: '#b45309', fontStyle: 'italic' }}>+ Klik untuk input bingkai, cat, dll</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Col I [fx]: Total HPP Satuan */}
                      <td 
                        onClick={() => setActiveCellInfo({
                          col: 'I',
                          colName: 'Total HPP Satuan',
                          formula: '= D + G + H (Bahan + Listrik + Bingkai & Cat)',
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
                    Kebutuhan: ~{formatNumber(summary.totalWeightGrams / 1000, 2)} kg filament & ~{formatNumber(summary.totalPrintHours, 1)} jam mesin
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

                {/* Total Machine Hours */}
                <td style={{ padding: '12px 6px', textAlign: 'center', borderRight: '1px solid #cbd5e1', fontSize: '0.8rem', color: '#107c41', fontWeight: 800 }}>
                  ~{formatNumber(summary.totalPrintHours, 1)}h
                </td>

                <td style={{ padding: '12px 6px', textAlign: 'right', borderRight: '1px solid #cbd5e1', color: '#64748b', fontSize: '0.78rem' }}>
                  -
                </td>

                <td style={{ padding: '12px 10px', textAlign: 'right', borderRight: '1px solid #cbd5e1', background: '#ecfdf5', color: '#047857' }}>
                  {formatRp(summary.totalElectricityCost)}
                </td>

                {/* Total Bingkai & Cat */}
                <td style={{ padding: '12px 10px', textAlign: 'right', borderRight: '1px solid #cbd5e1', background: '#fffbeb', color: '#92400e' }}>
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
            💡 <strong>Tips Waktu & Bingkai:</strong> Ketik waktu langsung <strong>1:20</strong> (1 jam 20 mnt). Klik tombol <strong>Atur</strong> pada Kolom H untuk menambah rincian manual seperti cat akrilik, lem, stiker nama, dll sekecil apapun!
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
              <strong style={{ color: '#0f172a' }}>2. Biaya Operasional Listrik (Per 60 Menit):</strong>
              <div style={{ color: '#047857', fontWeight: 600, marginTop: '2px' }}>
                Subtotal Listrik = (Jam + Menit/60) × Tarif Listrik/jam (Rp {defaultSettings.electricityPerHour})
              </div>
            </div>

            <div style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: '6px' }}>
              <strong style={{ color: '#0f172a' }}>3. Total Modal HPP Satuan:</strong>
              <div style={{ color: '#d97706', fontWeight: 700, marginTop: '2px' }}>
                HPP Satuan = Subtotal Filament (D) + Subtotal Listrik (G) + Total Tambahan Kolom H (Bingkai, Cat, dll)
              </div>
            </div>

            <div style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: '6px' }}>
              <strong style={{ color: '#0f172a' }}>4. Laba Bersih & Margin:</strong>
              <div style={{ color: '#16a34a', fontWeight: 700, marginTop: '2px' }}>
                Laba Bersih = (Harga Jual - HPP Satuan) × Kuantitas Order
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

      {/* 6. MODAL KHUSUS: Input Manual Rincian Biaya Tambahan (Bingkai, Cat, Lem, Stiker, dll) */}
      {editingAdditionalRow && (
        <div 
          className="modal-backdrop"
          onClick={() => setEditingAdditionalRow(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div 
            className="clean-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '560px',
              background: '#ffffff',
              borderRadius: '14px',
              padding: '24px',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ background: '#fef3c7', color: '#92400e', padding: '6px', borderRadius: '8px' }}>
                    <Tag size={18} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Input Manual Biaya Tambahan (Kolom H)
                  </h3>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Item: <strong style={{ color: '#107c41' }}>{editingAdditionalRow.name}</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAdditionalRow(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0, lineHeight: 1.4 }}>
              Tambahkan biaya sekecil apapun secara manual (misal <strong>Cat Akrilik, Bingkai 3D Box, Stiker Nama, Lem Perekat, Gantungan</strong>). Semua biaya akan dijumlahkan otomatis ke dalam <strong>Kolom H</strong> tanpa merusak susunan kolom spreadsheet lainnya!
            </p>

            {/* Quick Preset Chips */}
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                ⚡ Tambah Cepat Komponen Populer:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {POPULAR_ACCESSORIES.map((pop, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => handleAddTempAdditionalItem(pop.name, pop.cost)}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '20px',
                      padding: '4px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fef3c7';
                      e.currentTarget.style.borderColor = '#f59e0b';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                  >
                    <Plus size={12} color="#107c41" />
                    <span>{pop.name} (Rp {formatNumber(pop.cost)})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* List of Manual Additional Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 36px', gap: '8px', fontSize: '0.74rem', fontWeight: 800, color: '#64748b' }}>
                <span>NAMA BIAYA TAMBAHAN</span>
                <span style={{ textAlign: 'right' }}>NOMINAL BIAYA (RP)</span>
                <span></span>
              </div>

              {tempAdditionalList.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', color: '#94a3b8', fontSize: '0.84rem' }}>
                  Belum ada biaya tambahan. Klik tombol di bawah untuk menambah manual.
                </div>
              ) : (
                tempAdditionalList.map((item, iIdx) => (
                  <div key={item.id || iIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 36px', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTempAdditionalList(prev => prev.map((it, idx) => idx === iIdx ? { ...it, name: val } : it));
                      }}
                      placeholder="Contoh: Cat Akrilik / Bingkai 3D Box..."
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        color: '#0f172a'
                      }}
                    />

                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>Rp</span>
                      <input
                        type="number"
                        step="500"
                        min="0"
                        value={item.cost}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setTempAdditionalList(prev => prev.map((it, idx) => idx === iIdx ? { ...it, cost: val } : it));
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 8px 8px 30px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          textAlign: 'right',
                          color: '#0f172a'
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveTempAdditionalItem(item.id)}
                      style={{
                        background: '#fee2e2',
                        border: 'none',
                        color: '#dc2626',
                        padding: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Hapus baris biaya ini"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}

              <button
                type="button"
                onClick={() => handleAddTempAdditionalItem('', 1000)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: '#f0fdf4',
                  color: '#107c41',
                  border: '1px dashed #107c41',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: '4px'
                }}
              >
                <Plus size={15} />
                <span>+ Tambah Komponen Biaya Lain</span>
              </button>
            </div>

            {/* Total Footer in Modal */}
            <div style={{
              background: '#fef3c7',
              padding: '12px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid #fde68a'
            }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#92400e' }}>
                Total Biaya Tambahan (Kolom H):
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#92400e' }}>
                {formatRp(tempAdditionalList.reduce((acc, it) => acc + (parseFloat(it.cost) || 0), 0))}
              </span>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setEditingAdditionalRow(null)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSaveAdditionalModal}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#107c41',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(16, 124, 65, 0.3)'
                }}
              >
                Simpan & Terapkan ke Tabel
              </button>
            </div>
          </div>
        </div>
      )}

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
