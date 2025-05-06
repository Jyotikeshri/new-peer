// src/components/common/FeatureCard.jsx
import { Box, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';

// Import icons from @mui/icons-material as needed
import GroupIcon from '@mui/icons-material/Group';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import BarChartIcon from '@mui/icons-material/BarChart';

const FeatureCard = ({ title, description, gradientClass, iconName }) => {
  // Map icon names to components
  const getIcon = (name) => {
    switch (name) {
      case 'ConnectionIcon':
        return <GroupIcon className="text-white text-5xl" />;
      case 'VideoIcon':
        return <VideoCallIcon className="text-white text-5xl" />;
      case 'ChartIcon':
        return <BarChartIcon className="text-white text-5xl" />;
      default:
        return <GroupIcon className="text-white text-5xl" />;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Paper className="h-full rounded-3xl cursor-pointer overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
        <Box className="p-8 h-full flex flex-col">
          <Box className={`${gradientClass} w-20 h-20 rounded-full flex items-center justify-center mb-8`}>
            {getIcon(iconName)}
          </Box>
          <Typography variant="h4" className="font-bold mb-4 text-deep-navy">
            {title}
          </Typography>
          <Typography variant="body1" className="text-text-gray flex-grow text-lg">
            {description}
          </Typography>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default FeatureCard;