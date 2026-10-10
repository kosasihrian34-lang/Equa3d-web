export const INITIAL_PRODUCTS = [
  {
    id: "prod-001",
    title_id: "Gantungan Kunci / Keychain Custom Nama & Logo",
    title_en: "Custom Name & Logo 3D Keychain",
    category_id: "Keychain & Aksesoris",
    category_en: "Keychain & Accessories",
    price: 15000,
    material: "PLA",
    infill: "100% Solid",
    resolution: "0.16mm (Precise Text)",
    printTime_id: "45 Menit",
    printTime_en: "45 Mins",
    dimensions: "6 x 3 x 0.4 cm",
    weightGrams: 15,
    image: "/products/cyberpunk_mecha_3d_1791476366012.png",
    description_id: "Gantungan kunci 3D custom nama, plaka logo komunitas, atau nomor HP. Dicetak menggunakan bahan PLA berkepadatan tinggi yang tahan banting dan kaku.",
    description_en: "Custom 3D printed keychain with personalized name, logo plaque, or phone number. Printed with high-density PLA material for durability.",
    isFeatured: true,
    colorOptions: ["Hitam Gold", "Merah Putih", "Cyan Silver"],
    inStock: true
  },
  {
    id: "prod-002",
    title_id: "Lampu Tidur 3D Lithophane Foto Custom",
    title_en: "Custom Photo 3D Lithophane Night Lamp",
    category_id: "Dekorasi & Lampu Lithophane",
    category_en: "Decor & Lithophane Lamp",
    price: 145000,
    material: "PLA",
    infill: "100% Solid Shell",
    resolution: "0.12mm (High Photo Detail)",
    printTime_id: "14 Jam",
    printTime_en: "14 Hours",
    dimensions: "14 x 14 x 18 cm",
    weightGrams: 220,
    image: "/products/architectural_model_3d_1791476401943.png",
    description_id: "Lampu tidur hias berpendar foto kenangan (Lithophane). Ketika lampu LED di bagian dalam dinyalakan, foto keluarga/pasangan akan muncul secara detail dan estetik dalam nuansa 3D.",
    description_en: "Custom photo 3D lithophane night lamp. When the inner LED lamp lights up, your personalized family or portrait photo illuminates in detailed 3D relief.",
    isFeatured: true,
    colorOptions: ["Warm White LED", "Cool White LED"],
    inStock: true
  },
  {
    id: "prod-003",
    title_id: "Bingkai Foto 3D Relief & Stand Meja Minimalis",
    title_en: "Minimalist 3D Relief Photo Frame & Table Stand",
    category_id: "Dekorasi & Lampu Lithophane",
    category_en: "Decor & Lithophane Lamp",
    price: 85000,
    material: "PLA",
    infill: "20% Gyroid",
    resolution: "0.16mm (Clean Finish)",
    printTime_id: "8 Jam",
    printTime_en: "8 Hours",
    dimensions: "18 x 13 x 4 cm",
    weightGrams: 140,
    image: "/products/desk_stand_3d_1791476421850.png",
    description_id: "Bingkai foto meja cetak 3D dengan tekstur relief geometris modern. Dilengkapi slot presisi untuk memasukkan foto ukuran 4R / 5R.",
    description_en: "Modern 3D printed table photo frame with geometric relief texture. Features a precision slot fitting standard 4R / 5R photos.",
    isFeatured: false,
    colorOptions: ["Chalk White", "Slate Matte", "Marble Grey"],
    inStock: true
  },
  {
    id: "prod-004",
    title_id: "Planetary Gearbox Assembly",
    title_en: "Functional Planetary Gearbox Assembly",
    category_id: "Mechanical & Sparepart",
    category_en: "Mechanical & Spareparts",
    price: 195000,
    material: "PETG",
    infill: "40% Gyroid (High Strength)",
    resolution: "0.16mm (Precise Fit)",
    printTime_id: "18 Jam",
    printTime_en: "18 Hours",
    dimensions: "16 x 16 x 10 cm",
    weightGrams: 310,
    image: "/products/mechanical_gear_3d_1791476383735.png",
    description_id: "Mekanisme roda gigi fungsional berbahan PETG industri yang sangat kuat, tahan benturan, dan tahan suhu hingga 75°C.",
    description_en: "Functional planetary gear mechanism made of industrial PETG material. Impact-resistant and heat tolerant up to 75°C.",
    isFeatured: true,
    colorOptions: ["Black & Orange", "Grey & Blue"],
    inStock: true
  }
];

export const CATEGORIES_BILINGUAL = [
  { id: "Semua Kategori", en: "All Categories", value: "Semua Kategori" },
  { id: "Keychain & Aksesoris", en: "Keychain & Accessories", value: "Keychain & Aksesoris" },
  { id: "Dekorasi & Lampu Lithophane", en: "Decor & Lithophane Lamp", value: "Dekorasi & Lampu Lithophane" },
  { id: "Art & Figurine", en: "Art & Figurine", value: "Art & Figurine" },
  { id: "Mechanical & Sparepart", en: "Mechanical & Spareparts", value: "Mechanical & Sparepart" },
  { id: "Maket & Arsitektur", en: "Architectural Models", value: "Maket & Arsitektur" },
  { id: "Custom", en: "Custom Print", value: "Custom" }
];

export const CATEGORIES = CATEGORIES_BILINGUAL.map(c => c.id);

export const MATERIALS = [
  "Semua Bahan",
  "PLA",
  "PETG"
];

// Robust helper to get localized product properties with automatic fallbacks
export const getLocalizedProduct = (product, lang = 'id') => {
  if (!product) return {};
  const isEn = lang === 'en';

  let category = product.category_id || product.category || 'Katalog 3D';
  if (isEn) {
    if (category === 'Keychain & Aksesoris' || product.category_en === 'Keychain & Accessories') category = 'Keychain & Accessories';
    else if (category === 'Dekorasi & Lampu Lithophane') category = 'Decor & Lithophane Lamp';
    else if (category === 'Mechanical & Sparepart') category = 'Mechanical & Spareparts';
    else if (category === 'Maket & Arsitektur') category = 'Architectural Models';
    else if (category === 'Custom' || category === 'Costum') category = 'Custom Print';
  } else {
    if (category === 'Keychain & Accessories') category = 'Keychain & Aksesoris';
    else if (category === 'Decor & Lithophane Lamp') category = 'Dekorasi & Lampu Lithophane';
    else if (category === 'Mechanical & Spareparts') category = 'Mechanical & Sparepart';
    else if (category === 'Architectural Models') category = 'Maket & Arsitektur';
    else if (category === 'Custom Print') category = 'Custom';
  }

  let rawTitle = isEn ? (product.title_en || product.title_id || product.title || '') : (product.title_id || product.title_en || product.title || '');
  let title = String(rawTitle || 'Produk 3D');

  let rawDesc = isEn ? (product.description_en || product.description_id || product.description || '') : (product.description_id || product.description_en || product.description || '');
  let description = String(rawDesc || '');

  // Auto-translate if product was saved without _en properties
  if (isEn && title) {
    if (title.includes('Gantungan Kunci')) title = 'Custom Name & Logo 3D Keychain';
    else if (title.includes('Lampu Tidur')) title = 'Custom Photo 3D Lithophane Night Lamp';
    else if (title.includes('Bingkai Foto')) title = 'Minimalist 3D Relief Photo Frame';
    else if (title.includes('Planetary Gearbox')) title = 'Functional Planetary Gearbox Assembly';

    if (description.includes('Gantungan kunci')) {
      description = 'Custom 3D printed keychain with personalized name, logo plaque, or phone number. Printed with high-density PLA material.';
    } else if (description.includes('Lampu tidur')) {
      description = 'Custom photo 3D lithophane night lamp. When the inner LED lights up, your personalized photo illuminates in detailed 3D relief.';
    } else if (description.includes('Bingkai foto')) {
      description = 'Modern 3D printed table photo frame with geometric relief texture. Features a precision slot fitting standard 4R / 5R photos.';
    } else if (description.includes('Mekanisme')) {
      description = 'Functional planetary gear mechanism made of industrial PETG material. Impact-resistant and heat tolerant up to 75°C.';
    }
  }

  // Safe fallback for images
  const images = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : [product.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'];

  return {
    ...product,
    title,
    category,
    description,
    images,
    image: images[0],
    material: String(product.material || 'PLA'),
    infill: String(product.infill || '20% Gyroid'),
    resolution: String(product.resolution || '0.20mm Standard'),
    dimensions: String(product.dimensions || '10 x 10 x 10 cm'),
    printTime: isEn ? (product.printTime_en || product.printTime_id || product.printTime || '10 Hours') : (product.printTime_id || product.printTime_en || product.printTime || '10 Jam')
  };
};

// Universal Price Formatting Helper (Supports single numbers e.g. 25000 and ranges e.g. "25000-50000" or "25.000 - 50.000")
export const formatPriceDisplay = (priceVal, lang = 'id') => {
  if (priceVal === null || priceVal === undefined || priceVal === '') return lang === 'en' ? 'IDR 0' : 'Rp 0';

  const formatSingle = (num) => {
    return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const str = String(priceVal).trim();

  // If input contains range separator '-' or '–'
  if (str.includes('-') || str.includes('–')) {
    const parts = str.split(/[-–]/).map(p => p.replace(/[^\d]/g, '')).filter(Boolean);
    if (parts.length >= 2) {
      const minNum = parseInt(parts[0], 10);
      const maxNum = parseInt(parts[1], 10);
      if (!isNaN(minNum) && !isNaN(maxNum)) {
        return `${formatSingle(minNum)} - ${formatSingle(maxNum)}`;
      }
    }
  }

  // Pure number or standard numeric string
  const cleanDigits = str.replace(/[^\d]/g, '');
  if (cleanDigits) {
    const num = parseInt(cleanDigits, 10);
    if (!isNaN(num)) return formatSingle(num);
  }

  return str;
};

// Robust helper to extract clean numeric price (handles integers, formatted strings like "Rp 35.000", and ranges like "25000-50000")
export const parseNumericPrice = (priceVal) => {
  if (typeof priceVal === 'number') return isNaN(priceVal) ? 0 : priceVal;
  if (!priceVal) return 0;
  const str = String(priceVal).trim();
  if (str.includes('-') || str.includes('–')) {
    const parts = str.split(/[-–]/).map(p => p.replace(/[^\d]/g, '')).filter(Boolean);
    if (parts.length > 0) {
      return parseInt(parts[0], 10) || 0;
    }
  }
  const cleanDigits = str.replace(/[^\d]/g, '');
  return parseInt(cleanDigits, 10) || 0;
};

