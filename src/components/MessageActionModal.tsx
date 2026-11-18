import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Message } from '../types/models';

interface MessageActionModalProps {
  visible: boolean;
  message: Message | null;
  isMe: boolean;
  onClose: () => void;
  onReaction: (emoji: string) => void;
  onRecall: () => void;
  onReply: () => void;
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢'];

export const MessageActionModal: React.FC<MessageActionModalProps> = ({
  visible,
  message,
  isMe,
  onClose,
  onReaction,
  onRecall,
  onReply,
}) => {
  if (!message) return null;

  const handleCopy = () => {
    if (message.text) {
      Clipboard.setString(message.text);
      Alert.alert('Đã sao chép', 'Nội dung tin nhắn đã được sao chép.');
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menuCard}>
          {/* Hàng thả cảm xúc */}
          {!message.recalled && (
            <View style={styles.reactionBar}>
              {EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.emojiButton}
                  onPress={() => onReaction(emoji)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Danh sách hành động */}
          <View style={styles.actionList}>
            {/* Trả lời tin nhắn */}
            {!message.recalled && (
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                  onReply();
                  onClose();
                }}
              >
                <Text style={styles.actionIcon}>↩️</Text>
                <Text style={styles.actionLabel}>Trả lời</Text>
              </TouchableOpacity>
            )}

            {/* Sao chép (văn bản) */}
            {message.type === 'text' && !message.recalled && (
              <TouchableOpacity
                style={styles.actionItem}
                onPress={handleCopy}
              >
                <Text style={styles.actionIcon}>📋</Text>
                <Text style={styles.actionLabel}>Sao chép nội dung</Text>
              </TouchableOpacity>
            )}

            {/* Thu hồi tin nhắn (chỉ tin của mình) */}
            {isMe && !message.recalled && (
              <TouchableOpacity
                style={[styles.actionItem, styles.recallItem]}
                onPress={() => {
                  onRecall();
                  onClose();
                }}
              >
                <Text style={styles.actionIcon}>🚫</Text>
                <Text style={[styles.actionLabel, styles.recallText]}>
                  Thu hồi tin nhắn
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  menuCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  reactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 30,
    marginBottom: 12,
  },
  emojiButton: {
    padding: 4,
  },
  emojiText: {
    fontSize: 28,
  },
  actionList: {
    borderTopWidth: 0.5,
    borderTopColor: '#F1F5F9',
    paddingTop: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  recallItem: {
    backgroundColor: '#FEF2F2',
    marginTop: 4,
  },
  recallText: {
    color: '#EF4444',
  },
});

