import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import { CommentSection } from '../comment/CommentSection';
import { Comment } from '../../types/comment';
import { CircularProgress } from '../common/CircularProgress';
import { SubTaskFormModal } from './SubTaskFormModal';

export interface SubTask {
  id: string;
  title: string;
  description?: string;
  assignee: string[];
  progress: number;
  dueDate: string;
  createdBy: string;
  createdAt: string;
  lastUpdated: string;
  comments: Comment[];
}

interface SubTaskProps {
  subtask: SubTask;
  onPress?: () => void;
  onProgressChange?: (progress: number) => void;
  canEditProgress?: boolean;
  onAddComment: (subtaskId: string, text: string, parentCommentId?: string) => void;
  onEditComment: (subtaskId: string, commentId: string, text: string) => void;
  onDeleteComment: (subtaskId: string, commentId: string) => void;
  onUpdateSubTask: (subtaskId: string, data: Omit<SubTask, 'id' | 'createdAt' | 'lastUpdated' | 'createdBy' | 'comments'>) => void;
  participants: string[];
}

export const SubTaskCard: React.FC<SubTaskProps> = ({
  subtask,
  onPress,
  onProgressChange,
  canEditProgress = false,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onUpdateSubTask,
  participants,
}) => {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return colors.taskStatus.completed;
    if (progress >= 67) return '#34C759';
    if (progress >= 34) return '#FFD60A';
    return colors.taskStatus.expired;
  };

  const handleAddComment = (text: string, parentCommentId?: string) => {
    onAddComment(subtask.id, text, parentCommentId);
  };

  const handleEditComment = (commentId: string, text: string) => {
    onEditComment(subtask.id, commentId, text);
  };

  const handleDeleteComment = (commentId: string) => {
    onDeleteComment(subtask.id, commentId);
  };

  const handleUpdateSubTask = (data: Omit<SubTask, 'id' | 'createdAt' | 'lastUpdated' | 'createdBy' | 'comments'>) => {
    onUpdateSubTask(subtask.id, data);
    setIsEditModalVisible(false);
  };

  // Ensure comments is always an array
  const comments = subtask.comments || [];

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>{subtask.title}</Text>
            <TouchableOpacity 
              onPress={() => setIsEditModalVisible(true)}
              style={styles.editButton}
            >
              <MaterialIcons name="edit" size={16} color={colors.secondaryText} />
            </TouchableOpacity>
          </View>
          <CircularProgress
            progress={subtask.progress}
            size={40}
            strokeWidth={3}
            backgroundColor={`${getProgressColor(subtask.progress)}30`}
            progressColor={getProgressColor(subtask.progress)}
            textColor={getProgressColor(subtask.progress)}
          />
        </View>

        {subtask.description && (
          <Text style={[styles.description, { color: colors.secondaryText }]} numberOfLines={2}>
            {subtask.description}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <MaterialIcons name="people" size={16} color={colors.secondaryText} />
            <Text style={[styles.footerText, { color: colors.secondaryText }]}>
              {Array.isArray(subtask.assignee) ? subtask.assignee.join(', ') : subtask.assignee}
            </Text>
          </View>
          <View style={styles.footerItem}>
            <MaterialIcons name="access-time" size={16} color={colors.secondaryText} />
            <Text style={[styles.footerText, { color: colors.secondaryText }]}>
              {formatDate(subtask.dueDate)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <CommentSection
        subtaskId={subtask.id}
        comments={comments}
        onAddComment={handleAddComment}
        onEditComment={handleEditComment}
        onDeleteComment={handleDeleteComment}
      />

      <SubTaskFormModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onSubmit={handleUpdateSubTask}
        initialData={subtask}
        mode="edit"
        participants={participants}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  editButton: {
    padding: 4,
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    marginLeft: 4,
    fontSize: 12,
  },
}); 