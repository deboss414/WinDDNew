import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { IconProps } from '@expo/vector-icons/build/createIconSet';
import { useColorScheme } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { TaskListScreen } from '../screens/task/TaskListScreen';
import { TaskDetailScreen } from '../screens/TaskDetailsScreen/TaskDetailScreen';
import { TaskFormScreen } from '../screens/task/TaskFormScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { NotifScreen } from '../screens/notification/NotifScreen';
import { ChatNavigator } from './ChatNavigator';
import { getColors } from '../constants/colors';
import { CalendarNavigator } from './CalendarNavigator';

// Types for the Task stack navigator
export type TaskStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: string };
  TaskForm: undefined;
};

const TaskStack = createStackNavigator<TaskStackParamList>();

// Task Stack Navigator
const TaskStackNavigator = () => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);

  return (
    <TaskStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <TaskStack.Screen 
        name="TaskList" 
        component={TaskListScreen}
        options={{ title: 'Tasks' }}
      />
      <TaskStack.Screen 
        name="TaskDetail" 
        component={TaskDetailScreen}
        options={{ title: 'Task Details' }}
      />
      <TaskStack.Screen 
        name="TaskForm" 
        component={TaskFormScreen}
        options={{ title: 'New Task' }}
      />
    </TaskStack.Navigator>
  );
};

// Types for the bottom tab navigator
export type MainTabParamList = {
  Home: undefined;
  Tasks: {
    screen?: keyof TaskStackParamList;
    params?: {
      taskId?: string;
    };
  } | undefined;
  Calendar: undefined;
  Chat: undefined;
  Profile: undefined;
  NotifScreen: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

type IconName = keyof typeof MaterialIcons.glyphMap;

export const MainTabs = () => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: IconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'house';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'check-circle' : 'check-circle-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar-today' : 'calendar-today';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chat' : 'chat-bubble-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'NotifScreen') {
            iconName = focused ? 'notifications' : 'notifications-none';
          } else {
            iconName = 'home';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.divider,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tasks" component={TaskStackNavigator} />
      <Tab.Screen name="Calendar" component={CalendarNavigator} />
      <Tab.Screen name="Chat" component={ChatNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen 
        name="NotifScreen" 
        component={NotifScreen}
        options={{ tabBarLabel: 'Notifications' }}
      />
    </Tab.Navigator>
  );
}; 