import { Grid, Box, Typography } from '@mui/material';
import PeerCard from './PeerCard';
import useMatchingStore from '../../../contexts/matchingStore';

// Sample colors for avatars if no avatar image
const avatarColors = [
  '#3672F8', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'
];

const PeerGrid = ({ matches }) => {
  const { connectWithPeer, disconnectFromPeer } = useMatchingStore();

  // Transform API data to the format needed by PeerCard component
  const transformedMatches = matches.map((match, idx) => {
    return {
      id: match.user?._id || `peer-${idx}`,
      name: match.user?.username || `Peer ${idx + 1}`,
      field: match.user?.field || match.user?.bio?.substring(0, 30) || "Computer Science",
      avatar: match.user?.avatar || null,
      avatarColor: avatarColors[idx % avatarColors.length],
      score: match.score || 0.8, // Between 0 and 1
      strengths: match.user?.strengths || ['JavaScript', 'React', 'Node.js'],
      needsHelpWith: match.user?.needsHelpWith || ['GraphQL', 'Machine Learning'],
      connected: match.connected || false,
      leetcode: match.user?.leetcode,
      github: match.user?.github,
      portfolio: match.user?.portfolio,
      linkedin: match.user?.linkedin,
      createdAt : match.user?.createdAt,
      rating : match.user?.rating,

    };
  });

  // Handle connect with peer
  const handleConnect = async (peerId) => {
    await connectWithPeer(peerId);
  };

  // Handle disconnect from peer
  const handleDisconnect = async (peerId) => {
    await disconnectFromPeer(peerId);
  };

  // If no matches found
  if (matches.length === 0) {
    return (
      <Box 
        sx={{ 
          height: 300, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No matching peers found with current filters
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {transformedMatches.map((peer) => (
        <Grid item xs={12} sm={6} md={4} key={peer.id}>
          <PeerCard 
            peer={peer} 
            onConnect={handleConnect} 
            onDisconnect={handleDisconnect} 
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default PeerGrid;