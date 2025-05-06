// src/pages/HomePage.jsx
import React from 'react';
import HeroSection from '../components/sections/HeroSection';
import FeaturesSection from '../components/sections/FeaturesSection';
import HowItWorksSection from '../components/sections/HowItWorksSection';
import TestimonialsSection from '../components/sections/TestimonialsSection';
import UniversitiesSection from '../components/sections/UniversitiesSection';
import CtaSection from '../components/sections/CtaSection';
// import CtaSection from '../components/sections/CtaSection';

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <UniversitiesSection />
      
      {/* Features section with ID for navigation */}
      <div id="features">
        <FeaturesSection />
      </div>
      
      {/* How It Works section has its own ID internally */}
      <HowItWorksSection />
      
      {/* Testimonials section has its own ID internally */}
      <TestimonialsSection />
      
      <CtaSection />
    </>
  );
};

export default HomePage;