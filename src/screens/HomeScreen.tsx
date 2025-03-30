import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getColors } from '../constants/colors';
import { Task } from '../types/task';
import { TopSection } from '../components/home/TopSection';
import { FeaturedTasksSection } from '../components/home/FeaturedTasksSection';
import { TaskSummarySection } from '../components/home/TaskSummarySection';

type RootStackParamList = {
  TaskDetail: { taskId: string };
  Chat: undefined;
  NotifScreen: undefined;
  TaskList: { filter?: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Mock data - replace with actual data from your backend
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Complete Project Presentation',
      description: 'Create a comprehensive presentation for the client meeting',
      dueDate: '2024-03-25',
      status: 'inProgress',
      createdBy: 'John Doe',
      createdAt: '2024-03-20T10:00:00Z',
      lastUpdated: '2024-03-20T10:00:00Z',
      participants: [
        { email: 'john.doe@example.com', displayName: 'John Doe' },
        { email: 'jane.smith@example.com', displayName: 'Jane Smith' },
      ],
      subtasks: [],
    },
    {
      id: '2',
      title: 'Review Code Changes',
      description: 'Review and approve pull requests for the new feature',
      dueDate: '2024-03-24',
      status: 'completed',
      createdBy: 'John Doe',
      createdAt: '2024-03-19T10:00:00Z',
      lastUpdated: '2024-03-19T10:00:00Z',
      participants: [
        { email: 'john.doe@example.com', displayName: 'John Doe' },
      ],
      subtasks: [],
    },
    {
      id: '3',
      title: 'Team Meeting',
      description: 'Weekly sync with the development team',
      dueDate: '2024-03-23',
      status: 'expired',
      createdBy: 'John Doe',
      createdAt: '2024-03-18T10:00:00Z',
      lastUpdated: '2024-03-18T10:00:00Z',
      participants: [
        { email: 'john.doe@example.com', displayName: 'John Doe' },
        { email: 'jane.smith@example.com', displayName: 'Jane Smith' },
        { email: 'mike.johnson@example.com', displayName: 'Mike Johnson' },
      ],
      subtasks: [],
    },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search logic here
  };

  const handleFilterChange = (filter: string | null) => {
    setActiveFilter(filter);
    // Implement filter logic here
  };

  const handleTaskPress = (task: Task) => {
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  const filteredTasks = tasks.filter(task => {
    if (searchQuery) {
      return task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             task.description.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (activeFilter) {
      switch (activeFilter.toLowerCase()) {
        case 'in progress':
          return task.status === 'inProgress';
        case 'completed':
          return task.status === 'completed';
        case 'overdue':
          return task.status === 'expired';
        default:
          return true;
      }
    }
    return true;
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <TopSection
        inProgressCount={tasks.filter(task => task.status === 'inProgress').length}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />
      <FeaturedTasksSection
        tasks={filteredTasks.slice(0, 3)}
        onTaskPress={handleTaskPress}
      />
      <TaskSummarySection
        tasks={filteredTasks}
        onTaskPress={handleTaskPress}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
  },
});