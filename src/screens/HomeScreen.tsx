import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
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

    // Lắng nghe danh sách tất cả cuộc hội thoại (1-1 & Nhóm)
    const unsubscribe = subscribeConversations(
      currentUser.uid,
      (convList) => {
        setConversations(convList);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  const handleOpenChat = (item: Conversation) => {
    let peerId: string | undefined = undefined;
    if (item.type === 'direct' && item.members && currentUser) {
      peerId = Object.keys(item.members).find((id) => id !== currentUser.uid);
    }

    navigation.navigate('Chat', {
      convId: item.convId,
      name: item.name,
      type: item.type,
      peerId,
    });
  };

  const renderItem: ListRenderItem<Conversation> = ({ item }) => (
    <ConversationItem
      conversation={item}
      onPress={() => handleOpenChat(item)}
    />
  );

  return (
    <View style={styles.container}>
      {/* Header với nút Tạo nhóm mới */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Đoạn Chat</Text>
          <Text style={styles.headerSubtitle}>
            {conversations.length} cuộc hội thoại
          </Text>
        </View>

        <TouchableOpacity
          style={styles.createGroupBtn}
          onPress={() => navigation.navigate('CreateGroup')}
          activeOpacity={0.8}
        >
          <Text style={styles.createGroupText}>+ Tạo nhóm</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={styles.loadingText}>Đang tải cuộc trò chuyện...</Text>
        </View>
      ) : (
        <FlatList<Conversation>
          data={conversations}
          keyExtractor={(item) => item.convId}
          renderItem={renderItem}
          contentContainerStyle={
            conversations.length === 0 ? styles.emptyList : styles.listContent
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyTitle}>Chưa có cuộc trò chuyện</Text>
              <Text style={styles.emptySubtitle}>
                Chuyển sang tab Danh bạ hoặc bấm "+ Tạo nhóm" để bắt đầu trò chuyện!
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  createGroupBtn: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  createGroupText: {
    color: '#0284C7',
    fontWeight: '700',
    fontSize: 13,
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
