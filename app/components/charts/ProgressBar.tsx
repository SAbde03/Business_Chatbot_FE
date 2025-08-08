'use client';

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

// Your CSV data (simplified for this example)
const csvData = [
  { idS: '629750708017', phoneNumber: '3368876690', email: 'alisea.clu@outlook.com' },
  { idS: '581070325797', phoneNumber: '3369383640', email: 'corinne.garcia@corp.com' },
  { idS: '250328286465', phoneNumber: '3364891733', email: 'clmence.tirard@outlook.com' },
  // Add all your other data entries here...
  // In a real app, you would parse the actual CSV file
];

// Function to analyze the data
const analyzeData = (data) => {
  let filledPhoneNumbers = 0;
  let filledEmails = 0;
  const totalEntries = data.length;

  data.forEach(entry => {
    if (entry.phoneNumber && entry.phoneNumber.trim() !== '') {
      filledPhoneNumbers++;
    }
    if (entry.email && entry.email.trim() !== '') {
      filledEmails++;
    }
  });

  return {
    filledPhoneNumbers,
    filledEmails,
    totalEntries,
    phoneNumberPercentage: (filledPhoneNumbers / totalEntries * 100).toFixed(1),
    emailPercentage: (filledEmails / totalEntries * 100).toFixed(1)
  };
};

// Analyze the data
const analysis = analyzeData(csvData);

// Chart data configuration
const data = {
  labels: ['Phone Numbers', 'Emails'],
  datasets: [
    {
      label: 'Filled',
      data: [analysis.filledPhoneNumbers, analysis.filledEmails],
      backgroundColor: [
        'rgba(54, 162, 235, 0.7)',
        'rgba(75, 192, 192, 0.7)'
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(75, 192, 192, 1)'
      ],
      borderWidth: 1,
    },
    {
      label: 'Missing',
      data: [
        analysis.totalEntries - analysis.filledPhoneNumbers, 
        analysis.totalEntries - analysis.filledEmails
      ],
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(255, 159, 64, 0.7)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(255, 159, 64, 1)'
      ],
      borderWidth: 1,
    }
  ],
};

// Chart options
const options = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Data Completion Analysis',
      font: {
        size: 16,
      },
    },
    tooltip: {
      callbacks: {
        afterLabel: function(context) {
          const label = context.dataset.label;
          const index = context.dataIndex;
          if (label === 'Filled') {
            return index === 0 
              ? `${analysis.phoneNumberPercentage}% of total` 
              : `${analysis.emailPercentage}% of total`;
          }
          return index === 0 
            ? `${(100 - analysis.phoneNumberPercentage).toFixed(1)}% of total` 
            : `${(100 - analysis.emailPercentage).toFixed(1)}% of total`;
        }
      }
    }
  },
  scales: {
    x: {
      stacked: true,
      title: {
        display: true,
        text: 'Number of entries'
      }
    },
    y: {
      stacked: true
    }
  }
};

export default function DataCompletionChart() {
  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Data Completion Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Total Entries</h3>
            <p className="text-2xl font-bold">{analysis.totalEntries}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Phone Numbers</h3>
            <p className="text-2xl font-bold">
              {analysis.filledPhoneNumbers} <span className="text-sm">({analysis.phoneNumberPercentage}%)</span>
            </p>
          </div>
          <div className="bg-teal-50 p-4 rounded-lg">
            <h3 className="font-semibold text-teal-800">Emails</h3>
            <p className="text-2xl font-bold">
              {analysis.filledEmails} <span className="text-sm">({analysis.emailPercentage}%)</span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="h-96">
        <Bar data={data} options={options} />
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Analysis of data completion rates for phone numbers and email addresses.</p>
      </div>
    </div>
  );
}