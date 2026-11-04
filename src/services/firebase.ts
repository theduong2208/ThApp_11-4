import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
  Auth,
} from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cấu hình Firebase chính xác từ project: chat-realtime-516ce
const firebaseConfig = {
  apiKey: "AIzaSyBhjeb_9JKI96oD8Ryjaa9U2tY7l7y6aXY",
  authDomain: "chat-realtime-516ce.firebaseapp.com",
  databaseURL: "https://chat-realtime-516ce-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "chat-realtime-516ce",
  storageBucket: "chat-realtime-516ce.firebasestorage.app",
  messagingSenderId: "831366452926",
  appId: "1:831366452926:web:460aef30409e20f4a970ef"
};

// Đảm bảo không khởi tạo app nhiều lần nếu Fast Refresh chạy
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Khởi tạo Auth với AsyncStorage để lưu phiên đăng nhập lâu dài trên thiết bị
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // Dự phòng khi module đã được khởi tạo trước đó
  auth = getAuth(app);
}

// Khởi tạo Realtime Database instance
const db: Database = getDatabase(app);

export { app, auth, db };
