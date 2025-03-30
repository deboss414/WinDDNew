import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import { Task, TaskStatus } from '../../types/task';
import { TaskFormModal } from './TaskFormModal';

interface TaskHeaderProps {
  task: Task;
  onUpdate: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
  onGoToChat: () => void;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({
  task,
  onUpdate,
  onDelete,
  onGoToChat,
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
      await onUpdate(updatedTask);
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
      await onDelete(task.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete task');
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'expired':
        return colors.error;
      case 'closed':
        return colors.secondaryText;
      default:
        return colors.primary;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
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
        <TouchableOpacity
          style={[
            styles.statusButton,
            { backgroundColor: getStatusColor(task.status) },
          ]}
          onPress={() => {
            const statuses: TaskStatus[] = ['in progress', 'completed', 'expired', 'closed'];
            const currentIndex = statuses.indexOf(task.status);
            const nextStatus = statuses[(currentIndex + 1) % statuses.length];
            handleStatusChange(nextStatus);
          }}
        >
          <Text style={styles.statusText}>
            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </Text>
        </TouchableOpacity>
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
        onSubmit={onUpdate}
        initialData={task}
        mode="edit"
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
  title: {
    fontSize: 24,
    fontWeight: '600',
    flex: 1,
    marginRight: 16,
  },
  menuButton: {
    padding: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
});
