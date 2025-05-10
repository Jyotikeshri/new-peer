// src/App.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { StreamChat } from 'stream-chat';

import theme from './theme';
import useAuthStore from './contexts/authStore';
import useUserStore from './contexts/userStore';
import { useNotificationStore } from './contexts/notificationStore';
import streamNotificationService from './services/streamNotificationService';

import { getStreamToken } from './lib/api';

import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import PeerMatchingPage from './pages/PeerMatching/PeerMatchingPage';
import MessagesPage from './pages/MessagesPage';
import ChatRoom from './pages/ChatRoom';
import CallPage from './pages/CallPage';
import ErrorBoundary from './components/errors/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import NotificationsPage from './pages/NotificationsPage';
import UserReviewsPage from './pages/Profile/components/UserReviewsPage';
import GroupsDiscoveryPage from './pages/Group/GroupDiscoveryPage';
import CreateGroupForm from './pages/Group/CreateGroupForm';
import SignupPage from './pages/SignUpPage';

// Create a single QueryClient instance
const queryClient = new QueryClient();

// 1️⃣ Top‐level App only sets up QueryClientProvider + Theme
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

// 2️⃣ All your hooks (useQuery, useAuthStore, etc.) go in here
function AppContent() {
  // Auth
  const { checkAuth, isAuthenticated } = useAuthStore();
  const user = useUserStore((s) => s.user);
  const addNotification = useNotificationStore((s) => s.addNotification);

  // Stream notifications
  useEffect(() => {
    if (!user?.token) return;
    streamNotificationService
      .init(user._id, user.token)
      .then(ok => {
        if (!ok) throw new Error('Stream init failed');
        streamNotificationService.subscribeToNotifications(event => {
          addNotification({
            id:        event.event_id,
            type:      event.type,
            message:   event.message,
            sender:    event.sender,
            data:      event,
            createdAt: new Date(event.created_at),
          });
        });
      })
      .catch(console.error);
  }, [user, addNotification]);

  // App‐init loading
  const [isInitializing, setIsInitializing] = useState(true);
  useEffect(() => {
    checkAuth()
      .catch(console.error)
      .finally(() => setIsInitializing(false));
  }, [checkAuth]);

  // Stream Chat client
  const chatClient = useMemo(
    () => StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY),
    []
  );

  // *** THIS useQuery is now safe, because it's inside QueryClientProvider ***
  const { data: tokenData, isLoading: tokenLoading } = useQuery({
    queryKey: ['streamChatToken'],
    queryFn:  getStreamToken,
    enabled:  !!user,
  });
  const chatToken = tokenData?.token;

  if (isInitializing) {
    return (
      <Box className="flex items-center justify-center h-screen">
        <CircularProgress />
      </Box>
    );
  }

  // Router setup
  const router = createBrowserRouter([
    {
      path: '/',
      element: <MainLayout />,
      errorElement: <ErrorBoundary />,
      children: [
        {
          index: true,
          element: isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <HomePage />
        },
        { path: 'login',  element: isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage /> },
        { path: 'signup', element: isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage /> }
      ],
    },
    {
      element: isAuthenticated ? <ProtectedRoute /> : <Navigate to="/login" replace />,
      children: [
        { path: 'dashboard',           element: <Dashboard /> },
        { path: 'profile',             element: <Profile /> },
        { path: 'matching',            element: <PeerMatchingPage /> },
        { path: 'messages',            element: <MessagesPage /> },
        { path: 'chat/:channelId',     element: <ChatRoom /> },
        { path: 'call/:id',            element: <CallPage /> },
        { path: 'notifications',            element: <NotificationsPage /> },
        { path:"/reviews/:userId" ,  element:<UserReviewsPage />},
        { path:"groups" ,  element:<GroupsDiscoveryPage />},
        { path:"groups/create" ,  element:<CreateGroupForm />}

      ],
    },
    { path: '*', element: <ErrorBoundary /> },
  ]);

  return (
    
      <div className="min-h-screen font-sans">
        <RouterProvider router={router} />
      </div>
      
    
  );
}
