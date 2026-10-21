import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { NotificationItem } from '../types';
import { initialNotifications } from '../data/mockData';

export const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  // Đánh dấu 1 thông báo là đã đọc
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
  };

  // Đánh dấu tất cả thông báo là đã đọc
  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, isRead: true }))
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[
        styles.notiItem,
        !item.isRead ? styles.unreadItem : styles.readItem,
      ]}
      activeOpacity={0.7}
      onPress={() => handleMarkAsRead(item.id)}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.notiIcon}>{item.isRead ? '✉️' : '🔔'}</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.titleText,
              !item.isRead && styles.unreadTitleText,
            ]}
          >
            {item.title}
          </Text>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>

        <Text style={styles.bodyText}>{item.content}</Text>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Thông báo</Text>
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

      {/* Danh sách thông báo */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>Hiện chưa có thông báo mới nào</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  markAllButton: {
    backgroundColor: '#eff6ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  markAllText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 8,
  },
  notiItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  unreadItem: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  readItem: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notiIcon: {
    fontSize: 20,
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
    marginRight: 6,
  },
  unreadTitleText: {
    fontWeight: '700',
    color: '#0369a1',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0284c7',
  },
  bodyText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 6,
  },
  timeText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#94a3b8',
  },
});
