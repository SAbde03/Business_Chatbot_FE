'use client';
import { useState, useRef, useEffect } from 'react';
import { Chart, plugins, registerables } from 'chart.js';
import Papa from 'papaparse';
import { ChartData, CsvRow } from '@/types/chart';
import FranceMap from './FranceChoropleth';
import { FiMail, FiPhone } from 'react-icons/fi';
import { FaFileLines } from 'react-icons/fa6';
import { title } from 'process';
import { BiBorderRadius } from 'react-icons/bi';
import { Inter, Roboto, Open_Sans } from 'next/font/google'
import { BsFillTelephoneFill } from 'react-icons/bs';
import { AiFillMail } from 'react-icons/ai';
import { csv } from 'd3';
const inter = Inter({ subsets: ['latin'] })
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'] })
const openSans = Open_Sans({ subsets: ['latin'] })
Chart.register(...registerables);

const csvString = `idS,userId,phoneNumber,firstName,lastName,gender,currentCity,currentCountry,email,currentDepartment,currentRegion,hometownCity,hometownCountry,workplace,relationshipStatus
6.17E+11,4.97E+16,3363080194,Mohamed,Rhal,male,Paris,france,aurlie.contesse@hopitalmilitairesainteanne.com,Paris,ile-de-France,Hirson,france,hopital militaire sainte anne,married
1.78E+11,1.84E+18,3363080194,Aurélie,Contesse,female,Paris,france,aurlie.contesse@hopitalmilitairesainteanne.com,Paris,bretagne,Hirson,france,hopital militaire sainte anne,married
7.32E+11,1.78E+18,3363391068,Esmir Hr,Dolce Habibi,male,Paris,france,esmirhr.dolcehabibi@gucci.com,Paris,normandie,Budapest,hungary,gucci,married
54955659155,2.16E+18,3366202734,Arie,Miles,male,Paris,france,arie.miles@yahoo.com,Paris,ile-de-France,Budapest,hungary,gucci,married
8.11E+11,1.61E+18,3363559779,Sonia,Sofiane,female,Paris,france,sonia.sofiane@hm.com,Paris,ile-de-France,Paris,france,h&m,married`;
type AnalysisResult = {
  filledPhoneNumbers: number;
  filledEmails: number;
  totalEntries: number;
  phoneNumberPercentage: string;
  emailPercentage: string;
};
interface DashboardProps{
  isB2Bcliked?:boolean,
  isB2Cclicked?:boolean,
  csvFile:string,
}

export default function DataAnalysisDashboard({isB2Bcliked, isB2Cclicked,csvFile}:DashboardProps) {
  const [genderChartData, setGenderChartData] = useState<ChartData | null>(null);
  const [completionChartData, setCompletionChartData] = useState<ChartData | null>(null);
  const [topMainCategoryData, setTopMainCategoryData ] = useState<ChartData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');
  const genderChartRef = useRef<HTMLCanvasElement>(null);
  const completionChartRef = useRef<HTMLCanvasElement>(null);
  const topMainCategoryRef = useRef<HTMLCanvasElement>(null);
  const genderChartInstanceRef = useRef<Chart<'pie'> | null>(null);
  const completionChartInstanceRef = useRef<Chart<'bar'> | null>(null);
  const topMainCategoryInstanceRef = useRef<Chart<'bar'> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  

  useEffect(() => {

    setError('');
    Papa.parse<CsvRow>(csvString, {
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
  }, [csvFile]);



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
          backgroundColor: ['#10b981', '#10b981'],
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
    setTopMainCategoryData({
      labels: ['Cafe', 'Dentiste','Restaurants','Braserie','Cremerie','Restaurants','Braserie','Cremerie'],
      plugins:{
        title: {
              display: false,
              text: '',
            }
      },
      datasets: [
        {
          label: 'nombres',
          data: [100,5,65,564,7 ],
          backgroundColor: ['#10b981', '#10b981'],
          borderColor: ['rgb(255, 255, 255)', 'rgb(255, 255, 255)'],
          borderWidth: 1,
        },
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
        colors.push('#10b981');
      }
      
      if (maleCount > 0) {
        labels.push('Homme');
        values.push(maleCount);
        colors.push('#caffd8ff');
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
            borderWidth: 0,
            
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
    // TopMainCategory bar chart
    if (topMainCategoryData && topMainCategoryRef.current) {
      const ctx = topMainCategoryRef.current.getContext('2d');
      if (!ctx) return;

      if (topMainCategoryInstanceRef.current) {
        topMainCategoryInstanceRef.current.destroy();
      }

      topMainCategoryInstanceRef.current = new Chart(ctx, {
        type: 'bar',
        data: topMainCategoryData,
        options: {
          indexAxis: 'x',
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
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
                color: 'rgba(209, 213, 219, 0.07)' // gray-300 with opacity
              },
              ticks: {
                color: '#6B7280' // gray-500
              }
            },
            y: { 
              stacked: true,
              grid: {
                color: 'rgba(209, 213, 219, 0.04)' // gray-300 with opacity
              },
              ticks: {
                color: '#6B7280' // gray-500
              }
            }
          }
        }
      });
    }
  }, [genderChartData, completionChartData, analysisResult, topMainCategoryData]);

  return (
    
    <div className="max-w-full h-full mx-auto p-4 space-y-8">
      
      
      {isB2Cclicked ? (<>
        
       
      {analysisResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-6">
          <div className="flex justifiy-center items-center gap-5  bg-[#10b981]/70 bg-radial-[at_25%_25%] from-[#10b981]/70 to-[#3bb861] to-75%  bg-opacity-70 p-4 rounded-lg border border-[#10b981]/40">
            <div className='bg-white/30 w-fit h-fit  p-5  rounded-full'><FaFileLines></FaFileLines></div>
            <div>
               <h3 className={`font-semibold text-white-700 ${inter.className}`}>Résultats</h3>
                <p className="text-2xl font-bold text-white-400">{analysisResult.totalEntries}</p>
              </div>
           
          </div>
          <div className="flex justifiy-center items-center gap-5  bg-[#10b981]/70 bg-radial-[at_5%_25%] from-[#10b981]/70 to-[#3bb861] to-75%  bg-opacity-70 p-4 rounded-lg border border-[#10b981]/40">
            <div className='bg-white/30 w-fit h-fit  p-5  rounded-full'><BsFillTelephoneFill></BsFillTelephoneFill></div>
            <div>
               <h3 className="font-semibold text-white-700">Numéros de téléphone</h3>
            <p className="text-2xl font-bold text-white-800">
              {analysisResult.filledPhoneNumbers} <span className="text-sm text-white/50">({analysisResult.phoneNumberPercentage}%)</span>
            </p>
            </div>
           
          </div>
          <div className="flex justifiy-center items-center gap-5  bg-[#10b981]/70 bg-radial-[at_25%_25%] from-[#10b981]/70 to-[#3bb861] to-75%  bg-opacity-70 p-4 rounded-lg border border-[#10b981]/40">
            <div className='bg-white/30 w-fit h-fit  p-5  rounded-full'><AiFillMail className='text'></AiFillMail></div>
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
        <div className="bg-white/5 p-4 border border-white/10 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-4">Distribution de genres</h2>
          {genderChartData ? (
            <div className="relative h-80">
              <canvas id="chart1" ref={genderChartRef}></canvas>
            </div>
          ) : (
            <div className="text-center py-12 text-white-500">
              No gender data found in CSV
            </div>
          )}
        </div>

        <div className="bg-white/5  bg-opacity-70 p-4 border border-white/10 rounded-lg  shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-4">Validité de données</h2>
          {completionChartData ? (
            <div className="relative h-80">
              <canvas id="chart2" ref={completionChartRef}></canvas>
            </div>
          ) : (
            <div className="text-center py-12 text-white">
              Upload a CSV file to analyze data completion
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 h-150">
        <div className="bg-white/5 border-white p-4 border border-white/10 rounded-lg shadow-sm">
          <FranceMap csvFile={csvString} />
        </div>

        
      </div>
      </>):(<>
        
       
      {analysisResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-6">
          <div className="flex justifiy-center items-center gap-5  bg-[#10b981]/70 bg-radial-[at_25%_25%] from-[#10b981]/70 to-[#3bb861] to-75%  bg-opacity-70 p-4 rounded-lg border border-[#10b981]/40">
            <div className='bg-white/30 w-fit h-fit  p-5  rounded-full'><FaFileLines></FaFileLines></div>
            <div>
               <h3 className={`font-semibold text-white-700 ${inter.className}`}>Résultats</h3>
                <p className="text-2xl font-bold text-white-400">{analysisResult.totalEntries}</p>
              </div>
           
          </div>
          <div className="flex justifiy-center items-center gap-5  bg-[#10b981]/70 bg-radial-[at_5%_25%] from-[#10b981]/70 to-[#3bb861] to-75%  bg-opacity-70 p-4 rounded-lg border border-[#10b981]/40">
            <div className='bg-white/30 w-fit h-fit  p-5  rounded-full'><BsFillTelephoneFill></BsFillTelephoneFill></div>
            <div>
               <h3 className="font-semibold text-white-700">Numéros de téléphone</h3>
            <p className="text-2xl font-bold text-white-800">
              {analysisResult.filledPhoneNumbers} <span className="text-sm text-white/50">({analysisResult.phoneNumberPercentage}%)</span>
            </p>
            </div>
           
          </div>
          <div className="flex justifiy-center items-center gap-5  bg-[#10b981]/70 bg-radial-[at_25%_25%] from-[#10b981]/70 to-[#3bb861] to-75%  bg-opacity-70 p-4 rounded-lg border border-[#10b981]/40">
            <div className='bg-white/30 w-fit h-fit  p-5  rounded-full'><AiFillMail className='text'></AiFillMail></div>
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
        <div className="bg-white/5 p-4 border border-white/10 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-4">Distribution de genres</h2>
          {topMainCategoryData ? (
            <div className="relative h-80">
              <canvas id="chart1" ref={topMainCategoryRef}></canvas>
            </div>
          ) : (
            <div className="text-center py-12 text-white-500">
              No gender data found in CSV
            </div>
          )}
        </div>
        <div className="bg-white/5  bg-opacity-70 p-4 border border-white/10 rounded-lg  shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-4">Validité de données</h2>
          {completionChartData ? (
            <div className="relative h-80">
              <canvas id="chart2" ref={completionChartRef}></canvas>
            </div>
          ) : (
            <div className="text-center py-12 text-white">
              Upload a CSV file to analyze data completion
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 h-150">
        <div className="bg-white/5 border-white p-4 border border-white/10 rounded-lg shadow-sm">
          <FranceMap csvFile={csvString} />
        </div>

        
      </div>
      </>)}
      
      
    </div>
    
  );
}