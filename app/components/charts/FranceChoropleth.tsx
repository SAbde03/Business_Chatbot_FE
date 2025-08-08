import React, { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMapModule from 'highcharts/modules/map';
import frMapData from '@highcharts/map-collection/countries/fr/fr-all.geo.json';

// Initialize Highcharts modules
if (typeof Highcharts === 'object') {
  HighchartsMapModule(Highcharts);
}

interface MapDataPoint {
  code: string;
  value: number;
}

const FranceMap: React.FC = () => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sample data - replace with your actual data
  const mapData: MapDataPoint[] = [
    { code: 'fr-cor', value: 10 },
    { code: 'fr-bre', value: 11 },
    { code: 'fr-pdl', value: 12 },
    // Add all other regions...
  ];

  useEffect(() => {
    if (chartRef.current) {
      // Register map data
      Highcharts.maps['france'] = frMapData;
      setIsLoaded(true);
    }
  }, []);

  const chartOptions: Highcharts.Options = {
    chart: {
      map: 'france',
      backgroundColor: 'transparent',
    },
    title: {
      text: 'France Regional Data',
      style: {
        color: '#333',
        fontSize: '18px',
      },
    },
    mapNavigation: {
      enabled: true,
      buttonOptions: {
        verticalAlign: 'bottom',
      },
    },
    colorAxis: {
      min: 0,
      minColor: '#e6f7ff',
      maxColor: '#1890ff',
    },
    tooltip: {
      headerFormat: '',
      pointFormat: '<b>{point.name}</b><br>Value: {point.value}',
    },
    series: [{
      type: 'map',
      name: 'France',
      data: mapData.map(item => ({
        'hc-key': item.code,
        value: item.value,
      })),
      dataLabels: {
        enabled: true,
        format: '{point.name}',
      },
      states: {
        hover: {
          color: '#a4d8ff',
        },
      },
    }],
    credits: {
      enabled: false,
    },
  };

  if (!isLoaded) {
    return <div className="map-loading">Loading map data...</div>;
  }

  return (
    <div className="map-container" style={{ height: '600px', width: '100%' }}>
      <HighchartsReact
        highcharts={Highcharts}
        constructorType={'mapChart'}
        options={chartOptions}
        ref={chartRef}
      />
    </div>
  );
};

export default FranceMap;