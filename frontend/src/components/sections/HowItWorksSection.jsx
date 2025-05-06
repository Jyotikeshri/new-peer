// src/components/sections/HowItWorksSection.jsx
import React from 'react';
import { Container, Typography, Box, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import VideoChatIcon from '@mui/icons-material/VideoChat';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import find from "../../assets/step1.png";
import collab from "../../assets/step2.png";
import track from "../../assets/step3.png";



const steps = [
  {
    number: '1',
    title: 'Find Your Match',
    description: 'Our AI algorithm connects you with compatible study partners.',
    icon: <PersonSearchIcon className="text-4xl text-white" />,
    color: 'bg-teal-accent',
    image: find
  },
  {
    number: '2',
    title: 'Collaborate',
    description: 'Connect in virtual study rooms with video and collaborative tools.',
    icon: <VideoChatIcon className="text-4xl text-white" />,
    color: 'bg-bright-blue',
    image: collab
  },
  {
    number: '3',
    title: 'Track Progress',
    description: 'Monitor your improvement with detailed analytics and achievements.',
    icon: <EmojiEventsIcon className="text-4xl text-white" />,
    color: 'bg-pink-accent',
    image: track
  }
];

const HowItWorksSection = () => {
  return (
    <Box className="py-16 bg-off-white" id="how-it-works">
      <Container maxWidth="lg">
        <Box className="text-center mb-12">
          <Typography variant="h2" className="text-3xl font-bold mb-4 text-deep-navy">
            How It Works
          </Typography>
        </Box>

        <Box className="overflow-hidden">
          <Box className="flex flex-col lg:flex-row gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="w-full lg:w-1/3"
              >
                <Box className="bg-white cursor-pointer rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
                  {/* Image area */}
                  <Box className="relative">
                    <img 
                      src={step.image} 
                      alt={step.title} 
                      className="w-full h-58 object-cover"
                    />
                    <Box 
                      className={`${step.color} absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg`}
                    >
                      {step.number}
                    </Box>
                  </Box>
                  
                  {/* Content area */}
                  <Box className="p-6 flex-grow">
                    <Box className="flex items-center mb-4">
                      <Box className={`${step.color} p-2 rounded-lg mr-4`}>
                        {step.icon}
                      </Box>
                      <Typography variant="h5" className="font-bold text-deep-navy">
                        {step.title}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body1" className="text-text-gray">
                      {step.description}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        </Box>
        
        {/* Simple Get Started button */}
        <Box className="text-center mt-12">
          <button className="bg-accent-gradient text-lg font-bold text-white py-4 px-6 rounded-full hover:shadow-lg transition-all duration-300">
            Get Started
          </button>
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorksSection;