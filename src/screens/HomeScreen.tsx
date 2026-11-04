import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ListRenderItem,
} from 'react-native';
import { HomeScreenProps } from '../types/navigation';
import { Conversation } from '../types/models';
import { subscribeConversations } from '../services/conversationService';
import { getCurrentUser } from '../services/authService';
import { ConversationItem } from '../components/ConversationItem';

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Lắng nghe danh sách cuộc trò chuyện theo thời gian thực
    const unsubscribe = subscribeConversations(
      currentUser.uid,
      (convList) => {
        setConversations(convList);
        setLoading(false);
      }
    );

    // Hủy đăng ký listener khi unmount để tránh rò rỉ bộ nhớ
    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  const renderItem: ListRenderItem<Conversation> = ({ item }) => (
    <ConversationItem
      conversation={item}
      onPress={() =>
        navigation.navigate('Chat', {
          peerId: item.peerId,
          peerName: item.peerName,
        })
      }
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đoạn Chat</Text>
        <Text style={styles.headerSubtitle}>
          {conversations.length} cuộc hội thoại
        </Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={styles.loadingText}>Đang tải cuộc trò chuyện...</Text>
        </View>
      ) : (
        <FlatList<Conversation>
          data={conversations}
          keyExtractor={(item) => item.peerId}
          renderItem={renderItem}
          contentContainerStyle={
            conversations.length === 0 ? styles.emptyList : styles.listContent
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyTitle}>Chưa có cuộc trò chuyện</Text>
              <Text style={styles.emptySubtitle}>
                Chuyển sang tab Danh bạ để bắt đầu nhắn tin với bạn bè!
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
    paddingHorizontal: 20,
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
