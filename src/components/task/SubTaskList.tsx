import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from '../../constants/colors';
import { SubTask, SubTaskCard } from './SubTask';

interface SubTaskListProps {
  subtasks: SubTask[];
  onSubTaskPress?: (subtask: SubTask) => void;
  onProgressChange?: (subtaskId: string, progress: number) => void;
  canEditProgress: (subtask: SubTask) => boolean;
  onAddSubTask: () => void;
  onAddComment: (subtaskId: string, text: string, parentCommentId?: string) => void;
  onEditComment: (subtaskId: string, commentId: string, text: string) => void;
  onDeleteComment: (subtaskId: string, commentId: string) => void;
  participants: string[];
}

export const SubTaskList: React.FC<SubTaskListProps> = ({
  subtasks,
  onSubTaskPress,
  onProgressChange,
  canEditProgress,
  onAddSubTask,
  onAddComment,
  onEditComment,
  onDeleteComment,
  participants,
}) => {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme);

  const renderSubTask = ({ item }: { item: SubTask }) => (
    <SubTaskCard
      subtask={item}
      onPress={() => onSubTaskPress?.(item)}
      onProgressChange={(progress) => onProgressChange?.(item.id, progress)}
      canEditProgress={canEditProgress(item)}
      onAddComment={onAddComment}
      onEditComment={onEditComment}
      onDeleteComment={onDeleteComment}
      onUpdateSubTask={(subtaskId, data) => onProgressChange?.(subtaskId, data.progress)}
      participants={participants}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Subtasks</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={onAddSubTask}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {subtasks.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="list-outline" size={48} color={colors.secondaryText} />
          <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
            No subtasks yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={subtasks}
          renderItem={renderSubTask}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
  },
}); 