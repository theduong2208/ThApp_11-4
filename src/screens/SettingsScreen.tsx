import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Switch states as requested in requirements
  const [receiveNoti, setReceiveNoti] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cài đặt</Text>
      </View>

      {/* Thông tin tài khoản người dùng */}
      <View style={styles.profileCard}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          }}
          style={styles.avatar}
        />
        <View style={styles.profileDetails}>
          <Text style={styles.profileName}>Nguyễn Quốc Anh</Text>
          <Text style={styles.profileEmail}>quocanh.dev@gmail.com</Text>
          <Text style={styles.profilePhone}>SĐT: 0988 123 456</Text>
        </View>
      </View>

      {/* Tùy chọn ứng dụng với Switch */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tùy chọn chung</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>Nhận thông báo tin nhắn</Text>
            <Text style={styles.settingDescription}>
              Bật để nhận chuông và thông báo khi có tin nhắn mới
            </Text>
          </View>
          <Switch
            value={receiveNoti}
            onValueChange={setReceiveNoti}
            trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
            thumbColor={receiveNoti ? '#2563eb' : '#f8fafc'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>Hiển thị trạng thái online</Text>
            <Text style={styles.settingDescription}>
              Cho phép bạn bè thấy khi bạn đang hoạt động
            </Text>
          </View>
          <Switch
            value={onlineStatus}
            onValueChange={setOnlineStatus}
            trackColor={{ false: '#cbd5e1', true: '#86efac' }}
            thumbColor={onlineStatus ? '#16a34a' : '#f8fafc'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>Chế độ giao diện tối (Dark mode)</Text>
            <Text style={styles.settingDescription}>
              Giảm chói và bảo vệ mắt khi dùng ban đêm
            </Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
            thumbColor={darkMode ? '#2563eb' : '#f8fafc'}
          />
        </View>
      </View>

      {/* Phần nút Đăng xuất */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
    backgroundColor: '#e2e8f0',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 13,
    color: '#64748b',
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
    marginTop: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#94a3b8',
  },
  logoutContainer: {
    paddingHorizontal: 16,
    marginVertical: 24,
  },
  logoutButton: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '700',
  },
});
