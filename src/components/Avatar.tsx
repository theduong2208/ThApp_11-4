import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface AvatarProps {
  name: string;
  avatarUrl?: string;
  size?: number;
  backgroundColor?: string;
}

const AVATAR_COLORS = [
  '#4F46E5', '#0EA5E9', '#10B981', '#F59E0B',
  '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6',
];

function getColorForName(name: string): string {
  if (!name) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  avatarUrl,
  size = 46,
  backgroundColor,
}) => {
  const initial = name ? name.trim().charAt(0).toUpperCase() : '?';
  const bgColor = backgroundColor || getColorForName(name);

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#E2E8F0',
        }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={[
        styles.avatarContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.42 }]}>
        {initial}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
