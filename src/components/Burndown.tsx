import React, { useEffect, useRef } from 'react';
import { Chart, ChartData, ChartOptions } from 'chart.js/auto';

interface ChartComponentProps {
  days: string[];
  predicted: number[];
  done: number[];
  width: number;
  height: number;
}

const ChartComponent: React.FC<ChartComponentProps> = ({days, predicted, done, width, height}) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const chartData: ChartData = {
      labels: days,
      datasets: [
        {
          label: 'Predicted',
          data: predicted,
          backgroundColor: ['#1E2632'],
          borderColor: ['#1F6FEB'],
          borderWidth: 1,
        },
        {
          label: 'Actually done',
          data: done,
          backgroundColor: ['#2C2734'],
          borderColor: ['#AB7DF8'],
          borderWidth: 1,
        },
      ],
    };

    const chartOptions: ChartOptions = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };

    const chartInstance = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: chartOptions,
    });

    return () => chartInstance.destroy();
  }, [days, predicted, done]);
  return <canvas ref={chartRef} width={width} height={height} />;
};

export default ChartComponent;
