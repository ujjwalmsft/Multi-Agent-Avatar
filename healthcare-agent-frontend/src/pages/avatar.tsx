import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { 
  Container, 
  Typography, 
  Button, 
  CircularProgress, 
  Grid, 
  Box,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import useConversation from '@/hooks/useConversation';
import ChatList from '@/components/ChatList';
import ChatHistory from '@/components/ChatHistory';
import QuestionInput from '@/components/QuestionInput';

/**
* Enhanced landing page component with full layout.
* Similar to session page but with limited functionality.
*/
const IndexPage = () => {
  const router = useRouter();
  const { startConversation } = useConversation(null); // explicitly no session initially
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  /**
   * Explicitly handles the initiation of a new conversation.
   * Routes to the session page explicitly using returned session_id.
   */
  const handleStartConversation = async () => {
    setLoading(true);
    try {
      const response = await startConversation();
      console.log('[IndexPage] New session started with ID:', response?.session_id);
      if (response?.session_id) {
        router.push(`/session/${response.session_id}`);
      } else {
        console.error('[IndexPage] No session ID returned from startConversation');
      }
    } catch (error) {
      console.error('[IndexPage] Error starting new conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        mt: 4, 
        position: 'relative',
        minHeight: 'calc(100vh - 32px)', // Full viewport height minus margin
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Hamburger Menu Icon */}
      <IconButton 
        onClick={toggleDrawer}
        sx={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 1200,
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
      
      {/* ChatList Drawer */}
      <ChatList open={drawerOpen} onClose={() => setDrawerOpen(false)} isDrawer={true} />
      
      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* Left Column - Avatar and Input */}
        <Grid item xs={10} md={12} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Paper elevation={3} sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1
          }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 2, textAlign: 'center' }}>
              Welcome to the Medical AI Avatar Assistant
            </Typography>
            
            {/* Static Image instead of AvatarStream - increased height */}
            <Box 
              sx={{
                width: '100%',
                height: { xs: '40vh', md: '50vh' }, // Increased height to fill more space
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: 2,
                mb: 3,
                flexGrow: 1
              }}
            >
              <Image 
                src="/avatar_lisa.png" 
                alt="Medical AI Avatar"
                layout="fill"
                objectFit="contain"
                priority
              />
            </Box>
            
            <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                color="primary"
                size="large"
                startIcon={<PlayArrowIcon />}
                onClick={handleStartConversation} 
                disabled={loading}
                sx={{ 
                  px: 4, 
                  py: 1.5, 
                  borderRadius: 2,
                  boxShadow: 3,
                  fontSize: '1.1rem'
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Start New Conversation'}
              </Button>
            </Box>
            
            <Typography variant="body1" sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
              Click the button above to start a conversation with your medical assistant.
              You can access previous conversations from the menu.
            </Typography>
          </Paper>
  
          {/* Disabled Input */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: '12px', opacity: 0.7 }}>
            {/* QuestionInput component and overlay remain unchanged */}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default IndexPage;

 
/**

* Documentation:

* index.tsx

* 

* Purpose:

* Explicit landing page component that initiates a new conversation session.

* Provides clear navigation to the active session.

*

* Dependencies:

* - MaterialUI: UI components for clear styling and interaction.

* - useConversation Hook: Manages session initialization via backend.

* - Next.js useRouter: Handles client-side navigation.

*

* Usage:

* Rendered at the root ('/') route. Entry point for initiating sessions.

*/

 