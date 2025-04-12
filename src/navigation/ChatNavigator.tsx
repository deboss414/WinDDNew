import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ConversationsListScreen } from '../screens/chat/ConversationsListScreen';
import { ChatroomScreen } from '../screens/chat/ChatroomScreen/index';
import { Message, Participant } from '@/types/chat';

export type ChatStackParamList = {
  ConversationsList: undefined;
  Chatroom: {
    conversationId: string;
    taskId: string;
    taskTitle: string;
    taskStatus: string;
    preloadedMessages?: Message[];
    isFirstLoad: boolean;
    participants?: Participant[];
  };
};

const Stack = createStackNavigator<ChatStackParamList>();

export const ChatNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ConversationsList"
        component={ConversationsListScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Chatroom"
        component={ChatroomScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}; 