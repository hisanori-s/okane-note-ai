import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Button,
  Stack,
} from '@mui/material';
import { useRouter } from 'next/router';
import axios from 'axios';

// クエストの型定義
interface Quest {
  id: string;
  title: string;
  description: string;
  reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'available' | 'in_progress' | 'completed';
  deadline?: string;
  progress: number;
}

// 難易度に応じた色を定義
const difficultyColors = {
  easy: 'success',
  medium: 'warning',
  hard: 'error',
} as const;

const QuestList: React.FC = () => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // クエスト一覧を取得
  useEffect(() => {
    const fetchQuests = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/quests');
        setQuests(response.data);
      } catch (err) {
        setError('クエストの取得に失敗しました');
        console.error('Error fetching quests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuests();
  }, []);

  // クエストの受諾処理
  const handleAcceptQuest = async (questId: string) => {
    try {
      await axios.post(`/api/quests/${questId}/accept`);
      // クエスト一覧を再取得
      const response = await axios.get('/api/quests');
      setQuests(response.data);
    } catch (err) {
      console.error('Error accepting quest:', err);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        利用可能なクエスト
      </Typography>
      
      <Stack spacing={2}>
        {quests.map((quest) => (
          <Card key={quest.id} sx={{ position: 'relative' }}>
            <CardContent>
              <Typography variant="h6" component="div">
                {quest.title}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 1, mt: 1 }}>
                <Chip
                  label={quest.difficulty}
                  color={difficultyColors[quest.difficulty]}
                  size="small"
                />
                <Chip
                  label={`${quest.reward}円`}
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Typography variant="body2" color="text.secondary">
                {quest.description}
              </Typography>

              {quest.status === 'in_progress' && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    進捗状況: {quest.progress}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={quest.progress}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              )}

              {quest.status === 'available' && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleAcceptQuest(quest.id)}
                  >
                    クエストを受ける
                  </Button>
                </Box>
              )}

              {quest.deadline && (
                <Typography
                  variant="caption"
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  期限: {new Date(quest.deadline).toLocaleDateString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default QuestList;