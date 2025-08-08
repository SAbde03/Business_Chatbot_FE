'use client';
import { useState, useRef, useEffect } from 'react';
import { Chart, plugins, registerables } from 'chart.js';
import Papa from 'papaparse';
import { ChartData, CsvRow } from '@/types/chart';

import { FiMail, FiPhone } from 'react-icons/fi';
import { FaFileLines } from 'react-icons/fa6';
import { title } from 'process';
import { BiBorderRadius } from 'react-icons/bi';
import { Inter, Roboto, Open_Sans } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'] })
const openSans = Open_Sans({ subsets: ['latin'] })
Chart.register(...registerables);

type AnalysisResult = {
  filledPhoneNumbers: number;
  filledEmails: number;
  totalEntries: number;
  phoneNumberPercentage: string;
  emailPercentage: string;
};

export default function DataAnalysisDashboard() {
  const [genderChartData, setGenderChartData] = useState<ChartData | null>(null);
  const [completionChartData, setCompletionChartData] = useState<ChartData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');
  const genderChartRef = useRef<HTMLCanvasElement>(null);
  const completionChartRef = useRef<HTMLCanvasElement>(null);
  const genderChartInstanceRef = useRef<Chart<'pie'> | null>(null);
  const completionChartInstanceRef = useRef<Chart<'bar'> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up charts on unmount
  useEffect(() => {
    return () => {
      if (genderChartInstanceRef.current) {
        genderChartInstanceRef.current.destroy();
      }
      if (completionChartInstanceRef.current) {
        completionChartInstanceRef.current.destroy();
      }
    };
  }, []);

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

  const analyzeDataCompletion = (data: CsvRow[]): AnalysisResult => {
    let filledPhoneNumbers = 0;
    let filledEmails = 0;
    const totalEntries = data.length;

    data.forEach(entry => {
      if (entry.phoneNumber && String(entry.phoneNumber).trim() !=='') {
        filledPhoneNumbers++;
      }
      if (entry.email && String(entry.email).trim() !== '') {
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

  const processCsvData = (data: CsvRow[]) => {
    if (!data || data.length === 0) {
      setError('CSV file is empty or invalid format');
      return;
    }

    // Analyze data completion
    const analysis = analyzeDataCompletion(data);
    setAnalysisResult(analysis);

    // Prepare data completion chart
    setCompletionChartData({
      labels: ['Numéros de tel', 'Emails'],
      plugins:{
        title: {
              display: false,
              text: '',
            }
      },
      datasets: [
        {
          label: 'Fournies',
          data: [analysis.filledPhoneNumbers, analysis.filledEmails],
          backgroundColor: ['rgb(255, 255, 255)', 'rgb(255, 255, 255)'],
          borderColor: ['rgb(255, 255, 255)', 'rgb(255, 255, 255)'],
          borderWidth: 1,
        },
        {
          label: 'Manquantes',
          data: [
            analysis.totalEntries - analysis.filledPhoneNumbers, 
            analysis.totalEntries - analysis.filledEmails
          ],
          backgroundColor: ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.25)'],
          borderColor: ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.25)'],
          borderWidth: 1,
        }
      ]
    });

    // Process gender data if available
    if (data[0].hasOwnProperty('gender')) {
      let femaleCount = 0;
      let maleCount = 0;
      let otherCount = 0;

      data.forEach((row) => {
        const gender = String(row.gender).toLowerCase();
        if (gender === 'female') {
          femaleCount++;
        } else if (gender === 'male') {
          maleCount++;
        } else {
          otherCount++;
        }
      });

      const labels: string[] = [];
      const values: number[] = [];
      const colors: string[] = [];

      if (femaleCount > 0) {
        labels.push('Femme');
        values.push(femaleCount);
        colors.push('#FF6384');
      }
      
      if (maleCount > 0) {
        labels.push('Homme');
        values.push(maleCount);
        colors.push('#36A2EB');
      }
      
      if (otherCount > 0) {
        labels.push('Other/Unknown');
        values.push(otherCount);
        colors.push('#FFCE56');
      }

      if (labels.length > 0) {
        setGenderChartData({
          title:{
            display: false,
          },
          labels,
          datasets: [{
            data: values,
            backgroundColor: colors,
            borderWidth: 1,
            
          }]
        });
      }
    }
  };

  // Render or update charts when data changes
  useEffect(() => {
    // Gender pie chart
    if (genderChartData && genderChartRef.current) {
      const ctx = genderChartRef.current.getContext('2d');
      if (!ctx) return;

      if (genderChartInstanceRef.current) {
        genderChartInstanceRef.current.destroy();
      }

      genderChartInstanceRef.current = new Chart(ctx, {
        type: 'pie',
        data: genderChartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              position: 'right',
              labels: {
                color: '#ffffffff' // gray-500
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#F3F4F6', // gray-100
              bodyColor: '#F3F4F6',
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((Number(value) / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            },
            title: {
              display: false,
              text: '',
              color: '#374151', // gray-700
              font: { size: 16 }
            }
          }
        }
      });
    }

    // Data completion bar chart
    if (completionChartData && completionChartRef.current) {
      const ctx = completionChartRef.current.getContext('2d');
      if (!ctx) return;

      if (completionChartInstanceRef.current) {
        completionChartInstanceRef.current.destroy();
      }

      completionChartInstanceRef.current = new Chart(ctx, {
        type: 'bar',
        data: completionChartData,
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              position: 'top',
              labels: {
                color: '#ffffffff' // gray-500
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#F3F4F6',
              bodyColor: '#F3F4F6',
              callbacks: {
                afterLabel: (context) => {
                  const label = context.dataset.label;
                  const index = context.dataIndex;
                  if (!analysisResult) return '';
                  
                  if (label === 'Fournies') {
                    return index === 0 
                      ? `${analysisResult.phoneNumberPercentage}% of total` 
                      : `${analysisResult.emailPercentage}% of total`;
                  }
                  return index === 0 
                    ? `${(100 - parseFloat(analysisResult.phoneNumberPercentage)).toFixed(1)}% of total` 
                    : `${(100 - parseFloat(analysisResult.emailPercentage)).toFixed(1)}% of total`;
                }
              }
            },
            title: {
              display: true,
              text: '',
              color: '#ffffffff', // gray-700
              font: { size: 16 }
            }
          },
          scales: {
            x: { 
              stacked: true, 
              title: { 
                display: true, 
                text: 'Nombres d\'entitées',
                color: '#6B7280' // gray-500
              },
              grid: {
                color: 'rgba(209, 213, 219, 0.3)' // gray-300 with opacity
              },
              ticks: {
                color: '#6B7280' // gray-500
              }
            },
            y: { 
              stacked: true,
              grid: {
                color: 'rgba(209, 213, 219, 0.3)' // gray-300 with opacity
              },
              ticks: {
                color: '#6B7280' // gray-500
              }
            }
          }
        }
      });
    }
  }, [genderChartData, completionChartData, analysisResult]);

  return (
    <div className="max-w-full h-full mx-auto p-4 space-y-8">
      
      
      <div className="mb-6">
        <input
          type="file"
          accept=".csv, text/csv"
          onChange={handleFileUpload}
          ref={fileInputRef}
          className="block w-full text-sm text-zinc-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-zinc-900
            hover:file:bg-blue-100"
        />
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {analysisResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex justifiy-center items-center gap-5 bg-linear-360 from-white/5 to-zinc drop-shadow-zinc bg-opacity-70 p-4 rounded-lg ">
            <div className='bg-white/40 w-fit h-fit  p-5  rounded-lg'><FaFileLines></FaFileLines></div>
            <div>
               <h3 className={`font-semibold text-white-700 ${inter.className}`}>Résultats</h3>
                <p className="text-2xl font-bold text-white-400">{analysisResult.totalEntries}</p>
              </div>
           
          </div>
          <div className="flex justifiy-center items-center gap-5 bg-linear-360 from-white/5 to-zinc drop-shadow-zinc bg-opacity-70 p-4 rounded-lg ">
            <div className='bg-white/40 w-fit h-fit  p-5  rounded-lg'><FiPhone></FiPhone></div>
            <div>
               <h3 className="font-semibold text-white-700">Numéro de tel</h3>
            <p className="text-2xl font-bold text-white-800">
              {analysisResult.filledPhoneNumbers} <span className="text-sm text-white/50">({analysisResult.phoneNumberPercentage}%)</span>
            </p>
            </div>
           
          </div>
          <div className="flex justifiy-center items-center gap-5 bg-linear-360 from-white/5  to-zinc drop-shadow-zinc bg-opacity-70 p-4 rounded-lg ">
            <div className='bg-white/40 w-fit h-fit  p-5  rounded-lg'><FiMail className='text'></FiMail></div>
            <div>
              <h3 className="font-semibold text-white-700">Emails</h3>
            <p className="text-2xl font-bold text-white-800">
              {analysisResult.filledEmails} <span className="text-sm text-white/50">({analysisResult.emailPercentage}%)</span>
            </p>
            </div>
            
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 border-white p-4 border border-white/20 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-4">Distribution de genres</h2>
          {genderChartData ? (
            <div className="relative h-80">
              <canvas ref={genderChartRef}></canvas>
            </div>
          ) : (
            <div className="text-center py-12 text-white-500">
              No gender data found in CSV
            </div>
          )}
        </div>

        <div className="bg-white/10  bg-opacity-70 p-4 border border-white/20 rounded-lg  shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-4">Validité des données</h2>
          {completionChartData ? (
            <div className="relative h-80">
              <canvas ref={completionChartRef}></canvas>
            </div>
          ) : (
            <div className="text-center py-12 text-white">
              Upload a CSV file to analyze data completion
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 h-150">
        <div className="bg-white/10 border-white p-4 border border-white/20 rounded-lg shadow-sm">
         
        </div>

        
      </div>
      
    </div>
    
  );
}