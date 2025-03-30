export interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
  parentCommentId?: string;
  isEdited: boolean;
  subtaskId: string;
}

export interface CommentFormData {
  text: string;
  parentCommentId?: string;
  subtaskId: string;
} 