export interface AppUser {
  uid: string;
  name: string;
  email: string;
  online: boolean;
  lastSeen: number;
}

export type MessageType = 'text' | 'location';

export interface Message {
  id: string;
  senderId: string;
  type: MessageType;
  text?: string;
  latitude?: number;
  longitude?: number;
  createdAt: number;
}

export interface Conversation {
  peerId: string;
  peerName: string;
  lastMessage: string;
  lastMessageType: MessageType;
  lastTime: number;
  unread: number;
}

export interface NotificationItem {
  id: string;
  content: string;
  time: number;
  read: boolean;
}

