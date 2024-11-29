import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSupabaseClient } from '@supabase/supabase-js';

interface Balance {
  amount: number;
  lastUpdated: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  createdAt: string;
}

interface UseBalanceReturn {
  balance: Balance | null;
  isLoading: boolean;
  error: Error | null;
  transactions: Transaction[];
  updateBalance: (amount: number, type: 'income' | 'expense') => Promise<void>;
  refreshBalance: () => Promise<void>;
  isUpdating: boolean;
}

const useBalance = (userId: string): UseBalanceReturn => {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const supabase = useSupabaseClient();

  // 残高を取得する関数
  const fetchBalance = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/balance/${userId}`
      );
      setBalance(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch balance'));
    }
  }, [userId]);

  // 取引履歴を取得する関数
  const fetchTransactions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch transactions'));
    }
  }, [userId, supabase]);

  // 初期データの取得
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchBalance(), fetchTransactions()]);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      initialize();
    }
  }, [userId, fetchBalance, fetchTransactions]);

  // 残高を更新する関数
  const updateBalance = async (amount: number, type: 'income' | 'expense') => {
    setIsUpdating(true);
    try {
      const newAmount = type === 'income' ? amount : -amount;
      
      // 残高の更新
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/balance/${userId}/update`, {
        amount: newAmount,
        type
      });

      // トランザクションの記録
      await supabase.from('transactions').insert({
        user_id: userId,
        amount: newAmount,
        type,
        description: `${type} transaction`,
        created_at: new Date().toISOString()
      });

      // データの再取得
      await Promise.all([fetchBalance(), fetchTransactions()]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update balance'));
    } finally {
      setIsUpdating(false);
    }
  };

  // 残高を再取得する関数
  const refreshBalance = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchBalance(), fetchTransactions()]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh balance'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    balance,
    isLoading,
    error,
    transactions,
    updateBalance,
    refreshBalance,
    isUpdating
  };
};

export default useBalance;