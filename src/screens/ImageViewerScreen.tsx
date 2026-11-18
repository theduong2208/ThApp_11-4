import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
} from 'react-native';
import { ImageViewerScreenProps } from '../types/navigation';

export const ImageViewerScreen: React.FC<ImageViewerScreenProps> = ({
  route,
  navigation,
}) => {
  const { imageUrl } = route.params;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Nút đóng */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      {/* Hiển thị ảnh toàn màn hình */}
      <Image
        source={{ uri: imageUrl }}
        style={styles.fullImage}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
});
