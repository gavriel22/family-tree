// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCVWievvCcSbU_adFL_nlc6i6iiZvr2Y-M",
  authDomain: "family-tree-db-59e49.firebaseapp.com",
  databaseURL: "https://family-tree-db-59e49-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "family-tree-db-59e49",
  storageBucket: "family-tree-db-59e49.firebasestorage.app",
  messagingSenderId: "442595928872",
  appId: "1:442595928872:web:5ec2518fa5d5fc41ca3e1d"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Export database supaya bisa dipakai di file lain
export const db = getDatabase(app);