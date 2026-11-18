import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ListRenderItem,
} from 'react-native';
import { CreateGroupScreenProps } from '../types/navigation';
import { AppUser } from '../types/models';
import { subscribeUsers } from '../services/userService';
import { getCurrentUser } from '../services/authService';
import { createGroup } from '../services/groupService';
import { UserItem } from '../components/UserItem';

export const CreateGroupScreen: React.FC<CreateGroupScreenProps> = ({
  navigation,
}) => {
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState<AppUser[]>([]);
  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!currentUser) return;

    // Lắng nghe danh bạ
    const unsubscribe = subscribeUsers(currentUser.uid, (userList) => {
      setUsers(userList);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  const toggleSelectUser = (uid: string) => {
    setSelectedUids((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleCreateGroup = async () => {
    const trimmedName = groupName.trim();
    if (!trimmedName) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên nhóm.');
      return;
    }

    // Yêu cầu bắt buộc: Tối thiểu 2 người ngoài bản thân
    if (selectedUids.length < 2) {
      Alert.alert(
        'Thông báo',
        'Vui lòng chọn tối thiểu 2 thành viên khác để tạo nhóm trò chuyện.'
      );
      return;
    }

    if (!currentUser) return;

    setCreating(true);
    try {
      const convId = await createGroup(
        trimmedName,
        currentUser.uid,
        currentUser.displayName || 'Người dùng',
        selectedUids
      );

      // Chuyển thẳng vào màn hình chat nhóm vừa tạo
      navigation.replace('Chat', {
        convId,
        name: trimmedName,
        type: 'group',
      });
    } catch (error) {
      console.warn('Lỗi tạo nhóm:', error);
      Alert.alert('Lỗi', 'Không thể tạo nhóm. Vui lòng thử lại sau.');
    } finally {
      setCreating(false);
    }
  };

  const renderItem: ListRenderItem<AppUser> = ({ item }) => {
    const isSelected = selectedUids.includes(item.uid);
    return (
      <UserItem
        user={item}
        onPress={() => toggleSelectUser(item.uid)}
        selectable={true}
        selected={isSelected}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo Nhóm Mới</Text>
        <TouchableOpacity
          onPress={handleCreateGroup}
          disabled={creating || !groupName.trim() || selectedUids.length < 2}
          style={[
            styles.createButton,
            (creating || !groupName.trim() || selectedUids.length < 2) &&
              styles.createButtonDisabled,
          ]}
        >
          {creating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>Tạo</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Ô nhập tên nhóm */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tên nhóm</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: Team Dự Án, Hội Bạn Thân..."
          placeholderTextColor="#94A3B8"
          value={groupName}
          onChangeText={setGroupName}
        />
      </View>

      {/* Danh sách chọn thành viên */}
      <View style={styles.membersHeader}>
        <Text style={styles.membersTitle}>Chọn thành viên (tối thiểu 2 người)</Text>
        <Text style={styles.selectedCount}>
          Đã chọn: {selectedUids.length}
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={styles.loadingText}>Đang tải danh bạ...</Text>
        </View>
      ) : (
        <FlatList<AppUser>
          data={users}
          keyExtractor={(item) => item.uid}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>Chưa có người dùng nào khác trong hệ thống.</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    paddingRight: 12,
  },
  backText: {
    fontSize: 32,
    color: '#0284C7',
    lineHeight: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  createButton: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 16,
  },
  createButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  membersTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  selectedCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
  listContent: {
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});

