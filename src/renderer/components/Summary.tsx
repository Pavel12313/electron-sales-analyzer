import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText } from '@mui/material';
import { SalesData } from '../../utils/dataProcessor';

interface SummaryProps {
  data: SalesData;
}

const Summary: React.FC<SummaryProps> = ({ data }) => {
  return (
    <Paper style={{ padding: '20px', height: '100%' }}>
      <Typography variant="h6" gutterBottom>Summary</Typography>
      <Typography variant="subtitle1">Total Packages Sold: {data.totalPackages}</Typography>
      <Typography variant="subtitle1" gutterBottom>Package Types:</Typography>
      <List dense>
        {Object.entries(data.packageTypes).map(([type, count]) => (
          <ListItem key={type}>
            <ListItemText primary={`${type} - ${count}`} />
          </ListItem>
        ))}
      </List>
      <Typography variant="subtitle1" gutterBottom>Design Packages:</Typography>
      <List dense>
        {Object.entries(data.designPackages).map(([type, count]) => (
          <ListItem key={type}>
            <ListItemText primary={`${type} - ${count}`} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Summary;