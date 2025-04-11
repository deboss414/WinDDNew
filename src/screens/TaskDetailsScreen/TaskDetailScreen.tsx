import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Modal,
  TextInput,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  FlatList,
  RefreshControl,
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getColors } from '../../constants/colors';
import { fetchTaskDetails, updateSubTaskProgress, createSubTask, deleteSubTask, updateSubTask } from '../../api/taskApi';
import { SubTask } from '../../components/task/SubTask';
import { SubTaskFormModal } from '../../components/task/SubTaskFormModal';
import * as taskApi from '../../api/taskApi';
import { userApi } from '../../api/userApi';
import { TaskStatus, Task } from '../../types/task';
import { StackNavigationProp } from '@react-navigation/stack';
import { chatApi } from '../../api/chatApi';
import { TaskHeader } from '../../components/task/TaskHeader';
import { TaskInfo } from '../../components/task/TaskInfo';
import { TaskSubtasks } from '../../components/task/TaskSubtasks';
import { Comment } from './components/Comment';
import { SubTaskList } from '../../components/task/SubTaskList';

type RootStackParamList = {
  TaskDetail: { taskId: string };
  Chatroom: { conversationId: string; taskId: string; taskTitle: string };
};

type TaskDetailScreenRouteProp = RouteProp<RootStackParamList, 'TaskDetail'>;
type TaskDetailScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Props {
  route: TaskDetailScreenRouteProp;
}

type TaskDetails = Task;

export const TaskDetailScreen: React.FC<Props> = ({ route }) => {
  const { taskId } = route.params;
  const navigation = useNavigation<TaskDetailScreenNavigationProp>();
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme || 'light');
  const [task, setTask] = useState<TaskDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubTaskModalVisible, setIsSubTaskModalVisible] = useState(false);
  const [isCreatingSubTask, setIsCreatingSubTask] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const isDark = colorScheme === 'dark';
  const [participantEmail, setParticipantEmail] = useState('');
  const [participantError, setParticipantError] = useState<string | null>(null);
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [showSubTaskModal, setShowSubTaskModal] = useState(false);
  const [editingSubTask, setEditingSubTask] = useState<SubTask | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    dueDate: new Date(),
    status: 'in progress' as TaskStatus,
  });
  const [refreshing, setRefreshing] = useState(false);

  // Add navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
      header: () => null,
    });
  }, [navigation]);

  const loadTaskDetails = async () => {
    try {
      setLoading(true);
      const taskDetails = await fetchTaskDetails(taskId);
      setTask(taskDetails);
    } catch (err) {
      setError('Failed to load task details');
      Alert.alert('Error', 'Failed to load task details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaskDetails();
  }, [taskId]);

  const calculateTaskProgress = (subtasks: SubTask[]): number => {
    if (!subtasks || subtasks.length === 0) return 0;
    const totalProgress = subtasks.reduce((sum, subtask) => sum + (subtask.progress || 0), 0);
    return Math.round(totalProgress / subtasks.length);
  };

  const handleSubTaskProgressChange = async (subtaskId: string, progress: number) => {
    try {
      const updatedSubTask = await updateSubTaskProgress(taskId, subtaskId, progress);
      setTask((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          subtasks: prev.subtasks.map((st) =>
            st.id === subtaskId ? updatedSubTask : st
          ),
        };
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to update subtask progress. Please try again.');
    }
  };

  const handleUpdateSubTask = async (subtaskId: string, data: Partial<SubTask>) => {
    try {
      const updatedSubTask = await updateSubTask(taskId, subtaskId, data);
      setTask((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          subtasks: prev.subtasks.map((st) =>
            st.id === subtaskId ? updatedSubTask : st
          ),
        };
      });
    } catch (error) {
      console.error('Error updating subtask:', error);
      Alert.alert('Error', 'Failed to update subtask');
    }
  };

  const handleSubTaskSubmit = async (data: Omit<SubTask, 'id' | 'createdAt' | 'lastUpdated' | 'comments' | 'createdBy'>) => {
    try {
      setIsCreatingSubTask(true);
      const newSubTask = await taskApi.createSubTask(taskId, data);
      
      // Update the task state with the new subtask
      setTask(prev => {
        if (!prev) return null;
        return {
          ...prev,
          subtasks: [...(prev.subtasks as SubTask[]), newSubTask]
        } as Task;
      });
      
      setIsSubTaskModalVisible(false);
    } catch (error) {
      console.error('Error creating subtask:', error);
      Alert.alert('Error', 'Failed to create subtask');
    } finally {
      setIsCreatingSubTask(false);
    }
  };

  const handleAddComment = async (subtaskId: string, text: string, parentCommentId?: string) => {
    if (!task) return;

    // Create optimistic comment
    const optimisticComment = {
      id: `${subtaskId}-comment-${Date.now()}`,
      text,
      authorId: 'current-user', // Replace with actual user ID
      authorName: 'Current User', // Replace with actual user name
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentCommentId,
      isEdited: false,
      subtaskId,
    };

    // Update local state immediately
    setTask(prev => {
      if (!prev) return null;
      return {
        ...prev,
        subtasks: prev.subtasks.map(subtask => 
          subtask.id === subtaskId
            ? {
                ...subtask,
                comments: [...(subtask.comments || []), optimisticComment]
              }
            : subtask
        )
      } as TaskDetails;
    });

    try {
      // Send to backend
      const updatedTask = await taskApi.addComment(taskId, subtaskId, text, parentCommentId);
      setTask(updatedTask);
    } catch (error) {
      // Revert optimistic update on error
      setTask(prev => {
        if (!prev) return null;
        return {
          ...prev,
          subtasks: prev.subtasks.map(subtask => 
            subtask.id === subtaskId
              ? {
                  ...subtask,
                  comments: subtask.comments.filter(comment => comment.id !== optimisticComment.id)
                }
              : subtask
          )
        } as TaskDetails;
      });
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const handleEditComment = async (subtaskId: string, commentId: string, text: string) => {
    try {
      const updatedTask = await taskApi.editComment(taskId, subtaskId, commentId, text);
      setTask(updatedTask);
    } catch (error) {
      Alert.alert('Error', 'Failed to edit comment');
    }
  };

  const handleDeleteComment = async (subtaskId: string, commentId: string) => {
    try {
      const updatedTask = await taskApi.deleteComment(taskId, subtaskId, commentId);
      setTask(updatedTask);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete comment');
    }
  };

  const handleEditTask = () => {
    setShowMenu(false);
    setIsEditing(true);
  };

  const handleDeleteTask = async () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSubTask(taskId, taskId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
    setShowMenu(false);
  };

  const handleUpdateTask = async (data: { title: string; description: string; dueDate: string; status: TaskStatus }) => {
    try {
      if (!task) return;
      
      const response = await taskApi.updateTask(taskId, {
        ...data,
        participants: task.participants,
        subtasks: task.subtasks,
      });
      setTask(response.task);
      setShowEditModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update task. Please try again.');
    }
  };

  const handleTaskInfoUpdate = async (data: { title: string; description: string; dueDate: string; status: TaskStatus }) => {
    try {
      if (!task) return;
      
      const response = await taskApi.updateTask(taskId, {
        ...data,
        participants: task.participants,
        subtasks: task.subtasks,
      });
      setTask(response.task);
    } catch (error) {
      Alert.alert('Error', 'Failed to update task. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate && task) {
      selectedDate.setHours(0, 0, 0, 0);
      setSelectedDate(selectedDate);
      setTask({
        ...task,
        dueDate: selectedDate.toISOString(),
      });
    }
  };

  const handleAddParticipant = async () => {
    if (!participantEmail.trim()) {
      setParticipantError('Please enter an email address');
      return;
    }

    if (!participantEmail.includes('@')) {
      setParticipantError('Please enter a valid email address');
      return;
    }

    if (task?.participants.some(p => p.email === participantEmail)) {
      setParticipantError('This participant is already added');
      return;
    }

    try {
      setIsAddingParticipant(true);
      setParticipantError(null);
      
      const user = await userApi.lookupUserByEmail(participantEmail);
      if (!user) {
        setParticipantError('User not found');
        return;
      }

      const displayName = `${user.user.first_name} ${user.user.last_name}`;
      setTask(prev => {
        if (!prev) return null;
        return {
          ...prev,
          participants: [...prev.participants, { email: participantEmail, displayName }]
        };
      });
      
      setParticipantEmail('');
    } catch (error) {
      setParticipantError('Failed to add participant');
    } finally {
      setIsAddingParticipant(false);
    }
  };

  const handleRemoveParticipant = (participantToRemove: { email: string; displayName: string }) => {
    setTask(prev => {
      if (!prev) return null;
      return {
        ...prev,
        participants: prev.participants.filter(p => p.email !== participantToRemove.email)
      };
    });
  };

  const handleGoToChat = async () => {
    if (!task) return;
    
    try {
      setShowMenu(false);
      // Create or get existing conversation for this task
      const conversation = await chatApi.getOrCreateConversation(
        taskId,
        task.title,
        task.participants.map(p => ({
          id: p.email,
          name: p.displayName,
          email: p.email,
          role: 'member' as const
        }))
      );
      
      // Navigate to the chatroom with the conversation ID
      navigation.navigate('Chatroom', {
        conversationId: conversation.id,
        taskId: taskId,
        taskTitle: task.title
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to create chatroom. Please try again.');
    }
  };

  const handleParticipantAdd = async (email: string) => {
    if (!task) return;
    
    try {
      const userResponse = await userApi.lookupUserByEmail(email);
      if (!userResponse.user) {
        throw new Error('User not found');
      }

      const displayName = `${userResponse.user.first_name} ${userResponse.user.last_name}`;
      const response = await taskApi.updateTask(taskId, {
        ...task,
        participants: [...task.participants, { email, displayName }]
      });
      
      setTask(response.task);
    } catch (error) {
      throw error;
    }
  };

  const handleParticipantRemove = async (email: string) => {
    if (!task) return;
    
    try {
      const response = await taskApi.updateTask(taskId, {
        ...task,
        participants: task.participants.filter(p => p.email !== email)
      });
      
      setTask(response.task);
    } catch (error) {
      Alert.alert('Error', 'Failed to remove participant');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTaskDetails();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !task) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>{error || 'Task not found'}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 140 : 50}
    >
      <TaskHeader
        task={task}
        onBack={() => navigation.goBack()}
        onMenuPress={() => setShowMenu(true)}
        progress={calculateTaskProgress(task.subtasks)}
        onGoToChat={handleGoToChat}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onUpdateTask={handleUpdateTask}
      />

      <FlatList
        data={[1]} // Single item to render the content
        renderItem={({ index }) => (
          <View key={`task-details-${index}`}>
            <TaskInfo
              task={task}
              onEditPress={() => setIsEditing(true)}
              onTaskUpdate={handleTaskInfoUpdate}
              onParticipantAdd={handleParticipantAdd}
              onParticipantRemove={handleParticipantRemove}
            />

            {/* Subtasks Section */}
            <View style={styles.section}>
              <SubTaskList
                subtasks={task.subtasks}
                onSubTaskPress={(subtask) => {
                  console.log('Subtask pressed:', subtask);
                }}
                onProgressChange={handleSubTaskProgressChange}
                canEditProgress={(subtask) => true}
                onAddSubTask={() => setShowSubTaskModal(true)}
                onAddComment={handleAddComment}
                onEditComment={handleEditComment}
                onDeleteComment={handleDeleteComment}
                participants={task.participants.map(p => p.email)}
                onRefresh={loadTaskDetails}
                isLoading={loading}
              />
            </View>
          </View>
        )}
        keyExtractor={(_, index) => `task-details-${index}`}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />

      <SubTaskFormModal
        visible={showSubTaskModal}
        onClose={() => setShowSubTaskModal(false)}
        onSubmit={handleSubTaskSubmit}
        participants={task.participants.map(p => p.displayName)}
        isSubmitting={isCreatingSubTask}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  progressText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    padding: 16,
    lineHeight: 24,
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionText: {
    marginLeft: 8,
    fontSize: 16,
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  participantText: {
    marginLeft: 4,
    fontSize: 14,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  editModalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  editModalContent: {
    padding: 16,
    maxHeight: Platform.OS === 'ios' ? '70%' : '80%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  dateInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  datePickerContainer: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    padding: Platform.OS === 'ios' ? 10 : 0,
  },
  datePicker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 200 : undefined,
  },
  inputText: {
    fontSize: 16,
  },
  editModalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  characterCount: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  participantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  participantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  participantChipText: {
    fontSize: 14,
    marginRight: 8,
  },
  removeParticipantButton: {
    padding: 2,
  },
  addParticipantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addParticipantButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantErrorText: {
    fontSize: 12,
    marginTop: 4,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 16,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  dropdownContent: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  dropdownItemText: {
    fontSize: 16,
  },
}); 