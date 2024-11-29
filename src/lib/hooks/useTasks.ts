import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// タスクの型定義
export interface Task {
  id: string;
  title: string;
  description?: string;
  reward: number;
  status: 'pending' | 'completed' | 'cancelled';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// フックの戻り値の型定義
interface UseTasksReturn {
  tasks: Task[];
  isLoading: boolean;
  error: Error | null;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  fetchTasks: () => Promise<void>;
}

// API のベース URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const useTasks = (): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // タスク一覧を取得する関数
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tasks`);
      setTasks(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tasks'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // タスクを作成する関数
  const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/tasks`, task);
      setTasks(prevTasks => [...prevTasks, response.data]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create task'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // タスクを更新する関数
  const updateTask = async (id: string, task: Partial<Task>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${API_BASE_URL}/api/tasks/${id}`, task);
      setTasks(prevTasks =>
        prevTasks.map(t => (t.id === id ? { ...t, ...response.data } : t))
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update task'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // タスクを削除する関数
  const deleteTask = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_BASE_URL}/api/tasks/${id}`);
      setTasks(prevTasks => prevTasks.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete task'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // コンポーネントマウント時にタスク一覧を取得
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    fetchTasks,
  };
};

export default useTasks;
const TaskComponent = () => {
  const { tasks, isLoading, error, createTask, updateTask, deleteTask } = useTasks();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>Reward: {task.reward}</p>
          <button onClick={() => updateTask(task.id, { status: 'completed' })}>
            Complete
          </button>
          <button onClick={() => deleteTask(task.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};