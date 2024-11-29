import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Grid,
  Slider,
  Box
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// ChartJSの設定を登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CompoundForecastProps {
  initialBalance: number;
}

const CompoundForecast: React.FC<CompoundForecastProps> = ({ initialBalance }) => {
  // 状態管理
  const [principal, setPrincipal] = useState<number>(initialBalance);
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(1000);
  const [interestRate, setInterestRate] = useState<number>(3);
  const [years, setYears] = useState<number>(10);
  const [forecastData, setForecastData] = useState<number[]>([]);

  // 複利計算のロジック
  const calculateCompoundInterest = () => {
    let balance = principal;
    const monthlyRate = interestRate / 100 / 12;
    const months = years * 12;
    const data: number[] = [balance];

    for (let i = 1; i <= months; i++) {
      balance = balance * (1 + monthlyRate) + monthlyDeposit;
      if (i % 12 === 0) {
        data.push(Math.round(balance));
      }
    }

    setForecastData(data);
  };

  // 入力値が変更されたときに再計算
  useEffect(() => {
    calculateCompoundInterest();
  }, [principal, monthlyDeposit, interestRate, years]);

  // グラフのデータ設定
  const chartData = {
    labels: Array.from({ length: years + 1 }, (_, i) => `${i}年目`),
    datasets: [
      {
        label: '予測残高',
        data: forecastData,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '複利予測グラフ',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `${value.toLocaleString()}円`,
        },
      },
    },
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          複利予測シミュレーション
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="初期残高"
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              InputProps={{
                endAdornment: <Typography>円</Typography>,
              }}
              margin="normal"
            />

            <TextField
              fullWidth
              label="毎月の積立額"
              type="number"
              value={monthlyDeposit}
              onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
              InputProps={{
                endAdornment: <Typography>円</Typography>,
              }}
              margin="normal"
            />

            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>年利 ({interestRate}%)</Typography>
              <Slider
                value={interestRate}
                onChange={(_, value) => setInterestRate(value as number)}
                min={0}
                max={10}
                step={0.1}
              />
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom>期間 ({years}年)</Typography>
              <Slider
                value={years}
                onChange={(_, value) => setYears(value as number)}
                min={1}
                max={30}
                step={1}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ height: 300 }}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          </Grid>
        </Grid>

        <Typography variant="h6" sx={{ mt: 2 }}>
          {years}年後の予測残高: {forecastData[years]?.toLocaleString()}円
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CompoundForecast;