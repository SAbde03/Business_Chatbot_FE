import { useState, useEffect, useRef } from 'react';
import france from '@svg-maps/france.regions';
import Papa from 'papaparse';

interface RegionData {
  name: string;
  value: number;
  color: string;
}
interface SvgLocation {
  id: string;
  path: string;
  // Add other properties if present in france.locations (e.g., name, centroid, etc.)
}
interface MapProps{
  csvFile: string;
  isB2Bclicked?:boolean;
  isB2Cclicked?:boolean;
}
export default function FranceMap({csvFile, isB2Bclicked, isB2Cclicked}:MapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<{ name: string; value: number } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: -20, y: -20 });
  const [regionData, setRegionData] = useState<Record<string, { value: number; color: string }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  //const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  //const files = event.target.files;
  //if (!files || files.length === 0) return;

 // const file = files[0];
  //if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
  //  setError('Please upload a valid CSV file');
   // return;
//  }
  
  //setError('');
  //setIsLoading(true);
  
  useEffect(() => {
  if (!csvFile) return;


 
  const cleanedCsv =csvFile.replace(/\\s\\n/g, '')        // Remove escaped \s\n
    .replace(/\s+\n/g, '\n')        // Clean whitespace before newlines
    .replace(/\r\n/g, '\n')         // Normalize line endings
    .replace(/\r/g, '\n')            // Handle Mac line endings
    .replace(/\s*,\s*/g, ',')        // Clean spaces around commas
    .replace(/\n\n+/g, '\n')        // Remove double newlines
    .trim();                         // Remove leading/trailing whitespace

    console.log("csvFile content:", csvFile)
  Papa.parse(cleanedCsv, {
    delimiter: ',',        // Auto-detect or specify
    newline: '\n',        // Handle different line endings
    quoteChar: '"',       // Handle quoted fields
    skipEmptyLines: true, // Clean up data
    header: true,         // Convert to objects
    dynamicTyping: false,
  transformHeader: (header) => header.trim(),  
    complete: (results) => {
      console.log("Parsing meta:", results.meta);
      console.log("[DEBUG] CSV parsed:", results.data.length, "rows");
      console.log("[DEBUG] First 10 rows:", results.data.slice(0, 10));
      processCsvData(results.data);
      if (results.errors.length > 0) {
        setError('...');
        setIsLoading(false);
        return;
      }
      
      console.log("[DEBUG] ha fin 7best");
    },
    error: (error) => {
      
      setError('...');
      setIsLoading(false);
    },
  });
}, [csvFile]);

//};

function processCsvData(data: any[]) {
  
  const regionCounts: Record<string, number> = {};
  let unmappedRegions = new Set<string>();

  console.log("[DEBUG] Processing CSV data...");
  
  data.forEach((row, idx) => {
    if (row.currentRegion) {
      console.log(`[DEBUG] Row ${idx} - currentRegion raw:`, row.currentRegion);
      const region = normalizeRegionName(row.currentRegion);
      if (region) {
        console.log(`[DEBUG] Normalized '${row.currentRegion}' -> '${region}'`);
        regionCounts[region] = (regionCounts[region] || 0) + 1;
      } else {
        console.warn("[WARN] Unmapped region:", row.currentRegion);
        unmappedRegions.add(row.currentRegion);
      }
    }
  });

  if (unmappedRegions.size > 0) {
    console.warn('Unmapped regions list:', Array.from(unmappedRegions));
  }

  console.log("[DEBUG] Final region counts:", regionCounts);

  const maxCount = Object.values(regionCounts).reduce((sum, val) => sum + val, 0) + 1;
  console.log("[DEBUG] Max count:", maxCount);

  const newRegionData: Record<string, { value: number; color: string }> = {};
  
  france.locations.forEach(location => {
    newRegionData[location.id] = { 
      value: 0, 
      color: '#ffffffff' // Default gray
    };
  });

  Object.entries(regionCounts).forEach(([region, count]) => {
    const percentage = (count / maxCount) * 100;
    let color;
    if (percentage > 15) color = '#065f46';
    else if (percentage > 10) color = '#047857';
    else if (percentage > 8) color = '#059669';
    else if (percentage > 5) color = '#10b981';
    else color = '#00d69dff';

    
    newRegionData[region] = { value: count, color };
    console.log(`[DEBUG] Region '${region}' -> count: ${count}, percentage: ${percentage.toFixed(2)}%, color: ${color}`);
  });

  setRegionData(newRegionData);
  setIsLoading(false);
};



const normalizeRegionName = (region: string): string | null => {
  if (!region) return null;
  
  // First clean the region name
  const cleanedRegion = region
    .toLowerCase()
    .trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
    .replace(/[éèêë]/g, 'e')
    .replace(/[àâä]/g, 'a')
    .replace(/[îï]/g, 'i')
    .replace(/[ôö]/g, 'o')
    .replace(/[ùûü]/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/'/g, '')
    .replace(/\s+/g, '-')
    .replace(/côte/g, 'cote')
    .replace(/d'azur/g, 'dazur')
    .replace(/^normandy$/, 'normandie') 
    .replace(/^centre$/, 'centre-val-de-loire');

  // Map to SVG region IDs
  const regionMap: Record<string, string> = {
    'auvergne-rhone-alpes': 'ara',
    'bourgogne-franche-comte': 'bfc',
    'bretagne': 'bre',
    'centre-val-de-loire': 'cvl',
    'corse': 'cor',
    'grand-est': 'ges',
    'hauts-de-france': 'hdf',
    'ile-de-france': 'idf',
    'normandie': 'nor',
    'nouvelle-aquitaine': 'naq',
    'occitanie': 'occ',
    'pays-de-la-loire': 'pdl',
    'provence-alpes-cote-dazur': 'pac',
    'marseille': 'pac',
  };

  return regionMap[cleanedRegion] || null;
};

  const handleMouseMove = (event: React.MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const getRegionName = (id: string) => {
    const nameMap: Record<string, string> = {
    'ara': 'auvergne-rhone-alpes',
    'bfc': 'bourgogne-franche-comte',
    'bre': 'bretagne',
    'cvl': 'centre-val-de-loire',
    'cor': 'corse',
    'ges': 'grand-est',
    'hdf': 'hauts-de-france',
    'idf': 'ile-de-france',
    'nor': 'normandie',
    'naq': 'nouvelle-aquitaine',
    'occ': 'occitanie',
    'pdl': 'pays-de-la-loire',
    'pac': 'provence-alpes-cote-dazur',
    };
    return nameMap[id] || id;
  };
  console.log("[DEBUG] Rendering with regionData:", regionData);
  return (
    <div className="w-full h-[600px] rounded-lg p-4 relative">
      <h2 className="text-lg font-semibold text-white mb-4">Répartition géographique</h2>
      
      
      {isLoading ? (
        <div className="w-full h-[500px] bg-white/5 rounded-lg flex items-center justify-center">
          <div className="text-white">Loading data...</div>
        </div>
      ) : (
        <div className="w-full h-[500px] flex items-center justify-center relative">
          {Object.keys(regionData).length > 0 ? (
            <svg
              viewBox={france.viewBox}
              className="w-full h-full max-w-[600px] max-h-[600px] rounded-lg"
              onMouseMove={handleMouseMove}
            >
              {france.locations.map((location) => {
                const data = regionData[location.id] || { value:0, color: '#ffffffff' };
                return (
                  <path
                    key={location.id}
                    d={location.path}
                    fill={data.color}
                    stroke="rgba(188, 188, 188, 1)"
                    strokeWidth="0.5"
                    className="cursor-pointer transition-all duration-200 hover:brightness-110 hover:stroke-2"
                    onMouseEnter={() => setHoveredRegion({
                    name: getRegionName(location.id),
                    value: data.value
                  })}
                         onMouseLeave={() => setHoveredRegion(null)}
                  />
                );
              })}

              {/* <circle cx="300" cy="280" r="1.5" fill="white" opacity="0.9" />
              <text x="305" y="275" fill="white" fontSize="15">Lyon</text>

              <circle cx="200" cy="350" r="1.5" fill="white" opacity="0.9" />
              <text x="170" y="345" fill="white" fontSize="7">Toulouse</text>

              <circle cx="350" cy="350" r="1.5" fill="white" opacity="0.9" />
              <text x="355" y="345" fill="white" fontSize="7">Marseille</text>

              <circle cx="150" cy="320" r="1.5" fill="white" opacity="0.9" />
              <text x="110" y="315" fill="white" fontSize="7">Bordeaux</text>*/}
              <circle cx="290" cy="140" r="2" fill="white" opacity="0.9" />
              <text x="285" y="155" fill="white" fontSize="12" >Paris</text>

              
            </svg>
          ) : (
            <div className="w-full h-full bg-white/5 rounded-lg flex items-center justify-center">
              <div className="text-white">Upload a CSV file to visualize regional data</div>
            </div>
          )}

          {/* Legend */}
          {Object.keys(regionData).length > 0 && (
            <div className="absolute bottom-4 right-4 bg-black/80 p-3 rounded-lg">
              {isB2Cclicked?(
                  <h3 className="text-white text-sm font-semibold mb-2">Nombre de personnes</h3>
              ):(
                <h3 className="text-white text-sm font-semibold mb-2">Nombre d'organismes</h3>
              )}
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-800 rounded"></div>
                  <span className="text-white text-xs">80-100%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-700 rounded"></div>
                  <span className="text-white text-xs">60-80%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-600 rounded"></div>
                  <span className="text-white text-xs">40-60%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                  <span className="text-white text-xs">20-40%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tooltip */}
      
      {hoveredRegion && (
        
        <div 
          className="relative bg-black/90 text-white p-3 rounded-lg shadow-lg pointer-events-none z-50 border border-white/20"
          style={{
             position: "absolute",
            left: mousePosition.x,
            top: mousePosition.y,
          }}
        >
          {isB2Bclicked?(
            <>
            <div className="font-semibold text-[#10b981]">{hoveredRegion.name}</div>
            <div className="text-sm">Personnes: {hoveredRegion.value}</div>
            </>
          ):(
            <>
            <div className="font-semibold text-[#10b981]">{hoveredRegion.name}</div>
            <div className="text-sm">Organisme: {hoveredRegion.value}</div></>
          )}
          
        </div>
      )}
    </div>
  );
}