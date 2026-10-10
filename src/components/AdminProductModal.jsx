import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Edit3, Upload, Image as ImageIcon, Check, Globe, Trash2, Star, Video, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORIES, MATERIALS } from '../data/initialProducts';

export default function AdminProductModal({ productToEdit, onClose, onSaveProduct }) {
  const isEditing = Boolean(productToEdit);

  const [formData, setFormData] = useState({
    title_id: '',
    title_en: '',
    category: 'Keychain & Aksesoris',
    price: 25000,
    material: 'PLA',
    infill: '20% Gyroid',
    resolution: '0.16mm (Standard)',
    printTime_id: '2 Jam',
    printTime_en: '2 Hours',
    dimensions: '8 x 4 x 1 cm',
    weightGrams: 30,
    image: '/products/cyberpunk_mecha_3d_1791476366012.png',
    description_id: '',
    description_en: '',
    isFeatured: false,
    colorOptions: 'Hitam, White, Red'
  });

  const [imagesList, setImagesList] = useState([]);
  const [imageFileName, setImageFileName] = useState('');
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  useEffect(() => {
    if (productToEdit) {
      const existingImages = Array.isArray(productToEdit.images) && productToEdit.images.length > 0
        ? productToEdit.images
        : (productToEdit.image ? [productToEdit.image] : []);

      setImagesList(existingImages);

      setFormData({
        ...productToEdit,
        title_id: productToEdit.title_id || productToEdit.title || '',
        title_en: productToEdit.title_en || productToEdit.title || '',
        description_id: productToEdit.description_id || productToEdit.description || '',
        description_en: productToEdit.description_en || productToEdit.description || '',
        printTime_id: productToEdit.printTime_id || productToEdit.printTime || '2 Jam',
        printTime_en: productToEdit.printTime_en || productToEdit.printTime || '2 Hours',
        colorOptions: Array.isArray(productToEdit.colorOptions) ? productToEdit.colorOptions.join(', ') : (productToEdit.colorOptions || '')
      });
    } else {
      setImagesList(['/products/cyberpunk_mecha_3d_1791476366012.png']);
    }
  }, [productToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = value;
    if (type === 'number') {
      val = value.replace(/^0+(?=\d)/, '');
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : val
    }));
  };

  // Canvas Image Compression helper to keep localStorage lightweight and prevent white screen crashes
  const compressImageFile = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = () => resolve(e.target?.result);
        img.src = e.target?.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  // Helper to detect if a file or URL is a video
  const isVideoUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    return url.startsWith('data:video/') || url.match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i) || url.includes('/videos/');
  };

  // Helper to read media file (Images compressed via Canvas, Videos read as Data URL)
  const readMediaFile = (file) => {
    return new Promise((resolve) => {
      if (file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|ogg|mov|m4v)$/i)) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      } else {
        compressImageFile(file, 800, 800, 0.8).then(resolve);
      }
    });
  };

  // Handle local image/video file upload
  const handleMediaFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      const mediaList = await Promise.all(files.map(readMediaFile));
      const validMedia = mediaList.filter(Boolean);
      setImagesList((prev) => [...prev, ...validMedia]);
      setImageFileName(`${files.length} media (foto/video) berhasil diunggah`);
    } catch (err) {
      console.error("Gagal mengunggah media", err);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImagesList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetPrimaryImage = (indexToPrimary) => {
    setImagesList((prev) => {
      const copy = [...prev];
      const target = copy.splice(indexToPrimary, 1)[0];
      return [target, ...copy];
    });
  };

  // Drag and Drop Reorder Handlers
  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIdx(null);
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    setDragOverIdx(null);
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    
    setImagesList((prev) => {
      const newList = [...prev];
      const [draggedItem] = newList.splice(draggedIdx, 1);
      newList.splice(targetIdx, 0, draggedItem);
      return newList;
    });
    setDraggedIdx(null);
  };

  // Move Step (Arrow Buttons Reordering)
  const handleMoveStep = (fromIdx, direction) => {
    const toIdx = fromIdx + direction;
    if (toIdx < 0 || toIdx >= imagesList.length) return;
    setImagesList((prev) => {
      const newList = [...prev];
      const [item] = newList.splice(fromIdx, 1);
      newList.splice(toIdx, 0, item);
      return newList;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const colorsArray = formData.colorOptions
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const finalImages = imagesList.length > 0 
      ? imagesList 
      : ['/products/cyberpunk_mecha_3d_1791476366012.png'];

    const updatedProduct = {
      ...formData,
      id: isEditing ? formData.id : `prod-${Date.now()}`,
      images: finalImages,
      image: finalImages[0], // Cover image fallback
      title: formData.title_id, // Default title fallback
      description: formData.description_id, // Default description fallback
      price: formData.price || '0',
      weightGrams: Number(formData.weightGrams) || 0,
      colorOptions: colorsArray.length ? colorsArray : ['Standard Color']
    };

    onSaveProduct(updatedProduct);
    onClose();
  };

  const handleSafeClose = () => {
    // Check if form has unsaved changes
    const isFormDirty = isEditing
      ? (formData.title_id !== (productToEdit.title_id || productToEdit.title || '') ||
         formData.price !== (productToEdit.price || '') ||
         formData.description_id !== (productToEdit.description_id || productToEdit.description || '') ||
         imagesList.length !== ((productToEdit.images && productToEdit.images.length) || (productToEdit.image ? 1 : 0)))
      : (formData.title_id.trim() !== '' ||
         formData.description_id.trim() !== '' ||
         imagesList.length > 1 ||
         (imagesList.length === 1 && imagesList[0] !== '/products/cyberpunk_mecha_3d_1791476366012.png'));

    if (isFormDirty) {
      const confirmClose = window.confirm('Ada data atau perubahan produk yang belum disimpan. Yakin ingin keluar?');
      if (!confirmClose) return;
    }
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '780px',
          padding: '24px',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleSafeClose}
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

        {/* Header Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{
            background: '#eff6ff',
            padding: '8px',
            borderRadius: '8px',
            color: '#2563eb'
          }}>
            {isEditing ? <Edit3 size={18} /> : <Plus size={18} />}
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              {isEditing ? 'Edit Produk Katalog 3D (Multi-Foto)' : 'Tambah Produk Katalog Baru (Multi-Foto)'}
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Upload satu atau beberapa foto produk sekaligus agar user dapat menggeser foto di detail produk.
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          
          {/* Multi-Photo & Video Upload & Gallery Management Section */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#334155', fontWeight: 700, marginBottom: '6px' }}>
              <span>Upload Foto & Video Produk (Urutan Bisa Digeser / Drag & Drop)</span>
              <span style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.78rem' }}>
                Total: {imagesList.length} Media
              </span>
            </label>
            
            <div style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '10px',
              padding: '16px',
              background: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              {/* Thumbnail List Gallery with Drag & Drop */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '12px'
              }}>
                {imagesList.map((mediaUrl, idx) => {
                  const isVid = isVideoUrl(mediaUrl);
                  const isBeingDragged = draggedIdx === idx;
                  const isTargetHover = dragOverIdx === idx;

                  return (
                    <div 
                      key={idx}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, idx)}
                      onDragEnd={() => { setDraggedIdx(null); setDragOverIdx(null); }}
                      style={{
                        position: 'relative',
                        height: '125px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: idx === 0 
                          ? '2.5px solid #2563eb' 
                          : isTargetHover 
                          ? '2px dashed #2563eb' 
                          : '1px solid #cbd5e1',
                        background: '#000000',
                        boxShadow: isTargetHover ? '0 0 10px rgba(37,99,235,0.4)' : '0 2px 6px rgba(0,0,0,0.06)',
                        opacity: isBeingDragged ? 0.4 : 1,
                        cursor: 'grab',
                        transition: 'transform 0.15s ease, border 0.15s ease'
                      }}
                      title="Klik & tahan untuk menggeser urutan foto/video"
                    >
                      {isVid ? (
                        <video 
                          src={mediaUrl} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          muted 
                          preload="metadata"
                        />
                      ) : (
                        <img 
                          src={mediaUrl} 
                          alt={`Media ${idx + 1}`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}

                      {/* Video Tag Badge */}
                      {isVid && (
                        <span style={{
                          position: 'absolute',
                          bottom: '30px',
                          right: '4px',
                          background: 'rgba(0,0,0,0.75)',
                          color: '#ffffff',
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          padding: '2px 5px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <Video size={10} /> VIDEO
                        </span>
                      )}

                      {/* Order Position & Cover Tag */}
                      <span style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        background: idx === 0 ? '#2563eb' : 'rgba(15, 23, 42, 0.85)',
                        color: '#ffffff',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <GripVertical size={10} />
                        {idx === 0 ? '#1 Cover Utama' : `#${idx + 1}`}
                      </span>

                      {/* Delete Media Button */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: '#fef2f2',
                          border: '1px solid #fca5a5',
                          color: '#dc2626',
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        title="Hapus media ini"
                      >
                        <Trash2 size={11} />
                      </button>

                      {/* Quick Shift Arrows Control Bar at Bottom */}
                      <div style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '0',
                        right: '0',
                        background: 'rgba(15, 23, 42, 0.85)',
                        padding: '3px 6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backdropFilter: 'blur(4px)'
                      }}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleMoveStep(idx, -1); }}
                          disabled={idx === 0}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: idx === 0 ? '#64748b' : '#ffffff',
                            cursor: idx === 0 ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2px'
                          }}
                          title="Geser Ke Depan (Maju)"
                        >
                          <ChevronLeft size={14} />
                        </button>

                        <span style={{ fontSize: '0.62rem', color: '#cbd5e1', fontWeight: 600 }}>
                          Geser
                        </span>

                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleMoveStep(idx, 1); }}
                          disabled={idx === imagesList.length - 1}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: idx === imagesList.length - 1 ? '#64748b' : '#ffffff',
                            cursor: idx === imagesList.length - 1 ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2px'
                          }}
                          title="Geser Ke Belakang (Mundur)"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Upload Button Card */}
                <label 
                  htmlFor="multi-file-upload-input"
                  style={{
                    height: '125px',
                    borderRadius: '8px',
                    border: '2px dashed #2563eb',
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    padding: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#dbeafe'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#eff6ff'}
                >
                  <Plus size={22} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>+ Foto / Video</span>
                </label>
              </div>

              <input 
                id="multi-file-upload-input"
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleMediaFileChange}
                style={{ display: 'none' }}
              />

              <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                <span>💡 <strong>Tips:</strong> Tarik & lepas (drag & drop) atau klik panah ◄ ► di bawah foto untuk menggeser posisi urutan. Foto <strong>#1</strong> otomatis menjadi Cover Utama.</span>
                {imageFileName && (
                  <span style={{ color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={14} /> {imageFileName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 1. Title Bahasa Indonesia */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#0f172a', fontWeight: 700, marginBottom: '4px' }}>
              🇮🇩 Nama Produk (Bahasa Indonesia)
            </label>
            <input
              type="text"
              name="title_id"
              className="input-custom"
              placeholder="Contoh: Gantungan Kunci Custom Nama"
              value={formData.title_id}
              onChange={handleChange}
              required
            />
          </div>

          {/* 2. Title English */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#2563eb', fontWeight: 700, marginBottom: '4px' }}>
              🇬🇧 Product Title (English)
            </label>
            <input
              type="text"
              name="title_en"
              className="input-custom"
              placeholder="Example: Custom Name 3D Keychain"
              value={formData.title_en}
              onChange={handleChange}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 600, marginBottom: '4px' }}>
              Kategori
            </label>
            <select
              name="category"
              className="input-custom"
              value={formData.category}
              onChange={handleChange}
            >
              {CATEGORIES.filter(c => c !== 'Semua Kategori').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 600, marginBottom: '4px' }}>
              Harga Cetak (Rupiah atau Range)
            </label>
            <input
              type="text"
              name="price"
              className="input-custom"
              value={formData.price === 0 || formData.price === '0' ? '' : formData.price}
              onFocus={(e) => e.target.select()}
              onChange={handleChange}
              placeholder="Contoh: 25000 atau 25000-50000"
              required
            />
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>
              Bisa isi angka pas (misal: 25000) atau range harga (misal: 25000-50000).
            </div>
          </div>

          {/* Material */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 600, marginBottom: '4px' }}>
              Jenis Material
            </label>
            <select
              name="material"
              className="input-custom"
              value={formData.material}
              onChange={handleChange}
            >
              {MATERIALS.filter(m => m !== 'Semua Bahan').map(mat => (
                <option key={mat} value={mat}>{mat}</option>
              ))}
            </select>
          </div>

          {/* Infill */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 600, marginBottom: '4px' }}>
              Infill Density
            </label>
            <input
              type="text"
              name="infill"
              className="input-custom"
              placeholder="Contoh: 20% Gyroid / 100% Solid"
              value={formData.infill}
              onChange={handleChange}
            />
          </div>

          {/* Resolution */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 600, marginBottom: '4px' }}>
              Layer Resolution
            </label>
            <input
              type="text"
              name="resolution"
              className="input-custom"
              placeholder="Contoh: 0.16mm (Standard)"
              value={formData.resolution}
              onChange={handleChange}
            />
          </div>

          {/* Weight */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 600, marginBottom: '4px' }}>
              Berat Filamen (Gram)
            </label>
            <input
              type="number"
              name="weightGrams"
              className="input-custom"
              value={formData.weightGrams === 0 || formData.weightGrams === '0' ? '' : formData.weightGrams}
              onFocus={(e) => e.target.select()}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          {/* Print Time ID */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 600, marginBottom: '4px' }}>
              🇮🇩 Estimasi Print (Indo)
            </label>
            <input
              type="text"
              name="printTime_id"
              className="input-custom"
              placeholder="Contoh: 45 Menit / 8 Jam"
              value={formData.printTime_id}
              onChange={handleChange}
            />
          </div>

          {/* Print Time EN */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 600, marginBottom: '4px' }}>
              🇬🇧 Est. Print Time (English)
            </label>
            <input
              type="text"
              name="printTime_en"
              className="input-custom"
              placeholder="Example: 45 Mins / 8 Hours"
              value={formData.printTime_en}
              onChange={handleChange}
            />
          </div>

          {/* Dimensions */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 600, marginBottom: '4px' }}>
              Dimensi (PxLxT cm)
            </label>
            <input
              type="text"
              name="dimensions"
              className="input-custom"
              placeholder="Contoh: 6 x 3 x 0.4 cm"
              value={formData.dimensions}
              onChange={handleChange}
            />
          </div>

          {/* Color options */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#334155', fontWeight: 600, marginBottom: '4px' }}>
              Pilihan Warna (Dipisah Koma)
            </label>
            <input
              type="text"
              name="colorOptions"
              className="input-custom"
              placeholder="Hitam, Merah, White"
              value={formData.colorOptions}
              onChange={handleChange}
            />
          </div>

          {/* Description ID */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#0f172a', fontWeight: 700, marginBottom: '4px' }}>
              🇮🇩 Deskripsi Produk (Bahasa Indonesia)
            </label>
            <textarea
              name="description_id"
              rows={2}
              className="input-custom"
              placeholder="Tulis deskripsi produk dalam bahasa Indonesia..."
              value={formData.description_id}
              onChange={handleChange}
            />
          </div>

          {/* Description EN */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#2563eb', fontWeight: 700, marginBottom: '4px' }}>
              🇬🇧 Product Description (English)
            </label>
            <textarea
              name="description_en"
              rows={2}
              className="input-custom"
              placeholder="Write product description in English..."
              value={formData.description_en}
              onChange={handleChange}
            />
          </div>

          {/* Featured Checkbox */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
            />
            <label htmlFor="isFeatured" style={{ fontSize: '0.82rem', color: '#334155', cursor: 'pointer' }}>
              Tandai sebagai Produk FEATURED Unggulan
            </label>
          </div>

          {/* Submit Action */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button type="button" onClick={handleSafeClose} className="btn-secondary">
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              <Save size={16} />
              {isEditing ? 'Simpan Perubahan' : 'Tambah ke Katalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
