// Helper to resolve asset URLs dynamically according to Vite's base path (works on localhost & GitHub Pages subpaths)
export const getAssetUrl = (path) => {
  if (!path) return '';
  if (typeof path !== 'string') return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const safePath = path.replace(/ /g, '_');
  const cleanPath = safePath.startsWith('/') ? safePath.slice(1) : safePath;
  const baseUrl = import.meta.env.BASE_URL || '/';
  return baseUrl.endsWith('/') ? `${baseUrl}${cleanPath}` : `${baseUrl}/${cleanPath}`;
};

export const INITIAL_PRODUCTS = [
  {
    id: "prod-001",
    title_id: "Gantungan Kunci Gym & Dumbbell 3D",
    title_en: "3D Gym & Dumbbell Keychain",
    category_id: "Keychain & Aksesoris",
    category_en: "Keychain & Accessories",
    price: 20000,
    material: "PLA",
    infill: "100% Solid",
    resolution: "0.16mm (Standard)",
    printTime_id: "2 Jam",
    printTime_en: "2 Hours",
    dimensions: "4 x 3 x 3 cm",
    weightGrams: 30,
    image: "/products/Gym_Keychain.webp",
    images: ["/products/Gym_Keychain.webp", "/products/Gym_Keychain2.webp", "/products/Gym_Keychain3.webp", "/products/Gym_Keychain4.webp"],
    description_id: "Gantungan kunci 3D bertema fitness, dumbbell, dan plate gym. Dicetak menggunakan bahan PLA padat yang kuat, kaku, dan tahan banting.",
    description_en: "3D printed gym & dumbbell theme keychain. Printed with high-density PLA material for maximum durability.",
    isFeatured: true,
    colorOptions: ["Hitam Gold", "Merah Silver", "Blue Metallic"],
    inStock: true
  },
  {
    id: "prod-002",
    title_id: "Keycap Clicker 3D Custom Nama (Fidget Toy)",
    title_en: "3D Printed Custom Name Keycap Clicker",
    category_id: "Keychain & Aksesoris",
    category_en: "Keychain & Accessories",
    price: 25000,
    material: "PLA",
    infill: "20% Gyroid",
    resolution: "0.16mm (Precise)",
    printTime_id: "1.5 Jam",
    printTime_en: "1.5 Hours",
    dimensions: "3 x 3 x 4 cm",
    weightGrams: 25,
    image: "/products/Keycap_Cliker_Nama3.webp",
    images: ["/products/Keycap_Cliker_Nama3.webp", "/products/Keycap_Cliker_Nama.png", "/products/Keycap_Cliker_Nama2.jpeg"],
    description_id: "Mainan mechanical switch keycap clicker custom nama. Suara clicky yang memuaskan sebagai mainan pereda stress (fidget toy) di meja kerja.",
    description_en: "Mechanical switch keycap clicker with personalized 3D printed name. Satisfying clicky feedback for desk stress relief.",
    isFeatured: true,
    colorOptions: ["Hitam Putih", "Pastel Pink", "Cyber Cyan"],
    inStock: true
  },
  {
    id: "prod-003",
    title_id: "Gantungan Kunci Naga & Gurita Articulated 3D",
    title_en: "3D Articulated Dragon & Animal Keychain",
    category_id: "Keychain & Aksesoris",
    category_en: "Keychain & Accessories",
    price: 25000,
    material: "PLA",
    infill: "20% Gyroid",
    resolution: "0.16mm (Flex Joint)",
    printTime_id: "2.5 Jam",
    printTime_en: "2.5 Hours",
    dimensions: "12 x 3 x 2 cm",
    weightGrams: 35,
    image: "/products/Ganci_Naga.webp",
    images: ["/products/Ganci_Naga.webp", "/products/Ganci_Gurita.webp", "/products/Ganci_25_Animal.webp", "/products/Ganci_Nama.webp"],
    description_id: "Gantungan kunci naga & gurita 3D dengan engsel fleksibel bergerak (print-in-place articulated joint). Unik, fleksibel, dan estetik.",
    description_en: "3D printed articulated dragon & octopus keychain with moving joints. Flexible, durable, and highly unique.",
    isFeatured: true,
    colorOptions: ["Rainbow Silk", "Emerald Green", "Obsidian Black"],
    inStock: true
  },
  {
    id: "prod-004",
    title_id: "Dumpling Fidget Clicker 3D",
    title_en: "3D Printed Dumpling Fidget Clicker",
    category_id: "Keychain & Aksesoris",
    category_en: "Keychain & Accessories",
    price: 30000,
    material: "PLA",
    infill: "20% Gyroid",
    resolution: "0.16mm (Clean)",
    printTime_id: "2 Jam",
    printTime_en: "2 Hours",
    dimensions: "5 x 5 x 4 cm",
    weightGrams: 40,
    image: "/products/Dumpling_Kliker.webp",
    images: ["/products/Dumpling_Kliker.webp", "/products/Dumpling_Kliker1.png", "/products/Dumpling_Kliker2.png"],
    description_id: "Mainan fidget clicker bentuk dumpling siomay imut dengan mekanisme pencetan mekanis yang memuaskan.",
    description_en: "Cute dumpling shaped fidget clicker toy with satisfying tactile mechanical feedback.",
    isFeatured: false,
    colorOptions: ["White Cream", "Matcha Green", "Sakura Pink"],
    inStock: true
  },
  {
    id: "prod-005",
    title_id: "Lampu Tidur Bulan 3D Lithophane (Moon Lamp)",
    title_en: "3D Printed Moon Lithophane Night Lamp",
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
    image: "/products/Lampu_Tidur_Bulan.webp",
    images: ["/products/Lampu_Tidur_Bulan.webp", "/products/Lampu_Tidur_Bulan1.webp", "/products/Lampu_Tidur_Bulan2.webp", "/products/Lampu_Tidur_Bulan3.webp", "/products/Lampu_Tidur_Bulan_Size.webp"],
    description_id: "Lampu tidur hias relief permukaan bulan 3D (Lithophane Moon Lamp) dengan pendaran cahaya LED hangat yang estetik untuk kamar tidur.",
    description_en: "Custom 3D printed lunar surface lithophane night lamp. Emits warm ambient LED glow perfect for bedroom decor.",
    isFeatured: true,
    colorOptions: ["Warm White LED", "Cool White LED", "RGB Remote"],
    inStock: true
  },
  {
    id: "prod-006",
    title_id: "Lampu Tidur Hias Spiral & Tabung Modern",
    title_en: "Modern Spiral & Cylinder Night Lamp 3D",
    category_id: "Dekorasi & Lampu Lithophane",
    category_en: "Decor & Lithophane Lamp",
    price: 125000,
    material: "PLA",
    infill: "15% Gyroid",
    resolution: "0.20mm Standard",
    printTime_id: "10 Jam",
    printTime_en: "10 Hours",
    dimensions: "12 x 12 x 22 cm",
    weightGrams: 180,
    image: "/products/Lampu_Tidur_Spiral.webp",
    images: ["/products/Lampu_Tidur_Spiral.webp", "/products/Lampu_Tidur_Tabung.webp"],
    description_id: "Lampu meja hias berpola geometris spiral modern cetak 3D. Menghasilkan efek pantulan bayangan unik dan hangat.",
    description_en: "Modern 3D printed geometric spiral table lamp. Creates beautiful ambient shadow patterns.",
    isFeatured: false,
    colorOptions: ["Chalk White", "Matte Black", "Amber Gold"],
    inStock: true
  },
  {
    id: "prod-007",
    title_id: "Bingkai Foto & Medali Hexagonal Modular (Hyrox / Marathon)",
    title_en: "Modular Hexagonal Medal Display Frame",
    category_id: "Dekorasi & Lampu Lithophane",
    category_en: "Decor & Lithophane Lamp",
    price: 85000,
    material: "PLA",
    infill: "20% Gyroid",
    resolution: "0.16mm (Clean Finish)",
    printTime_id: "6 Jam",
    printTime_en: "6 Hours",
    dimensions: "16 x 14 x 3 cm",
    weightGrams: 120,
    image: "/products/Hexagonal_bingkai_Medal.webp",
    images: ["/products/Hexagonal_bingkai_Medal.webp", "/products/Hexagonal_Bingkai_Hyrox.webp", "/products/Hexagonal_bingkai_Medal1.webp", "/products/Hexagonal_bingkai_Medal2.webp", "/products/Hexagonal_bingkai_Medal3.webp", "/products/Hexagonal_bingkai_Medal4.webp", "/products/Hexagonal_Bingkai_Medal5.webp", "/products/Frame_Medal.webp"],
    description_id: "Bingkai display gantungan medali lari, marathon, Hyrox, dan foto berbahan 3D printing modular yang bisa disambung-sambung secara estetik di dinding.",
    description_en: "Modular 3D printed hexagonal frame for running, marathon, and Hyrox medals. Easily linkable for custom wall displays.",
    isFeatured: true,
    colorOptions: ["Matte Black", "Chalk White", "Gold Metallic"],
    inStock: true
  },
  {
    id: "prod-008",
    title_id: "Hiasan Dinding Hexagonal Modular 3D",
    title_en: "Modular Hexagonal Wall Art 3D",
    category_id: "Dekorasi & Lampu Lithophane",
    category_en: "Decor & Lithophane Lamp",
    price: 65000,
    material: "PLA",
    infill: "15% Gyroid",
    resolution: "0.20mm Standard",
    printTime_id: "4 Jam",
    printTime_en: "4 Hours",
    dimensions: "15 x 13 x 2 cm",
    weightGrams: 90,
    image: "/products/Hiasan_Dinding_Hexagonal_Modular.webp",
    images: ["/products/Hiasan_Dinding_Hexagonal_Modular.webp"],
    description_id: "Dekorasi dinding estetik susun honeycomb hexagonal 3D untuk menghias ruangan kamar, kantor, atau studio.",
    description_en: "Esthetic 3D printed honeycomb hexagonal wall decor panels for room and office interior decoration.",
    isFeatured: false,
    colorOptions: ["Black & Gold Combo", "Nordic White", "Slate Grey"],
    inStock: true
  },
  {
    id: "prod-009",
    title_id: "Pot Kaktus & Plant Stand 3D Minimalis",
    title_en: "Minimalist 3D Cactus Pot & Desk Stand",
    category_id: "Dekorasi & Lampu Lithophane",
    category_en: "Decor & Lithophane Lamp",
    price: 45000,
    material: "PLA",
    infill: "20% Gyroid",
    resolution: "0.20mm Standard",
    printTime_id: "3.5 Jam",
    printTime_en: "3.5 Hours",
    dimensions: "10 x 10 x 12 cm",
    weightGrams: 110,
    image: "/products/Kaktus_Stand.webp",
    images: ["/products/Kaktus_Stand.webp", "/products/Kaktus_Stand2.webp"],
    description_id: "Pot tanaman succulent / kaktus mini meja cetak 3D dengan desain lubang drainase presisi dan dudukan estetik.",
    description_en: "Minimalist 3D printed succulent planter pot with precision drainage and desk stand.",
    isFeatured: false,
    colorOptions: ["Terracotta", "Chalk White", "Sage Green"],
    inStock: true
  },
  {
    id: "prod-010",
    title_id: "Mainan Katana Telescopic Retractable 3D",
    title_en: "3D Printed Retractable Telescopic Katana",
    category_id: "Art & Figurine",
    category_en: "Art & Figurine",
    price: 75000,
    material: "PLA",
    infill: "100% Edge Solid",
    resolution: "0.16mm (Precision Slide)",
    printTime_id: "8 Jam",
    printTime_en: "8 Hours",
    dimensions: "75 x 5 x 5 cm (Extended)",
    weightGrams: 190,
    image: "/products/Mainan_Katana1.webp",
    images: ["/products/Mainan_Katana1.webp", "/products/Mainan_Katana2.webp", "/products/Mainan_Katana3.webp"],
    description_id: "Mainan pedang katana 3D printing yang bisa memanjang dan memendek secara mulus (Collapsible Telescopic Sword).",
    description_en: "3D printed collapsible telescopic katana sword that smoothly extends and retracts.",
    isFeatured: true,
    colorOptions: ["Black & Red", "Purple & Silver", "Full Black Stealth"],
    inStock: true
  },
  {
    id: "prod-011",
    title_id: "Action Figure Mecacamelon 3D Articulated",
    title_en: "3D Articulated Mecha Melon Action Figure",
    category_id: "Art & Figurine",
    category_en: "Art & Figurine",
    price: 95000,
    material: "PLA",
    infill: "20% Gyroid",
    resolution: "0.16mm High Detail",
    printTime_id: "9 Jam",
    printTime_en: "9 Hours",
    dimensions: "15 x 10 x 8 cm",
    weightGrams: 160,
    image: "/products/Mecacamelon.webp",
    images: ["/products/Mecacamelon.webp", "/products/Mecacamelon2.webp"],
    description_id: "Figur robot unik Mecacamelon dengan persendian bergerak penuh (Print-in-place articulated mecha robot figure).",
    description_en: "Unique 3D printed Mecacamelon robot figure with fully poseable articulated joints.",
    isFeatured: true,
    colorOptions: ["Green Melon", "Cyber Orange", "Steel Grey"],
    inStock: true
  },
  {
    id: "prod-012",
    title_id: "Rak Display Medali Olahraga 3D Dinding",
    title_en: "3D Printed Wall Medal Hanger Rack",
    category_id: "Dekorasi & Lampu Lithophane",
    category_en: "Decor & Lithophane Lamp",
    price: 85000,
    material: "PETG",
    infill: "40% Gyroid (High Strength)",
    resolution: "0.20mm Strong",
    printTime_id: "7 Jam",
    printTime_en: "7 Hours",
    dimensions: "30 x 10 x 4 cm",
    weightGrams: 210,
    image: "/products/Rak_Medali.webp",
    images: ["/products/Rak_Medali.webp", "/products/Rak_Medali2.webp", "/products/Rak_Medali3.webp", "/products/Rak_Medali4.webp"],
    description_id: "Gantungan rak display medali piala kejuaraan dinding berbahan PETG kokoh tahan beban berat.",
    description_en: "Heavy-duty 3D printed PETG wall medal hanger rack for sports and championship medals.",
    isFeatured: false,
    colorOptions: ["Matte Black", "Industrial Grey", "Navy Blue"],
    inStock: true
  },
  {
    id: "prod-013",
    title_id: "Rak Sepatu & Organizer Dinding Modular 3D",
    title_en: "Modular 3D Wall Shoe & Shelf Holder",
    category_id: "Mechanical & Sparepart",
    category_en: "Mechanical & Spareparts",
    price: 110000,
    material: "PETG",
    infill: "40% Gyroid",
    resolution: "0.20mm Structural",
    printTime_id: "11 Jam",
    printTime_en: "11 Hours",
    dimensions: "25 x 15 x 8 cm",
    weightGrams: 280,
    image: "/products/Rak_Sepatu_dan_rak_dinding.webp",
    images: ["/products/Rak_Sepatu_dan_rak_dinding.webp", "/products/Rak_Sepatu_dan_rak_dinding2.webp"],
    description_id: "Bracket gantungan rak dinding & floating shoe rack hemat tempat berbahan PETG industri ekstra kuat.",
    description_en: "Space-saving 3D printed modular wall shoe & shelf bracket made of high-strength PETG.",
    isFeatured: false,
    colorOptions: ["Solid Black", "Alpine White"],
    inStock: true
  },
  {
    id: "prod-014",
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
    images: ["/products/mechanical_gear_3d_1791476383735.png"],
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

// Robust helper to get localized product properties with automatic fallbacks & base URL resolution
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

  // Safe fallback for images with dynamic base URL resolution
  const rawImages = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : [product.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'];

  const images = rawImages.map(img => getAssetUrl(img));

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

// Robust helper to extract clean numeric price
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
