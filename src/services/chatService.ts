import {
  ref,
  push,
  update,
  onValue,
  serverTimestamp,
  increment,
  query,
  orderByKey,
  limitToLast,
  endBefore,
  get,
  onDisconnect,
} from 'firebase/database';
import { db } from './firebase';
import { Message, MessageType, MessageReaction } from '../types/models';

// Tạo convId cố định cho chat 1-1 (sắp xếp uid theo thứ tự từ điển)
export function getDirectConvId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join('_');
}

// Lắng nghe danh sách tin nhắn theo phân trang (limitToLast)
export function subscribeMessagesPaged(
  convId: string,
  limitCount: number,
  callback: (messages: Message[]) => void
): () => void {
  const messagesQuery = query(
    ref(db, `messages/${convId}`),
    orderByKey(),
    limitToLast(limitCount)
  );

  const unsubscribe = onValue(messagesQuery, (snapshot) => {
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
          convId,
          senderId: typeof data.senderId === 'string' ? data.senderId : '',
          senderName: typeof data.senderName === 'string' ? data.senderName : 'Người dùng',
          type: (data.type as MessageType) || 'text',
          text: typeof data.text === 'string' ? data.text : undefined,
          imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : undefined,
          latitude: typeof data.latitude === 'number' ? data.latitude : undefined,
          longitude: typeof data.longitude === 'number' ? data.longitude : undefined,
          createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
          recalled: Boolean(data.recalled),
          reactions: (data.reactions as MessageReaction) || undefined,
          replyTo: data.replyTo as { id: string; senderName: string; text: string } | undefined,
        });
      }
    });

    // Sắp xếp thời gian tăng dần
    messages.sort((a, b) => a.createdAt - b.createdAt);
    callback(messages);
  });

  return unsubscribe;
}

// Tải thêm tin nhắn cũ hơn (khi kéo lên trên đầu)
export async function loadMoreMessages(
  convId: string,
  oldestKey: string,
  count: number = 20
): Promise<Message[]> {
  const moreQuery = query(
    ref(db, `messages/${convId}`),
    orderByKey(),
    endBefore(oldestKey),
    limitToLast(count)
  );

  const snapshot = await get(moreQuery);
  if (!snapshot.exists()) return [];

  const olderMessages: Message[] = [];
  snapshot.forEach((child) => {
    const data = child.val() as Record<string, unknown> | null;
    const id = child.key ?? '';
    if (data) {
      olderMessages.push({
        id,
        convId,
        senderId: typeof data.senderId === 'string' ? data.senderId : '',
        senderName: typeof data.senderName === 'string' ? data.senderName : 'Người dùng',
        type: (data.type as MessageType) || 'text',
        text: typeof data.text === 'string' ? data.text : undefined,
        imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : undefined,
        latitude: typeof data.latitude === 'number' ? data.latitude : undefined,
        longitude: typeof data.longitude === 'number' ? data.longitude : undefined,
        createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
        recalled: Boolean(data.recalled),
        reactions: (data.reactions as MessageReaction) || undefined,
        replyTo: data.replyTo as { id: string; senderName: string; text: string } | undefined,
      });
    }
  });

  olderMessages.sort((a, b) => a.createdAt - b.createdAt);
  return olderMessages;
}

// Gửi tin nhắn đa năng (Text, Image, Location) bằng atomic multi-path update
export async function sendMessage(params: {
  convId: string;
  convType: 'direct' | 'group';
  convName: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  text?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  members: Record<string, boolean>; // Danh sách tất cả thành viên
  replyTo?: { id: string; senderName: string; text: string };
}): Promise<string> {
  const {
    convId,
    convType,
    convName,
    senderId,
    senderName,
    type,
    text,
    imageUrl,
    latitude,
    longitude,
    members,
    replyTo,
  } = params;

  const newMsgRef = push(ref(db, `messages/${convId}`));
  const msgId = newMsgRef.key;
  if (!msgId) throw new Error('Không thể tạo mã tin nhắn.');

  const nowTimestamp = serverTimestamp();

  // Xác định text tóm tắt hiển thị ở màn hình Home
  let lastMessageSummary = '';
  if (type === 'text') lastMessageSummary = text?.trim() || '';
  else if (type === 'image') lastMessageSummary = '📷 Hình ảnh';
  else if (type === 'location') lastMessageSummary = '📍 Vị trí';

  const updates: Record<string, unknown> = {};

  // 1. Thêm tin nhắn mới vào phòng chat
  updates[`messages/${convId}/${msgId}`] = {
    id: msgId,
    convId,
    senderId,
    senderName,
    type,
    text: text?.trim() || null,
    imageUrl: imageUrl || null,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    createdAt: nowTimestamp,
    recalled: false,
    replyTo: replyTo || null,
  };

  // Đảm bảo node conversations tồn tại nếu là direct chat lần đầu
  if (convType === 'direct') {
    updates[`conversations/${convId}/id`] = convId;
    updates[`conversations/${convId}/type`] = 'direct';
    updates[`conversations/${convId}/members`] = members;
  }

  // 2. Cập nhật userChats của TẤT CẢ thành viên trong 1 atomic update
  Object.keys(members).forEach((memberUid) => {
    const isSender = memberUid === senderId;
    updates[`userChats/${memberUid}/${convId}`] = {
      convId,
      type: convType,
      name: convType === 'direct' && isSender ? convName : (convType === 'direct' ? senderName : convName),
      lastMessage: lastMessageSummary,
      lastMessageType: type,
      lastSenderId: senderId,
      updatedAt: nowTimestamp,
      unread: isSender ? 0 : increment(1), // Người gửi unread=0, người nhận unread + 1
      members,
    };

    // 3. Tạo thông báo cho các thành viên khác
    if (!isSender) {
      updates[`notifications/${memberUid}/${msgId}`] = {
        id: msgId,
        type: 'new_message',
        convId,
        fromUid: senderId,
        fromName: senderName,
        text: convType === 'group'
          ? `${senderName} (${convName}): ${lastMessageSummary}`
          : `${senderName}: ${lastMessageSummary}`,
        createdAt: nowTimestamp,
        read: false,
      };
    }
  });

  // Tắt trạng thái đang gõ ngay khi gửi tin
  updates[`typing/${convId}/${senderId}`] = false;

  await update(ref(db), updates);
  return msgId;
}

// Thu hồi tin nhắn (chỉ áp dụng cho tin của chính mình)
export async function recallMessage(
  convId: string,
  msgId: string,
  senderId: string,
  members: Record<string, boolean>,
  isLastMessage: boolean = false
): Promise<void> {
  const updates: Record<string, unknown> = {};

  // 1. Đánh dấu recalled = true
  updates[`messages/${convId}/${msgId}/recalled`] = true;

  // 2. Nếu là tin cuối, cập nhật lại lastMessage ở màn hình Home của mọi thành viên
  if (isLastMessage) {
    const nowTimestamp = serverTimestamp();
    Object.keys(members).forEach((memberUid) => {
      updates[`userChats/${memberUid}/${convId}/lastMessage`] = 'Tin nhắn đã được thu hồi';
      updates[`userChats/${memberUid}/${convId}/updatedAt`] = nowTimestamp;
    });
  }

  await update(ref(db), updates);
}

// Thả / gỡ cảm xúc vào tin nhắn
export async function toggleReaction(
  convId: string,
  msgId: string,
  uid: string,
  emoji: string,
  messageSenderId: string,
  senderName: string
): Promise<void> {
  const reactionRef = ref(db, `messages/${convId}/${msgId}/reactions/${uid}`);
  const snap = await get(reactionRef);
  const currentReaction = snap.val() as string | null;

  const nowTimestamp = serverTimestamp();
  const updates: Record<string, unknown> = {};

  if (currentReaction === emoji) {
    // Nhấn lại cùng emoji thì xóa cảm xúc
    updates[`messages/${convId}/${msgId}/reactions/${uid}`] = null;
  } else {
    // Gán emoji mới
    updates[`messages/${convId}/${msgId}/reactions/${uid}`] = emoji;

    // Nếu người thả khác người gửi tin, tạo thông báo
    if (uid !== messageSenderId) {
      const notiId = `${msgId}_react_${uid}`;
      updates[`notifications/${messageSenderId}/${notiId}`] = {
        id: notiId,
        type: 'reaction',
        convId,
        fromUid: uid,
        fromName: senderName,
        text: `${senderName} đã thả ${emoji} vào tin nhắn của bạn`,
        createdAt: nowTimestamp,
        read: false,
      };
    }
  }

  await update(ref(db), updates);
}

// Cập nhật trạng thái đang soạn tin (typing) kèm onDisconnect tự hủy
export function setTypingStatus(
  convId: string,
  uid: string,
  isTyping: boolean
): void {
  const typingRef = ref(db, `typing/${convId}/${uid}`);
  update(ref(db, `typing/${convId}`), { [uid]: isTyping });

  if (isTyping) {
    // Tự tắt khi bị mất mạng hoặc tắt app đột ngột
    onDisconnect(typingRef).set(false);
  }
}

// Lắng nghe trạng thái đang soạn tin của những người khác trong phòng chat
export function subscribeTyping(
  convId: string,
  currentUid: string,
  callback: (typingUserNames: string[]) => void
): () => void {
  const typingRef = ref(db, `typing/${convId}`);

  const unsubscribe = onValue(typingRef, async (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const data = snapshot.val() as Record<string, boolean>;
    const typingUids = Object.keys(data).filter(
      (uid) => uid !== currentUid && data[uid] === true
    );

    callback(typingUids);
  });

  return unsubscribe;
}

// Đánh dấu đã xem cuộc trò chuyện
export async function markAsRead(convId: string, uid: string): Promise<void> {
  const updates: Record<string, unknown> = {};
  updates[`readStatus/${convId}/${uid}`] = serverTimestamp();
  updates[`userChats/${uid}/${convId}/unread`] = 0;

  try {
    await update(ref(db), updates);
  } catch (err) {
    // Bỏ qua lỗi nếu node chưa tồn tại
  }
}

// Lắng nghe thời điểm đã xem cuối cùng của các thành viên trong phòng chat
export function subscribeReadStatus(
  convId: string,
  callback: (readStatuses: Record<string, number>) => void
): () => void {
  const readRef = ref(db, `readStatus/${convId}`);

  const unsubscribe = onValue(readRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback({});
      return;
    }

    const data = snapshot.val() as Record<string, number>;
    callback(data || {});
  });

  return unsubscribe;
}
