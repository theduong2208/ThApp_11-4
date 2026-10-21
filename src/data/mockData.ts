import { Conversation, Contact, NotificationItem, ChatMessage } from '../types';

export const initialConversations: Conversation[] = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    lastMessage: 'Chiều nay có đi đá bóng không bạn?',
    time: '10:30',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Trần Thị Mai',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    lastMessage: 'Mình đã gửi tài liệu qua email rồi nhé!',
    time: '09:15',
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: '3',
    name: 'Lê Hoàng Nam',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    lastMessage: 'Ok, mai gặp ở quán cà phê nhé.',
    time: 'Hôm qua',
    unreadCount: 1,
    isOnline: false,
  },
  {
    id: '4',
    name: 'Phạm Minh Tú',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    lastMessage: 'Cảm ơn bạn nhiều!',
    time: 'Thứ 2',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '5',
    name: 'Hoàng Thị Thảo',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    lastMessage: 'Dự án đã hoàn thành xong phần giao diện rồi đó.',
    time: 'Thứ 2',
    unreadCount: 3,
    isOnline: true,
  },
  {
    id: '6',
    name: 'Vũ Đức Thịnh',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    lastMessage: 'Gọi lại cho mình khi rảnh nhé.',
    time: '12/10',
    unreadCount: 0,
    isOnline: false,
  },
];

export const initialContacts: Contact[] = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    isOnline: true,
    phone: '0901 234 567',
  },
  {
    id: '2',
    name: 'Trần Thị Mai',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    isOnline: true,
    phone: '0912 345 678',
  },
  {
    id: '3',
    name: 'Lê Hoàng Nam',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    isOnline: false,
    phone: '0923 456 789',
  },
  {
    id: '4',
    name: 'Phạm Minh Tú',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    isOnline: false,
    phone: '0934 567 890',
  },
  {
    id: '5',
    name: 'Hoàng Thị Thảo',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    isOnline: true,
    phone: '0945 678 901',
  },
  {
    id: '6',
    name: 'Vũ Đức Thịnh',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    isOnline: false,
    phone: '0956 789 012',
  },
  {
    id: '7',
    name: 'Đỗ Hải Đăng',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    isOnline: true,
    phone: '0967 890 123',
  },
  {
    id: '8',
    name: 'Bùi Phương Linh',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    isOnline: true,
    phone: '0978 901 234',
  },
];

export const initialNotifications: NotificationItem[] = [
  {
    id: '1',
    title: 'Tin nhắn mới từ Nguyễn Văn An',
    content: 'Nguyễn Văn An đã gửi cho bạn một tin nhắn mới: "Chiều nay có đi đá bóng không bạn?"',
    time: '10:30 Hôm nay',
    isRead: false,
  },
  {
    id: '2',
    title: 'Lời mời kết bạn',
    content: 'Bùi Phương Linh đã gửi lời mời kết bạn với bạn.',
    time: '08:45 Hôm nay',
    isRead: false,
  },
  {
    id: '3',
    title: 'Thông báo hệ thống',
    content: 'Chào mừng bạn đến với ứng dụng Chat App! Hãy cập nhật hồ sơ để kết nối bạn bè.',
    time: 'Hôm qua',
    isRead: true,
  },
  {
    id: '4',
    title: 'Đăng nhập thành công',
    content: 'Tài khoản của bạn đã được đăng nhập từ một thiết bị di động mới.',
    time: '12/10/2026',
    isRead: true,
  },
];

export const sampleChatMessages: Record<string, ChatMessage[]> = {
  '1': [
    { id: 'm1', sender: 'other', text: 'Chào bạn, dạo này khỏe không?', time: '10:15' },
    { id: 'm2', sender: 'me', text: 'Chào An! Mình vẫn khỏe, công việc dạo này thế nào?', time: '10:18' },
    { id: 'm3', sender: 'other', text: 'Cũng bình thường à. Chiều nay có đi đá bóng không bạn?', time: '10:30' },
  ],
  default: [
    { id: 'm1', sender: 'other', text: 'Xin chào! Rất vui được kết nối.', time: '09:00' },
    { id: 'm2', sender: 'me', text: 'Chào bạn, chúc bạn một ngày tốt lành!', time: '09:05' },
  ],
};
