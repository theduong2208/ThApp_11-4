import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { ContactsScreenProps } from '../types/navigation';
import { AppUser } from '../types/models';
import { subscribeUsers } from '../services/userService';
import { getCurrentUser } from '../services/authService';
import { removeVietnameseTones } from '../utils/removeVietnameseTones';
import { UserItem } from '../components/UserItem';

export const ContactsScreen: React.FC<ContactsScreenProps> = ({ navigation }) => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Lắng nghe danh bạ người dùng khác theo thời gian thực
    const unsubscribe = subscribeUsers(currentUser.uid, (userList) => {
      setUsers(userList);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  // Lọc danh bạ theo tên (không phân biệt hoa/thường, không dấu)
  const filteredUsers = useMemo(() => {
    const query = removeVietnameseTones(searchQuery);
    if (!query) return users;

    return users.filter((u) => {
      const normalizedName = removeVietnameseTones(u.name);
      return normalizedName.includes(query);
    });
  }, [users, searchQuery]);

  const renderItem: ListRenderItem<AppUser> = ({ item }) => (
    <UserItem
      user={item}
      onPress={() =>
        navigation.navigate('Chat', {
          peerId: item.uid,
          peerName: item.name,
        })
      }
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh Bạ</Text>
        <Text style={styles.headerSubtitle}>
          {users.length} người dùng trực tuyến/ngoại tuyến
        </Text>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo tên..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Text style={styles.clearBtn} onPress={() => setSearchQuery('')}>
              ✕
            </Text>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={styles.loadingText}>Đang tải danh bạ...</Text>
        </View>
      ) : (
        <FlatList<AppUser>
          data={filteredUsers}
          keyExtractor={(item) => item.uid}
          renderItem={renderItem}
          contentContainerStyle={
            filteredUsers.length === 0 ? styles.emptyList : styles.listContent
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'Không tìm thấy người dùng' : 'Chưa có người dùng nào'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'Hãy thử tìm kiếm với từ khóa khác.'
                  : 'Hãy mời thêm bạn bè tạo tài khoản để trò chuyện!'}
              </Text>
            </View>
          }
        />
      )}
    </View>
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
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  clearBtn: {
    fontSize: 14,
    color: '#94A3B8',
    padding: 4,
  },
  listContent: {
    backgroundColor: '#FFFFFF',
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});
