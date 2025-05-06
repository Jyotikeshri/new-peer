// MatchingLoadingScreen.jsx
import { Box, Container, Typography, LinearProgress, Paper, Grid } from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SchoolIcon from '@mui/icons-material/School';
import ForumIcon from '@mui/icons-material/Forum';

const MatchingLoadingScreen = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      bgcolor: '#F7F9FC'
    }}>
      <Container maxWidth="md">
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#07092F', mb: 2 }}>
            Finding Your Perfect Study Partners
          </Typography>
          
          <Typography variant="body1" sx={{ color: '#5A6282', mb: 4 }}>
            Our algorithm is analyzing skill sets, learning goals, and schedules to find your ideal matches. 
            This may take a few moments as we search for the most compatible peers.
          </Typography>
          
          <Box sx={{ width: '100%', mb: 4 }}>
            <LinearProgress 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  backgroundColor: '#3672F8'
                }
              }} 
            />
          </Box>
          
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2 }}>
                <PeopleAltIcon sx={{ fontSize: 40, color: '#3672F8', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#07092F' }}>
                  Skill Matching
                </Typography>
                <Typography variant="body2" sx={{ color: '#5A6282' }}>
                  Finding peers with complementary skills to yours
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2 }}>
                <SchoolIcon sx={{ fontSize: 40, color: '#3672F8', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#07092F' }}>
                  Goal Alignment
                </Typography>
                <Typography variant="body2" sx={{ color: '#5A6282' }}>
                  Matching your learning goals with similar peers
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2 }}>
                <ForumIcon sx={{ fontSize: 40, color: '#3672F8', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#07092F' }}>
                  Communication Style
                </Typography>
                <Typography variant="body2" sx={{ color: '#5A6282' }}>
                  Finding peers with compatible communication styles
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Typography variant="body2" sx={{ color: '#5A6282', fontStyle: 'italic' }}>
            Did you know? Research shows that studying with peers who have complementary 
            strengths can improve learning outcomes by up to 40%.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default MatchingLoadingScreen;