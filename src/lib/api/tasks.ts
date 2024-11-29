import axios from 'axios';

// APIのベースURL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// タスクの型定義
export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  deadline?: Date;
  created_at: Date;
  updated_at: Date;
}

// 新規タスク作成の型定義
export interface CreateTaskInput {
  title: string;
  description: string;
  reward: number;
  deadline?: Date;
}

// タスク更新の型定義
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  reward?: number;
  status?: Task['status'];
  deadline?: Date;
}

// タスクに関するAPI呼び出しを管理するクラス
export class TasksApi {
  // タスク一覧を取得
  static async getTasks(): Promise<Task[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tasks`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      throw error;
    }
  }

  // 特定のタスクを取得
  static async getTask(taskId: string): Promise<Task> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch task ${taskId}:`, error);
      throw error;
    }
  }

  // 新規タスクを作成
  static async createTask(taskData: CreateTaskInput): Promise<Task> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/tasks`, taskData);
      return response.data;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  }

  // タスクを更新
  static async updateTask(taskId: string, taskData: UpdateTaskInput): Promise<Task> {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update task ${taskId}:`, error);
      throw error;
    }
  }

  // タスクを削除
  static async deleteTask(taskId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/api/tasks/${taskId}`);
    } catch (error) {
      console.error(`Failed to delete task ${taskId}:`, error);
      throw error;
    }
  }

  // タスクのステータスを更新
  static async updateTaskStatus(
    taskId: string, 
    status: Task['status']
  ): Promise<Task> {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/tasks/${taskId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update task status ${taskId}:`, error);
      throw error;
    }
  }
}

export default TasksApi;