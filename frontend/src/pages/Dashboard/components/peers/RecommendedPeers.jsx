// src/components/RecommendedPeers/RecommendedPeers.jsx
import { Box, Paper, Typography, Link, List } from '@mui/material';
import useMatchingStore from '../../../../contexts/matchingStore';
import useUserStore     from '../../../../contexts/userStore';
import PeerItem         from './PeerItem';
import { useEffect, useState } from 'react';

export default function RecommendedPeers() {
  const { user } = useUserStore();
  const { filteredMatches, fetchMatches } = useMatchingStore();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (user) fetchMatches();
  }, [user, fetchMatches]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Recommended Peers
        </Typography>
        <Link href="/matching">View All</Link>
      </Box>
      <Paper sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <List>
          {filteredMatches.map(peer => (
            <PeerItem 
              key={peer.id} 
              peer={peer.user} 
              user={user} 
              onSnackbar={(msg, sev) =>
                setSnackbar({ open: true, message: msg, severity: sev })
              } 
            />
          ))}
        </List>
      </Paper>
      {/* render your Snackbar here */}
    </Box>
  );
}
