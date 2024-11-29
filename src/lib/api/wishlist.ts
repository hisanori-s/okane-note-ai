import axios from 'axios';
import { WishlistItem } from '@/types/wishlist';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * 欲しいものリストに関するAPI呼び出しを管理するモジュール
 */

/**
 * 欲しいものリストを取得する
 * @param userId ユーザーID
 * @returns 欲しいものリストの配列
 */
export const getWishlist = async (userId: string): Promise<WishlistItem[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/wishlist/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch wishlist:', error);
    throw error;
  }
};

/**
 * 新しい欲しいものをリストに追加する
 * @param userId ユーザーID
 * @param item 追加する項目
 * @returns 追加された項目
 */
export const addWishlistItem = async (
  userId: string,
  item: Omit<WishlistItem, 'id'>
): Promise<WishlistItem> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/wishlist/${userId}`, item);
    return response.data;
  } catch (error) {
    console.error('Failed to add wishlist item:', error);
    throw error;
  }
};

/**
 * 欲しいものの情報を更新する
 * @param userId ユーザーID
 * @param itemId 項目ID
 * @param updates 更新内容
 * @returns 更新された項目
 */
export const updateWishlistItem = async (
  userId: string,
  itemId: string,
  updates: Partial<WishlistItem>
): Promise<WishlistItem> => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/wishlist/${userId}/items/${itemId}`,
      updates
    );
    return response.data;
  } catch (error) {
    console.error('Failed to update wishlist item:', error);
    throw error;
  }
};

/**
 * 欲しいものをリストから削除する
 * @param userId ユーザーID
 * @param itemId 項目ID
 */
export const deleteWishlistItem = async (
  userId: string,
  itemId: string
): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/api/wishlist/${userId}/items/${itemId}`);
  } catch (error) {
    console.error('Failed to delete wishlist item:', error);
    throw error;
  }
};

/**
 * 欲しいものリストの順序を更新する
 * @param userId ユーザーID
 * @param itemOrder 項目の新しい順序
 */
export const updateWishlistOrder = async (
  userId: string,
  itemOrder: { id: string; order: number }[]
): Promise<void> => {
  try {
    await axios.put(`${API_BASE_URL}/api/wishlist/${userId}/order`, {
      order: itemOrder
    });
  } catch (error) {
    console.error('Failed to update wishlist order:', error);
    throw error;
  }
};

/**
 * 欲しいものの達成状態を更新する
 * @param userId ユーザーID
 * @param itemId 項目ID
 * @param achieved 達成状態
 */
export const updateWishlistAchievement = async (
  userId: string,
  itemId: string,
  achieved: boolean
): Promise<WishlistItem> => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/wishlist/${userId}/items/${itemId}/achievement`,
      { achieved }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to update wishlist achievement:', error);
    throw error;
  }
};