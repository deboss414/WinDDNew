import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getColors } from '../../constants/colors';
import { chatApi } from '../../api/chatApi';
import type { Conversation, Message } from '../../types/chat';
import type { ChatStackParamList } from '../../navigation/ChatNavigator';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { TaskStatus } from '../../components/task/TaskCard';

type ConversationsListScreenNavigationProp = StackNavigationProp<ChatStackParamList, 'ConversationsList'>;

// Cache to store preloaded messages
const messageCache = new Map<string, Message[]>();
const CACHE_STORAGE_KEY = '@chat_message_cache';

export const ConversationsListScreen: React.FC = () => {
  const navigation = useNavigation<ConversationsListScreenNavigationProp>();
  const colorScheme = useColorScheme() ?? null;
  const colors = getColors(colorScheme);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TaskStatus | 'all'>('inProgress');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [preloadingProgress, setPreloadingProgress] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadCacheFromStorage = async () => {
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_STORAGE_KEY);
      if (cachedData) {
        const parsedCache = JSON.parse(cachedData);
        Object.entries(parsedCache).forEach(([key, value]) => {
          messageCache.set(key, value as Message[]);
        });
        setIsFirstLoad(false);
      }
    } catch (error) {
      console.error('Failed to load message cache:', error);
    }
  };

  const saveCacheToStorage = async () => {
    try {
      const cacheObject = Object.fromEntries(messageCache);
      await AsyncStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Failed to save message cache:', error);
    }
  };

  const preloadMessages = async (conversationId: string) => {
    try {
      // Skip if messages are already cached
      if (messageCache.has(conversationId)) {
        setPreloadingProgress(prev => prev + 1);
        return;
      }

      const conversationData = await chatApi.getConversation(conversationId);
      messageCache.set(conversationId, conversationData.messages);
      
      // Update preloading progress
      setPreloadingProgress(prev => prev + 1);

      // Save cache to storage after each successful preload
      await saveCacheToStorage();
    } catch (error) {
      console.error(`Failed to preload messages for conversation ${conversationId}:`, error);
    }
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      // Load cache first
      await loadCacheFromStorage();
      
      const data = await chatApi.getConversations();
      setConversations(data);
      
      // Start preloading messages for each conversation
      data.forEach(conversation => {
        preloadMessages(conversation.id);
      });
    } catch (err) {
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleConversationPress = (conversation: Conversation) => {
    // Pass preloaded messages and isFirstLoad flag to the ChatroomScreen
    console.log('Navigating to conversation:', {
      id: conversation.id,
      taskTitle: conversation.taskTitle,
      cachedMessages: messageCache.get(conversation.id)
    });
    navigation.navigate('Chatroom', {
      conversationId: conversation.id,
      taskId: conversation.taskId,
      taskTitle: conversation.taskTitle,
      taskStatus: conversation.taskStatus,
      preloadedMessages: messageCache.get(conversation.id) || [],
      isFirstLoad,
      participants: conversation.participants
    });
  };

  const filteredConversations = conversations.filter(conversation => {
    const matchesStatus = activeTab === 'all' || conversation.taskStatus === activeTab;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || (
      conversation.taskTitle.toLowerCase().includes(searchLower) ||
      conversation.participants.some(p => p.name.toLowerCase().includes(searchLower)) ||
      conversation.lastMessage?.content.toLowerCase().includes(searchLower)
    );
    return matchesStatus && matchesSearch;
  });

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[styles.conversationItem, { backgroundColor: colors.cardBackground }]}
      onPress={() => handleConversationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.conversationContent}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: colors.taskStatus[item.taskStatus as keyof typeof colors.taskStatus] || colors.secondaryText }
            ]} />
            <Text 
              style={[styles.taskTitle, { color: colors.text }]}
              numberOfLines={1}
            >
              {item.taskTitle}
            </Text>
          </View>
          <Text style={[styles.timestamp, { color: colors.secondaryText }]}>
            {new Date(item.updatedAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
        <View style={styles.messageContainer}>
          <Text 
            style={[styles.lastMessage, { color: colors.secondaryText }]}
            numberOfLines={1}
          >
            {item.lastMessage ? (
              <>
                <Text style={{ fontWeight: '600' }}>{item.lastMessage.senderName}: </Text>
                {item.lastMessage.content}
              </>
            ) : (
              'Start the conversation...'
            )}
          </Text>
          {item.unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadCount}>
                {item.unreadCount > 9 ? '9+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterOption = (status: TaskStatus | 'all') => {
    const isActive = activeTab === status;
    const statusColors = {
      all: colors.primary,
      inProgress: colors.taskStatus.inProgress,
      completed: colors.taskStatus.completed,
      expired: colors.taskStatus.expired,
      closed: colors.secondaryText,
    };

    return (
      <TouchableOpacity
        key={status}
        style={[
          styles.filterOption,
          isActive && { backgroundColor: `${statusColors[status]}15` }
        ]}
        onPress={() => {
          setActiveTab(status);
          setShowFilter(false);
        }}
      >
        <Ionicons
          name={
            status === 'all' ? 'chatbubbles-outline' :
            status === 'completed' ? 'checkmark-done' :
            status === 'inProgress' ? 'pulse' :
            status === 'expired' ? 'timer-outline' :
            'close'
          }
          size={16}
          color={isActive ? statusColors[status] : colors.secondaryText}
        />
        <Text style={[
          styles.filterOptionText,
          { color: isActive ? statusColors[status] : colors.secondaryText }
        ]}>
          {status === 'all' ? 'All Chats' :
           status === 'inProgress' ? 'Active' :
           status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
        <Text style={[
          styles.filterOptionCount,
          { color: isActive ? statusColors[status] : colors.secondaryText }
        ]}>
          {status === 'all' 
            ? conversations.length 
            : conversations.filter(c => c.taskStatus === status).length}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
          Loading conversations...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <MaterialIcons name="error-outline" size={48} color={colors.secondaryText} />
        <Text style={[styles.errorText, { color: colors.secondaryText }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={loadConversations}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
          <MaterialIcons name="refresh" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header/Search */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Chatrooms
        </Text>
        <View style={styles.searchRow}>
          <View style={[styles.searchContainer, { backgroundColor: colors.cardBackground }]}>
            <Ionicons name="search" size={20} color={colors.secondaryText} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search conversations..."
              placeholderTextColor={colors.secondaryText}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: colors.cardBackground }]}
            onPress={() => setShowFilter(true)}
          >
            <Ionicons name="filter" size={20} color={colors.secondaryText} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="chat-bubble-outline" size={48} color={colors.secondaryText} />
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              No conversations found
            </Text>
          </View>
        }
        ListFooterComponent={
          preloadingProgress > 0 && preloadingProgress < conversations.length ? (
            <View style={styles.preloadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.preloadingText, { color: colors.secondaryText }]}>
                Preloading messages... {preloadingProgress}/{conversations.length}
              </Text>
            </View>
          ) : null
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilter}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilter(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilter(false)}
        >
          <View style={[styles.filterModal, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.filterHeader}>
              <Text style={[styles.filterTitle, { color: colors.text }]}>Filter by Status</Text>
              <TouchableOpacity onPress={() => setShowFilter(false)}>
                <Ionicons name="close" size={24} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>
            {(['all', 'inProgress', 'completed', 'expired', 'closed'] as (TaskStatus | 'all')[]).map(renderFilterOption)}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 64,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
    borderWidth: 0,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  conversationItem: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  conversationContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    opacity: 0.8,
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '80%',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    paddingBottom: 32,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  filterOptionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  filterOptionCount: {
    fontSize: 14,
    opacity: 0.8,
  },
  preloadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  preloadingText: {
    fontSize: 14,
    opacity: 0.7,
  },
});