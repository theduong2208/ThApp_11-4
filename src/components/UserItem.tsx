import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AppUser } from '../types/models';
import { Avatar } from './Avatar';
import { OnlineDot } from './OnlineDot';

interface UserItemProps {
  user: AppUser;
  onPress: () => void;
  selectable?: boolean;
  selected?: boolean;
}

export const UserItem: React.FC<UserItemProps> = ({
  user,
  onPress,
  selectable,
  selected,
}) => {
  const { name, email, avatarUrl, online } = user;

  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.selectedContainer]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Checkbox khi ở chế độ chọn thành viên tạo nhóm */}
      {selectable && (
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      )}

      <View style={styles.avatarWrapper}>
        <Avatar name={name} avatarUrl={avatarUrl} size={48} />
        <View style={styles.dotPosition}>
          <OnlineDot online={online} size={12} />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {email}
        </Text>
      </View>

      {!selectable && (
        <View style={styles.statusBadge}>
          <Text
            style={[
              styles.statusText,
              online ? styles.statusOnline : styles.statusOffline,
            ]}
          >
            {online ? 'Online' : 'Offline'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  selectedContainer: {
    backgroundColor: '#F0F9FF',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  checkboxSelected: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  avatarWrapper: {
    position: 'relative',
  },
  dotPosition: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  email: {
    fontSize: 13,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusOnline: {
    color: '#10B981',
  },
  statusOffline: {
    color: '#94A3B8',
  },
});
