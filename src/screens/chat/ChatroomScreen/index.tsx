import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { getColors } from '../../../constants/colors';
import { chatApi } from '../../../api/chatApi';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ChatroomHeader } from './ChatroomHeader';
import type { RootStackParamList, MessageListProps, ChatInputProps } from './types';
import type { Message, Conversation } from '../../../types/chat';

export const ChatroomScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'Chatroom'>>();
  const { conversationId, taskId, taskTitle, taskStatus, preloadedMessages, isFirstLoad, participants: routeParticipants } = route.params;
  const [messages, setMessages] = useState<Message[]>(preloadedMessages || []);
  const [loading, setLoading] = useState(isFirstLoad);
  const [conversation, setConversation] = useState<Conversation | null>({
    id: conversationId,
    taskId,
    taskTitle,
    taskStatus,
    participants: routeParticipants || [],
    updatedAt: new Date().toISOString(),
    unreadCount: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [inputText, setInputText] = useState('');
  const [showAttachmentPicker, setShowAttachmentPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const colorScheme = useColorScheme() ?? null;
  const colors = getColors(colorScheme);

  useEffect(() => {
    if (!preloadedMessages) {
      loadConversation();
    } else {
      console.log('Using preloaded messages:', preloadedMessages);
    }
  }, [conversationId]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      const data = await chatApi.getConversation(conversationId);
      console.log('Loading conversation data:', {
        conversationId,
        messages: data.messages,
        participants: data.participants
      });
      setConversation({
        id: conversationId,
        taskId,
        taskTitle,
        taskStatus,
        participants: routeParticipants || data.participants || [],
        lastMessage: data.messages[data.messages.length - 1],
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
      });
      setMessages(data.messages);
      console.log('Messages state after setting:', data.messages);
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (message: string, replyTo?: { id: string; senderName: string; content: string; }) => {
    if (!message.trim()) return;

    try {
      setIsSending(true);
      const newMessage = await chatApi.sendMessage(
        conversationId,
        message,
        '1', // Using the same ID as mock data
        'John Doe',
        replyTo
      );
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      setReplyingTo(null);
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleDeleteMessage = async (message: Message) => {
    try {
      await chatApi.deleteMessage(conversationId, message.id);
      setMessages(prev => prev.filter(m => m.id !== message.id));
    } catch (err) {
      setError('Failed to delete message');
    }
  };

  const handleAttachmentSelect = async (type: 'photo' | 'video' | 'file', uri: string) => {
    try {
      // Handle attachment upload and message sending
      console.log('Selected attachment:', { type, uri });
    } catch (error) {
      console.error('Failed to handle attachment:', error);
    }
  };

  const messageListColors = {
    ...colors,
    border: colors.divider,
    taskStatus: {
      inProgress: colors.taskStatus.inProgress,
      completed: colors.taskStatus.completed,
      pending: colors.taskStatus.expired,
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ChatroomHeader
        taskTitle={taskTitle}
        taskId={taskId}
        participants={conversation?.participants || []}
        onBackPress={() => navigation.goBack()}
        onMenuPress={() => {}}
        onParticipantsPress={() => setShowParticipantsModal(true)}
        showParticipantsModal={showParticipantsModal}
        setShowParticipantsModal={setShowParticipantsModal}
        colors={colors}
      />
      
      <MessageList
        messages={messages}
        currentUserId="1"
        onReplyPress={handleReply}
        onEditPress={() => {}}
        onDeletePress={handleDeleteMessage}
        colors={messageListColors}
        flatListRef={flatListRef}
        loading={loading}
      />

      <ChatInput
        value={inputText}
        onChangeText={setInputText}
        onSend={handleSendMessage}
        replyingTo={replyingTo}
        onCancelReply={handleCancelReply}
        showAttachmentPicker={showAttachmentPicker}
        setShowAttachmentPicker={setShowAttachmentPicker}
        isSending={isSending}
        colors={colors}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 