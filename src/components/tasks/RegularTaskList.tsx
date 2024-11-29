import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Chip,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  RepeatRounded,
  CheckCircleOutline,
  Delete,
  Edit,
} from '@mui/material/icons-material';
import { format } from 'date-fns';

// 定期タスクの型定義
interface RegularTask {
  id: string;
  title: string;
  description: string;
  reward: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  nextDueDate: string;
  isCompleted: boolean;
}

interface RegularTaskListProps {
  onTaskComplete?: (taskId: string) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskEdit?: (task: RegularTask) => void;
}

const RegularTaskList: React.FC<RegularTaskListProps> = ({
  onTaskComplete,
  onTaskDelete,
  onTaskEdit,
}) => {
  const [tasks, setTasks] = useState<RegularTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // タスク一覧を取得
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // TODO: 実際のAPIエンドポイントに置き換える
        const response = await fetch('/api/regular-tasks');
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError('タスクの取得に失敗しました');
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // 頻度に応じたチップの色を返す
  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'primary';
      case 'weekly':
        return 'secondary';
      case 'monthly':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <List>
      {tasks.map((task) => (
        <ListItem
          key={task.id}
          divider
          sx={{
            opacity: task.isCompleted ? 0.6 : 1,
            transition: 'opacity 0.3s',
          }}
        >
          <ListItemIcon>
            <RepeatRounded />
          </ListItemIcon>
          <ListItemText
            primary={task.title}
            secondary={
              <React.Fragment>
                <Typography
                  component="span"
                  variant="body2"
                  color="text.primary"
                >
                  {task.description}
                </Typography>
                <Box mt={1}>
                  <Chip
                    label={`${task.frequency}`}
                    size="small"
                    color={getFrequencyColor(task.frequency)}
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`${task.reward}円`}
                    size="small"
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`次回: ${format(new Date(task.nextDueDate), 'yyyy/MM/dd')}`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </React.Fragment>
            }
          />
          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              aria-label="complete"
              onClick={() => onTaskComplete?.(task.id)}
              sx={{ mr: 1 }}
            >
              <CheckCircleOutline />
            </IconButton>
            <IconButton
              edge="end"
              aria-label="edit"
              onClick={() => onTaskEdit?.(task)}
              sx={{ mr: 1 }}
            >
              <Edit />
            </IconButton>
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => onTaskDelete?.(task.id)}
            >
              <Delete />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
      {tasks.length === 0 && (
        <Box p={3} textAlign="center">
          <Typography color="textSecondary">
            定期タスクが設定されていません
          </Typography>
        </Box>
      )}
    </List>
  );
};

export default RegularTaskList;