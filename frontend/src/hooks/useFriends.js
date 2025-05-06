// src/hooks/useFriends.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFriendsList, sendFriendRequest, removeFriend } from '../lib/api';
import useUserStore from '../contexts/userStore';

/**
 * Custom hook for managing friends with real-time updates
 */
export function useFriends() {
  const queryClient = useQueryClient();
  const { fetchUser } = useUserStore();
  
  // Query to fetch friends list
  const {
    data: friends = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['friends'],
    queryFn: getFriendsList,
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Mutation for sending friend request
  const sendRequestMutation = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: async () => {
      // Invalidate friends cache
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      // Invalidate friend requests cache if it exists
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      // Update user data in store
      await fetchUser();
    }
  });
  
  // Mutation for removing friend
  const removeFriendMutation = useMutation({
    mutationFn: removeFriend,
    onSuccess: async () => {
      // Invalidate friends cache
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      // Update user data in store
      await fetchUser();
    }
  });
  
  return {
    friends,
    isLoading,
    isError,
    error,
    refetch,
    sendRequest: sendRequestMutation.mutate,
    isSendingRequest: sendRequestMutation.isPending,
    removeFriend: removeFriendMutation.mutate,
    isRemovingFriend: removeFriendMutation.isPending
  };
}
