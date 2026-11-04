import React from 'react';
import { View, StyleSheet } from 'react-native';

interface OnlineDotProps {
  online: boolean;
  size?: number;
}

export const OnlineDot: React.FC<OnlineDotProps> = ({ online, size = 10 }) => {
  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: online ? '#10B981' : '#9CA3AF',
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  dot: {
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});

