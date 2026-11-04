import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { ChatScreenProps } from '../types/navigation';
import { Message } from '../types/models';
import {
  getChatId,
  subscribeMessages,
  sendTextMessage,
  sendLocationMessage,
  markAsRead,
} from '../services/chatService';
import { subscribeUserStatus } from '../services/userService';
import { getCurrentUser } from '../services/authService';
import { MessageBubble } from '../components/MessageBubble';
import { LocationBubble } from '../components/LocationBubble';
import { OnlineDot } from '../components/OnlineDot';
import { Avatar } from '../components/Avatar';
import { useLocationPermission } from '../hooks/useLocationPermission';

export const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { peerId, peerName } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [peerStatus, setPeerStatus] = useState<{ online: boolean; lastSeen: number }>({
    online: false,
    lastSeen: 0,
  });

  const flatListRef = useRef<FlatList<Message>>(null);
  const currentUser = getCurrentUser();
  const currentUid = currentUser?.uid ?? '';
  const currentName = currentUser?.displayName ?? 'Tôi';

  const chatId = getChatId(currentUid, peerId);
  const { getCurrentLocation } = useLocationPermission();

  // Đánh dấu đã đọc khi vào màn hình
  useEffect(() => {
    if (currentUid && peerId) {
      markAsRead(currentUid, peerId);
    }
  }, [currentUid, peerId]);

  // Lắng nghe trạng thái Online/Offline của người đối diện
  useEffect(() => {
    const unsubStatus = subscribeUserStatus(peerId, (status) => {
      setPeerStatus(status);
    });

    return () => {
      unsubStatus();
    };
  }, [peerId]);

  // Lắng nghe tin nhắn thời gian thực
  useEffect(() => {
    const unsubMessages = subscribeMessages(chatId, (newMsgs) => {
      setMessages(newMsgs);
      // Tự động đánh dấu đã đọc khi có tin mới trong lúc người dùng đang mở màn hình chat
      if (currentUid && peerId) {
        markAsRead(currentUid, peerId);
      }
    });

    return () => {
      unsubMessages();
    };
  }, [chatId, currentUid, peerId]);

  // Gửi tin nhắn văn bản
  const handleSendText = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || sending) return;

    setInputText('');
    setSending(true);
    try {
      await sendTextMessage(
        currentUid,
        currentName,
        peerId,
        peerName,
        trimmed
      );
    } catch (error) {
      console.warn('Lỗi gửi tin nhắn:', error);
    } finally {
      setSending(false);
    }
  };

  // Gửi vị trí GPS hiện tại
  const handleSendLocation = async () => {
    if (sending) return;
    setSending(true);
    try {
      const coords = await getCurrentLocation();
      if (coords) {
        await sendLocationMessage(
          currentUid,
          currentName,
          peerId,
          peerName,
          coords.latitude,
          coords.longitude
        );
      }
    } catch (error) {
      console.warn('Lỗi gửi vị trí:', error);
    } finally {
      setSending(false);
    }
  };

  const renderMessageItem: ListRenderItem<Message> = useCallback(
    ({ item }) => {
      const isMe = item.senderId === currentUid;
      if (item.type === 'location') {
        return <LocationBubble message={item} isMe={isMe} />;
      }
      return <MessageBubble message={item} isMe={isMe} />;
    },
    [currentUid]
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header tùy chỉnh hiển thị tên và trạng thái realtime */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerAvatar}>
          <Avatar name={peerName} size={38} />
          <View style={styles.headerDot}>
            <OnlineDot online={peerStatus.online} size={10} />
          </View>
        </View>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerName} numberOfLines={1}>
            {peerName}
          </Text>
          <Text
            style={[
              styles.headerStatus,
              peerStatus.online ? styles.statusOnline : styles.statusOffline,
            ]}
          >
            {peerStatus.online ? 'Đang hoạt động' : 'Ngoại tuyến'}
          </Text>
        </View>
      </View>

      {/* Danh sách tin nhắn */}
      <FlatList<Message>
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👋</Text>
            <Text style={styles.emptyText}>
              Hãy bắt đầu cuộc trò chuyện với {peerName}!
            </Text>
          </View>
        }
      />

      {/* Thanh nhập liệu & gửi vị trí */}
      <View style={styles.inputBar}>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleSendLocation}
          disabled={sending}
          activeOpacity={0.7}
        >
          <Text style={styles.locationIcon}>📍</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#94A3B8"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || sending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSendText}
          disabled={!inputText.trim() || sending}
          activeOpacity={0.8}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.sendButtonText}>Gửi</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
  },
  backButtonText: {
    fontSize: 32,
    color: '#0284C7',
    lineHeight: 32,
  },
  headerAvatar: {
    position: 'relative',
    marginRight: 10,
  },
  headerDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerStatus: {
    fontSize: 12,
    marginTop: 1,
  },
  statusOnline: {
    color: '#10B981',
    fontWeight: '500',
  },
  statusOffline: {
    color: '#94A3B8',
  },
  messageList: {
    paddingVertical: 12,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  locationButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 20,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
    color: '#0F172A',
    marginHorizontal: 8,
  },
  sendButton: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

