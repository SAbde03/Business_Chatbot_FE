'use client'; // Required for Next.js client components

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Sample data
const data = {
  labels: ['email', 'tel'],
  datasets: [
    {
      label: 'Sales 2023',
      data: [65, 59],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
    },
    
  ],
};

const config = {
  type: 'bar',
  data: data,
  options: {
    indexAxis: 'y', // Makes the chart horizontal
    elements: {
      bar: {
        borderWidth: 2,
        borderRadius: 4, // Added rounded corners
      },
    },
    responsive: true,
    maintainAspectRatio: false, // Allows custom sizing
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12, // Smaller color boxes in legend
          padding: 20, // Spacing between legend items
        },
      },
      title: {
        display: true,
        font: {
          size: 16,
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 12,
        },
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          padding: 10,
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          mirror: true, // Positions ticks inside the chart
          padding: 10,
        },
      },
    },
  },
};

export default function HorizontalBarChart() {
  return (
    <div className="w-full h-[400px] p-4 bg-white rounded-lg shadow">
      <Bar data={data} options={config.options} />
    </div>
  );
}