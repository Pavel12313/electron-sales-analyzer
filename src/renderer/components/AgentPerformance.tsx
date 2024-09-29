import React from 'react';
import { Typography, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent, List, ListItem, ListItemText } from '@mui/material';
import { SalesData } from '../../utils/dataProcessor';
import { Bar } from 'react-chartjs-2';

interface AgentPerformanceProps {
  data: SalesData;
  showDetails?: boolean;
  selectedAgent?: string;
  onAgentSelect: (agent: string) => void;
}

const AgentPerformance: React.FC<AgentPerformanceProps> = ({ data, showDetails = false, selectedAgent = '', onAgentSelect }) => {
  const handleAgentChange = (event: SelectChangeEvent<string>) => {
    onAgentSelect(event.target.value as string);
  };

  const agentData = selectedAgent ? data.agents[selectedAgent] : null;

  const chartData = {
    labels: Object.keys(data.agents),
    datasets: [
      {
        label: 'Total Packages Sold',
        data: Object.values(data.agents).map(agent => agent.totalSold),
        backgroundColor: '#36A2EB',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            return `Agent: ${tooltipItems[0].label}`;
          },
          label: (tooltipItem) => {
            return `Packages Sold: ${tooltipItem.formattedValue}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: 90,
          minRotation: 90
        },
      },
      y: {
        beginAtZero: true,
      },
    },
    onClick: (_: any, elements: any[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const agent = Object.keys(data.agents)[index];
        onAgentSelect(agent);
      }
    },
  };

  if (!showDetails) {
    return (
      <div style={{ height: '300px' }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    );
  }

  return (
    <>
      <Typography variant="h6" gutterBottom>Agent Performance</Typography>
      <FormControl fullWidth style={{ marginBottom: '20px' }}>
        <InputLabel>Select Agent</InputLabel>
        <Select value={selectedAgent} onChange={handleAgentChange}>
          {Object.entries(data.agents)
            .filter(([_, agentData]) => agentData.totalSold > 0)
            .map(([agent, _]) => (
              <MenuItem key={agent} value={agent}>{agent}</MenuItem>
            ))}
        </Select>
      </FormControl>
      {agentData && (
        <>
          <Typography variant="subtitle1">Total Packages Sold: {agentData.totalSold}</Typography>
          <Typography variant="subtitle1" gutterBottom>Design Packages:</Typography>
          <List dense>
            {Object.entries(agentData.designPackages).map(([type, count]) => (
              <ListItem key={type}>
                <ListItemText primary={`${type} - ${count}`} />
              </ListItem>
            ))}
          </List>
          <Typography variant="subtitle1" gutterBottom>Statuses:</Typography>
          <List dense>
            {Object.entries(agentData.statuses).map(([status, count]) => (
              <ListItem key={status}>
                <ListItemText primary={`${status}: ${count}`} />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </>
  );
};

export default AgentPerformance;