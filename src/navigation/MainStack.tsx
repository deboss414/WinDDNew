import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { NotifScreen } from '../screens/notification/NotifScreen';
import { TaskListScreen } from '../screens/task/TaskListScreen';
import { TaskDetailScreen } from '../screens/TaskDetailsScreen/TaskDetailScreen';
import { TaskFormScreen } from '../screens/task/TaskFormScreen';

export type MainStackParamList = {
  Home: undefined;
  Notifications: undefined;
  TaskList: undefined;
  TaskDetail: { taskId: string };
  TaskForm: undefined;
};

const Stack = createStackNavigator<MainStackParamList>();

export const MainStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2A9D8F',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'Home',
        }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotifScreen}
        options={{
          title: 'Notifications',
        }}
      />
      <Stack.Screen 
        name="TaskList" 
        component={TaskListScreen}
        options={{
          title: 'Tasks',
        }}
      />
      <Stack.Screen 
        name="TaskDetail" 
        component={TaskDetailScreen}
        options={{
          headerShown: false,
          header: () => null,
        }}
      />
      <Stack.Screen 
        name="TaskForm" 
        component={TaskFormScreen}
        options={{
          title: 'New Task',
        }}
      />
    </Stack.Navigator>
  );
}; 