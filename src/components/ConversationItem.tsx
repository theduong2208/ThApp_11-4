import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Conversation } from '../types/models';
import { Avatar } from './Avatar';
import { formatConversationTime } from '../utils/formatTime';

interface ConversationItemProps {
  conversation: Conversation;
  onPress: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  onPress,
}) => {
  const {
    name,
    avatarUrl,
    type,
    lastMessage,
    lastMessageType,
    updatedAt,
    unread,
  } = conversation;

  let displayMessage = lastMessage;
  if (lastMessageType === 'image') {
    displayMessage = '📷 Hình ảnh';
  } else if (lastMessageType === 'location') {
    displayMessage = '📍 Vị trí';
  }

  const isGroup = type === 'group';

  return (
    <TouchableOpacity
      style={styles.itemContainer}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.avatarWrapper}>
        <Avatar name={name} avatarUrl={avatarUrl} size={50} />
        {isGroup && (
          <View style={styles.groupBadge}>
            <Text style={styles.groupBadgeText}>👥</Text>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
          <Text style={styles.nameText} numberOfLines={1}>
            {name}
          </Text>
          <Text
            style={[
              styles.timeText,
              unread > 0 && styles.unreadTimeText,
            ]}
          >
            {formatConversationTime(updatedAt)}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text
            style={[
              styles.messageText,
              unread > 0 && styles.unreadMessageText,
            ]}
            numberOfLines={1}
          >
            {displayMessage || 'Bắt đầu cuộc trò chuyện'}
          </Text>

          {unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unread > 99 ? '99+' : unread}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  avatarWrapper: {
    position: 'relative',
  },
  groupBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#0284C7',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  groupBadgeText: {
    fontSize: 9,
  },
  contentContainer: {
    flex: 1,
    marginLeft: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  unreadTimeText: {
    color: '#0284C7',
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
    marginRight: 8,
  },
  unreadMessageText: {
    color: '#0F172A',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#EF4444',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
