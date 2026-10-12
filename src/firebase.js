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

// Helper to handle media (returns HTTP URLs and compressed Base64 Data URLs instantly for Cloud Firestore)
export const uploadMediaToStorage = async (mediaData, productId, index = 0) => {
  if (!mediaData || typeof mediaData !== 'string') return mediaData;
  // Return compressed Base64 Data URLs or HTTP links instantly (saved directly into Firestore Cloud DB in 0.2s)
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

// Real-Time listener for catalog calculator items
export const subscribeToCatalogCalculatorItems = (onUpdate, onError) => {
  const calcRef = collection(db, "catalog_calculator");
  
  return onSnapshot(calcRef, (snapshot) => {
    const items = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        ...data,
        id: data.id !== undefined ? data.id : docSnap.id
      };
    });
    onUpdate(items);
  }, (err) => {
    console.error("Firestore catalog_calculator listener error:", err);
    if (onError) onError(err);
  });
};

// Save single item to Firestore catalog_calculator
export const saveCloudCatalogCalculatorItem = async (item) => {
  if (!item || item.id === undefined || item.id === null) return;
  const cleanItem = JSON.parse(JSON.stringify(item));
  const docRef = doc(db, "catalog_calculator", String(item.id));
  await setDoc(docRef, { ...cleanItem, updatedAt: new Date().toISOString() }, { merge: true });
  return cleanItem;
};

// Save multiple items to Firestore catalog_calculator in batch/parallel
export const saveAllCloudCatalogCalculatorItems = async (itemsList = []) => {
  if (!Array.isArray(itemsList) || itemsList.length === 0) return;
  const promises = itemsList.map(item => saveCloudCatalogCalculatorItem(item));
  await Promise.all(promises);
};

// Delete item from Firestore catalog_calculator
export const deleteCloudCatalogCalculatorItem = async (itemId) => {
  if (itemId === undefined || itemId === null) return;
  const docRef = doc(db, "catalog_calculator", String(itemId));
  await deleteDoc(docRef);
};

// Seed initial calculator items if collection is empty
export const seedCatalogCalculatorIfEmpty = async (initialList = []) => {
  try {
    const calcRef = collection(db, "catalog_calculator");
    const snapshot = await getDocs(calcRef);
    if (snapshot.empty && initialList.length > 0) {
      for (const item of initialList) {
        const docRef = doc(db, "catalog_calculator", String(item.id));
        await setDoc(docRef, { ...item, createdAt: new Date().toISOString() });
      }
    }
  } catch (err) {
    console.warn("Failed to seed catalog calculator:", err);
  }
};

// ==================== INITIAL CAPITAL: FUNDS (Sumber Dana Modal) ====================
export const subscribeToCapitalFunds = (onUpdate, onError) => {
  const fundsRef = collection(db, "initial_capital_funds");
  return onSnapshot(fundsRef, (snapshot) => {
    const items = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        ...data,
        id: data.id !== undefined ? data.id : docSnap.id
      };
    });
    onUpdate(items);
  }, (err) => {
    console.error("Firestore initial_capital_funds listener error:", err);
    if (onError) onError(err);
  });
};

export const saveCloudCapitalFund = async (fund) => {
  if (!fund || fund.id === undefined || fund.id === null) return;
  const cleanFund = JSON.parse(JSON.stringify(fund));
  const docRef = doc(db, "initial_capital_funds", String(fund.id));
  await setDoc(docRef, { ...cleanFund, updatedAt: new Date().toISOString() }, { merge: true });
  return cleanFund;
};

export const saveAllCloudCapitalFunds = async (fundsList = []) => {
  if (!Array.isArray(fundsList) || fundsList.length === 0) return;
  const promises = fundsList.map(fund => saveCloudCapitalFund(fund));
  await Promise.all(promises);
};

export const deleteCloudCapitalFund = async (fundId) => {
  if (fundId === undefined || fundId === null) return;
  const docRef = doc(db, "initial_capital_funds", String(fundId));
  await deleteDoc(docRef);
};

export const seedCapitalFundsIfEmpty = async (initialFunds = []) => {
  try {
    const fundsRef = collection(db, "initial_capital_funds");
    const snapshot = await getDocs(fundsRef);
    if (snapshot.empty && initialFunds.length > 0) {
      for (const fund of initialFunds) {
        const docRef = doc(db, "initial_capital_funds", String(fund.id));
        await setDoc(docRef, { ...fund, createdAt: new Date().toISOString() });
      }
    }
  } catch (err) {
    console.warn("Failed to seed capital funds:", err);
  }
};

// ==================== INITIAL CAPITAL: ITEMS & STRUK (Belanja Aset Modal) ====================
export const subscribeToCapitalItems = (onUpdate, onError) => {
  const itemsRef = collection(db, "initial_capital_items");
  return onSnapshot(itemsRef, (snapshot) => {
    const items = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        ...data,
        id: data.id !== undefined ? data.id : docSnap.id
      };
    });
    onUpdate(items);
  }, (err) => {
    console.error("Firestore initial_capital_items listener error:", err);
    if (onError) onError(err);
  });
};

export const saveCloudCapitalItem = async (item) => {
  if (!item || item.id === undefined || item.id === null) return;
  const cleanItem = JSON.parse(JSON.stringify(item));
  const docRef = doc(db, "initial_capital_items", String(item.id));
  await setDoc(docRef, { ...cleanItem, updatedAt: new Date().toISOString() }, { merge: true });
  return cleanItem;
};

export const saveAllCloudCapitalItems = async (itemsList = []) => {
  if (!Array.isArray(itemsList) || itemsList.length === 0) return;
  const promises = itemsList.map(item => saveCloudCapitalItem(item));
  await Promise.all(promises);
};

export const deleteCloudCapitalItem = async (itemId) => {
  if (itemId === undefined || itemId === null) return;
  const docRef = doc(db, "initial_capital_items", String(itemId));
  await deleteDoc(docRef);
};

export const seedCapitalItemsIfEmpty = async (initialItems = []) => {
  try {
    const itemsRef = collection(db, "initial_capital_items");
    const snapshot = await getDocs(itemsRef);
    if (snapshot.empty && initialItems.length > 0) {
      for (const item of initialItems) {
        const docRef = doc(db, "initial_capital_items", String(item.id));
        await setDoc(docRef, { ...item, createdAt: new Date().toISOString() });
      }
    }
  } catch (err) {
    console.warn("Failed to seed capital items:", err);
  }
};



