// src/components/StatsCard/StatsCard.jsx
import { Box, Typography, Paper, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled components
const CardWrapper = styled(Paper)(({ theme, accentcolor }) => ({
  position: 'relative',
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: 8,
    backgroundColor: accentcolor || theme.palette.primary.main,
    borderRadius: `${theme.shape.borderRadius}px 0 0 ${theme.shape.borderRadius}px`
  }
}));

const IconBox = styled(Box)(({ theme, iconcolor }) => ({
  width: 48,
  height: 48,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: iconcolor ? `${iconcolor}15` : theme.palette.primary.light + '15',
  marginBottom: theme.spacing(2)
}));

const ProgressBar = styled(LinearProgress)(({ theme, barcolor }) => ({
  height: 6,
  borderRadius: 3,
  backgroundColor: theme.palette.grey[100],
  '& .MuiLinearProgress-bar': {
    backgroundColor: barcolor || theme.palette.primary.main
  }
}));

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  progress, 
  accentColor, 
  iconColor 
}) => {
  return (
    <CardWrapper accentcolor={accentColor} elevation={0}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <IconBox iconcolor={iconColor}>
            {icon}
          </IconBox>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            {value}
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ mt: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Box></Box>
          <Typography variant="caption" color="text.secondary">
            {`${progress}%`}
          </Typography>
        </Box>
        <ProgressBar 
          variant="determinate" 
          value={progress} 
          barcolor={accentColor}
        />
      </Box>
    </CardWrapper>
  );
};

export default StatsCard;