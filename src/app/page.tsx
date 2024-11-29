// app/page.tsx
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Container, Grid, Box } from '@mui/material'

// Client Componentsの動的インポート
const BalanceDisplay = dynamic(
  () => import('@/components/Balance/BalanceDisplay'),
  { 
    ssr: false,
    loading: () => <Box>Loading balance...</Box>
  }
)

const TaskList = dynamic(
  () => import('@/components/Work/QuestList'),
  {
    ssr: true,
    loading: () => <Box>Loading tasks...</Box>
  }
)

const WishList = dynamic(
  () => import('@/components/Wishlist/DraggableList'),
  {
    ssr: true,
    loading: () => <Box>Loading wishlist...</Box>
  }
)

// メインダッシュボードページ（Server Component）
export default async function DashboardPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* 残高表示セクション */}
        <Grid item xs={12} md={4}>
          <Suspense fallback={<Box>Loading balance...</Box>}>
            <BalanceDisplay />
          </Suspense>
        </Grid>

        {/* タスクリストセクション */}
        <Grid item xs={12} md={4}>
          <Suspense fallback={<Box>Loading tasks...</Box>}>
            <TaskList />
          </Suspense>
        </Grid>

        {/* ウィッシュリストセクション */}
        <Grid item xs={12} md={4}>
          <Suspense fallback={<Box>Loading wishlist...</Box>}>
            <WishList />
          </Suspense>
        </Grid>
      </Grid>
    </Container>
  )
}

// メタデータの設定
export const metadata = {
  title: 'MoneyKids - Dashboard',
  description: 'Manage your money, tasks, and wishes in one place',
}

// 再検証の設定
export const revalidate = 60 // 1分ごとに再検証