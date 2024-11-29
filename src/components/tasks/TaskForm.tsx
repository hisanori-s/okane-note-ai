import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Box, FormControl, FormHelperText } from '@mui/material';

// タスクのバリデーションスキーマ
const taskSchema = z.object({
  title: z.string()
    .min(1, '題名は必須です')
    .max(100, '題名は100文字以内で入力してください'),
  description: z.string()
    .max(500, '説明は500文字以内で入力してください')
    .optional(),
  dueDate: z.string()
    .optional(),
  reward: z.number()
    .min(0, '報酬は0以上の数値を入力してください')
    .max(10000, '報酬は10000以下の数値を入力してください'),
});

// フォームの型定義
type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => Promise<void>;
  initialData?: Partial<TaskFormData>;
  isLoading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  initialData = {},
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: initialData,
  });

  // フォーム送信処理
  const handleFormSubmit = async (data: TaskFormData) => {
    try {
      await onSubmit(data);
      reset(); // フォームをリセット
    } catch (error) {
      console.error('タスクの送信に失敗しました:', error);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleFormSubmit)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxWidth: '500px',
        margin: '0 auto',
        padding: 2,
      }}
    >
      <FormControl error={!!errors.title}>
        <TextField
          {...register('title')}
          label="タスクの題名"
          fullWidth
          error={!!errors.title}
          helperText={errors.title?.message}
          disabled={isLoading}
        />
      </FormControl>

      <FormControl error={!!errors.description}>
        <TextField
          {...register('description')}
          label="タスクの説明"
          multiline
          rows={4}
          fullWidth
          error={!!errors.description}
          helperText={errors.description?.message}
          disabled={isLoading}
        />
      </FormControl>

      <FormControl error={!!errors.dueDate}>
        <TextField
          {...register('dueDate')}
          label="期限"
          type="date"
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
          error={!!errors.dueDate}
          helperText={errors.dueDate?.message}
          disabled={isLoading}
        />
      </FormControl>

      <FormControl error={!!errors.reward}>
        <TextField
          {...register('reward', { valueAsNumber: true })}
          label="報酬"
          type="number"
          fullWidth
          InputProps={{
            inputProps: { min: 0, max: 10000 }
          }}
          error={!!errors.reward}
          helperText={errors.reward?.message}
          disabled={isLoading}
        />
      </FormControl>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={isLoading}
        sx={{ mt: 2 }}
      >
        {isLoading ? '送信中...' : 'タスクを作成'}
      </Button>
    </Box>
  );
};

export default TaskForm;