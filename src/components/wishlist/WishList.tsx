import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import WishlistItem from './WishlistItem';
import { useSupabaseClient } from '@supabase/supabase-js';

interface WishListItem {
  id: string;
  title: string;
  price: number;
  priority: number;
  imageUrl?: string;
  description?: string;
  targetDate?: Date;
}

const WishList: React.FC = () => {
  const [items, setItems] = useState<WishListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabaseClient();

  // 欲しいものリストの取得
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('wishlist')
          .select('*')
          .order('priority', { ascending: true });

        if (error) throw error;
        setItems(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '欲しいものリストの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  // ドラッグ&ドロップの処理
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    // 優先順位の更新
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      priority: index + 1,
    }));

    setItems(updatedItems);

    // データベースの更新
    try {
      const { error } = await supabase
        .from('wishlist')
        .upsert(updatedItems.map(({ id, priority }) => ({ id, priority })));

      if (error) throw error;
    } catch (err) {
      setError('優先順位の更新に失敗しました');
    }
  };

  // アイテムの削除
  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .match({ id });

      if (error) throw error;
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      setError('アイテムの削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={3}>
        <Typography color="error">{error}</Typography>
        <Button variant="contained" onClick={() => setError(null)} sx={{ mt: 2 }}>
          再試行
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', p: 2 }}>
      <Typography variant="h5" gutterBottom>
        欲しいものリスト
      </Typography>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="wishlist">
          {(provided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{ minHeight: 100 }}
            >
              {items.map((item, index) => (
                <WishlistItem
                  key={item.id}
                  item={item}
                  index={index}
                  onDelete={handleDeleteItem}
                />
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
};

export default WishList;