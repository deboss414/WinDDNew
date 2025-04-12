import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import { Comment as CommentType } from '../../types/comment';
import { Comment } from '../comment/Comment';
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
  comments: CommentType[];
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

const Avatar: React.FC<{ name: string; size?: number }> = ({ name, size = 28 }) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={[styles.avatar, { width: size, height: size, backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.background }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.45 }]}>{initials}</Text>
    </View>
  );
};

const AssigneeList: React.FC<{ assignees: string[]; participants: string[] }> = ({ assignees, participants }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.assigneeContainer}>
      <TouchableOpacity 
        onPress={toggleExpand}
        style={styles.avatarGroup}
        activeOpacity={0.7}
      >
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
      </TouchableOpacity>

      {isExpanded && (
        <Animated.View style={[styles.expandedList, { opacity: 1 }]}>
          <View style={styles.expandedHeader}>
            <Text style={[styles.expandedTitle, { color: colors.text }]}>Assignees</Text>
            <TouchableOpacity onPress={toggleExpand} style={styles.collapseButton}>
              <MaterialIcons name="close" size={20} color={colors.secondaryText} />
            </TouchableOpacity>
          </View>
          {assignees.map((email) => {
            const participant = participants.find(p => p === email);
            if (!participant) return null;
            return (
              <View key={email} style={styles.expandedItem}>
                <Avatar name={participant} size={24} />
                <View style={styles.expandedInfo}>
                  <Text style={[styles.expandedName, { color: colors.text }]}>
                    {participant}
                  </Text>
                  <Text style={[styles.expandedEmail, { color: colors.secondaryText }]}>
                    {email}
                  </Text>
                </View>
              </View>
            );
          })}
        </Animated.View>
      )}
    </View>
  );
};

export const SubTaskCard: React.FC<SubTaskProps> = ({
  subtask,
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
  const [animation] = useState(new Animated.Value(0));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return colors.taskStatus.completed;
    if (progress >= 67) return '#2ECC71';
    if (progress >= 34) return '#F1C40F';
    return colors.taskStatus.expired;
  };

  const handleEditComment = (commentId: string, text: string) => {
    onEditComment(subtask.id, commentId, text);
  };

  const handleDeleteComment = (commentId: string) => {
    onDeleteComment(subtask.id, commentId);
  };

  const handleAddComment = (text: string, parentCommentId?: string) => {
    onAddComment(subtask.id, text, parentCommentId);
  };

  const handleUpdateSubTask = (data: Omit<SubTask, 'id' | 'createdAt' | 'lastUpdated' | 'createdBy' | 'comments'>) => {
    onUpdateSubTask(subtask.id, data);
    setIsEditModalVisible(false);
  };

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const comments = subtask.comments || [];
  const expandedStyle = {
    opacity: animation,
    transform: [{
      translateY: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [-10, 0],
      }),
    }],
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.divider }]}>
      <TouchableOpacity 
        onPress={toggleExpand}
        activeOpacity={0.8}
        style={styles.cardHeader}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {subtask.title}
            </Text>
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                setIsEditModalVisible(true);
              }}
              style={styles.editButton}
            >
              <MaterialIcons name="edit" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <CircularProgress
            progress={subtask.progress}
            size={48}
            strokeWidth={4}
            backgroundColor={`${getProgressColor(subtask.progress)}22`}
            progressColor={getProgressColor(subtask.progress)}
            textColor={getProgressColor(subtask.progress)}
            textStyle={{ fontSize: 10, fontWeight: '700' }}
            showGlow={true}
            animationDuration={500}
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
              <MaterialIcons name="people" size={18} color={colors.secondaryText} />
              <Text style={[styles.footerText, { color: colors.secondaryText }]}>
                {subtask.assignee?.length || 0}
              </Text>
            </View>
            <View style={styles.footerItem}>
              <MaterialIcons name="chat-bubble-outline" size={18} color={colors.secondaryText} />
              <Text style={[styles.footerText, { color: colors.secondaryText }]}>
                {comments.length}
              </Text>
            </View>
          </View>
          <View style={styles.footerItem}>
            <MaterialIcons name="event" size={18} color={colors.secondaryText} />
            <Text style={[styles.footerText, { color: colors.secondaryText }]}>
              {formatDate(subtask.dueDate)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <Animated.View style={[styles.expandedContent, expandedStyle]}>
          <View style={styles.expandedSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Assignees</Text>
            <AssigneeList assignees={subtask.assignee} participants={participants} />
          </View>
          
          <View style={styles.expandedSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Comments</Text>
            {comments.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                No comments yet
              </Text>
            ) : (
              comments.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  onEdit={(commentId, text) => handleEditComment(commentId, text)}
                  onDelete={(commentId) => handleDeleteComment(commentId)}
                  onReply={(text, parentCommentId) => handleAddComment(text, parentCommentId)}
                />
              ))
            )}
          </View>
        </Animated.View>
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
    marginVertical: 8,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    padding: 16,
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
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 20,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
  },
  avatar: {
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  avatarWrapper: {
    marginLeft: -10,
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assigneeContainer: {
    flex: 1,
    marginVertical: 8,
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  expandedTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  collapseButton: {
    padding: 4,
  },
  expandedList: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
  },
  expandedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  expandedInfo: {
    marginLeft: 12,
    flex: 1,
  },
  expandedName: {
    fontSize: 14,
    fontWeight: '500',
  },
  expandedEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  expandedContent: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  expandedSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    padding: 12,
  },
});