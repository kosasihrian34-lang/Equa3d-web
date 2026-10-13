// Constants and Helpers for Custom Order & Pre-Order (PO) Tracking with Real-Time Slicer Timer

export const CATEGORY_CODES = [
  { code: 'KY', name: 'Keychain & Aksesoris', nameEn: 'Keychain & Accessories' },
  { code: 'DK', name: 'Dekorasi & Lampu Lithophane', nameEn: 'Decor & Lithophane Lamp' },
  { code: 'AF', name: 'Art & Figurine', nameEn: 'Art & Figurine' },
  { code: 'MC', name: 'Mechanical & Sparepart', nameEn: 'Mechanical & Spareparts' },
  { code: 'MK', name: 'Maket & Arsitektur', nameEn: 'Architectural Models' },
  { code: 'CS', name: 'Custom Print & Lainnya', nameEn: 'Custom Print & Other' },
];

export const ORDER_STATUSES = {
  queued: {
    id: 'queued',
    step: 1,
    label_id: 'Menunggu Antrean Cetak',
    label_en: 'Queued for Printing',
    desc_id: 'Pesanan telah dikonfirmasi dan file 3D sedang dalam antrean mesin cetak.',
    desc_en: 'Order confirmed and 3D file is in printing queue.',
    color: '#d97706',
    badgeBg: '#fef3c7',
    badgeBorder: '#fde68a',
  },
  printing: {
    id: 'printing',
    step: 2,
    label_id: 'Sedang Dicetak (3D Printing)',
    label_en: '3D Printing in Progress',
    desc_id: 'Mesin 3D printer sedang aktif mencetak model pesanan Anda secara presisi.',
    desc_en: '3D printer is currently active precision-printing your model.',
    color: '#2563eb',
    badgeBg: '#dbeafe',
    badgeBorder: '#bfdbfe',
  },
  finishing: {
    id: 'finishing',
    step: 3,
    label_id: 'Finishing & Quality Control',
    label_en: 'Finishing & Quality Control',
    desc_id: 'Pembersihan support, perakitan, dan inspeksi kualitas cetak presisi.',
    desc_en: 'Support cleanup, assembly, and precision quality inspection.',
    color: '#7c3aed',
    badgeBg: '#ede9fe',
    badgeBorder: '#ddd6fe',
  },
  ready: {
    id: 'ready',
    step: 4,
    label_id: 'Siap Diambil / Siap Diantar',
    label_en: 'Ready for Pickup / Delivery',
    desc_id: 'Pesanan telah selesai dipacking dan siap diambil di workshop atau dikirim.',
    desc_en: 'Order is packed and ready for pickup at workshop or courier delivery.',
    color: '#059669',
    badgeBg: '#d1fae5',
    badgeBorder: '#a7f3d0',
  },
  completed: {
    id: 'completed',
    step: 5,
    label_id: 'Pesanan Selesai',
    label_en: 'Order Completed',
    desc_id: 'Pesanan telah diterima oleh pelanggan. Terima kasih telah mempercayakan Equa3D!',
    desc_en: 'Order has been received by customer. Thank you for choosing Equa3D!',
    color: '#047857',
    badgeBg: '#ecfdf5',
    badgeBorder: '#6ee7b7',
  },
  cancelled: {
    id: 'cancelled',
    step: 0,
    label_id: 'Pesanan Dibatalkan',
    label_en: 'Order Cancelled',
    desc_id: 'Pesanan ini telah dibatalkan.',
    desc_en: 'This order has been cancelled.',
    color: '#dc2626',
    badgeBg: '#fee2e2',
    badgeBorder: '#fecaca',
  }
};

export const ORDER_STEP_LIST = [
  { id: 'queued', title_id: 'Antrean Cetak', title_en: 'Queued' },
  { id: 'printing', title_id: 'Proses Cetak 3D', title_en: '3D Printing' },
  { id: 'finishing', title_id: 'Finishing & QC', title_en: 'Finishing & QC' },
  { id: 'ready', title_id: 'Siap Diambil/Diantar', title_en: 'Ready' },
  { id: 'completed', title_id: 'Selesai', title_en: 'Completed' },
];

/**
 * Normalizes input order code for reliable search (e.g. "ky-001", "KY 001", "ky001" -> "KY-001")
 */
export const normalizeOrderCode = (code = '') => {
  if (!code) return '';
  const clean = code.trim().toUpperCase().replace(/\s+/g, '');
  // Match standard format PREFIX-NUMBER or PREFIXNUMBER
  const match = clean.match(/^([A-Z]{2})[-_]?([0-9]+)$/);
  if (match) {
    const prefix = match[1];
    const num = match[2].padStart(3, '0');
    return `${prefix}-${num}`;
  }
  return clean;
};

/**
 * Calculates live slicer printing countdown & progress percentage
 */
export const calculateSlicerCountdown = (order) => {
  if (!order) return null;

  const totalMinutes = Number(order.printDurationMinutes || 0) + (Number(order.printDurationHours || 0) * 60);
  const totalSeconds = totalMinutes * 60;

  if (!order.printStartedAt || totalSeconds <= 0) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalRemainingSec: 0,
      percentDone: 0,
      isFinished: false,
      formattedTime: '00:00:00'
    };
  }

  const startTime = new Date(order.printStartedAt).getTime();
  const endTime = startTime + (totalSeconds * 1000);
  const now = Date.now();

  const totalRemainingSec = Math.max(0, Math.floor((endTime - now) / 1000));
  const elapsedSec = Math.max(0, Math.floor((now - startTime) / 1000));

  let percentDone = totalSeconds > 0 ? Math.min(100, Math.max(0, Math.round((elapsedSec / totalSeconds) * 100))) : 0;
  const isFinished = totalRemainingSec <= 0;
  if (isFinished) percentDone = 100;

  const hours = Math.floor(totalRemainingSec / 3600);
  const minutes = Math.floor((totalRemainingSec % 3600) / 60);
  const seconds = totalRemainingSec % 60;

  const pad = (n) => String(n).padStart(2, '0');
  const formattedTime = `${pad(hours)} Jam ${pad(minutes)} Menit ${pad(seconds)} Detik`;
  const digitalTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return {
    hours,
    minutes,
    seconds,
    totalRemainingSec,
    elapsedSec,
    totalSeconds,
    percentDone,
    isFinished,
    formattedTime,
    digitalTime,
    estimatedEndTime: new Date(endTime).toISOString()
  };
};

/**
 * Format duration string from hours & minutes
 */
export const formatDurationDisplay = (hours = 0, minutes = 0) => {
  const h = Number(hours) || 0;
  const m = Number(minutes) || 0;
  if (h === 0 && m === 0) return 'Belum diatur';
  if (h > 0 && m > 0) return `${h} Jam ${m} Menit`;
  if (h > 0) return `${h} Jam`;
  return `${m} Menit`;
};

// Initial Sample Orders for immediate demo & testing (includes 8hr slicer print started 3hrs ago -> 5hrs remaining)
export const getSampleCustomOrders = () => {
  const now = Date.now();
  // Started exactly 3 hours ago
  const threeHoursAgo = new Date(now - (3 * 60 * 60 * 1000)).toISOString();
  const oneHourAgo = new Date(now - (1 * 60 * 60 * 1000)).toISOString();
  const yesterday = new Date(now - (24 * 60 * 60 * 1000)).toISOString();

  return [
    {
      id: "KY-001",
      orderCode: "KY-001",
      categoryCode: "KY",
      categoryName: "Keychain & Aksesoris",
      orderNumber: "001",
      customerName: "Budi Santoso",
      customerPhone: "081234567890",
      itemTitle: "Keychain Gym Dumbbell 3D (Custom Nama 'BUDI')",
      quantity: 2,
      material: "PLA+",
      color: "Hitam Gold & Silver",
      notes: "Infill 100% Solid untuk ketahanan maksimal. Tambahkan ring ganci besi tebal.",
      status: "printing",
      printDurationHours: 8,
      printDurationMinutes: 0,
      printStartedAt: threeHoursAgo, // Dimulai 3 jam lalu, durasi 8 jam -> sisa 5 jam!
      createdAt: yesterday,
      updatedAt: threeHoursAgo,
      pickupMethod: "Diambil di Workshop",
      estimatedPrice: 40000
    },
    {
      id: "KY-002",
      orderCode: "KY-002",
      categoryCode: "KY",
      categoryName: "Keychain & Aksesoris",
      orderNumber: "002",
      customerName: "Siti Rahma",
      customerPhone: "085712345678",
      itemTitle: "Keycap Clicker Custom Nama 'SITI' (Fidget Toy)",
      quantity: 1,
      material: "PLA",
      color: "Pastel Pink & Putih",
      notes: "Switch Outemu Blue Clicky. Gantungan rantai biji lada warna putih.",
      status: "queued",
      printDurationHours: 2,
      printDurationMinutes: 30,
      printStartedAt: null,
      createdAt: oneHourAgo,
      updatedAt: oneHourAgo,
      pickupMethod: "Kirim Ekspedisi (J&T)",
      estimatedPrice: 25000
    },
    {
      id: "DK-001",
      orderCode: "DK-001",
      categoryCode: "DK",
      categoryName: "Dekorasi & Lampu Lithophane",
      orderNumber: "001",
      customerName: "Rian Kosasih",
      customerPhone: "081987654321",
      itemTitle: "Lampu Lithophane Curve 3D Foto Keluarga",
      quantity: 1,
      material: "PLA White Litho & Stand Kayu/PLA",
      color: "Pure White (Translucent)",
      notes: "Lampu LED warm white USB sudah termasuk. Sedang proses pembersihan dan perakitan lampu.",
      status: "finishing",
      printDurationHours: 12,
      printDurationMinutes: 0,
      printStartedAt: yesterday,
      createdAt: yesterday,
      updatedAt: oneHourAgo,
      pickupMethod: "Diambil di Workshop",
      estimatedPrice: 135000
    },
    {
      id: "MC-001",
      orderCode: "MC-001",
      categoryCode: "MC",
      categoryName: "Mechanical & Sparepart",
      orderNumber: "001",
      customerName: "Alex Wijaya",
      customerPhone: "082199887766",
      itemTitle: "Gearbox Replacement Part & Bracket Mesin",
      quantity: 4,
      material: "PETG High Strength",
      color: "Solid Black",
      notes: "Toleransi lubang baut presisi 0.15mm. Barang sudah siap diambil di workshop.",
      status: "ready",
      printDurationHours: 6,
      printDurationMinutes: 15,
      printStartedAt: yesterday,
      createdAt: yesterday,
      updatedAt: oneHourAgo,
      pickupMethod: "Diambil di Workshop",
      estimatedPrice: 90000
    }
  ];
};
