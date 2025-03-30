import { Task, SubTask } from '../types/task';

// Mock data
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Project Planning',
    description: 'Create a detailed project plan including timeline, resources, and milestones.',
    status: 'in progress',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    createdBy: 'user@example.com',
    participants: [
      { email: 'user@example.com', displayName: 'John Doe' },
      { email: 'colleague@example.com', displayName: 'Jane Smith' }
    ],
    subtasks: [
      {
        id: '1-1',
        title: 'Research Requirements',
        description: 'Research and document project requirements',
        status: 'completed',
        progress: 100,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        createdBy: 'user@example.com',
        comments: [
          {
            id: '1-1-1',
            text: 'Requirements research completed',
            createdAt: new Date().toISOString(),
            createdBy: 'user@example.com'
          }
        ]
      },
      {
        id: '1-2',
        title: 'Create Timeline',
        description: 'Develop project timeline with milestones',
        status: 'in progress',
        progress: 60,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        createdBy: 'user@example.com',
        comments: []
      }
    ]
  },
  {
    id: '2',
    title: 'Design System',
    description: 'Design the system architecture and user interface',
    status: 'pending',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    createdBy: 'user@example.com',
    participants: [
      { email: 'user@example.com', displayName: 'John Doe' },
      { email: 'designer@example.com', displayName: 'Alice Johnson' }
    ],
    subtasks: [
      {
        id: '2-1',
        title: 'UI Design',
        description: 'Create user interface designs',
        status: 'pending',
        progress: 0,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        createdBy: 'user@example.com',
        comments: []
      }
    ]
  }
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface TaskResponse {
  task: Task;
}

interface TasksResponse {
  tasks: Task[];
}

export const taskApi = {
  // Get all tasks
  getTasks: async (): Promise<TasksResponse> => {
    try {
      await delay(500); // Simulate network delay
      return { tasks: mockTasks };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  // Get a single task by ID
  getTask: async (taskId: string): Promise<TaskResponse> => {
    try {
      await delay(300);
      const task = mockTasks.find(t => t.id === taskId);
      if (!task) {
        throw new Error('Task not found');
      }
      return { task };
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  },

  // Create a new task
  createTask: async (task: Omit<Task, 'id' | 'createdAt' | 'lastUpdated'>): Promise<TaskResponse> => {
    try {
      await delay(500);
      const newTask: Task = {
        ...task,
        id: `${mockTasks.length + 1}`,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
      mockTasks.push(newTask);
      return { task: newTask };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Update a task
  updateTask: async (taskId: string, updates: Partial<Task>): Promise<TaskResponse> => {
    try {
      await delay(500);
      const taskIndex = mockTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }
      const updatedTask = {
        ...mockTasks[taskIndex],
        ...updates,
        lastUpdated: new Date().toISOString(),
      };
      mockTasks[taskIndex] = updatedTask;
      return { task: updatedTask };
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Delete a task
  deleteTask: async (taskId: string): Promise<void> => {
    try {
      await delay(500);
      const taskIndex = mockTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }
      mockTasks.splice(taskIndex, 1);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Update task status
  updateTaskStatus: async (taskId: string, status: Task['status']): Promise<TaskResponse> => {
    try {
      await delay(500);
      const taskIndex = mockTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }
      const updatedTask = {
        ...mockTasks[taskIndex],
        status,
        lastUpdated: new Date().toISOString(),
      };
      mockTasks[taskIndex] = updatedTask;
      return { task: updatedTask };
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  },

  // Add a subtask
  addSubtask: async (taskId: string, subtask: Omit<SubTask, 'id' | 'createdAt' | 'lastUpdated' | 'comments' | 'createdBy'>): Promise<TaskResponse> => {
    try {
      await delay(500);
      const taskIndex = mockTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }
      const newSubtask: SubTask = {
        ...subtask,
        id: `${taskId}-${mockTasks[taskIndex].subtasks.length + 1}`,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        createdBy: 'user@example.com',
        comments: [],
      };
      mockTasks[taskIndex].subtasks.push(newSubtask);
      return { task: mockTasks[taskIndex] };
    } catch (error) {
      console.error('Error adding subtask:', error);
      throw error;
    }
  },

  // Update a subtask
  updateSubtask: async (taskId: string, subtaskId: string, updates: Partial<SubTask>): Promise<TaskResponse> => {
    try {
      await delay(500);
      const taskIndex = mockTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }
      const subtaskIndex = mockTasks[taskIndex].subtasks.findIndex(st => st.id === subtaskId);
      if (subtaskIndex === -1) {
        throw new Error('Subtask not found');
      }
      const updatedSubtask = {
        ...mockTasks[taskIndex].subtasks[subtaskIndex],
        ...updates,
        lastUpdated: new Date().toISOString(),
      };
      mockTasks[taskIndex].subtasks[subtaskIndex] = updatedSubtask;
      return { task: mockTasks[taskIndex] };
    } catch (error) {
      console.error('Error updating subtask:', error);
      throw error;
    }
  },

  // Delete a subtask
  deleteSubtask: async (taskId: string, subtaskId: string): Promise<TaskResponse> => {
    try {
      await delay(500);
      const taskIndex = mockTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }
      const subtaskIndex = mockTasks[taskIndex].subtasks.findIndex(st => st.id === subtaskId);
      if (subtaskIndex === -1) {
        throw new Error('Subtask not found');
      }
      mockTasks[taskIndex].subtasks.splice(subtaskIndex, 1);
      return { task: mockTasks[taskIndex] };
    } catch (error) {
      console.error('Error deleting subtask:', error);
      throw error;
    }
  },

  // Update subtask progress
  updateSubtaskProgress: async (taskId: string, subtaskId: string, progress: number): Promise<TaskResponse> => {
    try {
      await delay(500);
      const taskIndex = mockTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }
      const subtaskIndex = mockTasks[taskIndex].subtasks.findIndex(st => st.id === subtaskId);
      if (subtaskIndex === -1) {
        throw new Error('Subtask not found');
      }
      const updatedSubtask = {
        ...mockTasks[taskIndex].subtasks[subtaskIndex],
        progress,
        lastUpdated: new Date().toISOString(),
      };
      mockTasks[taskIndex].subtasks[subtaskIndex] = updatedSubtask;
      return { task: mockTasks[taskIndex] };
    } catch (error) {
      console.error('Error updating subtask progress:', error);
      throw error;
    }
  },
};

// Add missing exports that are referenced in TaskDetailScreen.tsx
export const fetchTaskDetails = async (taskId: string): Promise<Task> => {
  try {
    const response = await taskApi.getTask(taskId);
    return response.task;
  } catch (error) {
    console.error('Error fetching task details:', error);
    throw error;
  }
};

export const updateSubTaskProgress = async (taskId: string, subtaskId: string, progress: number): Promise<SubTask> => {
  try {
    const response = await taskApi.updateSubtaskProgress(taskId, subtaskId, progress);
    return response.task.subtasks.find(st => st.id === subtaskId) || response.task.subtasks[0];
  } catch (error) {
    console.error('Error updating subtask progress:', error);
    throw error;
  }
};

export const createSubTask = async (taskId: string, subtask: Omit<SubTask, 'id' | 'createdAt' | 'lastUpdated' | 'comments' | 'createdBy'>): Promise<Task> => {
  try {
    const response = await taskApi.addSubtask(taskId, subtask);
    return response.task;
  } catch (error) {
    console.error('Error creating subtask:', error);
    throw error;
  }
};

export const deleteSubTask = async (taskId: string, subtaskId: string): Promise<void> => {
  try {
    await taskApi.deleteSubtask(taskId, subtaskId);
  } catch (error) {
    console.error('Error deleting subtask:', error);
    throw error;
  }
};

export const updateSubTask = async (taskId: string, subtaskId: string, updates: Partial<SubTask>): Promise<SubTask> => {
  try {
    const response = await taskApi.updateSubtask(taskId, subtaskId, updates);
    return response.task.subtasks.find(st => st.id === subtaskId) || response.task.subtasks[0];
  } catch (error) {
    console.error('Error updating subtask:', error);
    throw error;
  }
};

// Add comment-related functions
export const addComment = async (taskId: string, subtaskId: string, text: string, parentCommentId?: string): Promise<Task> => {
  try {
    // TODO: Replace with actual API call
    const response = await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, parentCommentId }),
    });
    if (!response.ok) {
      throw new Error('Failed to add comment');
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const editComment = async (taskId: string, subtaskId: string, commentId: string, text: string): Promise<Task> => {
  try {
    // TODO: Replace with actual API call
    const response = await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      throw new Error('Failed to edit comment');
    }
    return await response.json();
  } catch (error) {
    console.error('Error editing comment:', error);
    throw error;
  }
};

export const deleteComment = async (taskId: string, subtaskId: string, commentId: string): Promise<Task> => {
  try {
    // TODO: Replace with actual API call
    const response = await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}/comments/${commentId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};
