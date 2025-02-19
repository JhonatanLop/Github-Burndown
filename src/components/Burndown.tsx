import React, { useEffect, useRef } from 'react';
import { Chart, ChartData, ChartOptions } from 'chart.js/auto';

interface ChartComponentProps {
  labels: string[];
  distribution: number[];
  points: number[];
}

const ChartComponent: React.FC<ChartComponentProps> = ({labels, distribution, points}) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const chartData: ChartData = {
      labels,
      datasets: [
        {
          label: 'Distribution',
          data: distribution,
          backgroundColor: ['#1E2632'],
          borderColor: ['#1F6FEB'],
          borderWidth: 1,
        },
        {
          label: 'Points Remaining',
          data: points,
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
  }, [labels, distribution, points]);
  return <canvas ref={chartRef} width={1776} height={777}/>;
};

export default ChartComponent;
