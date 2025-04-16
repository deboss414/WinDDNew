import { Comment } from './comment.types';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  createdBy: string;
  createdAt: string;
  lastUpdated: string;
  participants: Participant[];
  subtasks: SubTask[];
  progress?: number;
}

export interface SubTask {
  id: string;
  title: string;
  description?: string;
  assignee: string[];
  progress: number;
  dueDate: string;
  createdBy: string;
  createdAt: string;
  lastUpdated: string;
  comments: Comment[];
}

export interface Participant {
  email: string;
  displayName: string;
}

export type TaskStatus = 'in progress' | 'completed' | 'expired' | 'closed';

export interface TaskResponse {
  task: Task;
}

export interface TasksResponse {
  tasks: Task[];
} 