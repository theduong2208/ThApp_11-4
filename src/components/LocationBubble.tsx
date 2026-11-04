import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Modal,
  Platform,
  Alert,
  Image,
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
  const [modalVisible, setModalVisible] = useState(false);

  // Mở ứng dụng bản đồ bên ngoài (Google Maps / Apple Maps)
  const openExternalMap = async () => {
    if (latitude === undefined || longitude === undefined) {
      Alert.alert('Lỗi', 'Không có dữ liệu tọa độ hợp lệ.');
      return;
    }

    const geoUrl =
      Platform.OS === 'ios'
        ? `maps://?q=${latitude},${longitude}`
        : `geo:${latitude},${longitude}?q=${latitude},${longitude}(Vị trí của tôi)`;

    const webUrl = `https://maps.google.com/?q=${latitude},${longitude}`;

    try {
      await Linking.openURL(geoUrl);
    } catch {
      try {
        await Linking.openURL(webUrl);
      } catch (err) {
        Alert.alert('Lỗi', 'Không thể khởi chạy ứng dụng bản đồ.');
      }
    }
  };

  const hasCoords = latitude !== undefined && longitude !== undefined;
  // URL ảnh bản đồ tĩnh OpenStreetMap để hiển thị trực quan
  const mapPreviewUrl = hasCoords
    ? `https://static-maps.yandex.ru/1.x/?ll=${longitude},${latitude}&z=14&l=map&size=360,180&pt=${longitude},${latitude},pm2rdm`
    : '';

  return (
    <>
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
          activeOpacity={0.85}
          onPress={() => setModalVisible(true)}
        >
          {/* Header hiển thị biểu tượng và tọa độ */}
          <View style={styles.headerRow}>
            <Text style={styles.pinIcon}>📍</Text>
            <View style={styles.titleWrapper}>
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
                  styles.coordsText,
                  isMe ? styles.coordsMe : styles.coordsOther,
                ]}
              >
                {latitude?.toFixed(5)}, {longitude?.toFixed(5)}
              </Text>
            </View>
          </View>

          {/* Khung xem trước bản đồ */}
          <View style={styles.previewContainer}>
            {mapPreviewUrl ? (
              <Image
                source={{ uri: mapPreviewUrl }}
                style={styles.mapImage}
                resizeMode="cover"
              />
            ) : null}
            <View style={styles.mapOverlay}>
              <View style={styles.centerMarker}>
                <Text style={styles.markerText}>📍</Text>
              </View>
              <Text style={styles.tapToViewText}>Chạm để xem bản đồ</Text>
            </View>
          </View>

          {/* Thanh chân bong bóng */}
          <View style={styles.footerRow}>
            <Text
              style={[
                styles.actionLabel,
                isMe ? styles.actionLabelMe : styles.actionLabelOther,
              ]}
            >
              Mở bản đồ ↗
            </Text>
            <Text
              style={[styles.time, isMe ? styles.timeMe : styles.timeOther]}
            >
              {formatMessageTime(message.createdAt)}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Modal hiển thị bản đồ trực quan */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {/* Tiêu đề Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📍 Bản Đồ Vị Trí</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeIconBtn}
              >
                <Text style={styles.closeIconText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Khung bản đồ phóng to */}
            <View style={styles.modalMapBox}>
              {mapPreviewUrl ? (
                <Image
                  source={{ uri: mapPreviewUrl }}
                  style={styles.modalMapImage}
                  resizeMode="cover"
                />
              ) : null}
              <View style={styles.modalMarkerWrapper}>
                <Text style={styles.modalMarkerPin}>📍</Text>
                <View style={styles.modalMarkerPulse} />
              </View>
            </View>

            {/* Chi tiết tọa độ */}
            <View style={styles.infoBox}>
              <View style={styles.coordRow}>
                <Text style={styles.coordLabel}>Vĩ độ (Latitude):</Text>
                <Text style={styles.coordValue}>{latitude?.toFixed(6)}</Text>
              </View>
              <View style={styles.coordRow}>
                <Text style={styles.coordLabel}>Kinh độ (Longitude):</Text>
                <Text style={styles.coordValue}>{longitude?.toFixed(6)}</Text>
              </View>
            </View>

            {/* Nút hành động */}
            <View style={styles.modalActionButtons}>
              <TouchableOpacity
                style={styles.openMapsBtn}
                onPress={() => {
                  setModalVisible(false);
                  openExternalMap();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.openMapsText}>Mở bằng Google Maps ↗</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.closeModalText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
    width: 260,
    padding: 10,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  bubbleMe: {
    backgroundColor: '#0284C7',
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
  pinIcon: {
    fontSize: 26,
    marginRight: 8,
  },
  titleWrapper: {
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
  coordsText: {
    fontSize: 11,
    marginTop: 2,
  },
  coordsMe: {
    color: '#E0F2FE',
  },
  coordsOther: {
    color: '#64748B',
  },
  previewContainer: {
    height: 110,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  markerText: {
    fontSize: 18,
  },
  tapToViewText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionLabelMe: {
    color: '#BAE6FD',
  },
  actionLabelOther: {
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

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeIconBtn: {
    padding: 6,
  },
  closeIconText: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '700',
  },
  modalMapBox: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalMapImage: {
    width: '100%',
    height: '100%',
  },
  modalMarkerWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalMarkerPin: {
    fontSize: 40,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  modalMarkerPulse: {
    width: 16,
    height: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  coordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  coordLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  coordValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalActionButtons: {
    marginTop: 16,
  },
  openMapsBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  openMapsText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  closeModalBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeModalText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
});
