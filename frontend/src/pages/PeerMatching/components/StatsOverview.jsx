import { Box, Typography, Divider } from '@mui/material';

const StatsOverview = ({ stats }) => {
  const statItems = [
    {
      value: stats.potentialMatches,
      label: 'Potential Matches',
      color: '#3B82F6'
    },
    {
      value: stats.highCompatibility,
      label: 'High Compatibility (>90%)',
      color: '#8B5CF6'
    },
    {
      value: stats.connectedWeek,
      label: 'Connected This Week',
      color: '#10B981'
    },
    {
      value: stats.studySessions,
      label: 'Study Sessions Scheduled',
      color: '#F59E0B'
    }
  ];

  return (
    <Box 
      sx={{ 
        backgroundColor: 'white',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        mb: 3,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ display: 'flex', width: '100%', textAlign: 'center' }}>
        {statItems.map((item, index) => (
          <Box 
            key={index} 
            sx={{ 
              flex: 1, 
              py: 2,
              px: 1,
              position: 'relative',
              '&:not(:last-child)::after': {
                content: '""',
                position: 'absolute',
                right: 0,
                top: '20%',
                bottom: '20%',
                width: 1,
                // backgroundColor: 'divider'
              }
            }}
          >
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: item.color, 
                mb: 0.5 
              }}
            >
              {item.value}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default StatsOverview;