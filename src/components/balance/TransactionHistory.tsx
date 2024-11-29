import React, { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
}

interface TransactionHistoryProps {
  transactions?: Transaction[];
  loading?: boolean;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  transactions = [], 
  loading = false 
}) => {
  const [sortedTransactions, setSortedTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // 日付順に並び替え
    const sorted = [...transactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setSortedTransactions(sorted);
  }, [transactions]);

  const formatAmount = (amount: number, type: 'income' | 'expense'): string => {
    return `${type === 'expense' ? '-' : '+'}¥${amount.toLocaleString()}`;
  };

  const getTransactionColor = (type: 'income' | 'expense'): string => {
    return type === 'income' ? '#4caf50' : '#f44336';
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography>読み込み中...</Typography>
      </Box>
    );
  }

  if (sortedTransactions.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography>取引履歴がありません</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
      <Table stickyHeader aria-label="取引履歴テーブル">
        <TableHead>
          <TableRow>
            <TableCell>日付</TableCell>
            <TableCell>カテゴリー</TableCell>
            <TableCell>説明</TableCell>
            <TableCell align="right">金額</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedTransactions.map((transaction) => (
            <TableRow
              key={transaction.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {format(new Date(transaction.date), 'yyyy/MM/dd (E)', { locale: ja })}
              </TableCell>
              <TableCell>
                <Chip 
                  label={transaction.category}
                  size="small"
                  sx={{ 
                    backgroundColor: transaction.type === 'income' ? '#e8f5e9' : '#ffebee',
                    color: getTransactionColor(transaction.type)
                  }}
                />
              </TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell 
                align="right"
                sx={{ 
                  color: getTransactionColor(transaction.type),
                  fontWeight: 'bold'
                }}
              >
                {formatAmount(transaction.amount, transaction.type)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TransactionHistory;