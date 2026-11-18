import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Message } from '../types/models';
import { formatMessageTime, formatReadTime } from '../utils/formatTime';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  isGroup?: boolean;
  isLastMessageFromMe?: boolean;
  readTimestamp?: number; // Thời điểm xem của người đối diện (hoặc gần nhất)
  onLongPress?: (msg: Message) => void;
  onImagePress?: (imageUrl: string) => void;
  onReplyPress?: (replyMsgId: string) => void;
  onRetryUpload?: (msg: Message) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMe,
  isGroup,
  isLastMessageFromMe,
  readTimestamp,
  onLongPress,
  onImagePress,
  onReplyPress,
  onRetryUpload,
}) => {
  // 1. Tin nhắn hệ thống (System Message)
  if (message.type === 'system') {
    return (
      <View style={styles.systemContainer}>
        <View style={styles.systemBadge}>
          <Text style={styles.systemText}>{message.text}</Text>
        </View>
      </View>
    );
  }

  // 2. Tính toán tổng hợp cảm xúc (Reactions)
  const reactionCounts: Record<string, number> = {};
  if (message.reactions) {
    Object.values(message.reactions).forEach((emoji) => {
      if (emoji) {
        reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1;
      }
    });
  }
  const reactionEntries = Object.entries(reactionCounts);

  // 3. Trạng thái đã xem / đã gửi cho tin cuối cùng của mình
  let deliveryStatusText = '';
  if (isMe && isLastMessageFromMe && !message.recalled) {
    if (readTimestamp && readTimestamp >= message.createdAt) {
      deliveryStatusText = formatReadTime(readTimestamp);
    } else {
      deliveryStatusText = 'Đã gửi';
    }
  }

  return (
    <View
      style={[
        styles.container,
        isMe ? styles.containerMe : styles.containerOther,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onLongPress={() => onLongPress && onLongPress(message)}
        delayLongPress={250}
        style={[
          styles.bubbleWrapper,
          isMe ? styles.wrapperMe : styles.wrapperOther,
        ]}
      >
        {/* Tên người gửi trong nhóm chat */}
        {isGroup && !isMe && !message.recalled && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}

        {/* Trích dẫn tin nhắn được trả lời (Reply/Quote) */}
        {message.replyTo && (
          <TouchableOpacity
            style={[
              styles.replyBox,
              isMe ? styles.replyBoxMe : styles.replyBoxOther,
            ]}
            activeOpacity={0.7}
            onPress={() => onReplyPress && onReplyPress(message.replyTo!.id)}
          >
            <View style={styles.replyBar} />
            <View style={styles.replyContent}>
              <Text style={styles.replySender} numberOfLines={1}>
                {message.replyTo.senderName}
              </Text>
              <Text style={styles.replyText} numberOfLines={1}>
                {message.replyTo.text}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Nội dung tin nhắn */}
        <View
          style={[
            styles.bubble,
            isMe ? styles.bubbleMe : styles.bubbleOther,
            message.recalled && styles.bubbleRecalled,
          ]}
        >
          {message.recalled ? (
            // Tin nhắn đã thu hồi
            <View style={styles.recalledRow}>
              <Text style={styles.recalledIcon}>🚫</Text>
              <Text style={styles.recalledText}>Tin nhắn đã được thu hồi</Text>
            </View>
          ) : message.type === 'image' ? (
            // Tin nhắn hình ảnh
            <View style={styles.imageContainer}>
              {message.imageUrl ? (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => onImagePress && onImagePress(message.imageUrl!)}
                >
                  <Image
                    source={{ uri: message.imageUrl }}
                    style={styles.messageImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ) : null}

              {/* Trạng thái đang tải lên */}
              {message.uploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.uploadingText}>Đang tải ảnh lên...</Text>
                </View>
              )}

              {/* Trạng thái tải lên lỗi */}
              {message.uploadError && (
                <TouchableOpacity
                  style={styles.retryOverlay}
                  onPress={() => onRetryUpload && onRetryUpload(message)}
                >
                  <Text style={styles.retryIcon}>⚠️</Text>
                  <Text style={styles.retryText}>Lỗi. Nhấn để thử lại</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            // Tin nhắn văn bản
            <Text
              style={[
                styles.messageText,
                isMe ? styles.textMe : styles.textOther,
              ]}
            >
              {message.text}
            </Text>
          )}

          {/* Thời gian gửi tin */}
          <Text
            style={[
              styles.timeText,
              isMe ? styles.timeMe : styles.timeOther,
              message.recalled && styles.timeRecalled,
            ]}
          >
            {formatMessageTime(message.createdAt)}
          </Text>
        </View>

        {/* Hiển thị biểu tượng cảm xúc (Reactions) dưới bong bóng */}
        {reactionEntries.length > 0 && !message.recalled && (
          <View
            style={[
              styles.reactionContainer,
              isMe ? styles.reactionMe : styles.reactionOther,
            ]}
          >
            {reactionEntries.map(([emoji, count]) => (
              <View key={emoji} style={styles.reactionBadge}>
                <Text style={styles.reactionEmoji}>{emoji}</Text>
                {count > 1 && (
                  <Text style={styles.reactionCount}>{count}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Trạng thái Đã gửi / Đã xem thời gian thực */}
        {deliveryStatusText !== '' && (
          <Text style={styles.deliveryStatusText}>{deliveryStatusText}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 12,
    flexDirection: 'row',
  },
  containerMe: {
    justifyContent: 'flex-end',
  },
  containerOther: {
    justifyContent: 'flex-start',
  },
  bubbleWrapper: {
    maxWidth: '78%',
  },
  wrapperMe: {
    alignItems: 'flex-end',
  },
  wrapperOther: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
    marginBottom: 2,
    marginLeft: 6,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 6,
    borderRadius: 18,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  bubbleMe: {
    backgroundColor: '#0284C7',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  bubbleRecalled: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  textMe: {
    color: '#FFFFFF',
  },
  textOther: {
    color: '#0F172A',
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeMe: {
    color: '#BAE6FD',
  },
  timeOther: {
    color: '#94A3B8',
  },
  timeRecalled: {
    color: '#94A3B8',
  },
  recalledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  recalledIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  recalledText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#64748B',
  },
  imageContainer: {
    width: 220,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  messageImage: {
    width: '100%',
    height: '100%',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  retryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  retryIcon: {
    fontSize: 24,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  replyBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 8,
    padding: 6,
    marginBottom: 4,
    maxWidth: '100%',
  },
  replyBoxMe: {
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
  },
  replyBoxOther: {
    backgroundColor: '#F1F5F9',
  },
  replyBar: {
    width: 3,
    backgroundColor: '#0284C7',
    borderRadius: 2,
    marginRight: 6,
  },
  replyContent: {
    flex: 1,
  },
  replySender: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  replyText: {
    fontSize: 12,
    color: '#475569',
  },
  reactionContainer: {
    flexDirection: 'row',
    marginTop: -8,
    marginBottom: 2,
    zIndex: 2,
  },
  reactionMe: {
    alignSelf: 'flex-end',
    marginRight: 6,
  },
  reactionOther: {
    alignSelf: 'flex-start',
    marginLeft: 6,
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reactionEmoji: {
    fontSize: 13,
  },
  reactionCount: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
    marginLeft: 3,
  },
  deliveryStatusText: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600',
    marginTop: 2,
    marginRight: 4,
  },
  systemContainer: {
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 20,
  },
  systemBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  systemText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
});
