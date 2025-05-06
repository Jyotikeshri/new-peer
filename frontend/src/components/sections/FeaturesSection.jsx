import { Container, Typography, Box } from '@mui/material';
import FeatureCard from '../common/FeatureCard';

const features = [
  {
    title: 'Smart Matching',
    description: 'Our AI algorithm connects you with study partners who complement your learning style.',
    gradient: 'bg-card-gradient-1',
    iconName: 'ConnectionIcon'
  },
  {
    title: 'Virtual Study Rooms',
    description: 'Collaborate in real-time with video, audio, and screen sharing tools.',
    gradient: 'bg-card-gradient-2',
    iconName: 'VideoIcon'
  },
  {
    title: 'Progress Tracking',
    description: 'Monitor your learning goals and achievements with detailed analytics.',
    gradient: 'bg-card-gradient-3',
    iconName: 'ChartIcon'
  }
];

const FeaturesSection = () => {
  return (
    <Box className="py-16 bg-white">
      <Container maxWidth="lg">
        <Box className="text-center mb-12">
          <Typography variant="h2" className="text-4xl font-bold mb-4">
            Features That Set Us Apart
          </Typography>
          <Box className="w-24 h-1 bg-accent-gradient mx-auto mb-8"></Box>
          <Typography variant="body1" className="text-text-gray max-w-3xl mx-auto mb-10">
            Discover how Peer Network transforms your learning experience with our unique, data-driven approach to peer collaboration.
          </Typography>
        </Box>
      
        {/* Horizontal layout using flexbox */}
        <Box className="flex flex-col md:flex-row gap-8 justify-center">
          {features.map((feature, index) => (
            <Box key={index} className="w-full md:w-1/3">
              <FeatureCard 
                title={feature.title} 
                description={feature.description} 
                gradientClass={feature.gradient}
                iconName={feature.iconName}
              />
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturesSection;