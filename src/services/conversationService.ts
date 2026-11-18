import { ref, onValue } from 'firebase/database';
import { db } from './firebase';
import { Conversation, MessageType, ConversationType } from '../types/models';

// Lắng nghe danh sách tất cả cuộc hội thoại (1-1 và Nhóm) của người dùng hiện tại
export function subscribeConversations(
  myUid: string,
  callback: (conversations: Conversation[]) => void
): () => void {
  const userChatsRef = ref(db, `userChats/${myUid}`);

  const unsubscribe = onValue(userChatsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const conversations: Conversation[] = [];
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val() as Record<string, unknown> | null;
      const convId = childSnapshot.key ?? '';

      if (data && convId) {
        conversations.push({
          convId,
          type: (data.type as ConversationType) || 'direct',
          name: typeof data.name === 'string' ? data.name : 'Cuộc trò chuyện',
          avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : undefined,
          lastMessage: typeof data.lastMessage === 'string' ? data.lastMessage : '',
          lastMessageType: (data.lastMessageType as MessageType) || 'text',
          lastSenderId: typeof data.lastSenderId === 'string' ? data.lastSenderId : '',
          updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : (typeof data.lastTime === 'number' ? data.lastTime : 0),
          unread: typeof data.unread === 'number' ? data.unread : 0,
          members: (data.members as Record<string, boolean>) || undefined,
        });
      }
    });

    // Sắp xếp cuộc trò chuyện có tương tác mới nhất lên đầu
    conversations.sort((a, b) => b.updatedAt - a.updatedAt);
    callback(conversations);
  });

  return unsubscribe;
}
