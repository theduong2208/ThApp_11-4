import {
  ref,
  push,
  update,
  onValue,
  serverTimestamp,
  increment,
} from 'firebase/database';
import { db } from './firebase';
import { Message, MessageType } from '../types/models';

// Tạo chatId chuẩn hóa giữa 2 người (sắp xếp tăng dần theo từ điển)
export function getChatId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join('_');
}

// Lắng nghe danh sách tin nhắn theo chatId
export function subscribeMessages(
  chatId: string,
  callback: (messages: Message[]) => void
): () => void {
  const messagesRef = ref(db, `chats/${chatId}/messages`);

  const unsubscribe = onValue(messagesRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const messages: Message[] = [];
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val() as Record<string, unknown> | null;
      const id = childSnapshot.key ?? '';

      if (data) {
        messages.push({
          id,
          senderId: typeof data.senderId === 'string' ? data.senderId : '',
          type: (data.type as MessageType) || 'text',
          text: typeof data.text === 'string' ? data.text : undefined,
          latitude: typeof data.latitude === 'number' ? data.latitude : undefined,
          longitude:
            typeof data.longitude === 'number' ? data.longitude : undefined,
          createdAt:
            typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
        });
      }
    });

    messages.sort((a, b) => a.createdAt - b.createdAt);
    callback(messages);
  });

  return unsubscribe;
}

// Gửi tin nhắn văn bản bằng atomic multi-path update (bao gồm cập nhật thông báo)
export async function sendTextMessage(
  senderId: string,
  senderName: string,
  peerId: string,
  peerName: string,
  text: string
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;

  const chatId = getChatId(senderId, peerId);
  const newMsgRef = push(ref(db, `chats/${chatId}/messages`));
  const msgId = newMsgRef.key;
  if (!msgId) return;

  const nowTimestamp = serverTimestamp();
  const updates: Record<string, unknown> = {};

  // 1. Thêm tin nhắn mới vào phòng chat
  updates[`chats/${chatId}/messages/${msgId}`] = {
    senderId,
    type: 'text',
    text: trimmed,
    createdAt: nowTimestamp,
  };

  // 2. Cập nhật hội thoại cho người gửi (unread = 0)
  updates[`userChats/${senderId}/${peerId}`] = {
    peerId,
    peerName,
    lastMessage: trimmed,
    lastMessageType: 'text',
    lastTime: nowTimestamp,
    unread: 0,
  };

  // 3. Cập nhật hội thoại cho người nhận (unread + 1)
  updates[`userChats/${peerId}/${senderId}`] = {
    peerId: senderId,
    peerName: senderName,
    lastMessage: trimmed,
    lastMessageType: 'text',
    lastTime: nowTimestamp,
    unread: increment(1),
  };

  // 4. Tạo thông báo tin nhắn mới cho người nhận
  updates[`notifications/${peerId}/${msgId}`] = {
    id: msgId,
    content: `${senderName}: ${trimmed}`,
    time: nowTimestamp,
    read: false,
  };

  await update(ref(db), updates);
}

// Gửi tin nhắn vị trí địa lý bằng atomic multi-path update
export async function sendLocationMessage(
  senderId: string,
  senderName: string,
  peerId: string,
  peerName: string,
  latitude: number,
  longitude: number
): Promise<void> {
  const chatId = getChatId(senderId, peerId);
  const newMsgRef = push(ref(db, `chats/${chatId}/messages`));
  const msgId = newMsgRef.key;
  if (!msgId) return;

  const nowTimestamp = serverTimestamp();
  const summaryText = '📍 Đã gửi một vị trí';
  const updates: Record<string, unknown> = {};

  // 1. Thêm tin nhắn vị trí
  updates[`chats/${chatId}/messages/${msgId}`] = {
    senderId,
    type: 'location',
    latitude,
    longitude,
    createdAt: nowTimestamp,
  };

  // 2. Cập nhật cho người gửi
  updates[`userChats/${senderId}/${peerId}`] = {
    peerId,
    peerName,
    lastMessage: summaryText,
    lastMessageType: 'location',
    lastTime: nowTimestamp,
    unread: 0,
  };

  // 3. Cập nhật cho người nhận (unread + 1)
  updates[`userChats/${peerId}/${senderId}`] = {
    peerId: senderId,
    peerName: senderName,
    lastMessage: summaryText,
    lastMessageType: 'location',
    lastTime: nowTimestamp,
    unread: increment(1),
  };

  // 4. Tạo thông báo vị trí mới cho người nhận
  updates[`notifications/${peerId}/${msgId}`] = {
    id: msgId,
    content: `${senderName} đã chia sẻ một vị trí GPS với bạn 📍`,
    time: nowTimestamp,
    read: false,
  };

  await update(ref(db), updates);
}

// Đánh dấu cuộc trò chuyện đã đọc
export async function markAsRead(myUid: string, peerId: string): Promise<void> {
  try {
    await update(ref(db, `userChats/${myUid}/${peerId}`), {
      unread: 0,
    });
  } catch {
    // Bỏ qua nếu node chưa khởi tạo
  }
}
