export interface AppUser {
  uid: string;
  name: string;
  email: string;
  avatarUrl?: string;
  online: boolean;
  lastSeen: number;
}

export type ConversationType = 'direct' | 'group';

export interface ConversationMeta {
  id: string; // convId
  type: ConversationType;
  name: string;
  avatarUrl?: string;
  members: Record<string, boolean>; // { [uid]: true }
  createdBy: string;
  createdAt: number;
}

export type MessageType = 'text' | 'image' | 'location' | 'system';

export interface MessageReaction {
  [uid: string]: string; // emoji e.g. '👍' | '❤️' | '😂' | '😮' | '😢'
}

export interface Message {
  id: string;
  convId: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  text?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  createdAt: number;
  recalled?: boolean; // Đã thu hồi
  reactions?: MessageReaction;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  uploading?: boolean; // Dành cho bong bóng tạm lúc đang upload ảnh
  uploadError?: boolean;
}

export interface Conversation {
  convId: string;
  type: ConversationType;
  name: string;
  avatarUrl?: string;
  lastMessage: string;
  lastMessageType: MessageType;
  lastSenderId: string;
  updatedAt: number;
  unread: number;
  members?: Record<string, boolean>;
}

export type NotificationType = 'new_message' | 'added_to_group' | 'reaction';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  convId: string;
  fromUid: string;
  fromName?: string;
  text: string;
  createdAt: number;
  read: boolean;
}
