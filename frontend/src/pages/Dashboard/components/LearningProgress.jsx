// src/pages/Dashboard/components/LearningProgress.jsx
import { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  ToggleButtonGroup, 
  ToggleButton,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Sample data for the chart
const generateData = (timeframe) => {
  if (timeframe === 'weekly') {
    return [
      { name: 'Mon', soloStudy: 3, groupStudy: 2.5 },
      { name: 'Tue', soloStudy: 3.5, groupStudy: 1.8 },
      { name: 'Wed', soloStudy: 2.7, groupStudy: 3.2 },
      { name: 'Thu', soloStudy: 2.8, groupStudy: 1.4 },
      { name: 'Fri', soloStudy: 3.1, groupStudy: 2.2 },
      { name: 'Sat', soloStudy: 2.5, groupStudy: 1.1 },
      { name: 'Sun', soloStudy: 2.9, groupStudy: 0.8 },
    ];
  } else if (timeframe === 'monthly') {
    return [
      { name: 'Week 1', soloStudy: 15, groupStudy: 10 },
      { name: 'Week 2', soloStudy: 18, groupStudy: 12 },
      { name: 'Week 3', soloStudy: 14, groupStudy: 15 },
      { name: 'Week 4', soloStudy: 17, groupStudy: 11 },
    ];
  } else {
    return [
      { name: 'Jan', soloStudy: 65, groupStudy: 42 },
      { name: 'Feb', soloStudy: 58, groupStudy: 38 },
      { name: 'Mar', soloStudy: 70, groupStudy: 45 },
      { name: 'Apr', soloStudy: 62, groupStudy: 52 },
      { name: 'May', soloStudy: 74, groupStudy: 58 },
      { name: 'Jun', soloStudy: 68, groupStudy: 42 },
    ];
  }
};

const LearningProgress = () => {
  const [timeframe, setTimeframe] = useState('weekly');
  const [data, setData] = useState(generateData('weekly'));

  const handleTimeframeChange = (event) => {
    const newTimeframe = event.target.value;
    setTimeframe(newTimeframe);
    setData(generateData(newTimeframe));
  };

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Your Learning Progress
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={timeframe}
            onChange={handleTimeframeChange}
            displayEmpty
            variant="outlined"
            sx={{ borderRadius: 4 }}
          >
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="yearly">Yearly</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tickCount={6} 
            tickFormatter={(value) => `${value}h`} 
          />
          <Tooltip 
            formatter={(value) => [`${value} hours`, undefined]}
            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          />
          <Legend 
            align="center"
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ paddingTop: 20 }}
          />
          <Bar 
            dataKey="soloStudy" 
            name="Solo Study" 
            stackId="a" 
            fill="#29B6F6" 
            radius={[4, 4, 0, 0]} 
          />
          <Bar 
            dataKey="groupStudy" 
            name="Group Study" 
            stackId="a" 
            fill="#0288D1" 
            radius={[4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default LearningProgress;