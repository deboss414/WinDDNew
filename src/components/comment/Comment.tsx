import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { getColors } from '../../constants/colors';
import { useColorScheme } from 'react-native';
import { CommentContent } from './CommentContent';
import { CommentActions } from './CommentActions';
import { CommentInput } from './CommentInput';

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
  const [isReplying, setIsReplying] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleEditSubmit = (text: string) => {
    onEdit(comment.id, text);
    setIsEditing(false);
  };

  const handleReplySubmit = (text: string) => {
    onReply(text, comment.id);
    setIsReplying(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
      {isEditing ? (
        <CommentInput
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditing(false)}
          initialText={comment.text}
          showCancel={true}
        />
      ) : (
        <>
          <View style={styles.contentContainer}>
            <CommentContent
              authorName={comment.authorName}
              createdAt={comment.createdAt}
              text={comment.text}
              isEdited={comment.isEdited}
            />
            <CommentActions
              onEdit={handleEdit}
              onDelete={() => onDelete(comment.id)}
              onReply={() => setIsReplying(true)}
              isEditing={isEditing}
            />
          </View>
          {isReplying && (
            <View style={styles.replyContainer}>
              <CommentInput
                onSubmit={handleReplySubmit}
                onCancel={() => setIsReplying(false)}
                placeholder="Write a reply..."
                showCancel={true}
              />
            </View>
          )}
          {comment.replies && comment.replies.length > 0 && (
            <View style={styles.repliesContainer}>
              {comment.replies.map((reply) => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReply={onReply}
                />
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  replyContainer: {
    marginTop: 8,
    marginLeft: 8,
  },
  repliesContainer: {
    marginTop: 8,
    marginLeft: 8,
  },
}); 