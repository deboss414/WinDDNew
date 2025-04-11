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

const Avatar: React.FC<{ name: string; size?: number }> = ({ name, size = 24 }) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={[styles.avatar, { width: size, height: size, backgroundColor: colors.primary }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>{initials}</Text>
    </View>
  );
};

const AssigneeList: React.FC<{ assignees: string[]; participants: string[] }> = ({ assignees, participants }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);

  const formatName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length < 2) return name;
    const lastName = parts[parts.length - 1];
    const firstName = parts[0];
    return `${lastName[0]}.${firstName}`;
  };

  return (
    <View style={styles.assigneeContainer}>
      <View style={styles.avatarGroup}>
        {assignees.slice(0, isExpanded ? undefined : 3).map((email, index) => {
          const participant = participants.find(p => p === email);
          if (!participant) return null;
          return (
            <View key={email} style={[styles.avatarWrapper, { zIndex: assignees.length - index }]}>
              <Avatar name={participant} />
            </View>
          );
        })}
        {assignees.length > 3 && !isExpanded && (
          <View style={[styles.avatarWrapper, { zIndex: 0 }]}>
            <View style={[styles.avatar, { backgroundColor: colors.secondaryText }]}>
              <Text style={[styles.avatarText, { fontSize: 10 }]}>+{assignees.length - 3}</Text>
            </View>
          </View>
        )}
      </View>
      <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
        <Text style={[styles.expandText, { color: colors.primary }]}>
          {isExpanded ? 'Show Less' : 'Show More'}
        </Text>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.expandedList}>
          {assignees.map((email) => {
            const participant = participants.find(p => p === email);
            if (!participant) return null;
            return (
              <View key={email} style={styles.expandedItem}>
                <Avatar name={participant} size={20} />
                <Text style={[styles.expandedName, { color: colors.text }]}>
                  {formatName(participant)}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

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
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
    <View style={styles.card}>
      <TouchableOpacity 
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.cardHeader}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>{subtask.title}</Text>
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                setIsEditModalVisible(true);
              }}
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
          <View style={styles.footerLeft}>
            <View style={styles.footerItem}>
              <MaterialIcons name="people" size={16} color={colors.secondaryText} />
              <Text style={[styles.footerText, { color: colors.secondaryText }]}>
                {subtask.assignee.length}
              </Text>
            </View>
            <View style={styles.footerItem}>
              <MaterialIcons name="chat-bubble-outline" size={16} color={colors.secondaryText} />
              <Text style={[styles.footerText, { color: colors.secondaryText }]}>
                {subtask.comments?.length || 0}
              </Text>
            </View>
          </View>
          <View style={styles.footerItem}>
            <MaterialIcons name="access-time" size={16} color={colors.secondaryText} />
            <Text style={[styles.footerText, { color: colors.secondaryText }]}>
              {formatDate(subtask.dueDate)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={[styles.expandedSection, { backgroundColor: colors.background }]}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="people" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Assignees</Text>
            </View>
            <AssigneeList assignees={subtask.assignee} participants={participants} />
          </View>
          
          <View style={[styles.expandedSection, { backgroundColor: colors.background }]}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="chat-bubble-outline" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Comments</Text>
            </View>
            <CommentSection
              subtaskId={subtask.id}
              comments={comments}
              onAddComment={handleAddComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
            />
          </View>
        </View>
      )}

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
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
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
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    marginLeft: 4,
    fontSize: 12,
  },
  avatar: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  avatarWrapper: {
    marginLeft: -8,
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assigneeContainer: {
    flex: 1,
    marginRight: 8,
  },
  expandText: {
    fontSize: 12,
    marginTop: 4,
  },
  expandedList: {
    marginTop: 8,
  },
  expandedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  expandedName: {
    marginLeft: 8,
    fontSize: 12,
  },
  expandedContent: {
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 12,
  },
  expandedSection: {
    borderRadius: 0,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 