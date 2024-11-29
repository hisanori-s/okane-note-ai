import axios from 'axios';

// APIのベースURLを環境変数から取得
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// 残高情報の型定義
export interface Balance {
  currentBalance: number;
  savingsBalance: number;
  lastUpdated: string;
}

// 取引履歴の型定義
export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
}

// 残高情報を取得するAPI
export const getBalance = async (): Promise<Balance> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/balance`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    throw error;
  }
};

// 取引履歴を取得するAPI
export const getTransactions = async (
  page: number = 1,
  limit: number = 10
): Promise<{ transactions: Transaction[]; total: number }> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/balance/transactions`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    throw error;
  }
};

// 新しい取引を追加するAPI
export const addTransaction = async (
  transaction: Omit<Transaction, 'id' | 'date'>
): Promise<Transaction> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/balance/transactions`,
      transaction
    );
    return response.data;
  } catch (error) {
    console.error('Failed to add transaction:', error);
    throw error;
  }
};

// 残高目標を設定するAPI
export const setSavingsGoal = async (
  amount: number
): Promise<{ success: boolean }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/balance/goal`, {
      amount,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to set savings goal:', error);
    throw error;
  }
};

// 残高アラートを設定するAPI
export const setBalanceAlert = async (
  threshold: number,
  enabled: boolean
): Promise<{ success: boolean }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/balance/alert`, {
      threshold,
      enabled,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to set balance alert:', error);
    throw error;
  }
};

// エラーハンドリングのユーティリティ関数
export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || 'An error occurred with the API';
  }
  return 'An unexpected error occurred';
};