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

const csvString = `idS,userId,phoneNumber,firstName,lastName,gender,currentCity,currentCountry,email,currentDepartment,currentRegion,hometownCity,hometownCountry,workplace,relationshipStatus,mainCategory
6.17E+11,4.97E+16,336308019,Mohamed,Rhal,male,Paris,france,aurlie.contesse@hopitalmilitairesainteanne.com,Paris,ile-de-France,Hirson,france,hopital militaire sainte anne,married,restaurant
1.78E+11,1.84E+18,3363080194,Aurélie,Contesse,female,Paris,france,aurlie.contesse@hopitalmilitairesainteanne.com,Paris,bretagne,Hirson,france,hopital militaire sainte anne,married,cafe
7.32E+11,1.78E+18,3363391068,Esmir Hr,Dolce Habibi,male,Paris,france,esmirhr.dolcehabibi@gucci.com,Paris,normandie,Budapest,hungary,gucci,married,braserie
54955659155,2.16E+18,3366202734,Arie,Miles,male,Paris,france,arie.miles@yahoo.com,Paris,ile-de-France,Budapest,hungary,gucci,married,patiserie
8.11E+11,1.61E+18,3363559779,Sonia,Sofiane,female,Paris,france,sonia.sofiane@hm.com,Paris,ile-de-France,Paris,france,h&m,married,yahya
6.17E+11,4.97E+16,3363080194,Mohamed,Rhal,male,Paris,france,aurlie.contesse@hopitalmilitairesainteanne.com,Paris,ile-de-France,Hirson,france,hopital militaire sainte anne,married,restaurant
1.78E+11,1.84E+18,3363080194,Aurélie,Contesse,female,Paris,france,aurlie.contesse@hopitalmilitairesainteanne.com,Paris,bretagne,Hirson,france,hopital militaire sainte anne,married,restaurant
7.32E+11,1.78E+18,3363391068,Esmir Hr,Dolce Habibi,male,Paris,france,esmirhr.dolcehabibi@gucci.com,Paris,normandie,Budapest,hungary,gucci,married,restaurant
54955659155,2.16E+18,3366202734,Arie,Miles,male,Paris,france,arie.miles@yahoo.com,Paris,ile-de-France,Budapest,hungary,gucci,married,restaurant
8.11E+11,1.61E+18,3363559779,Sonia,Sofiane,female,Paris,france,sonia.sofiane@hm.com,Paris,ile-de-France,Paris,france,h&m,married,restaurant
`;
const csvStrin =`placeId,name,description,isSpendingOnAds,reviews,rating,website,mockEmail,phone,canClaim,ownerId,ownerName,ownerLink,featuredImage,mainCategory,categories,workdayTiming,isTemporarilyClosed,isPermanentlyClosed,closedOn,address,reviewKeywords,link,status,priceRange,reviewsPerRating,featuredQuestion,reviewsLink,latitude,longitude,coordinates,plusCode,ward,street,city,postalCode,state,countryCode,timeZone,cid,dataId,about,images,hours,popularTimes,mostPopularTimes,featuredReviews,detailedReviews,query,score,scoreCategory,competitors
ChIJlSJiH6XAyRIRDskibzSf7PU,LE COURT CIRCUIT,,False,376,4.4,https://le-court-circuit.eatbu.com/?lang=fr,general@le-court-circuit.eatbu.com,+33 4 91 47 22 02,True,,LE COURT CIRCUIT (Owner),,https://lh3.ggpht.com/p/AC9h4nol-xLf7St1vcrn0up-N2RVEscrAyHb7Vqiq9ljwa4NQpr9Qka9_Hp8z01W5xgmjJACfX8q5I7rIXLKeyabwFLycMcOCpVvYMQvz7nti8XZUEoFM31JS29XN2rD7SWOehRn9faN=s1024,Restaurant,"['Restaurant', 'French restaurant', 'Mediterranean restaurant', 'Organic restaurant', 'Vegetarian restaurant']",7 AM–1 AM,False,False,,"23 Pl. Notre Dame du Mont, 13006 Marseille, France","[{'count': 25, 'keyword': 'price'}, {'count': 14, 'keyword': 'cuisine'}]",https://www.google.com/maps/place/LE+COURT+CIRCUIT,Closed ⋅ Opens 7 AM,€10–20,"{'1': 9, '2': 8, '3': 30, '4': 94, '5': 235}",,,43.292008,5.3848145,"{'lon': 5.3848145, 'lat': 43.292008}","79RM+RW Marseille, France",,23 Pl. Notre Dame du Mont,Marseille,13006,Provence-Alpes-Côte d'Azur,FR,Europe/Paris,17720713681347725582,0x12c9c0a51f622295:0xf5ec9f346f22c90e,"[{'name': 'Service options', 'options': ['Outdoor seating', 'Dine-in', 'Delivery']}]","[{'link': 'https://lh3.ggpht.com/p/AC9h4nol-xLf7St1vcrn0up-N2RVEscrAyHb7Vqiq9ljwa4NQpr9Qka9_Hp8z01W5xgmjJACfX8q5I7rIXLKeyabwFLycMcOCpVvYMQvz7nti8XZUEoFM31JS29XN2rD7SWOehRn9faN=s1024'}]","[{'day': 'Monday', 'times': ['7 AM–1 AM']}]",,,"[{'name': 'Ada P', 'rating': 5, 'reviewText': 'Decent and relaxed bar/ cafe/ restaurant with lots of outdoor seating.'}]",,café restaurant in marseille,,,"[{'name': 'Matza', 'rating': 4.7, 'mainCategory': 'Restaurant'}]"
ChIJuyuNXdfAyRIRPFLPP-7QIJs,Restaurant Michel,"Traditional bouillabaisse since 1946",False,1051,4.5,https://fr.gaultmillau.com/fr/restaurant/restaurant-michel,general@fr.gaultmillau.com,+33 4 91 52 64 22,False,110849437673541674071,Restaurant Michel (Owner),https://www.google.com/maps/contrib/110849437673541674071,https://lh3.ggpht.com/p/AC9h4npX2hBqBhlSUZ64g_1RxV0mKLDdqY8uucXnEb0_rGaYC-J6DzNklkQwUrwiezl5H-nX56H10tcj6BxqN6Ywvfk0vOMhy2qqghBxsPJmL-lW-U7zaFhl2nLRRmm9Ce3ufZxSwZFe=s1024,Restaurant,"['Restaurant']","['12–1:30 PM']",False,False,,"6 Rue des Catalans, 13007 Marseille, France","[{'count': 430, 'keyword': 'bouillabaisse'}]",https://www.google.com/maps/place/Restaurant+Michel,Closed ⋅ Opens 12 PM,"['€100+']","{'1': 47, '2': 33, '3': 51, '4': 143, '5': 777}",,,43.2909547,5.3559865,"{'lon': 5.3559865, 'lat': 43.2909547}","79R4+99 Marseille, France",,6 Rue des Catalans,13007,Provence-Alpes-Côte d'Azur,FR,Europe/Paris,11178163996824916540,0x12c9c0d75d8d2bbb:0x9b20d0ee3fcf523c,"[{'name': 'Service options', 'options': ['Dine-in', 'Delivery', 'Takeout']}]","[{'link': 'https://lh3.ggpht.com/p/AC9h4npX2hBqBhlSUZ64g_1RxV0mKLDdqY8uucXnEb0_rGaYC-J6DzNklkQwUrwiezl5H-nX56H10tcj6BxqN6Ywvfk0vOMhy2qqghBxsPJmL-lW-U7zaFhl2nLRRmm9Ce3ufZxSwZFe=s1024'}]","[{'day': 'Monday', 'times': ['12–1:30 PM']}]",,,"[{'name': 'Mark Kilian', 'rating': 4, 'reviewText': 'Authentic bouillabaisse experience.'}]",,café restaurant in marseille,,,"[{'name': 'Chez Fonfon', 'rating': 4.1, 'mainCategory': 'Fish restaurant'}]"`;
type AnalysisResult = {
  filledPhoneNumbers: number;
  filledEmails: number;
  filledCompanyName:number;
  filledAddress:number;
  totalEntries: number;
  phoneNumberPercentage: string;
  emailPercentage: string;
};
type mainCategoryList = {
  labels: string[];
  data_sorted:any;
}
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
  const [mainCategoryList, setMainCategoryList] = useState<mainCategoryList | null>(null);
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
    Papa.parse<CsvRow>(csvFile, {
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
    let filledCompanyName=0;
    let filledAddress=0;
    const totalEntries = data.length;

    data.forEach(entry => {
      if(isB2Cclicked){
        if (entry.phoneNumber && String(entry.phoneNumber).trim() !=='' && String(entry.phoneNumber).length == 10 ) {
        filledPhoneNumbers++;
      }
      if (entry.email && String(entry.email).trim() !== '' && String(entry.email).includes('@',)) {
        filledEmails++;
      }
      }
      if(isB2Bcliked){
        if (entry.phone && String(entry.phone).trim() !=='' && String(entry.phone).length == 17 ) {
        filledPhoneNumbers++;
      }
      if (entry.mockEmail && String(entry.mockEmail).trim() !== '' && String(entry.mockEmail).includes('@',)) {
        filledEmails++;
      }
      if(entry.name && String(entry.name).trim()!==''){
        filledCompanyName++;
      }
      if(entry.address && String(entry.address).trim()!==''){
        filledAddress++;
      }
      }
      
    });

    return {
      filledPhoneNumbers,
      filledEmails,
      filledCompanyName,
      filledAddress,
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
      
      labels: isB2Bcliked ? ['Numéros de tel', 'Emails','Nom','adresse'] : ['Numéros de tel', 'Emails'],
      plugins:{
        title: {
              display: false,
              text: '',
            }
      },
      datasets: [
        {
          label: 'Fournies',
          data: isB2Bcliked ?[analysis.filledPhoneNumbers, analysis.filledEmails, analysis.filledCompanyName, analysis.filledAddress] : [analysis.filledPhoneNumbers, analysis.filledEmails],
          backgroundColor: ['#3bb861ff'],
          
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
    const CountMainCategories = (data: CsvRow[]): mainCategoryList => {
    const categoryCounts: Record<string, number> = {};

    data.forEach((row) => {
    if (row.mainCategory) {
      categoryCounts[row.mainCategory] = (categoryCounts[row.mainCategory] || 0) + 1;
    }
  });
    const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1]);
    const labels = sortedCategories.map(([category]) => category).slice(0, 5);;
    const data_sorted = sortedCategories.map(([_, count]) => count).slice(0, 5);;
    
    return {
      labels,
      data_sorted
    };
  };
  const result = CountMainCategories(data);
    setMainCategoryList(result);
    setTopMainCategoryData({
      labels: result.labels,
      plugins:{
        title: {
              display: false,
              text: '',
            }
        
      },
      datasets: [
        {
          label:'Organisme',
          data:result.data_sorted,
          backgroundColor: ['#3bb861c0', '#3bb861c0'],
         
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
        colors.push('#3bb861ff');
      }
      
      if (maleCount > 0) {
        labels.push('Homme');
        values.push(maleCount);
        colors.push('#73ff98ff');
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
                color: '#ffffffff' 
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#F3F4F6', 
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
              color: '#374151', 
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
                color: '#ffffffff' 
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
              color: '#ffffffff', 
              font: { size: 16 }
            }
          },
          scales: {
            x: { 
              stacked: true, 
              title: { 
                display: true, 
                text: 'Nombres d\'entitées',
                color: '#6B7280' 
              },
              grid: {
                color: 'rgba(209, 213, 219, 0.3)' 
              },
              ticks: {
                color: '#6B7280' 
              }
            },
            y: { 
              stacked: true,
              grid: {
                color: 'rgba(209, 213, 219, 0.3)'
              },
              ticks: {
                color: '#6B7280' 
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
                color: '#ffffffff' 
              }
            },
            tooltip: {
              backgroundColor: 'rgba(10, 10, 10, 0.8)',
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
              color: '#ffffffff', 
              font: { size: 16 }
            }
          },
          scales: {
            x: { 
              stacked: true, 
              title: { 
                display: true, 
                text: 'Nombres d\'entitées',
                color: '#6B7280' 
              },
              grid: {
                color: 'rgba(209, 213, 219, 0.07)' 
              },
              ticks: {
                color: '#6B7280' 
              }
            },
            y: { 
              stacked: true,
              grid: {
                color: 'rgba(209, 213, 219, 0.04)' 
              },
              ticks: {
                color: '#6B7280' 
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
            <div className="text-center py-12 text-white-500 ">
              Aucune donnée de genre
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
              Aucune donnée
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 h-150">
        <div className="bg-white/5 border-white p-4 border border-white/10 rounded-lg shadow-sm">
          <FranceMap csvFile={csvFile} />
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
          <h2 className="text-lg font-semibold text-white mb-4">Meilleures Catégories</h2>
          {topMainCategoryData ? (
            <div className="relative h-80">
              <canvas id="chart1" ref={topMainCategoryRef}></canvas>
            </div>
          ) : (
            <div className="text-center py-12 text-white-500">
              Aucune donnée de genre.
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
              télécharger un fichier csv
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 h-150">
        <div className="bg-white/5 border-white p-4 border border-white/10 rounded-lg shadow-sm">
          <FranceMap csvFile={csvFile} />
        </div>

        
      </div>
      </>)}
      
      
    </div>
    
  );
}