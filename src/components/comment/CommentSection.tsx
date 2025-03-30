import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  useColorScheme,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import { Comment } from '../../types/comment';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name: string) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

interface CommentSectionProps {
  subtaskId: string;
  comments: Comment[];
  onAddComment: (text: string, parentCommentId?: string) => void;
  onEditComment: (commentId: string, text: string) => void;
  onDeleteComment: (commentId: string) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  subtaskId,
  comments = [],
  onAddComment,
  onEditComment,
  onDeleteComment,
}) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyToId, setReplyToId] = useState<string | undefined>();
  const [editingCommentId, setEditingCommentId] = useState<string | undefined>();

  const safeComments = Array.isArray(comments) ? comments : [];
  const topLevelComments = safeComments.filter(comment => !comment.parentCommentId);
  const getResponses = (commentId: string) => 
    safeComments.filter(comment => comment.parentCommentId === commentId);

  const handleSubmitComment = () => {
    if (!newCommentText.trim()) return;
    onAddComment(newCommentText.trim(), replyToId);
    setNewCommentText('');
    setReplyToId(undefined);
  };

  const handleEditComment = (commentId: string, text: string) => {
    onEditComment(commentId, text);
    setEditingCommentId(undefined);
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const responses = getResponses(comment.id);
    const isEditing = editingCommentId === comment.id;
    const isReply = depth > 0;

    return (
      <View key={comment.id} style={[styles.commentContainer, { marginLeft: depth * 20 }]}>
        {isReply && (
          <View style={[styles.threadLine, { backgroundColor: colors.divider }]} />
        )}
        <View style={[
          styles.commentContent,
          isReply && { backgroundColor: '#fff' }
        ]}>
          <View style={[styles.avatarContainer, { backgroundColor: getAvatarColor(comment.authorName) }]}>
            <Text style={styles.avatarText}>{getInitials(comment.authorName)}</Text>
          </View>
          <View style={styles.commentMain}>
            <View style={styles.commentHeader}>
              <Text style={[styles.authorName, { color: colors.text }]}>
                {comment.authorName}
              </Text>
              <Text style={[styles.timestamp, { color: colors.secondaryText }]}>
                {new Date(comment.createdAt).toLocaleDateString()}
                {comment.isEdited && ' (edited)'}
              </Text>
            </View>

            {isEditing ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={[
                    styles.editInput,
                    {
                      backgroundColor: colors.cardBackground,
                      color: colors.text,
                      borderColor: colors.divider,
                    },
                  ]}
                  value={newCommentText}
                  onChangeText={setNewCommentText}
                  multiline
                  autoFocus
                />
                <View style={styles.editActions}>
                  <TouchableOpacity
                    onPress={() => {
                      handleEditComment(comment.id, newCommentText);
                    }}
                    style={[styles.editButton, { backgroundColor: colors.primary }]}
                  >
                    <Text style={styles.editButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setEditingCommentId(undefined)}
                    style={[styles.editButton, { backgroundColor: colors.taskStatus.expired }]}
                  >
                    <Text style={styles.editButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <Text style={[styles.commentText, { color: colors.text }]}>
                  {comment.text}
                </Text>
                <View style={styles.commentActions}>
                  {!isReply && (
                    <TouchableOpacity
                      onPress={() => setReplyToId(comment.id)}
                      style={styles.actionButton}
                    >
                      <MaterialIcons name="reply" size={16} color={colors.primary} />
                      <Text style={[styles.actionText, { color: colors.primary }]}>Reply</Text>
                    </TouchableOpacity>
                  )}
                  {/* Show edit/delete only for the author */}
                  <TouchableOpacity
                    onPress={() => {
                      setEditingCommentId(comment.id);
                      setNewCommentText(comment.text);
                    }}
                    style={styles.actionButton}
                  >
                    <MaterialIcons name="edit" size={16} color={colors.primary} />
                    <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onDeleteComment(comment.id)}
                    style={styles.actionButton}
                  >
                    <MaterialIcons name="delete" size={16} color={colors.taskStatus.expired} />
                    <Text style={[styles.actionText, { color: colors.taskStatus.expired }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>

        {responses.length > 0 && (
          <View style={styles.responses}>
            {responses.map(response => renderComment(response, depth + 1))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={[styles.headerText, { color: colors.text }]}>
          Comments ({comments.length})
        </Text>
        <MaterialIcons
          name={isExpanded ? 'expand-less' : 'expand-more'}
          size={24}
          color={colors.primary}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.cardBackground,
                  color: colors.text,
                  borderColor: colors.divider,
                },
              ]}
              placeholder={replyToId ? 'Write a reply...' : 'Write a comment...'}
              placeholderTextColor={colors.secondaryText}
              value={newCommentText}
              onChangeText={setNewCommentText}
              multiline
            />
            <TouchableOpacity
              onPress={handleSubmitComment}
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
            >
              <MaterialIcons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {replyToId && (
            <TouchableOpacity
              onPress={() => setReplyToId(undefined)}
              style={styles.cancelReply}
            >
              <MaterialIcons name="close" size={16} color={colors.secondaryText} />
              <Text style={[styles.cancelReplyText, { color: colors.secondaryText }]}>
                Cancel reply
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.commentsList}>
            {topLevelComments.map(comment => renderComment(comment))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingRight: 40,
    fontSize: 14,
  },
  submitButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelReply: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  cancelReplyText: {
    fontSize: 12,
  },
  commentsList: {
    marginTop: 16,
  },
  commentContainer: {
    marginBottom: 16,
    position: 'relative',
    paddingLeft: 20,
  },
  commentContent: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  commentMain: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  responses: {
    marginTop: 12,
    paddingLeft: 20,
  },
  editContainer: {
    gap: 8,
  },
  editInput: {
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  threadLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#E0E0E0',
  },
}); 