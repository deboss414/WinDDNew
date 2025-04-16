import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  TextInput,
  LayoutChangeEvent,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import { Task, SubTask } from '../../types/task';
import { TaskSubtasks } from './TaskSubtasks';

interface TaskInfoProps {
  task: Task;
  onEditPress: () => void;
  onTaskUpdate: (task: Task) => void;
  onParticipantAdd: (email: string) => Promise<void>;
  onParticipantRemove: (email: string) => Promise<void>;
}

export const TaskInfo: React.FC<TaskInfoProps> = ({ 
  task, 
  onTaskUpdate,
  onParticipantAdd,
  onParticipantRemove 
}) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newParticipant, setNewParticipant] = useState('');
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [textHeight, setTextHeight] = useState(0);
  const MAX_LINES = 3;
  const INITIAL_PARTICIPANTS_SHOWN = 3;

  const handleTextLayout = (event: LayoutChangeEvent) => {
    setTextHeight(event.nativeEvent.layout.height);
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
    onTaskUpdate({ ...task, subtasks: updatedSubtasks });
  };

  const handleSubtaskUpdate = (subtaskId: string, data: Partial<SubTask>) => {
    const updatedSubtasks = task.subtasks.map(subtask =>
      subtask.id === subtaskId ? { ...subtask, ...data } : subtask
    );
    onTaskUpdate({ ...task, subtasks: updatedSubtasks });
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
    onTaskUpdate({ ...task, subtasks: [...task.subtasks, newSubtask] });
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
    onTaskUpdate({ ...task, subtasks: updatedSubtasks as SubTask[] });
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
    onTaskUpdate({ ...task, subtasks: updatedSubtasks });
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
    onTaskUpdate({ ...task, subtasks: updatedSubtasks });
  };

  const handleAddParticipant = async () => {
    if (newParticipant.trim()) {
      const email = newParticipant.trim();
      if (task.participants.some(p => p.email === email)) {
        setErrorMessage('Participant already added');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      try {
        await onParticipantAdd(email);
        setNewParticipant('');
      } catch (error) {
        setErrorMessage('Failed to add participant');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    }
  };

  const handleRemoveParticipant = async (email: string) => {
    await onParticipantRemove(email);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Description Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
        <Text 
          style={[styles.description, { color: colors.text }]}
          numberOfLines={isExpanded ? undefined : MAX_LINES}
          onLayout={handleTextLayout}
        >
          {task.description || 'No description provided'}
        </Text>
        {task.description && textHeight > 0 && (
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
            <Text style={[styles.readMore, { color: colors.primary }]}>
              {isExpanded ? 'Show Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Date and Creator Section */}
      <View style={styles.section}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialIcons name="calendar-today" size={20} color={colors.text} />
            <View>
              <Text style={[styles.infoText, { color: colors.text }]}>
                {formatDate(task.dueDate)}
              </Text>
              <Text style={[styles.labelText, { color: colors.secondaryText }]}>
                due date
              </Text>
            </View>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="person" size={20} color={colors.text} />
            <View>
              <Text style={[styles.infoText, { color: colors.text }]}>
                {task.participants.find(p => p.email === task.createdBy)?.displayName || task.createdBy}
              </Text>
              <Text style={[styles.labelText, { color: colors.secondaryText }]}>
                admin
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Participants Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Participants</Text>
        {errorMessage ? (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {errorMessage}
          </Text>
        ) : null}
        <View style={styles.participantsList}>
          {task.participants
            .slice(0, showAllParticipants ? undefined : INITIAL_PARTICIPANTS_SHOWN)
            .map((participant, index) => (
              <View key={index} style={styles.participantItem}>
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarText}>
                    {participant.displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.participantInfo}>
                  <Text style={[styles.participantText, { color: colors.text }]}>
                    {participant.displayName}
                  </Text>
                  <Text style={[styles.participantEmail, { color: colors.secondaryText }]}>
                    {participant.email}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => handleRemoveParticipant(participant.email)}
                  style={styles.removeButton}
                >
                  <MaterialIcons name="close" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
        </View>
        {task.participants.length > INITIAL_PARTICIPANTS_SHOWN && (
          <TouchableOpacity 
            onPress={() => setShowAllParticipants(!showAllParticipants)}
            style={styles.showAllButton}
          >
            <Text style={[styles.showAllText, { color: colors.primary }]}>
              {showAllParticipants ? 'Show Less' : `Show All (${task.participants.length})`}
            </Text>
          </TouchableOpacity>
        )}
        <View style={styles.addParticipantContainer}>
          <TextInput
            style={[styles.input, { 
              color: colors.text,
              borderColor: colors.secondaryText,
              backgroundColor: colors.background
            }]}
            placeholder="Add participant email"
            placeholderTextColor={colors.secondaryText}
            value={newParticipant}
            onChangeText={setNewParticipant}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleAddParticipant}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Subtasks Section */}
      {/* <View style={styles.section}>
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
      </View> */}
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
    marginTop: 8,
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
  readMore: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    marginLeft: 8,
  },
  labelText: {
    fontSize: 12,
    marginLeft: 8,
    marginTop: 2,
  },
  participantsList: {
    marginTop: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  participantInfo: {
    flex: 1,
  },
  participantText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  participantEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  addParticipantContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  addButton: {
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  showAllButton: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  showAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
  },
});
