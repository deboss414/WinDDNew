import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
  ActivityIndicator,
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
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
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
  onRefresh,
  isLoading = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme as 'light' | 'dark');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  const renderSubTask = useCallback(({ item, index }: { item: SubTask; index: number }) => (
    <View style={styles.subtaskContainer}>
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
      {index < subtasks.length - 1 && (
        <View style={[styles.divider, { backgroundColor: colors.text }]} />
      )}
    </View>
  ), [onSubTaskPress, onProgressChange, canEditProgress, onAddComment, onEditComment, onDeleteComment, participants, subtasks.length, colors.text]);

  const keyExtractor = useCallback((item: SubTask) => item.id, []);

  const listContentContainerStyle = useMemo(() => ({
    ...styles.list,
    paddingBottom: 24,
    flexGrow: subtasks.length === 0 ? 1 : 0,
  }), [subtasks.length]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="list-outline" size={32} color={colors.secondaryText} />
      </View>
      <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
        No subtasks yet
      </Text>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={onAddSubTask}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add Subtask</Text>
      </TouchableOpacity>
    </View>
  ), [colors.primary, colors.secondaryText, colors.background, onAddSubTask]);

  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text }]}>Subtasks</Text>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={onAddSubTask}
      >
        <Ionicons name="add" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  ), [colors.primary, colors.text, onAddSubTask]);

  const renderFooter = useCallback(() => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }, [isLoading, colors.primary]);

  return (
    <View style={styles.container}>
      <FlatList
        data={subtasks}
        renderItem={renderSubTask}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={listContentContainerStyle}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        extraData={subtasks.length}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          ) : undefined
        }
        removeClippedSubviews={false}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={10}
        onEndReachedThreshold={0.5}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
      />
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
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  list: {
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    gap: 24,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  subtaskContainer: {
    marginBottom: 16,
  },
  divider: {
    height: 1,
    marginTop: 16,
    opacity: 0.1,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
}); 