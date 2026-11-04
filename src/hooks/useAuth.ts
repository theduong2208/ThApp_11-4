import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { subscribeAuth } from '../services/authService';
import { setupPresence } from '../services/userService';

interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Theo dõi trạng thái đăng nhập
    const unsubscribeAuth = subscribeAuth((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    // Tự động kích hoạt cơ chế Online/Offline và đồng bộ tên khi user đã đăng nhập
    if (!user) return;

    const cleanupPresence = setupPresence(
      user.uid,
      user.displayName,
      user.email
    );

    return () => {
      cleanupPresence();
    };
  }, [user]);

  return { user, loading };
}
