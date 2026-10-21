export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  phone?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  time: string;
  isRead: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
}

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  ChatDetail: {
    id: string;
    name: string;
    avatar: string;
    isOnline?: boolean;
  };
};

export type MainTabParamList = {
  HomeTab: undefined;
  ContactsTab: undefined;
  NotificationsTab: undefined;
  SettingsTab: undefined;
};
