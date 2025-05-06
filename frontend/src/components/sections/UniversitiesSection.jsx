// src/components/sections/UniversitiesSection.jsx
import { Container, Box } from '@mui/material';

const UniversitiesSection = () => {
  const universities = [
    { name: 'HARVARD', logo: 'harvard-logo' },
    { name: 'Stanford', logo: 'stanford-logo' },
    { name: 'MIT', logo: 'mit-logo' },
    { name: 'Princeton', logo: 'princeton-logo' },
    { name: 'Oxford', logo: 'oxford-logo' },
  ];

  return (
    <Box className="bg-off-white py-8">
      <Container maxWidth="lg">
        <Box className="flex flex-wrap justify-center items-center gap-10">
          {universities.map((university) => (
            <Box key={university.name} className="text-deep-navy font-bold text-lg md:text-xl">
              {university.name}
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default UniversitiesSection;