import React from 'react';
import { Typography } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { SalesData } from '../../utils/dataProcessor';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface ChartsProps {
  data: SalesData;
  chartType: 'designPackages' | 'packageTypes';
}

const Charts: React.FC<ChartsProps> = ({ data, chartType }) => {
  const designPackagesData = {
    labels: Object.entries(data.designPackages).map(([type, count]) => `${type} (${count})`),
    datasets: [
      {
        data: Object.values(data.designPackages),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
        ],
      },
    ],
  };

  const packageTypesData = {
    labels: Object.keys(data.packageTypes),
    datasets: [
      {
        data: Object.values(data.packageTypes),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 20,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== undefined) {
              label += context.parsed;
            }
            return label;
          }
        }
      }
    },
  };

  const renderChart = () => {
    switch (chartType) {
      case 'designPackages':
        return <Pie data={designPackagesData} options={chartOptions} />;
      case 'packageTypes':
        return <Pie data={packageTypesData} options={chartOptions} />;
      default:
        return <Typography>Invalid chart type</Typography>;
    }
  };

  return (
    <div style={{ height: '300px' }}>
      {renderChart()}
    </div>
  );
};

export default Charts;