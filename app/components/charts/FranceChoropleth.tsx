// components/FranceChoropleth.tsx
import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { ChoroplethController, GeoFeature, ColorScale, ProjectionScale } from 'chartjs-chart-geo';
import * as topojson from 'topojson-client';

// Type definitions
type TopoJSON = {
  type: string;
  objects: {
    regions: {
      type: string;
      geometries: any[];
    };
  };
  arcs: any[];
};

type RegionFeature = {
  type: string;
  properties: {
    name: string;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: any[];
  };
};

type ChoroplethDataPoint = {
  feature: RegionFeature;
  value: number;
};

// Register chart.js components
Chart.register(ChoroplethController, GeoFeature, ColorScale, ProjectionScale);

export default function FranceChoropleth() {
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!canvasRef.current) return;

      try {
        // Fetch France regions TopoJSON data
        const response = await fetch(
          'https://raw.githubusercontent.com/rveciana/d3-composite-projections/master/test/data/france.json'
        );
        const france: TopoJSON = await response.json();

        // Convert TopoJSON to GeoJSON features
        const regions = topojson.feature(france, france.objects.regions).features as RegionFeature[];

        // Create projection for France
        const projection = d3.geoConicConformalFrance()
          .scale(2500)
          .translate([400, 300]);

        if (chartRef.current) {
          chartRef.current.destroy();
        }

        // Create the choropleth chart
        chartRef.current = new Chart(canvasRef.current.getContext('2d')!, {
          type: 'choropleth',
          data: {
            labels: regions.map((d, i) => d.properties.name || `Region ${i}`),
            datasets: [{
              label: 'French Regions',
              outline: regions,
              data: regions.map((d): ChoroplethDataPoint => ({
                feature: d,
                value: Math.random() * 100 // Replace with your actual data
              })),
              backgroundColor: (context) => {
                if (context.dataIndex === undefined) return 'transparent';
                const value = (context.dataset.data[context.dataIndex] as ChoroplethDataPoint).value;
                return `hsl(${200 - value * 2}, 70%, 50%)`;
              }
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'right'
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const dataPoint = context.raw as ChoroplethDataPoint;
                    return `${dataPoint.feature.properties.name}: ${dataPoint.value.toFixed(2)}`;
                  }
                }
              }
            },
            scales: {
              xy: {
                projection: () => projection
              },
              color: {
                display: true,
                position: 'bottom',
                quantize: 5,
                legend: {
                  position: 'bottom-right'
                }
              }
            }
          }
        });
      } catch (error) {
        console.error('Error loading map data:', error);
      }
    };

    fetchData();

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[600px]">
      <canvas ref={canvasRef} />
    </div>
  );
}