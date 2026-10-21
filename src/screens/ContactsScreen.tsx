import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Contact } from '../types';
import { initialContacts } from '../data/mockData';

export const ContactsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts] = useState<Contact[]>(initialContacts);

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.phone && contact.phone.includes(searchQuery))
  );

  const handleOpenChat = (item: Contact) => {
    navigation.navigate('ChatDetail', {
      id: item.id,
      name: item.name,
      avatar: item.avatar,
      isOnline: item.isOnline,
    });
  };

  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={styles.contactItem}
      activeOpacity={0.7}
      onPress={() => handleOpenChat(item)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View
          style={[
            styles.statusIndicator,
            item.isOnline ? styles.statusOnline : styles.statusOffline,
          ]}
        />
      </View>

      <View style={styles.contactInfo}>
        <Text style={styles.contactName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text
          style={[
            styles.statusText,
            item.isOnline ? styles.onlineText : styles.offlineText,
          ]}
        >
          {item.isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => handleOpenChat(item)}
      >
        <Text style={styles.chatButtonText}>Nhắn tin</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh bạ</Text>
      </View>

      {/* Ô tìm kiếm danh bạ */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Danh sách người dùng */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContactItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>Không tìm thấy liên hệ nào</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: '#94a3b8',
    padding: 4,
  },
  listContent: {
    paddingVertical: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e2e8f0',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  statusOnline: {
    backgroundColor: '#22c55e',
  },
  statusOffline: {
    backgroundColor: '#94a3b8',
  },
  contactInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 13,
  },
  onlineText: {
    color: '#16a34a',
  },
  offlineText: {
    color: '#94a3b8',
  },
  chatButton: {
    backgroundColor: '#eff6ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  chatButtonText: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '600',
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
