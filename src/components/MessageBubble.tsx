import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../types/models';
import { formatMessageTime } from '../utils/formatTime';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMe,
}) => {
  return (
    <View
      style={[
        styles.container,
        isMe ? styles.containerMe : styles.containerOther,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isMe ? styles.bubbleMe : styles.bubbleOther,
        ]}
      >
        <Text style={[styles.text, isMe ? styles.textMe : styles.textOther]}>
          {message.text}
        </Text>
        <Text
          style={[styles.time, isMe ? styles.timeMe : styles.timeOther]}
        >
          {formatMessageTime(message.createdAt)}
        </Text>
      </View>
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
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 6,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  bubbleMe: {
    backgroundColor: '#0284C7', // Xanh đậm nổi bật cho người gửi
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  textMe: {
    color: '#FFFFFF',
  },
  textOther: {
    color: '#1E293B',
  },
  time: {
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
});

