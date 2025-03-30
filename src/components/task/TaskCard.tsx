import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import { SubTask } from './SubTask';
import { TaskStatus } from '@/types/task';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate: string;
  participants: Array<{ email: string; displayName: string }>;
  subtasks: SubTask[];
  progress?: number;
}

interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

const statusIcons = {
  'in progress': 'time-outline' as const,
  'completed': 'checkmark-circle-outline' as const,
  'expired': 'alert-circle-outline' as const,
  'closed': 'close-circle-outline' as const,
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getStatusText = (status: TaskStatus) => {
    return status === 'in progress' ? 'In Progress' :
           status.charAt(0).toUpperCase() + status.slice(1);
  };

  const completedSubtasks = task.subtasks.filter(subtask => subtask.progress === 100).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.cardBackground }]}
      onPress={onPress}
    >
      <Text style={[styles.title, { color: colors.text }]}>{task.title}</Text>
      
      <View style={styles.footer}>
        <View style={[
          styles.statusContainer,
          { backgroundColor: `${colors.taskStatus[task.status]}15` }
        ]}>
          <Ionicons 
            name={statusIcons[task.status]}
            size={16}
            color={colors.taskStatus[task.status]}
          />
          <Text style={[styles.status, { color: colors.taskStatus[task.status] }]}>
            {getStatusText(task.status)}
          </Text>
        </View>
        
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={16} color={colors.secondaryText} />
          <Text style={[styles.date, { color: colors.secondaryText }]}>
            {formatDate(task.dueDate)}
          </Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        {task.participants && task.participants.length > 0 && (
          <View style={styles.assigneeGroup}>
            <Ionicons name="people-outline" size={16} color={colors.secondaryText} />
            <Text style={[styles.assigneeText, { color: colors.secondaryText }]}>
              {task.participants.map(p => p.displayName).join(', ')}
            </Text>
          </View>
        )}

        {totalSubtasks > 0 && (
          <View style={styles.subtaskCount}>
            <Ionicons name="list-outline" size={16} color={colors.secondaryText} />
            <Text style={[styles.subtaskCountText, { color: colors.secondaryText }]}>
              {completedSubtasks}/{totalSubtasks}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  status: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    marginLeft: 4,
    fontSize: 12,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  assigneeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assigneeText: {
    marginLeft: 4,
    fontSize: 12,
  },
  subtaskCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtaskCountText: {
    marginLeft: 4,
    fontSize: 12,
  },
});