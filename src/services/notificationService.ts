import { ref, onValue, update } from 'firebase/database';
import { db } from './firebase';
import { NotificationItem } from '../types/models';

// Lắng nghe danh sách thông báo của người dùng theo thời gian thực từ Realtime Database
export function subscribeNotifications(
  uid: string,
  callback: (notifications: NotificationItem[]) => void
): () => void {
  const notiRef = ref(db, `notifications/${uid}`);

  const unsubscribe = onValue(notiRef, (snapshot) => {
    if (!snapshot.exists()) {
      // Thông báo chào mừng mặc định nếu người dùng chưa có tin nhắn nào
      callback([
        {
          id: 'welcome',
          content: 'Chào mừng bạn! Thông báo về tin nhắn mới sẽ hiển thị tại đây.',
          time: Date.now(),
          read: true,
        },
      ]);
      return;
    }

    const items: NotificationItem[] = [];
    snapshot.forEach((child) => {
      const data = child.val() as Record<string, unknown> | null;
      const id = child.key ?? '';
      if (data) {
        items.push({
          id,
          content: typeof data.content === 'string' ? data.content : 'Bạn có thông báo mới',
          time: typeof data.time === 'number' ? data.time : Date.now(),
          read: Boolean(data.read),
        });
      }
    });

    // Sắp xếp thông báo mới nhất lên đầu
    items.sort((a, b) => b.time - a.time);
    callback(items);
  });

  return unsubscribe;
}

// Đánh dấu 1 thông báo là đã đọc trên Firebase
export async function markNotificationAsRead(
  uid: string,
  id: string
): Promise<void> {
  if (id === 'welcome') return;
  try {
    await update(ref(db, `notifications/${uid}/${id}`), {
      read: true,
    });
  } catch (err) {
    console.warn('Lỗi đánh dấu đã đọc thông báo:', err);
  }
}

// Đánh dấu tất cả thông báo là đã đọc trên Firebase
export async function markAllNotificationsAsRead(
  uid: string,
  notifications: NotificationItem[]
): Promise<void> {
  const updates: Record<string, unknown> = {};
  for (const noti of notifications) {
    if (noti.id !== 'welcome' && !noti.read) {
      updates[`notifications/${uid}/${noti.id}/read`] = true;
    }
  }

  if (Object.keys(updates).length > 0) {
    try {
      await update(ref(db), updates);
    } catch (err) {
      console.warn('Lỗi đánh dấu tất cả đã đọc:', err);
    }
  }
}
