import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  useColorScheme,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { TaskCard, Task } from '../../components/task/TaskCard';
import { taskApi } from '../../api/taskApi';
import { MainStackParamList } from '../../navigation/MainStack';
import { getColors } from '../../constants/colors';

type TaskListScreenNavigationProp = StackNavigationProp<MainStackParamList>;

export const TaskListScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<TaskListScreenNavigationProp>();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = getColors(colorScheme);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 40,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    titleContainer: {
      padding: 16,
      paddingBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      flex: 1,
    },
    backButton: {
      padding: 8,
      marginRight: 8,
    },
    listContent: {
      padding: 16,
      paddingTop: 0,
    },
    cardContainer: {
      marginBottom: 4,
    },
    errorText: {
      fontSize: 16,
      marginBottom: 16,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    fab: {
      position: 'absolute',
      right: 16,
      bottom: 16,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
  });

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskApi.getTasks();
      setTasks(response.tasks);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Refresh tasks when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadTasks();
    }, [])
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.taskStatus.expired }]}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadTasks}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.titleContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Tasks</Text>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <TaskCard
              task={item}
              onPress={() => navigation.navigate('Tasks', {
                screen: 'TaskDetail',
                params: { taskId: item.id }
              })}
            />
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Tasks', {
          screen: 'TaskForm'
        })}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}; 