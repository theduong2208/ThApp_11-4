import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { GroupSettingsScreenProps } from '../types/navigation';
import { ConversationMeta, AppUser } from '../types/models';
import {
  subscribeConversation,
  updateGroupName,
  addMembersToGroup,
  leaveGroup,
} from '../services/groupService';
import { subscribeUsers } from '../services/userService';
import { getCurrentUser } from '../services/authService';
import { Avatar } from '../components/Avatar';

export const GroupSettingsScreen: React.FC<GroupSettingsScreenProps> = ({
  route,
  navigation,
}) => {
  const { convId } = route.params;

  const [group, setGroup] = useState<ConversationMeta | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = getCurrentUser();
  const currentUid = currentUser?.uid ?? '';
  const currentName = currentUser?.displayName ?? 'Tôi';

  useEffect(() => {
    const unsubGroup = subscribeConversation(convId, (conv) => {
      setGroup(conv);
      if (conv) setNameInput(conv.name);
      setLoading(false);
    });

    const unsubUsers = subscribeUsers(currentUid, (uList) => {
      setAllUsers(uList);
    });

    return () => {
      unsubGroup();
      unsubUsers();
    };
  }, [convId, currentUid]);

  // Cập nhật tên nhóm
  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === group?.name) {
      setEditingName(false);
      return;
    }

    try {
      await updateGroupName(convId, trimmed, currentUid, currentName);
      setEditingName(false);
      Alert.alert('Thành công', 'Đã đổi tên nhóm.');
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể đổi tên nhóm.');
    }
  };

  // Thêm thành viên vào nhóm
  const handleAddMembers = async () => {
    if (selectedToAdd.length === 0 || !group) return;

    try {
      await addMembersToGroup(
        convId,
        group.name,
        selectedToAdd,
        currentUid,
        currentName
      );
      setSelectedToAdd([]);
      setShowAddMember(false);
      Alert.alert('Thành công', 'Đã thêm thành viên vào nhóm.');
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể thêm thành viên.');
    }
  };

  // Rời nhóm
  const handleLeaveGroup = () => {
    Alert.alert(
      'Xác nhận rời nhóm',
      'Bạn có chắc chắn muốn rời khỏi nhóm trò chuyện này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Rời nhóm',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveGroup(convId, currentUid, currentName);
              // Quay về màn hình danh sách cuộc trò chuyện
              navigation.popToTop();
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể rời nhóm.');
            }
          },
        },
      ]
    );
  };

  if (loading || !group) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  const memberUids = Object.keys(group.members || {});
  // Những người chưa có trong nhóm
  const availableToAdd = allUsers.filter((u) => !memberUids.includes(u.uid));

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
        <Text style={styles.headerTitle}>Cài Đặt Nhóm</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Thông tin nhóm & Đổi tên */}
      <View style={styles.groupInfoCard}>
        <Avatar name={group.name} size={64} />
        {editingName ? (
          <View style={styles.editNameRow}>
            <TextInput
              style={styles.nameInput}
              value={nameInput}
              onChangeText={setNameInput}
              autoFocus
            />
            <TouchableOpacity
              style={styles.saveNameBtn}
              onPress={handleSaveName}
            >
              <Text style={styles.saveNameText}>Lưu</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.nameDisplayRow}
            onPress={() => setEditingName(true)}
          >
            <Text style={styles.groupNameText}>{group.name}</Text>
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.memberCountText}>
          {memberUids.length} thành viên
        </Text>
      </View>

      {/* Danh sách thành viên */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Thành viên nhóm</Text>
        <TouchableOpacity
          style={styles.addMemberBtn}
          onPress={() => setShowAddMember(!showAddMember)}
        >
          <Text style={styles.addMemberText}>
            {showAddMember ? 'Đóng' : '+ Thêm người'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Panel chọn thêm thành viên */}
      {showAddMember && (
        <View style={styles.addMemberPanel}>
          <Text style={styles.panelTitle}>Chọn người để thêm vào nhóm:</Text>
          {availableToAdd.length === 0 ? (
            <Text style={styles.emptyNote}>
              Tất cả liên hệ trong danh bạ đã có trong nhóm.
            </Text>
          ) : (
            <>
              {availableToAdd.map((u) => {
                const isSelected = selectedToAdd.includes(u.uid);
                return (
                  <TouchableOpacity
                    key={u.uid}
                    style={styles.addMemberRow}
                    onPress={() => {
                      setSelectedToAdd((prev) =>
                        prev.includes(u.uid)
                          ? prev.filter((id) => id !== u.uid)
                          : [...prev, u.uid]
                      );
                    }}
                  >
                    <View
                      style={[
                        styles.addCheckbox,
                        isSelected && styles.addCheckboxActive,
                      ]}
                    >
                      {isSelected && <Text style={styles.checkText}>✓</Text>}
                    </View>
                    <Avatar name={u.name} size={32} />
                    <Text style={styles.addMemberName}>{u.name}</Text>
                  </TouchableOpacity>
                );
              })}
              {selectedToAdd.length > 0 && (
                <TouchableOpacity
                  style={styles.confirmAddBtn}
                  onPress={handleAddMembers}
                >
                  <Text style={styles.confirmAddText}>
                    Xác nhận thêm ({selectedToAdd.length})
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}

      {/* Danh sách thành viên hiện tại */}
      <FlatList
        data={memberUids}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          const matchedUser = allUsers.find((u) => u.uid === item);
          const isCurrentUser = item === currentUid;
          const isCreator = item === group.createdBy;
          const name = isCurrentUser
            ? `${currentName} (Bạn)`
            : matchedUser?.name || 'Thành viên';

          return (
            <View style={styles.memberItem}>
              <Avatar name={name} size={40} />
              <View style={styles.memberItemInfo}>
                <Text style={styles.memberName}>{name}</Text>
                {isCreator && <Text style={styles.creatorTag}>Trưởng nhóm</Text>}
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.memberList}
      />

      {/* Nút rời nhóm */}
      <View style={styles.leaveContainer}>
        <TouchableOpacity
          style={styles.leaveButton}
          onPress={handleLeaveGroup}
        >
          <Text style={styles.leaveText}>Rời khỏi nhóm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  groupInfoCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  nameDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  groupNameText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  editIcon: {
    fontSize: 14,
    marginLeft: 6,
  },
  editNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#0284C7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 16,
    color: '#0F172A',
    minWidth: 180,
  },
  saveNameBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  saveNameText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  memberCountText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  addMemberBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addMemberText: {
    fontSize: 13,
    color: '#0284C7',
    fontWeight: '700',
  },
  addMemberPanel: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  panelTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  emptyNote: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  addMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  addCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCheckboxActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  addMemberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 10,
  },
  confirmAddBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  confirmAddText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  memberList: {
    backgroundColor: '#FFFFFF',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  memberItemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  creatorTag: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '600',
    marginTop: 2,
  },
  leaveContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  leaveButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  leaveText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 15,
  },
});

