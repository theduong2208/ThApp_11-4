import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AppUser } from '../types/models';
import { Avatar } from './Avatar';
import { OnlineDot } from './OnlineDot';

interface UserItemProps {
  user: AppUser;
  onPress: () => void;
}

export const UserItem: React.FC<UserItemProps> = ({ user, onPress }) => {
  const { name, email, online } = user;

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.avatarWrapper}>
        <Avatar name={name} size={48} />
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

