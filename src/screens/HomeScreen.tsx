import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { TaskCard } from '../components/task/TaskCard';
import { Task } from '../types/task';
import { taskApi } from '../api/taskApi';
import { MainStackParamList } from '../navigation/MainStack';
import { getColors } from '../constants/colors';
import { TopSection } from '../components/home/TopSection';
import { FeaturedTasksSection } from '../components/home/FeaturedTasksSection';
import { TaskSummarySection } from '../components/home/TaskSummarySection';

type NavigationProp = StackNavigationProp<MainStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskApi.getTasks();
      setTasks(response.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [])
  );

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
          return task.status === 'in progress';
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
        inProgressCount={tasks.filter(task => task.status === 'in progress').length}
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