import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getColors } from '../../../constants/colors';
import { useColorScheme } from 'react-native';

interface CommentProps {
  comment: {
    id: string;
    text: string;
    authorId: string;
    authorName: string;
    createdAt: string;
    updatedAt: string;
    parentCommentId?: string;
    isEdited: boolean;
    subtaskId: string;
    replies?: Array<{
      id: string;
      text: string;
      authorId: string;
      authorName: string;
      createdAt: string;
      updatedAt: string;
      parentCommentId?: string;
      isEdited: boolean;
      subtaskId: string;
    }>;
  };
  onEdit: (commentId: string, text: string) => void;
  onDelete: (commentId: string) => void;
  onReply: (text: string, parentCommentId: string) => void;
}

export const Comment: React.FC<CommentProps> = ({
  comment,
  onEdit,
  onDelete,
  onReply,
}) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleEditSubmit = () => {
    onEdit(comment.id, editText);
    setIsEditing(false);
  };

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReply(replyText.trim(), comment.id);
      setReplyText('');
      setIsReplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.commentHeader}>
          <View style={styles.commentInfo}>
            <Text style={[styles.author, { color: colors.text }]}>{comment.authorName}</Text>
            <Text style={[styles.date, { color: colors.secondaryText }]}>
              {formatDate(comment.createdAt)}
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <MaterialIcons
                name={isEditing ? 'check' : 'edit'}
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setIsReplying(!isReplying)}
            >
              <MaterialIcons
                name="reply"
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onDelete(comment.id)}
            >
              <MaterialIcons
                name="delete"
                size={16}
                color={colors.taskStatus.expired}
              />
            </TouchableOpacity>
          </View>
        </View>

        {isEditing ? (
          <TextInput
            style={[
              styles.editInput,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.divider,
              },
            ]}
            value={editText}
            onChangeText={setEditText}
            multiline
            autoFocus
            onBlur={handleEditSubmit}
            placeholder="Edit comment"
            placeholderTextColor={colors.secondaryText}
          />
        ) : (
          <Text style={[styles.commentText, { color: colors.text }]}>
            {comment.text}
          </Text>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {comment.replies.map((reply) => (
              <View key={reply.id} style={styles.reply}>
                <View style={styles.replyHeader}>
                  <Text style={[styles.replyAuthor, { color: colors.text }]}>
                    {reply.authorName}
                  </Text>
                  <Text style={[styles.replyDate, { color: colors.secondaryText }]}>
                    {formatDate(reply.createdAt)}
                  </Text>
                </View>
                <Text style={[styles.replyText, { color: colors.text }]}>
                  {reply.text}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {isReplying && (
        <View style={styles.replyContainer}>
          <TextInput
            style={[
              styles.replyInput,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.divider,
              },
            ]}
            placeholder="Write a reply..."
            placeholderTextColor={colors.secondaryText}
            value={replyText}
            onChangeText={setReplyText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.replyButton,
              { backgroundColor: colors.primary },
            ]}
            onPress={handleReplySubmit}
            disabled={!replyText.trim()}
          >
            <Text style={styles.replyButtonText}>Reply</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentInfo: {
    flex: 1,
  },
  author: {
    fontSize: 14,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  editInput: {
    fontSize: 14,
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  replyContainer: {
    marginTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 8 : 0,
  },
  replyInput: {
    fontSize: 14,
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 40,
    marginBottom: 8,
  },
  replyButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  replyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  repliesContainer: {
    marginTop: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#eee',
  },
  reply: {
    marginTop: 8,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  replyAuthor: {
    fontSize: 13,
    fontWeight: '500',
    marginRight: 8,
  },
  replyDate: {
    fontSize: 12,
  },
  replyText: {
    fontSize: 13,
    lineHeight: 18,
  },
}); 