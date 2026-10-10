import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadString, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCh2WvDoZfAlOZfRpaUcG4lUyhNv2zzGt8",
  authDomain: "equaa3d.firebaseapp.com",
  projectId: "equaa3d",
  storageBucket: "equaa3d.firebasestorage.app",
  messagingSenderId: "372838164762",
  appId: "1:372838164762:web:c635b12f6717ab7c79e4a3",
  measurementId: "G-LYZ1065Z7B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Helper to upload media file (Base64 string or File Object) to Firebase Storage
export const uploadMediaToStorage = async (mediaData, productId, index = 0) => {
  if (!mediaData || typeof mediaData !== 'string') return mediaData;

  // If already an HTTP / HTTPS URL, return as-is
  if (mediaData.startsWith('http://') || mediaData.startsWith('https://')) {
    return mediaData;
  }

  // If it's a Base64 data URL (e.g. data:image/jpeg;base64,...)
  if (mediaData.startsWith('data:')) {
    try {
      const extension = mediaData.includes('video/') ? 'mp4' : 'jpg';
      const storageRef = ref(storage, `products/${productId}_img_${index}_${Date.now()}.${extension}`);
      await uploadString(storageRef, mediaData, 'data_url');
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (err) {
      console.warn("Failed to upload base64 image to Firebase Storage, using data URL fallback:", err);
      return mediaData;
    }
  }

  return mediaData;
};

// Real-Time listener for products collection
export const subscribeToCloudProducts = (onUpdate, onError) => {
  const productsRef = collection(db, "products");
  
  return onSnapshot(productsRef, (snapshot) => {
    const cloudProducts = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
    onUpdate(cloudProducts);
  }, (err) => {
    console.error("Firestore listener error:", err);
    if (onError) onError(err);
  });
};

// Add or Update product in Firestore
export const saveCloudProduct = async (product) => {
  if (!product || !product.id) return;

  // Process all images to ensure base64 photos are uploaded to Firebase Storage
  const finalImages = await Promise.all(
    (product.images || [product.image]).map((media, idx) => 
      uploadMediaToStorage(media, product.id, idx)
    )
  );

  const updatedProduct = {
    ...product,
    images: finalImages,
    image: finalImages[0] || product.image,
    updatedAt: new Date().toISOString()
  };

  // Sanitize object for Firestore (strip undefined values)
  const cleanProduct = JSON.parse(JSON.stringify(updatedProduct));

  const docRef = doc(db, "products", String(product.id));
  await setDoc(docRef, cleanProduct, { merge: true });
  return cleanProduct;
};

// Delete product from Firestore
export const deleteCloudProduct = async (productId) => {
  if (!productId) return;
  const docRef = doc(db, "products", String(productId));
  await deleteDoc(docRef);
};

// Seed default initial products to Firestore if collection is empty
export const seedInitialProductsIfEmpty = async (initialList = []) => {
  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    if (snapshot.empty && initialList.length > 0) {
      console.log("Seeding initial products to Firestore...");
      for (const item of initialList) {
        const docRef = doc(db, "products", String(item.id));
        await setDoc(docRef, { ...item, createdAt: new Date().toISOString() });
      }
      console.log("Firestore seeded successfully!");
    }
  } catch (err) {
    console.warn("Failed to seed initial products to Firestore:", err);
  }
};
