import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { SettingsScreenProps } from '../types/navigation';
import { getCurrentUser, logout, updateUserProfile } from '../services/authService';
import { uploadImageToCloudinary } from '../services/uploadService';
import { Avatar } from '../components/Avatar';

export const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const user = getCurrentUser();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    user?.photoURL || undefined
  );
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Xin quyền máy ảnh trên Android
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Quyền sử dụng máy ảnh',
            message: 'Ứng dụng cần quyền Camera để chụp ảnh đại diện mới.',
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

  // Chọn ảnh từ camera hoặc thư viện và upload lên Cloudinary
  const handlePickAvatar = (source: 'camera' | 'library') => {
    const options = {
      mediaType: 'photo' as const,
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.8 as const,
    };

    const onPickerResponse = async (response: any) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Lỗi', response.errorMessage || 'Không thể chọn ảnh.');
        return;
      }

      const asset = response.assets?.[0];
      if (!asset?.uri) return;

      setUploadingAvatar(true);
      try {
        const result = await uploadImageToCloudinary(asset.uri, asset.fileName);
        setAvatarUrl(result.url);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải ảnh đại diện lên máy chủ Cloudinary.');
      } finally {
        setUploadingAvatar(false);
      }
    };

    if (source === 'camera') {
      requestCameraPermission().then((granted) => {
        if (!granted) {
          Alert.alert('Thông báo', 'Bạn cần cấp quyền Camera để chụp ảnh đại diện.');
          return;
        }
        launchCamera(options, onPickerResponse);
      });
    } else {
      launchImageLibrary(options, onPickerResponse);
    }
  };

  const showAvatarPickerOptions = () => {
    Alert.alert(
      'Đổi ảnh đại diện',
      'Chọn phương thức để cập nhật ảnh đại diện:',
      [
        { text: 'Chụp ảnh mới', onPress: () => handlePickAvatar('camera') },
        { text: 'Chọn từ thư viện', onPress: () => handlePickAvatar('library') },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  // Lưu thông tin hồ sơ
  const handleSaveProfile = async () => {
    const trimmed = displayName.trim();
    if (!trimmed) {
      Alert.alert('Lỗi', 'Họ tên không được để trống.');
      return;
    }

    setSavingProfile(true);
    try {
      await updateUserProfile(trimmed, avatarUrl);
      Alert.alert('Thành công', 'Thông tin cá nhân đã được lưu thành công!');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật hồ sơ. Vui lòng thử lại.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await logout();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cài Đặt</Text>
      </View>

      {/* Thẻ Hồ sơ cá nhân */}
      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Hồ sơ cá nhân</Text>

        <View style={styles.avatarRow}>
          <TouchableOpacity
            style={styles.avatarTouchable}
            activeOpacity={0.8}
            onPress={showAvatarPickerOptions}
            disabled={uploadingAvatar}
          >
            <Avatar
              name={displayName || 'Người dùng'}
              avatarUrl={avatarUrl}
              size={80}
            />
            {uploadingAvatar ? (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color="#FFFFFF" size="small" />
              </View>
            ) : (
              <View style={styles.cameraBadge}>
                <Text style={styles.cameraIcon}>📷</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.changeAvatarButton}
            onPress={showAvatarPickerOptions}
            disabled={uploadingAvatar}
          >
            <Text style={styles.changeAvatarText}>
              {uploadingAvatar ? 'Đang tải ảnh...' : 'Đổi ảnh đại diện'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Họ và tên</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Nhập họ và tên hiển thị..."
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email (Không thể thay đổi)</Text>
          <View style={[styles.input, styles.inputDisabled]}>
            <Text style={styles.emailText}>{user?.email || 'N/A'}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, savingProfile && styles.buttonDisabled]}
          onPress={handleSaveProfile}
          disabled={savingProfile || uploadingAvatar}
        >
          {savingProfile ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Lưu Thay Đổi</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Thông tin ứng dụng */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin ứng dụng</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Phiên bản</Text>
          <Text style={styles.rowValue}>2.0.0 (Bài thực hành 5)</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Chế độ trò chuyện</Text>
          <Text style={styles.rowValue}>1-1 & Chat nhóm Realtime</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Lưu trữ ảnh</Text>
          <Text style={styles.rowValue}>Cloudinary Unsigned</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Cơ sở dữ liệu</Text>
          <Text style={styles.rowValue}>Firebase Realtime Database</Text>
        </View>
      </View>

      {/* Nút Đăng xuất */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity
          style={[styles.logoutButton, loggingOut && styles.buttonDisabled]}
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.8}
        >
          {loggingOut ? (
            <ActivityIndicator color="#EF4444" />
          ) : (
            <Text style={styles.logoutButtonText}>Đăng Xuất</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
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
  profileSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  avatarRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarTouchable: {
    position: 'relative',
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0284C7',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cameraIcon: {
    fontSize: 13,
  },
  changeAvatarButton: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
  },
  changeAvatarText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  inputDisabled: {
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
  },
  emailText: {
    color: '#64748B',
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  rowLabel: {
    fontSize: 14,
    color: '#334155',
  },
  rowValue: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  logoutContainer: {
    marginVertical: 24,
    paddingHorizontal: 16,
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '700',
  },
});
