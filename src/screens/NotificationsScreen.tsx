import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { NotificationsScreenProps } from '../types/navigation';
import { NotificationItem } from '../types/models';
import {
  subscribeNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notificationService';
import { getCurrentUser } from '../services/authService';
import { formatConversationTime } from '../utils/formatTime';

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  navigation,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = getCurrentUser();
  const currentUid = currentUser?.uid ?? '';

  useEffect(() => {
    if (!currentUid) {
      setLoading(false);
      return;
    }

    // Lắng nghe thông báo tin nhắn thời gian thực từ Firebase
    const unsubscribe = subscribeNotifications(currentUid, (items) => {
      setNotifications(items);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUid]);

  // Đánh dấu 1 thông báo là đã đọc và chuyển đến cuộc trò chuyện tương ứng
  const handlePressNotification = (item: NotificationItem) => {
    if (currentUid && !item.read) {
      markNotificationAsRead(currentUid, item.id);
    }

    if (item.convId) {
      navigation.navigate('Chat', {
        convId: item.convId,
        name: item.fromName || 'Cuộc trò chuyện',
        type: item.type === 'added_to_group' ? 'group' : 'direct',
        peerId: item.type === 'added_to_group' ? undefined : item.fromUid,
      });
    }
  };

  // Đánh dấu tất cả thông báo là đã đọc
  const handleMarkAllAsRead = () => {
    if (currentUid && notifications.length > 0) {
      markAllNotificationsAsRead(currentUid, notifications);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string, read: boolean) => {
    switch (type) {
      case 'reaction':
        return '❤️';
      case 'added_to_group':
        return '👥';
      case 'new_message':
      default:
        return read ? '✉️' : '💬';
    }
  };

  const renderItem: ListRenderItem<NotificationItem> = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notiItem,
        !item.read ? styles.unreadItem : styles.readItem,
      ]}
      activeOpacity={0.7}
      onPress={() => handlePressNotification(item)}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.notiIcon}>
          {getNotificationIcon(item.type, item.read)}
        </Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.contentText,
              !item.read && styles.unreadContentText,
            ]}
          >
            {item.text}
          </Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>

        <Text style={styles.timeText}>
          {formatConversationTime(item.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Thông Báo</Text>
          <Text style={styles.subtitle}>
            {unreadCount > 0
              ? `Bạn có ${unreadCount} thông báo chưa đọc`
              : 'Tất cả thông báo đã đọc'}
          </Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.markAllText}>Đọc tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Danh sách thông báo Realtime */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      ) : (
        <FlatList<NotificationItem>
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={
            notifications.length === 0 ? styles.emptyList : styles.listContent
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyTitle}>Chưa có thông báo nào</Text>
              <Text style={styles.emptySubtitle}>
                Bạn sẽ nhận được thông báo khi có người nhắn tin hoặc chia sẻ vị trí!
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
  },
  markAllText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  notiItem: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  unreadItem: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderLeftColor: '#0284C7',
  },
  readItem: {
    backgroundColor: '#F1F5F9',
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  notiIcon: {
    fontSize: 24,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  contentText: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
  },
  unreadContentText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0284C7',
    marginLeft: 8,
  },
  timeText: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
