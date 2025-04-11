import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import { Task, TaskStatus } from '../../types/task';
import { TaskFormModal } from './TaskFormModal';

interface TaskHeaderProps {
  task: Task;
  onBack: () => void;
  onMenuPress: () => void;
  progress: number;
  onGoToChat: () => Promise<void>;
  onEditTask: () => void;
  onDeleteTask: () => Promise<void>;
  onUpdateTask: (data: { title: string; description: string; dueDate: string; status: TaskStatus }) => Promise<void>;
}

const statusIcons = {
  'in progress': 'time-outline' as const,
  'completed': 'checkmark-circle-outline' as const,
  'expired': 'alert-circle-outline' as const,
  'closed': 'close-circle-outline' as const,
};

export const TaskHeader: React.FC<TaskHeaderProps> = ({
  task,
  onBack,
  onMenuPress,
  progress,
  onGoToChat,
  onEditTask,
  onDeleteTask,
  onUpdateTask,
}) => {
  const colorScheme = useColorScheme() || 'light';
  const colors = getColors(colorScheme);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      const updatedTask = {
        ...task,
        status: newStatus,
        lastUpdated: new Date().toISOString(),
      };
      await onUpdateTask({
        title: updatedTask.title,
        description: updatedTask.description,
        dueDate: updatedTask.dueDate,
        status: updatedTask.status,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const handleEditTask = () => {
    setShowMenu(false);
    setShowEditModal(true);
  };

  const handleDeleteTask = () => {
    setShowMenu(false);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await onDeleteTask();
      setShowDeleteConfirm(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete task');
    }
  };

  const getStatusText = (status: TaskStatus) => {
    return status === 'in progress' ? 'In Progress' :
           status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>{task.title}</Text>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setShowMenu(!showMenu)}
          >
            <MaterialIcons name="more-vert" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statusContainer}>
        <View style={[
          styles.statusButton,
          { backgroundColor: `${colors.taskStatus[task.status === 'in progress' ? 'inProgress' : task.status]}15` }
        ]}>
          <Ionicons 
            name={statusIcons[task.status]}
            size={20}
            color={colors.taskStatus[task.status === 'in progress' ? 'inProgress' : task.status]}
          />
          <Text style={[
            styles.statusText,
            { color: colors.taskStatus[task.status === 'in progress' ? 'inProgress' : task.status] }
          ]}>
            {getStatusText(task.status)}
          </Text>
        </View>
        
        <View style={[
          styles.progressContainer,
          { backgroundColor: `${colors.primary}15` }
        ]}>
          <Ionicons 
            name="pie-chart-outline"
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.progressText, { color: colors.primary }]}>
            {progress}%
          </Text>
        </View>
      </View>

      {showMenu && (
        <View style={[styles.menu, { backgroundColor: colors.cardBackground }]}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleEditTask}
          >
            <MaterialIcons name="edit" size={20} color={colors.text} />
            <Text style={[styles.menuItemText, { color: colors.text }]}>Edit Task</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleDeleteTask}
          >
            <MaterialIcons name="delete" size={20} color={colors.error} />
            <Text style={[styles.menuItemText, { color: colors.error }]}>Delete Task</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Delete Task</Text>
            <Text style={[styles.modalText, { color: colors.text }]}>
              Are you sure you want to delete this task? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={confirmDelete}
              >
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.divider }]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TaskFormModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={onUpdateTask}
        initialData={task}
        mode="edit"
        containerStyle={{
          ...styles.editModalContainer,
          backgroundColor: colors.cardBackground
        }}
        headerStyle={{
          ...styles.editModalHeader,
          borderBottomColor: colors.divider
        }}
        contentStyle={styles.editModalContent}
        overlayStyle={styles.editModalOverlay}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    flex: 1,
  },
  menuButton: {
    padding: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  menu: {
    position: 'absolute',
    top: 60,
    right: 16,
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  progressText: {
    marginLeft: 6,
    fontSize: 14,
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
    maxHeight: Platform.OS === 'ios' ? '85%' : '90%',
    width: '100%',
  },
  editModalContent: {
    padding: 16,
    flex: 1,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
});
