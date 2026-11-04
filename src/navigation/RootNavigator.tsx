import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { ChatScreen } from '../screens/ChatScreen';
import { useAuth } from '../hooks/useAuth';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  // Màn hình chờ khi đang khôi phục phiên đăng nhập từ AsyncStorage
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingLogo}>💬</Text>
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={styles.loadingText}>Đang khởi tạo ứng dụng...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // Đã đăng nhập: Cho phép truy cập MainTabs và màn Chat
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      ) : (
        // Chưa đăng nhập: Chỉ cho phép truy cập AuthStack (Login, Register)
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingLogo: {
    fontSize: 64,
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
});

