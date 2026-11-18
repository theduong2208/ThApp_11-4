import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import { ConversationType } from './models';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Contacts: undefined;
  Notifications: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Chat: {
    convId: string;
    name: string;
    type: ConversationType;
    peerId?: string; // Dành riêng cho 1-1 để theo dõi online/lastSeen
  };
  CreateGroup: undefined;
  GroupSettings: { convId: string };
  ImageViewer: { imageUrl: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

// Kiểu Props cho màn hình Auth
export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;

// Kiểu Props cho màn hình Tab
export type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type ContactsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Contacts'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type NotificationsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Notifications'>,
  NativeStackScreenProps<RootStackParamList>
>;

export type SettingsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Settings'>,
  NativeStackScreenProps<RootStackParamList>
>;

// Kiểu Props cho các màn hình Stack
export type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;
export type CreateGroupScreenProps = NativeStackScreenProps<RootStackParamList, 'CreateGroup'>;
export type GroupSettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'GroupSettings'>;
export type ImageViewerScreenProps = NativeStackScreenProps<RootStackParamList, 'ImageViewer'>;
