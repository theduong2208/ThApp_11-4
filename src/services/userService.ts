import {
  ref,
  onValue,
  update,
  onDisconnect,
  serverTimestamp,
} from 'firebase/database';
import { db } from './firebase';
import { AppUser } from '../types/models';

// Lắng nghe danh sách tất cả người dùng khác trong hệ thống theo thời gian thực
export function subscribeUsers(
  currentUid: string,
  callback: (users: AppUser[]) => void
): () => void {
  const usersRef = ref(db, 'users');

  const unsubscribe = onValue(usersRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const users: AppUser[] = [];
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val() as Record<string, unknown> | null;
      const uid = childSnapshot.key ?? '';

      // Loại bỏ chính tài khoản đang đăng nhập
      if (uid && uid !== currentUid && data) {
        let displayName = 'Người dùng';
        if (typeof data.name === 'string' && data.name.trim().length > 0) {
          displayName = data.name.trim();
        } else if (typeof data.email === 'string' && data.email.includes('@')) {
          displayName = data.email.split('@')[0];
        }

        users.push({
          uid,
          name: displayName,
          email: typeof data.email === 'string' ? data.email : '',
          avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : undefined,
          online: Boolean(data.online),
          lastSeen: typeof data.lastSeen === 'number' ? data.lastSeen : 0,
        });
      }
    });

    callback(users);
  });

  return unsubscribe;
}

// Thiết lập presence (trạng thái Online/Offline tự động qua .info/connected)
export function setupPresence(
  uid: string,
  displayName?: string | null,
  email?: string | null,
  avatarUrl?: string | null
): () => void {
  const connectedRef = ref(db, '.info/connected');
  const userStatusRef = ref(db, `users/${uid}`);

  const unsubscribe = onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      const onDisconnectRef = onDisconnect(userStatusRef);
      onDisconnectRef.update({
        online: false,
        lastSeen: serverTimestamp(),
      });

      const statusUpdate: Record<string, unknown> = {
        online: true,
        uid,
      };

      if (displayName && displayName.trim().length > 0) {
        statusUpdate.name = displayName.trim();
      }
      if (email && email.trim().length > 0) {
        statusUpdate.email = email.trim();
      }
      if (avatarUrl && avatarUrl.trim().length > 0) {
        statusUpdate.avatarUrl = avatarUrl.trim();
      }

      update(userStatusRef, statusUpdate);
    }
  });

  return unsubscribe;
}

// Lắng nghe trạng thái online/offline của một người dùng cụ thể
export function subscribeUserStatus(
  uid: string,
  callback: (status: { online: boolean; lastSeen: number }) => void
): () => void {
  const userRef = ref(db, `users/${uid}`);

  const unsubscribe = onValue(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val() as Record<string, unknown>;
      callback({
        online: Boolean(data.online),
        lastSeen: typeof data.lastSeen === 'number' ? data.lastSeen : 0,
      });
    } else {
      callback({ online: false, lastSeen: 0 });
    }
  });

  return unsubscribe;
}
