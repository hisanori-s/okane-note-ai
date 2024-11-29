import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSupabaseClient } from '@supabase/supabase-js';

// 欲しいものアイテムの型定義
export interface WishListItem {
  id: string;
  name: string;
  price: number;
  priority: number;
  imageUrl?: string;
  description?: string;
  targetDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// フックの戻り値の型定義
interface UseWishListReturn {
  items: WishListItem[];
  loading: boolean;
  error: Error | null;
  addItem: (item: Omit<WishListItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateItem: (id: string, item: Partial<WishListItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  reorderItems: (startIndex: number, endIndex: number) => Promise<void>;
}

const useWishList = (): UseWishListReturn => {
  const [items, setItems] = useState<WishListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = useSupabaseClient();

  // 欲しいものリストの取得
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from('wishlist')
        .select('*')
        .order('priority', { ascending: true });

      if (supabaseError) throw supabaseError;
      setItems(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch wishlist items'));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // 初期データの取得
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // アイテムの追加
  const addItem = async (newItem: Omit<WishListItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('wishlist')
        .insert([{
          ...newItem,
          priority: items.length, // 新しいアイテムは最後に追加
        }])
        .select();

      if (supabaseError) throw supabaseError;
      if (data) {
        setItems([...items, data[0]]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add wishlist item'));
      throw err;
    }
  };

  // アイテムの更新
  const updateItem = async (id: string, updatedItem: Partial<WishListItem>) => {
    try {
      const { error: supabaseError } = await supabase
        .from('wishlist')
        .update(updatedItem)
        .eq('id', id);

      if (supabaseError) throw supabaseError;
      
      setItems(items.map(item => 
        item.id === id ? { ...item, ...updatedItem } : item
      ));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update wishlist item'));
      throw err;
    }
  };

  // アイテムの削除
  const deleteItem = async (id: string) => {
    try {
      const { error: supabaseError } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', id);

      if (supabaseError) throw supabaseError;
      
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete wishlist item'));
      throw err;
    }
  };

  // アイテムの並び替え
  const reorderItems = async (startIndex: number, endIndex: number) => {
    try {
      const newItems = Array.from(items);
      const [removed] = newItems.splice(startIndex, 1);
      newItems.splice(endIndex, 0, removed);

      // 優先順位の更新
      const updates = newItems.map((item, index) => ({
        id: item.id,
        priority: index,
      }));

      const { error: supabaseError } = await supabase
        .from('wishlist')
        .upsert(updates);

      if (supabaseError) throw supabaseError;
      
      setItems(newItems);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to reorder wishlist items'));
      throw err;
    }
  };

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
  };
};

export default useWishList;