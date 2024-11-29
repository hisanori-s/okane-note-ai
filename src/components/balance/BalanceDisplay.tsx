import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Skeleton,
  useTheme 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { formatCurrency } from '../../utils/formatters';

interface BalanceDisplayProps {
  balance?: number;
  lastUpdate?: string;
  isLoading?: boolean;
  error?: string;
}

// スタイル付きコンポーネントの定義
const BalanceContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  background: theme.palette.mode === 'light' 
    ? 'linear-gradient(45deg, #FFF 30%, #F5F5F5 90%)'
    : 'linear-gradient(45deg, #424242 30%, #303030 90%)',
  boxShadow: theme.shadows[3],
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const BalanceAmount = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(1),
}));

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  balance = 0,
  lastUpdate,
  isLoading = false,
  error,
}) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // マウント時のアニメーション効果
    setIsVisible(true);
  }, []);

  if (error) {
    return (
      <BalanceContainer>
        <Typography color="error">
          {error}
        </Typography>
      </BalanceContainer>
    );
  }

  return (
    <BalanceContainer
      sx={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out',
      }}
    >
      {isLoading ? (
        <>
          <Skeleton variant="text" width="60%" height={60} />
          <Skeleton variant="text" width="40%" />
        </>
      ) : (
        <>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            現在の残高
          </Typography>
          <BalanceAmount>
            {formatCurrency(balance)}
          </BalanceAmount>
          {lastUpdate && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="caption" color="textSecondary">
                最終更新: {lastUpdate}
              </Typography>
            </Box>
          )}
        </>
      )}
    </BalanceContainer>
  );
};

export default BalanceDisplay;

// 残高表示用のフォーマッター（utils/formatters.tsに実装することを想定）
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
  }).format(amount);
};
