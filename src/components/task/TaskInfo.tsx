import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import { Task, SubTask } from '../../types/task';
import { TaskSubtasks } from './TaskSubtasks';

interface TaskInfoProps {
  task: Task;
  onUpdate: (updatedTask: Task) => void;
}

export const TaskInfo: React.FC<TaskInfoProps> = ({ task, onUpdate }) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSubtaskProgressChange = (subtaskId: string, progress: number) => {
    const updatedSubtasks = task.subtasks.map(subtask =>
      subtask.id === subtaskId ? { ...subtask, progress } : subtask
    );
    onUpdate({ ...task, subtasks: updatedSubtasks });
  };

  const handleSubtaskUpdate = (subtaskId: string, data: Partial<SubTask>) => {
    const updatedSubtasks = task.subtasks.map(subtask =>
      subtask.id === subtaskId ? { ...subtask, ...data } : subtask
    );
    onUpdate({ ...task, subtasks: updatedSubtasks });
  };

  const handleSubtaskCreate = (data: Omit<SubTask, 'id' | 'createdAt' | 'lastUpdated' | 'comments' | 'createdBy'>) => {
    const newSubtask: SubTask = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      comments: [],
      createdBy: task.createdBy,
    };
    onUpdate({ ...task, subtasks: [...task.subtasks, newSubtask] });
  };

  const handleAddComment = (subtaskId: string, text: string, parentCommentId?: string) => {
    const updatedSubtasks = task.subtasks.map(subtask => {
      if (subtask.id === subtaskId) {
        const newComment = {
          id: Date.now().toString(),
          text,
          createdAt: new Date().toISOString(),
          createdBy: task.createdBy,
          parentCommentId,
        };
        return { ...subtask, comments: [...subtask.comments, newComment] };
      }
      return subtask;
    });
    onUpdate({ ...task, subtasks: updatedSubtasks });
  };

  const handleEditComment = (subtaskId: string, commentId: string, text: string) => {
    const updatedSubtasks = task.subtasks.map(subtask => {
      if (subtask.id === subtaskId) {
        return {
          ...subtask,
          comments: subtask.comments.map(comment =>
            comment.id === commentId ? { ...comment, text } : comment
          ),
        };
      }
      return subtask;
    });
    onUpdate({ ...task, subtasks: updatedSubtasks });
  };

  const handleDeleteComment = (subtaskId: string, commentId: string) => {
    const updatedSubtasks = task.subtasks.map(subtask => {
      if (subtask.id === subtaskId) {
        return {
          ...subtask,
          comments: subtask.comments.filter(comment => comment.id !== commentId),
        };
      }
      return subtask;
    });
    onUpdate({ ...task, subtasks: updatedSubtasks });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Description Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
          <TouchableOpacity onPress={toggleDescription}>
            <MaterialIcons
              name={isDescriptionExpanded ? 'expand-less' : 'expand-more'}
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
        {isDescriptionExpanded && (
          <Text style={[styles.description, { color: colors.text }]}>
            {task.description || 'No description provided'}
          </Text>
        )}
      </View>

      {/* Due Date Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Due Date</Text>
        <View style={styles.dateContainer}>
          <MaterialIcons name="calendar-today" size={20} color={colors.text} />
          <Text style={[styles.dateText, { color: colors.text }]}>
            {formatDate(task.dueDate)}
          </Text>
        </View>
      </View>

      {/* Created Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Created</Text>
        <View style={styles.dateContainer}>
          <MaterialIcons name="schedule" size={20} color={colors.text} />
          <Text style={[styles.dateText, { color: colors.text }]}>
            {formatDate(task.createdAt)}
          </Text>
        </View>
        <Text style={[styles.creatorText, { color: colors.secondaryText }]}>
          by {task.createdBy}
        </Text>
      </View>

      {/* Subtasks Section */}
      <View style={styles.section}>
        <TaskSubtasks
          taskId={task.id}
          subtasks={task.subtasks}
          participants={task.participants}
          onProgressChange={handleSubtaskProgressChange}
          onUpdateSubTask={handleSubtaskUpdate}
          onSubtaskCreate={handleSubtaskCreate}
          onAddComment={handleAddComment}
          onEditComment={handleEditComment}
          onDeleteComment={handleDeleteComment}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dateText: {
    fontSize: 16,
    marginLeft: 8,
  },
  creatorText: {
    fontSize: 14,
    marginTop: 4,
    marginLeft: 28,
  },
});
