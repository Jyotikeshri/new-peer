// src/pages/NotificationsPage.jsx
import React from 'react';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptFriendRequest, getFriendRequests, rejectFriendRequest } from "../lib/api";
import { 
  Box, 
  Container, 
  Typography, 
  CircularProgress, 
  Card, 
  CardContent, 
  Avatar, 
  Button, 
  Chip,
  Divider,
  Paper,
  Grid
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChatIcon from '@mui/icons-material/Chat';
import  NoNotificationsFound  from '../components/notifications/NoNotificationFound';

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  // Get friend requests
  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  // Accept friend request mutation
  const { mutate: acceptRequestMutation, isPending: isAccepting } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  // Reject friend request mutation
  const { mutate: rejectRequestMutation, isPending: isRejecting } = useMutation({
    mutationFn: rejectFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    },
  });

  const incomingRequests = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Container maxWidth="md" sx={{ mt: 2 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Notifications
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ mt: 4 }}>
            {incomingRequests.length > 0 && (
              <Box component="section" sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonAddIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h5" component="h2" fontWeight={600}>
                    Friend Requests
                  </Typography>
                  <Chip 
                    label={incomingRequests.length} 
                    color="primary" 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {incomingRequests.map((request) => (
                    <Card 
                      key={request._id} 
                      sx={{ 
                        transition: 'box-shadow 0.3s',
                        '&:hover': { boxShadow: 3 }
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar 
                              src={request.sender.avatar} 
                              alt={request.sender.username}
                              sx={{ width: 56, height: 56 }}
                            />
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {request.sender.username}
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                {request.sender.interests && request.sender.interests.slice(0, 2).map((interest, index) => (
                                  <Chip 
                                    key={index}
                                    label={interest}
                                    size="small"
                                    color="secondary"
                                    variant="outlined"
                                  />
                                ))}
                              </Box>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => rejectRequestMutation(request.sender._id)}
                              disabled={isRejecting || isAccepting}
                            >
                              Decline
                            </Button>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => acceptRequestMutation(request.sender._id)}
                              disabled={isRejecting || isAccepting}
                            >
                              Accept
                            </Button>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}

            {/* Accepted Requests Section */}
            {acceptedRequests.length > 0 && (
              <Box component="section" sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <NotificationsIcon sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h5" component="h2" fontWeight={600}>
                    New Connections
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {acceptedRequests.map((notification) => (
                    <Card key={notification._id}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Avatar 
                            src={notification.recipient.avatar} 
                            alt={notification.recipient.username}
                            sx={{ width: 40, height: 40, mt: 0.5 }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {notification.recipient.username}
                            </Typography>
                            <Typography variant="body2" sx={{ my: 0.5 }}>
                              {notification.recipient.username} accepted your friend request
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.7 }}>
                              <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                              <Typography variant="caption">
                                Recently
                              </Typography>
                            </Box>
                          </Box>
                          <Chip 
                            icon={<ChatIcon sx={{ fontSize: '0.8rem !important' }} />}
                            label="New Friend" 
                            color="success" 
                            size="small"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}

            {incomingRequests.length === 0 && acceptedRequests.length === 0 && (
              <NoNotificationsFound />
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default NotificationsPage;