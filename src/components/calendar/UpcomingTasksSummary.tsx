import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  useColorScheme,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import type { Task } from '../task/TaskCard';

interface UpcomingTasksSummaryProps {
  tasks: Task[];
  onTaskPress: (task: Task) => void;
}

interface GroupedTasks {
  [date: string]: Task[];
}

export const UpcomingTasksSummary: React.FC<UpcomingTasksSummaryProps> = ({ tasks, onTaskPress }) => {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);

  // Get tasks for the next 7 days
  const getUpcomingTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999); // Set to end of day

    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
      return taskDate >= today && taskDate <= nextWeek;
    });
  };

  // Group tasks by date
  const groupTasksByDate = (tasks: Task[]): GroupedTasks => {
    return tasks.reduce((acc, task) => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
      const date = taskDate.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
      return acc;
    }, {} as GroupedTasks);
  };

  const upcomingTasks = getUpcomingTasks();
  const groupedTasks = groupTasksByDate(upcomingTasks);
  const sortedDates = Object.keys(groupedTasks).sort();

  const toggleDate = (date: string) => {
    const newExpandedDates = new Set(expandedDates);
    if (newExpandedDates.has(date)) {
      newExpandedDates.delete(date);
    } else {
      newExpandedDates.add(date);
    }
    setExpandedDates(newExpandedDates);
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={[styles.taskItem, { backgroundColor: colors.cardBackground }]}
      onPress={() => onTaskPress(item)}
    >
      <View style={styles.taskContent}>
        <MaterialIcons
          name={item.status.toLowerCase() === 'completed' ? 'check-circle' : 'radio-button-unchecked'}
          size={16}
          color={getStatusColor(item.status, colors)}
        />
        <Text style={[styles.taskTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
      </View>
      <View style={styles.taskRightContent}>
        <Text style={[styles.taskDate, { color: colors.secondaryText }]}>
          {new Date(item.dueDate + 'T12:00:00Z').toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })}
        </Text>
        <Text style={[styles.taskTime, { color: colors.secondaryText }]}>
          {new Date(item.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderDateGroup = (date: string) => {
    const isExpanded = expandedDates.has(date);
    const tasksForDate = groupedTasks[date];
    const taskCount = tasksForDate.length;

    return (
      <View key={date} style={styles.dateGroup}>
        <TouchableOpacity
          style={[styles.dateHeader, { backgroundColor: colors.cardBackground }]}
          onPress={() => toggleDate(date)}
        >
          <View style={styles.dateHeaderContent}>
            <Text style={[styles.dateText, { color: colors.text }]}>
              {new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </Text>
            <View style={styles.taskCountContainer}>
              <Text style={[styles.taskCount, { color: colors.secondaryText }]}>
                {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
              </Text>
              <MaterialIcons
                name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                size={20}
                color={colors.secondaryText}
              />
            </View>
          </View>
        </TouchableOpacity>
        
        {isExpanded && (
          <Animated.View>
            <FlatList
              data={tasksForDate}
              renderItem={renderTask}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </Animated.View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Upcoming Tasks</Text>
      </View>
      <FlatList
        data={sortedDates}
        renderItem={({ item }) => renderDateGroup(item)}
        keyExtractor={date => date}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 16,
  },
  dateGroup: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  dateHeader: {
    padding: 12,
  },
  dateHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
  },
  taskCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCount: {
    fontSize: 14,
    marginRight: 4,
  },
  taskItem: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  taskRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskDate: {
    fontSize: 12,
  },
  taskTime: {
    fontSize: 12,
  },
});

const getStatusColor = (status: string, colors: any) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return colors.taskStatus.completed;
    case 'in progress':
      return colors.taskStatus.inProgress;
    case 'expired':
      return colors.taskStatus.expired;
    default:
      return colors.secondaryText;
  }
}; 