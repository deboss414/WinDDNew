export const taskApi = {
  updateSubTask: async (taskId: string, subtaskId: string, data: Omit<SubTask, 'id' | 'createdAt' | 'lastUpdated' | 'createdBy' | 'comments'>): Promise<Task> => {
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate a delay and update the mock data
      await new Promise(resolve => setTimeout(resolve, 500));

      const task = mockTasks.find(t => t.id === taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      const subtaskIndex = task.subtasks.findIndex(s => s.id === subtaskId);
      if (subtaskIndex === -1) {
        throw new Error('Subtask not found');
      }

      const updatedSubtask: SubTask = {
        ...task.subtasks[subtaskIndex],
        ...data,
        lastUpdated: new Date().toISOString(),
      };

      task.subtasks[subtaskIndex] = updatedSubtask;
      task.lastUpdated = new Date().toISOString();

      return task;
    } catch (error) {
      console.error('Error updating subtask:', error);
      throw error;
    }
  },

  createSubTask: async (taskId: string, data: Omit<SubTask, 'id' | 'createdAt' | 'lastUpdated' | 'comments'>): Promise<Task> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const task = mockTasks.find(t => t.id === taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      const newSubtask: SubTask = {
        ...data,
        id: `${taskId}-${Date.now()}`,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        createdBy: 'Current User',
        comments: [],
      };

      task.subtasks.push(newSubtask);
      task.lastUpdated = new Date().toISOString();

      return task;
    } catch (error) {
      console.error('Error creating subtask:', error);
      throw error;
    }
  },
}; 