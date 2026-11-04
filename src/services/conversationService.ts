import { ref, onValue } from 'firebase/database';
import { db } from './firebase';
import { Conversation, MessageType } from '../types/models';

// Lắng nghe danh sách cuộc trò chuyện của người dùng hiện tại
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
      const peerId = childSnapshot.key ?? '';

      if (data && peerId) {
        conversations.push({
          peerId,
          peerName: typeof data.peerName === 'string' ? data.peerName : 'Người dùng',
          lastMessage: typeof data.lastMessage === 'string' ? data.lastMessage : '',
          lastMessageType: (data.lastMessageType as MessageType) || 'text',
          lastTime: typeof data.lastTime === 'number' ? data.lastTime : 0,
          unread: typeof data.unread === 'number' ? data.unread : 0,
        });
      }
    });

    // Sắp xếp cuộc trò chuyện có tin nhắn mới nhất lên đầu
    conversations.sort((a, b) => b.lastTime - a.lastTime);
    callback(conversations);
  });

  return unsubscribe;
}

