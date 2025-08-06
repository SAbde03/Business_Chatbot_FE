'use client';
import { useState, useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import Papa from 'papaparse';
import { ChartData, CsvRow } from '@/types/chart';

export default function CsvToPieChart() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string>('');
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart<'pie'> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Chart.js
  useEffect(() => {
    Chart.register(...registerables);
    
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError('Please upload a valid CSV file');
      return;
    }

    setError('');
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`CSV parsing error: ${results.errors[0].message}`);
          return;
        }
        processCsvData(results.data);
      },
      error: (error: Error) => {
        setError(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  // Process CSV data into chart format
  const processCsvData = (data: CsvRow[]) => {
    if (!data || data.length === 0) {
      setError('CSV file is empty or invalid format');
      return;
    }

    // Get first two columns
    const columns = Object.keys(data[0]);
    if (columns.length < 2) {
      setError('CSV needs at least two columns (labels and values)');
      return;
    }

    const labelKey = columns[0];
    const valueKey = columns[1];

    const labels: string[] = [];
    const values: number[] = [];

    data.forEach((row) => {
      const label = String(row[labelKey]);
      const value = parseFloat(String(row[valueKey]));
      
      if (label && !isNaN(value)) {
        labels.push(label);
        values.push(value);
      }
    });

    if (labels.length === 0) {
      setError('No valid data found in CSV');
      return;
    }

    setChartData({
      labels,
      datasets: [{
        data: values,
        backgroundColor: generateColors(labels.length),
        borderWidth: 1
      }]
    });
  };

  // Generate distinct colors for chart
  const generateColors = (count: number): string[] => {
    const baseColors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
      '#9966FF', '#FF9F40', '#8AC24A', '#607D8B'
    ];
    
    if (count <= baseColors.length) {
      return baseColors.slice(0, count);
    }

    // Generate additional colors if needed
    const colors = [...baseColors];
    for (let i = baseColors.length; i < count; i++) {
      const hue = Math.floor((i * 360 / count) % 360);
      colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    return colors;
  };

  // Render or update chart when data changes
  useEffect(() => {
    if (!chartData || !chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: 'pie',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((Number(value) / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

  }, [chartData]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">CSV to Pie Chart</h1>
      
      <div className="mb-4">
        <input
          type="file"
          accept=".csv, text/csv"
          onChange={handleFileUpload}
          ref={fileInputRef}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      <div className="bg-transparent p-4 rounded-lg shadow">
        {chartData ? (
          <div className="relative h-96">
            <canvas ref={chartRef}></canvas>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Upload a CSV file to generate chart
            <p className="text-sm mt-2">
              Expected format: First column for labels, second column for numerical values
            </p>
          </div>
        )}
      </div>
    </div>
  );
}