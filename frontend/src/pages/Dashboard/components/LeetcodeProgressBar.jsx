// src/pages/Dashboard/components/LeetcodeProgressBar.jsx
import { Box, Typography, LinearProgress, Paper, Grid } from '@mui/material';
import { CheckCircle as CheckIcon, TrendingUp as StreakIcon } from '@mui/icons-material';

const LeetcodeProgressBar = ({ data }) => {
  const { problemsSolved, streak } = data;

  return (
    <Paper sx={{ padding: 3, marginBottom: 3, boxShadow: 3, borderRadius: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Leetcode Progress</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CheckIcon sx={{ color: '#4CAF50', marginRight: 1 }} />
            <Typography variant="body2">Problems Solved: {problemsSolved}</Typography>
          </Box>
          <LinearProgress variant="determinate" value={(problemsSolved / 1000) * 100} sx={{ marginBottom: 2 }} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Leetcode Streak</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <StreakIcon sx={{ color: '#FFC107', marginRight: 1 }} />
            <Typography variant="body2">Streak: {streak} days</Typography>
          </Box>
          <LinearProgress variant="determinate" value={(streak / 30) * 100} sx={{ marginBottom: 2 }} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LeetcodeProgressBar;
