

/**
* Documentation:

* pages/session/[sessionId].tsx - Dynamic Conversation Session Page
*
* Purpose:
* - Explicitly manages loading and rendering of individual conversation sessions.
* - Clearly differentiates between new and historical sessions based on URL params.
*
* Explicit Features:
* - Explicit extraction of sessionId from URL via Next.js router.
* - Uses useConversation hook explicitly with provided sessionId.
* - Handles loading states clearly, rendering ChatHistory, QuestionInput, and ChatList components explicitly.
*
* Dependencies:
* - Next.js useRouter: Extracts sessionId explicitly from URL.
* - MUI components: For explicit UI layout and consistent design.
* - Custom Hooks and Components: useConversation, ChatHistory, ChatList, QuestionInput for explicit functionality.
*
* Usage:
* Dynamically loaded at route '/session/[sessionId]'.
* Explicitly initiates conversation loading based on sessionId.


* Functionality:

* - Clearly identifies if session is new or existing based on conversation history presence.

* - Explicitly fetches conversation history from backend if available.

* - Clearly renders ChatHistory component with retrieved data.

* - Provides explicit user input via QuestionInput component.

*

* Dependencies:

* - useRouter (Next.js): retrieves dynamic session ID from route.

* - useConversation (custom hook): fetches conversation history explicitly.

*/



import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Container, 
  Grid, 
  Typography, 
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Box,
  Button,
  Paper,
  useMediaQuery,
  useTheme
} from '@mui/material';
import ChatHistory from '@/components/ChatHistory';
import QuestionInput from '@/components/QuestionInput';
import ChatList from '@/components/ChatList';
import useConversation from '@/hooks/useConversation';
import MenuIcon from '@mui/icons-material/Menu';
import AvatarStream from '@/components/AvatarStream';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutButton from '@/components/Logout';
import PrescriptionUpload from '@/components/PrescriptionUpload';
// Define the response type explicitly
interface MessageResponse {
  message: string;
  is_conversation_over?: boolean;
}

const SessionPage: React.FC = () => {
  const router = useRouter();
  const { sessionId } = router.query;
  const [showEmailNotification, setShowEmailNotification] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const theme = useTheme();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showSessionStartNotification, setShowSessionStartNotification] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Explicitly cast sessionId to string or null
  const effectiveSessionId = Array.isArray(sessionId) ? sessionId[0] : sessionId || null;

  const {
    conversationHistory,
    loading,
    loadConversationHistory,
    sendUserMessage,
    messageisLoading,
    uploadPrescription,
  } = useConversation(effectiveSessionId);

  // Load historical conversation explicitly based on session ID
  useEffect(() => {
    if (effectiveSessionId) {
      console.log(`[SessionPage] Loading history for session: ${effectiveSessionId}`);
      loadConversationHistory(effectiveSessionId)
        .then(() => {
          console.log('[SessionPage] Conversation history loaded:', conversationHistory);
        })
        .catch(error => {
          console.error('[SessionPage] Error loading conversation history:', error);
        });
    }
  }, [effectiveSessionId, loadConversationHistory]);
  

  const handleSend = async (userInput: string) => {
    try {
      setMessageLoading(true);
  
      // Check if the user wants to upload
      if (detectUploadIntent(userInput)) {
        console.log('[SessionPage] Upload intent detected in user message');
        
        // IMPORTANT: Show upload modal immediately when upload intent is detected
        setShowUploadModal(true);
        
        // Still send the message to the backend to add to conversation history
        const response = await sendUserMessage(userInput) as MessageResponse;
        
        setMessageLoading(false);
        return response;
      }
  
      // Normal flow for non-upload messages
      const response = await sendUserMessage(userInput) as MessageResponse;
      console.log('[SessionPage] Response received:', response);
  
      // Handle UI updates and other logic...
      if (response && response.message) {
        window.postMessage({ type: 'SPEAK', text: response.message }, '*');
      }

 
      // Check if response contains is_conversation_over and it's true
      if (response && response.is_conversation_over === true) {
        console.log('[SessionPage] Conversation ended, showing email notification');
        setShowEmailNotification(true);
            // Wait for regular response to finish (with a small delay)
            setTimeout(() => {
              window.postMessage({ 
                type: 'SPEAK', 
                text: "Email notification sent with your prescription details!" 
              }, '*');
            }, 1000);
          }
            
      setMessageLoading(false);
      return response;
    } catch (error) {
      console.error("[SessionPage] Error sending user message:", error);
      setMessageLoading(false);
    }
  };

  const detectUploadIntent = (userMessage: string): boolean => {
    const uploadKeywords = ['upload', 'picture', 'image', 'photo', 'prescription', 'document'];
    const messageLower = userMessage.toLowerCase();
    
    return uploadKeywords.some(keyword => messageLower.includes(keyword));
  };

  
  
  const handleCloseNotification = () => {
    setShowEmailNotification(false);
  };
  const handleSessionStateChange = (active: boolean) => {
    setIsSessionActive(active);
    
    // Show notification when session starts
    if (active) {
      setShowSessionStartNotification(true);
      
      // Optional: Have avatar say welcome message
      setTimeout(() => {
        window.postMessage({ 
          type: 'SPEAK', 
          text: "Session started. I'm ready to assist you with your medical questions." 
        }, '*');
      }, 500);
    }
  };
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2">Loading conversation...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ 
      mt: 2, // Reduced from 4 to 2
      position: 'relative',
      px: { xs: 2, sm: 3, md: 4 },
      maxWidth: { sm: '100%', lg: '95%', xl: '1800px' },
      mx: 'auto',
      height: '100vh', // Ensure container takes exactly viewport height
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden' // Prevent scrolling on the container
    }}>
      {/* Top Navigation Bar */}
      <Box 
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        mb: 2, // Reduced from 3 to 2
        mt: 0 // Removed top margin
      }}
    >

      {/* Left Side - Hamburger Menu */}
      <Box>
        <IconButton 
          onClick={toggleDrawer}
          sx={{
            bgcolor: 'background.paper',
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'background.paper',
              opacity: 0.9
            }
          }}
        >
          <MenuIcon />
        </IconButton>
      </Box>


      {/* Right Side - Back and Logout Buttons */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/avatar')}
          sx={{
            borderRadius: '8px',
            boxShadow: 2,
            '&:hover': {
              boxShadow: 3
            }
          }}
        >
          Back
        </Button>
        
        <LogoutButton />
      </Box>
    </Box>
    {/* ChatList Drawer */}
    <ChatList open={drawerOpen} onClose={() => setDrawerOpen(false)} isDrawer={true} />
    
    {/* Email Notification */}
    <Snackbar 
      open={showEmailNotification} 
      autoHideDuration={6000} 
      onClose={handleCloseNotification}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert 
        onClose={handleCloseNotification} 
        severity="success" 
        variant="filled"
        sx={{ width: '100%', boxShadow: 3 }}
      >
        Email notification sent with your prescription details!
      </Alert>
    </Snackbar>
    <Snackbar 
  open={showSessionStartNotification} 
  autoHideDuration={4000} 
  onClose={() => setShowSessionStartNotification(false)}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
>
  <Alert 
    onClose={() => setShowSessionStartNotification(false)} 
    severity="info" 
    variant="filled"
    sx={{ width: '100%', boxShadow: 3 }}
  >
    Session started successfully! You can now interact with the medical assistant.
  </Alert>
</Snackbar>
    <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
  {/* Left Column - Avatar and Input (65%) */}
  <Grid item xs={12} md={8} lg={8}>
        <Paper elevation={5} sx={{ 
          p: { xs: 2, sm: 3 }, 
          mb: 3, 
          borderRadius: '12px' 
        }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
            Session: {effectiveSessionId || 'New Session'}
          </Typography>
            
           {/* Avatar Iframe Container */}
           <Box 
            sx={{
              width: '100%',
              height: { 
                xs: '50vh', 
                sm: '60vh', 
                md: 'calc(100vh - 260px)' 
              },
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: 2,
              mb: 3
            }}
          >
            <AvatarStream onSessionStateChange={handleSessionStateChange} />
          </Box>
          
          {/* Question Input */}
          <QuestionInput 
  sessionId={effectiveSessionId || ''} 
  onSend={handleSend} 
  disabled={!isSessionActive}
  onRequestUpload={() => setShowUploadModal(true)}
/>
        </Paper>
      </Grid>
        
        {/* Right Column - Chat History (30%) */}
        <Grid item xs={12} md={4} lg={4}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            borderRadius: '12px',
            height: { md: 'calc(100vh - 120px)' },
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Conversation
          </Typography>
            
          <Box sx={{ 
            flexGrow: 1,
            overflow: 'auto',
            backgroundColor: '#f5f5f5', 
            borderRadius: 1,
            p: 2,
            minHeight: '300px',
            position: 'relative'
          }}>
            {messageLoading && (
              <Box 
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: 1,
                  zIndex: 1
                }}
              >
 <CircularProgress size={40} />
              </Box>
            )}
            
            {conversationHistory.length > 0 ? (
              <ChatHistory 
                conversationHistory={conversationHistory.map(entry => ({
                  ...entry,
                  sender: entry.sender === "avatar" ? "ai_avatar" : entry.sender
                }))} 
                loading={messageisLoading} 
              />
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
                Start typing to begin your conversation with the medical assistant.
              </Typography>
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>

    <PrescriptionUpload
  open={showUploadModal}
  onClose={() => setShowUploadModal(false)}
  sessionId={effectiveSessionId || ''}
  onUploadComplete={(response: any) => {
    console.log('[Upload] Completed:', response);
    setShowUploadModal(false);
    
    // If there's a message in the response, speak it through the avatar
    if (response && response.message) {
      window.postMessage({ 
        type: 'SPEAK', 
        text: response.message 
      }, '*');
    }
    
    // IMPORTANT: Refresh conversation history from the backend
    if (effectiveSessionId) {
      loadConversationHistory(effectiveSessionId);
    }
  }}
  onUpload={(file: any) => uploadPrescription(file)}
/>
  </Container>
);
};

export default SessionPage;
