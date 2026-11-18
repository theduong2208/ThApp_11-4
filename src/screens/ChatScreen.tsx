import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Alert,
  PermissionsAndroid,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { ChatScreenProps } from '../types/navigation';
import { Message, MessageType } from '../types/models';
import {
  subscribeMessagesPaged,
  loadMoreMessages,
  sendMessage,
  recallMessage,
  toggleReaction,
  setTypingStatus,
  subscribeTyping,
  markAsRead,
  subscribeReadStatus,
} from '../services/chatService';
import { subscribeUserStatus, subscribeUsers } from '../services/userService';
import { subscribeConversation } from '../services/groupService';
import { getCurrentUser } from '../services/authService';
import { uploadImageToCloudinary } from '../services/uploadService';
import { formatLastSeen } from '../utils/formatTime';
import { MessageBubble } from '../components/MessageBubble';
import { LocationBubble } from '../components/LocationBubble';
import { OnlineDot } from '../components/OnlineDot';
import { Avatar } from '../components/Avatar';
import { MessageActionModal } from '../components/MessageActionModal';
import { useLocationPermission } from '../hooks/useLocationPermission';

export const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { convId, name: initialName, type: convType, peerId } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Nhóm hoặc 1-1
  const [convName, setConvName] = useState(initialName);
  const [members, setMembers] = useState<Record<string, boolean>>({});

  // 1-1 Peer status
  const [peerStatus, setPeerStatus] = useState<{ online: boolean; lastSeen: number }>({
    online: false,
    lastSeen: 0,
  });

  // Nhóm: số thành viên online
  const [onlineMembersCount, setOnlineMembersCount] = useState(0);

  // Typing
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read status
  const [readStatuses, setReadStatuses] = useState<Record<string, number>>({});

  // Message Action Menu & Reply
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; senderName: string; text: string } | null>(null);

  // Tìm kiếm tin nhắn trong phòng chat (Phần C)
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const flatListRef = useRef<FlatList<Message>>(null);
  const currentUser = getCurrentUser();
  const currentUid = currentUser?.uid ?? '';
  const currentName = currentUser?.displayName || 'Tôi';

  const { getCurrentLocation } = useLocationPermission();

  // Khởi tạo danh sách thành viên ban đầu
  useEffect(() => {
    if (convType === 'direct' && peerId) {
      setMembers({ [currentUid]: true, [peerId]: true });
    }
  }, [convType, peerId, currentUid]);

  // Lắng nghe thông tin nhóm (nếu là group)
  useEffect(() => {
    if (convType === 'group') {
      const unsubGroup = subscribeConversation(convId, (conv) => {
        if (conv) {
          setConvName(conv.name);
          setMembers(conv.members || {});
        }
      });
      return () => unsubGroup();
    }
  }, [convId, convType]);

  // Đánh dấu đã xem khi vào phòng chat
  useEffect(() => {
    if (currentUid && convId) {
      markAsRead(convId, currentUid);
    }
  }, [convId, currentUid]);

  // Lắng nghe trạng thái Online/Offline
  useEffect(() => {
    if (convType === 'direct' && peerId) {
      const unsubStatus = subscribeUserStatus(peerId, (status) => {
        setPeerStatus(status);
      });
      return () => unsubStatus();
    } else if (convType === 'group') {
      // Lắng nghe toàn bộ users để đếm số thành viên online trong nhóm
      const unsubUsers = subscribeUsers(currentUid, (allUsers) => {
        const onlineCount = allUsers.filter(
          (u) => members[u.uid] && u.online
        ).length;
        // Cộng thêm bản thân nếu đang online
        setOnlineMembersCount(onlineCount + 1);
      });
      return () => unsubUsers();
    }
  }, [convType, peerId, convId, members, currentUid]);

  // Lắng nghe trạng thái soạn tin (typing)
  useEffect(() => {
    const unsubTyping = subscribeTyping(convId, currentUid, (typingUids) => {
      setTypingUsers(typingUids);
    });

    return () => {
      // Khi rời màn hình chat, tự động hủy typing
      setTypingStatus(convId, currentUid, false);
      unsubTyping();
    };
  }, [convId, currentUid]);

  // Lắng nghe thời điểm đọc tin của các thành viên
  useEffect(() => {
    const unsubRead = subscribeReadStatus(convId, (statuses) => {
      setReadStatuses(statuses);
    });

    return () => unsubRead();
  }, [convId]);

  // Lắng nghe tin nhắn theo phân trang (lần đầu 20 tin mới nhất)
  useEffect(() => {
    const unsubMessages = subscribeMessagesPaged(convId, 20, (pagedMsgs) => {
      setMessages((prev) => {
        // Giữ lại các tin nhắn cũ hơn đã load thêm nếu có
        const pagedMap = new Map(pagedMsgs.map((m) => [m.id, m]));
        const combined = prev.map((m) => pagedMap.get(m.id) || m);
        pagedMsgs.forEach((m) => {
          if (!combined.some((item) => item.id === m.id)) {
            combined.push(m);
          }
        });
        combined.sort((a, b) => a.createdAt - b.createdAt);
        return combined;
      });

      // Tự động đánh dấu đã xem khi có tin mới tới trong lúc đang mở màn hình chat
      if (currentUid && convId) {
        markAsRead(convId, currentUid);
      }
    });

    return () => unsubMessages();
  }, [convId, currentUid]);

  // Kéo lên trên để tải thêm 20 tin cũ hơn (không bị nhảy)
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || messages.length === 0) return;

    setLoadingMore(true);
    const oldestMsg = messages[0];
    try {
      const older = await loadMoreMessages(convId, oldestMsg.id, 20);
      if (older.length < 20) {
        setHasMore(false);
      }
      if (older.length > 0) {
        setMessages((prev) => [...older, ...prev]);
      }
    } catch (err) {
      console.warn('Lỗi tải thêm tin nhắn:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Xử lý đang gõ văn bản & Debounce 3 giây tắt typing
  const handleTextChange = (text: string) => {
    setInputText(text);

    if (text.trim().length > 0) {
      setTypingStatus(convId, currentUid, true);

      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      // Tự động tắt sau 3 giây không gõ
      typingTimerRef.current = setTimeout(() => {
        setTypingStatus(convId, currentUid, false);
      }, 3000);
    } else {
      setTypingStatus(convId, currentUid, false);
    }
  };

  // Gửi tin nhắn văn bản
  const handleSendText = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || sending) return;

    setInputText('');
    setTypingStatus(convId, currentUid, false);
    const replyData = replyingTo;
    setReplyingTo(null);

    setSending(true);
    try {
      await sendMessage({
        convId,
        convType,
        convName,
        senderId: currentUid,
        senderName: currentName,
        type: 'text',
        text: trimmed,
        members,
        replyTo: replyData || undefined,
      });
    } catch (error) {
      console.warn('Lỗi gửi tin nhắn văn bản:', error);
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn.');
    } finally {
      setSending(false);
    }
  };

  // Gửi vị trí GPS
  const handleSendLocation = async () => {
    if (sending) return;
    setSending(true);
    try {
      const coords = await getCurrentLocation();
      if (coords) {
        await sendMessage({
          convId,
          convType,
          convName,
          senderId: currentUid,
          senderName: currentName,
          type: 'location',
          latitude: coords.latitude,
          longitude: coords.longitude,
          members,
        });
      }
    } catch (error) {
      console.warn('Lỗi gửi vị trí:', error);
    } finally {
      setSending(false);
    }
  };

  // Xin quyền Camera (Android)
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Quyền sử dụng máy ảnh',
            message: 'Ứng dụng cần quyền Camera để chụp ảnh gửi trong cuộc trò chuyện.',
            buttonPositive: 'Đồng ý',
            buttonNegative: 'Từ chối',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true;
  };

  // Gửi ảnh chụp hoặc chọn từ thư viện
  const handlePickImage = (source: 'camera' | 'library') => {
    const options = {
      mediaType: 'photo' as const,
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.8 as const,
    };

    const handleResponse = async (response: any) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Lỗi', response.errorMessage || 'Không thể chọn ảnh.');
        return;
      }

      const asset = response.assets?.[0];
      if (!asset?.uri) return;

      // Tạo bong bóng tạm thời với vòng loading
      const tempId = `temp_${Date.now()}`;
      const tempMessage: Message = {
        id: tempId,
        convId,
        senderId: currentUid,
        senderName: currentName,
        type: 'image',
        imageUrl: asset.uri,
        createdAt: Date.now(),
        uploading: true,
      };

      setMessages((prev) => [...prev, tempMessage]);

      try {
        // Tải lên Cloudinary bằng Unsigned Upload Preset
        const uploadRes = await uploadImageToCloudinary(asset.uri, asset.fileName);

        // Ghi vào Realtime Database
        await sendMessage({
          convId,
          convType,
          convName,
          senderId: currentUid,
          senderName: currentName,
          type: 'image',
          imageUrl: uploadRes.url,
          members,
        });

        // Xóa tin tạm sau khi đã ghi thành công
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } catch (error) {
        console.warn('Lỗi upload ảnh:', error);
        // Đánh dấu bong bóng tạm bị lỗi để có nút "Thử lại"
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...m, uploading: false, uploadError: true } : m
          )
        );
      }
    };

    if (source === 'camera') {
      requestCameraPermission().then((hasPermission) => {
        if (!hasPermission) {
          Alert.alert('Từ chối quyền', 'Bạn chưa cấp quyền máy ảnh để chụp hình.');
          return;
        }
        launchCamera(options, handleResponse);
      });
    } else {
      launchImageLibrary(options, handleResponse);
    }
  };

  // Thử lại upload ảnh
  const handleRetryUpload = async (tempMsg: Message) => {
    if (!tempMsg.imageUrl) return;

    setMessages((prev) =>
      prev.map((m) =>
        m.id === tempMsg.id ? { ...m, uploading: true, uploadError: false } : m
      )
    );

    try {
      const uploadRes = await uploadImageToCloudinary(tempMsg.imageUrl);
      await sendMessage({
        convId,
        convType,
        convName,
        senderId: currentUid,
        senderName: currentName,
        type: 'image',
        imageUrl: uploadRes.url,
        members,
      });
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempMsg.id ? { ...m, uploading: false, uploadError: true } : m
        )
      );
      Alert.alert('Lỗi', 'Tải ảnh lên thất bại. Vui lòng kiểm tra kết nối mạng.');
    }
  };

  // Nhấn nút ảnh 📷 mở ActionSheet chọn chụp hoặc thư viện
  const handleImageButtonPress = () => {
    Alert.alert('Gửi hình ảnh', 'Chọn phương thức lấy ảnh:', [
      { text: 'Chụp ảnh mới 📷', onPress: () => handlePickImage('camera') },
      { text: 'Chọn từ thư viện 🖼️', onPress: () => handlePickImage('library') },
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  // Thu hồi tin nhắn
  const handleRecallMessage = async () => {
    if (!selectedMessage) return;

    const isLast = messages[messages.length - 1]?.id === selectedMessage.id;
    try {
      await recallMessage(convId, selectedMessage.id, currentUid, members, isLast);
    } catch {
      Alert.alert('Lỗi', 'Không thể thu hồi tin nhắn.');
    }
  };

  // Thả cảm xúc
  const handleReaction = async (emoji: string) => {
    if (!selectedMessage) return;
    try {
      await toggleReaction(
        convId,
        selectedMessage.id,
        currentUid,
        emoji,
        selectedMessage.senderId,
        currentName
      );
    } catch {
      Alert.alert('Lỗi', 'Không thể thả cảm xúc.');
    }
  };

  // Cuộn tới tin nhắn được trả lời
  const handleScrollToRepliedMessage = (replyMsgId: string) => {
    const index = messages.findIndex((m) => m.id === replyMsgId);
    if (index >= 0) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
    } else {
      Alert.alert('Thông báo', 'Tin nhắn gốc nằm ở trang cũ hơn.');
    }
  };

  // Lọc tin nhắn khi tìm kiếm (Phần C)
  const displayedMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const query = searchQuery.toLowerCase().trim();
    return messages.filter((m) => m.text?.toLowerCase().includes(query));
  }, [messages, searchQuery]);

  // Tìm tin nhắn cuối cùng gửi bởi chính mình
  const lastMyMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].senderId === currentUid && !messages[i].recalled) {
        return messages[i];
      }
    }
    return null;
  }, [messages, currentUid]);

  // Thời điểm xem của peer (1-1) hoặc thời điểm xem cao nhất (nhóm)
  const peerReadTimestamp = useMemo(() => {
    if (convType === 'direct' && peerId) {
      return readStatuses[peerId] || 0;
    }
    const otherTimestamps = Object.entries(readStatuses)
      .filter(([uid]) => uid !== currentUid)
      .map(([, ts]) => ts);
    return otherTimestamps.length > 0 ? Math.max(...otherTimestamps) : 0;
  }, [convType, peerId, readStatuses, currentUid]);

  // Tiêu đề phụ (Sub-header)
  const subHeaderText = useMemo(() => {
    // 1. Nếu có người đang soạn tin
    if (typingUsers.length > 0) {
      return 'đang soạn tin...';
    }
    // 2. Nhóm: hiển thị số thành viên online
    if (convType === 'group') {
      return `${onlineMembersCount} thành viên đang online`;
    }
    // 3. 1-1: nếu online thì 'Đang hoạt động', nếu offline thì 'Hoạt động X phút trước'
    if (peerStatus.online) {
      return 'Đang hoạt động';
    }
    return formatLastSeen(peerStatus.lastSeen);
  }, [typingUsers, convType, onlineMembersCount, peerStatus]);

  const renderMessageItem: ListRenderItem<Message> = useCallback(
    ({ item }) => {
      const isMe = item.senderId === currentUid;
      const isLastFromMe = item.id === lastMyMessage?.id;

      if (item.type === 'location') {
        return <LocationBubble message={item} isMe={isMe} />;
      }

      return (
        <MessageBubble
          message={item}
          isMe={isMe}
          isGroup={convType === 'group'}
          isLastMessageFromMe={isLastFromMe}
          readTimestamp={peerReadTimestamp}
          onLongPress={(msg) => {
            setSelectedMessage(msg);
            setActionModalVisible(true);
          }}
          onImagePress={(imgUrl) => {
            navigation.navigate('ImageViewer', { imageUrl: imgUrl });
          }}
          onReplyPress={handleScrollToRepliedMessage}
          onRetryUpload={handleRetryUpload}
        />
      );
    },
    [currentUid, convType, lastMyMessage, peerReadTimestamp, navigation]
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerInfoTouch}
          activeOpacity={convType === 'group' ? 0.7 : 1}
          onPress={() => {
            if (convType === 'group') {
              navigation.navigate('GroupSettings', { convId });
            }
          }}
        >
          <View style={styles.headerAvatarWrapper}>
            <Avatar name={convName} size={38} />
            {convType === 'direct' && (
              <View style={styles.headerDot}>
                <OnlineDot online={peerStatus.online} size={10} />
              </View>
            )}
          </View>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerName} numberOfLines={1}>
              {convName}
            </Text>
            <Text
              style={[
                styles.headerStatus,
                (typingUsers.length > 0 || peerStatus.online) && styles.statusActive,
              ]}
              numberOfLines={1}
            >
              {subHeaderText}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Nút tìm kiếm & Cài đặt nhóm */}
        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setSearchVisible(!searchVisible)}
          >
            <Text style={styles.headerIconText}>🔍</Text>
          </TouchableOpacity>

          {convType === 'group' && (
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate('GroupSettings', { convId })}
            >
              <Text style={styles.headerIconText}>ℹ️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Thanh tìm kiếm tin nhắn (Phần C) */}
      {searchVisible && (
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm trong cuộc trò chuyện..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Danh sách tin nhắn */}
      <FlatList<Message>
        ref={flatListRef}
        data={displayedMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => {
          if (!searchQuery && messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }}
        ListHeaderComponent={
          hasMore ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <ActivityIndicator size="small" color="#0284C7" />
              ) : (
                <Text style={styles.loadMoreText}>↑ Tải thêm tin nhắn cũ</Text>
              )}
            </TouchableOpacity>
          ) : undefined
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👋</Text>
            <Text style={styles.emptyText}>
              Bắt đầu trò chuyện trong {convName}!
            </Text>
          </View>
        }
      />

      {/* Thanh hiển thị tin đang được trả lời (Reply Preview) */}
      {replyingTo && (
        <View style={styles.replyPreviewBar}>
          <View style={styles.replyIndicator} />
          <View style={styles.replyPreviewContent}>
            <Text style={styles.replyPreviewSender} numberOfLines={1}>
              Đang trả lời {replyingTo.senderName}:
            </Text>
            <Text style={styles.replyPreviewText} numberOfLines={1}>
              {replyingTo.text}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.cancelReplyBtn}
            onPress={() => setReplyingTo(null)}
          >
            <Text style={styles.cancelReplyText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Thanh nhập liệu (Gửi text, gửi ảnh 📷, gửi vị trí 📍) */}
      <View style={styles.inputBar}>
        {/* Nút gửi ảnh */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleImageButtonPress}
          disabled={sending}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>📷</Text>
        </TouchableOpacity>

        {/* Nút gửi vị trí */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleSendLocation}
          disabled={sending}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>📍</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#94A3B8"
          value={inputText}
          onChangeText={handleTextChange}
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

      {/* Menu hành động khi nhấn giữ tin nhắn */}
      <MessageActionModal
        visible={actionModalVisible}
        message={selectedMessage}
        isMe={selectedMessage?.senderId === currentUid}
        onClose={() => setActionModalVisible(false)}
        onReaction={(emoji) => {
          setActionModalVisible(false);
          handleReaction(emoji);
        }}
        onRecall={() => {
          setActionModalVisible(false);
          handleRecallMessage();
        }}
        onReply={() => {
          if (selectedMessage) {
            setReplyingTo({
              id: selectedMessage.id,
              senderName: selectedMessage.senderName,
              text: selectedMessage.text || (selectedMessage.type === 'image' ? '📷 Hình ảnh' : '📍 Vị trí'),
            });
          }
          setActionModalVisible(false);
        }}
      />
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
  headerInfoTouch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatarWrapper: {
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
    color: '#64748B',
    marginTop: 1,
  },
  statusActive: {
    color: '#0284C7',
    fontWeight: '600',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    padding: 6,
    marginLeft: 4,
  },
  headerIconText: {
    fontSize: 18,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    color: '#0F172A',
  },
  clearSearchText: {
    fontSize: 16,
    color: '#64748B',
    paddingHorizontal: 8,
  },
  messageList: {
    paddingVertical: 12,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  loadMoreButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    marginBottom: 8,
  },
  loadMoreText: {
    fontSize: 12,
    color: '#0284C7',
    fontWeight: '600',
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
  replyPreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  replyIndicator: {
    width: 3,
    height: '100%',
    backgroundColor: '#0284C7',
    borderRadius: 2,
    marginRight: 8,
  },
  replyPreviewContent: {
    flex: 1,
  },
  replyPreviewSender: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  replyPreviewText: {
    fontSize: 12,
    color: '#64748B',
  },
  cancelReplyBtn: {
    padding: 6,
  },
  cancelReplyText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '700',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionBtn: {
    padding: 6,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 22,
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
    marginHorizontal: 6,
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
