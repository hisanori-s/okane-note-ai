import React from 'react';
import { Box, Typography, IconButton, Paper, LinearProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { styled } from '@mui/material/styles';

interface WishListItemProps {
  id: string;
  title: string;
  price: number;
  savedAmount: number;
  imageUrl?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// スタイル付きコンポーネントの定義
const ItemContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const ImageContainer = styled(Box)({
  width: 80,
  height: 80,
  borderRadius: 8,
  overflow: 'hidden',
  flexShrink: 0,
});

const WishListItem: React.FC<WishListItemProps> = ({
  id,
  title,
  price,
  savedAmount,
  imageUrl,
  onEdit,
  onDelete,
}) => {
  // 進捗率の計算
  const progressPercentage = Math.min((savedAmount / price) * 100, 100);

  return (
    <ItemContainer>
      <ImageContainer>
        <img
          src={imageUrl || '/placeholder-image.png'}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </ImageContainer>

      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            目標額: ¥{price.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            |
          </Typography>
          <Typography variant="body2" color="text.secondary">
            貯金額: ¥{savedAmount.toLocaleString()}
          </Typography>
        </Box>

        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={progressPercentage} 
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="body2" color="text.secondary" align="right">
            {progressPercentage.toFixed(1)}%
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <IconButton
          size="small"
          onClick={() => onEdit(id)}
          aria-label="edit"
        >
          <EditIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onDelete(id)}
          aria-label="delete"
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </ItemContainer>
  );
};

export default WishListItem;