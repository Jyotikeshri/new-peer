import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import useUserStore from "../contexts/userStore";
import { getStreamToken } from "../lib/api";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// Singleton pattern to prevent duplicate clients
let videoClientInstance = null;

const CallPage = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const navigate = useNavigate();

  const { user, isLoading: userLoading } = useUserStore();

  const { data: tokenData, isLoading: tokenLoading } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Cache token for 5 minutes
  });

  useEffect(() => {
    // Handle cleanup when component unmounts
    return () => {
      if (videoClientInstance) {
        console.log("Disconnecting video client on unmount");
        videoClientInstance.disconnectUser()
          .catch(err => console.error("Error disconnecting video client:", err));
        videoClientInstance = null;
      }
    };
  }, []);

  useEffect(() => {
    const initCall = async () => {
      if (!tokenData?.token || !user || !callId) {
        console.log("Missing required data for call:", { 
          hasToken: !!tokenData?.token, 
          hasUser: !!user, 
          callId 
        });
        return;
      }

      try {
        setIsConnecting(true);
        console.log("Initializing Stream video client...");

        // If we already have a client instance, disconnect it first
        if (videoClientInstance) {
          console.log("Disconnecting existing video client");
          await videoClientInstance.disconnectUser();
          videoClientInstance = null;
        }

        const userData = {
          id: user._id,
          name: user.username,
          image: user.avatar || undefined,
        };

        // Create a new client
        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user: userData,
          token: tokenData.token,
        });

        videoClientInstance = videoClient;

        // Get call instance
        const callInstance = videoClient.call("default", callId);

        // Only create if needed, otherwise just join
        const existingCall = await callInstance.getOrCreate();
        console.log("Call exists or created:", existingCall);

        // Join the call - don't use create:true to avoid duplication issues
        await callInstance.join();
        console.log("Joined call successfully");

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call. Please try again.");
        
        // Cleanup on error
        if (videoClientInstance) {
          videoClientInstance.disconnectUser().catch(console.error);
          videoClientInstance = null;
        }
      } finally {
        setIsConnecting(false);
      }
    };

    if (tokenData && user && !client) {
      initCall();
    }
  }, [tokenData, user, callId, client]);

  if (userLoading || tokenLoading || isConnecting) {
    return (
      <Box className="flex flex-col items-center justify-center h-screen">
        <CircularProgress size={40} />
        <Typography variant="body1" className="mt-4">
          Connecting to call...
        </Typography>
      </Box>
    );
  }

  if (!client || !call) {
    return (
      <Box className="flex flex-col items-center justify-center h-screen">
        <Typography variant="h6" className="mb-4 text-red-600">
          Call Connection Error
        </Typography>
        <Typography variant="body1" className="mb-4 text-center">
          Could not initialize the call. Please check your connection and try again.
        </Typography>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </Box>
    );
  }

  return (
    <div className="h-screen">
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <CallContent navigate={navigate} />
        </StreamCall>
      </StreamVideo>
    </div>
  );
};

const CallContent = ({ navigate }) => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      navigate("/messages");
    }
  }, [callingState, navigate]);

  return (
    <StreamTheme>
      <div className="h-screen flex flex-col">
        <div className="flex-grow">
          <SpeakerLayout />
        </div>
        <div className="bg-white p-4 border-t border-gray-200">
          <CallControls />
        </div>
      </div>
    </StreamTheme>
  );
};

export default CallPage;