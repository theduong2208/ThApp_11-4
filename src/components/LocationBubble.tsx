import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { Message } from '../types/models';
import { formatMessageTime } from '../utils/formatTime';

interface LocationBubbleProps {
  message: Message;
  isMe: boolean;
}

export const LocationBubble: React.FC<LocationBubbleProps> = ({
  message,
  isMe,
}) => {
  const { latitude, longitude } = message;

  const handleOpenMap = async () => {
    if (latitude === undefined || longitude === undefined) {
      Alert.alert('Lỗi', 'Không có dữ liệu tọa độ hợp lệ.');
      return;
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Lỗi', 'Không thể mở ứng dụng bản đồ hoặc trình duyệt.');
    }
  };

  return (
    <View
      style={[
        styles.container,
        isMe ? styles.containerMe : styles.containerOther,
      ]}
    >
      <TouchableOpacity
        style={[
          styles.bubble,
          isMe ? styles.bubbleMe : styles.bubbleOther,
        ]}
        activeOpacity={0.8}
        onPress={handleOpenMap}
      >
        <View style={styles.headerRow}>
          <Text style={styles.icon}>📍</Text>
          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.title,
                isMe ? styles.titleMe : styles.titleOther,
              ]}
            >
              Vị trí của tôi
            </Text>
            <Text
              style={[
                styles.coords,
                isMe ? styles.coordsMe : styles.coordsOther,
              ]}
            >
              {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Text
            style={[
              styles.actionText,
              isMe ? styles.actionTextMe : styles.actionTextOther,
            ]}
          >
            Chạm để mở trên Google Maps ↗
          </Text>
          <Text
            style={[styles.time, isMe ? styles.timeMe : styles.timeOther]}
          >
            {formatMessageTime(message.createdAt)}
          </Text>
        </View>
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
  bubble: {
    width: 250,
    padding: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  bubbleMe: {
    backgroundColor: '#0369A1',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 28,
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  titleMe: {
    color: '#FFFFFF',
  },
  titleOther: {
    color: '#0F172A',
  },
  coords: {
    fontSize: 12,
    marginTop: 2,
  },
  coordsMe: {
    color: '#E0F2FE',
  },
  coordsOther: {
    color: '#64748B',
  },
  actionRow: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionTextMe: {
    color: '#BAE6FD',
  },
  actionTextOther: {
    color: '#0284C7',
  },
  time: {
    fontSize: 10,
  },
  timeMe: {
    color: '#BAE6FD',
  },
  timeOther: {
    color: '#94A3B8',
  },
});

