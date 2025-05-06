import React, { useEffect, useState } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  Drawer, 
  IconButton, 
  Typography, 
  CircularProgress, 
  Box,
  Divider,
  Paper,
  Avatar,
  Button
} from '@mui/material';
import apiService from '../app/services/apiService';
import { useRouter } from 'next/router';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';

/**
* ChatList Component
*
* Displays a professional sliding drawer with historical chat sessions
* using a hamburger menu toggle.
*/
const ChatList: React.FC<{
  open?: boolean;
  onClose?: () => void;
  isDrawer?: boolean;
}> = ({ open = false, onClose, isDrawer = false }) => {
  const router = useRouter();
  const [sessions, setSessions] = useState<{ session_id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load sessions on component mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await apiService.getAllSessions();
        const sessionList = response.sessions || [];
        setSessions(sessionList);
      } catch (error) {
        console.error('[ChatList] Failed to load chat sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);
 
  const handleSessionClick = (sessionId: string) => {
    router.push(`/session/${sessionId}`);
    if (onClose) onClose();
  };
  
  const handleNewChat = () => {
    router.push('/session/new');
    if (onClose) onClose();
  };
  
  const content = (
    <Box sx={{ 
      width: isDrawer ? '280px' : '100%',
      height: '100%', 
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,0,0,0.12)'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Conversations
        </Typography>
        {isDrawer && (
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      
      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<AddIcon />}
        onClick={handleNewChat}
        sx={{ 
          m: 2, 
          borderRadius: 2,
          boxShadow: 2
        }}
      >
        New Conversation
      </Button>
      
      <Divider sx={{ mb: 1 }} />
      
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        px: 1
      }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={30} />
            <Typography variant="body2" sx={{ mt: 1 }}>Loading sessions...</Typography>
          </Box>
        ) : (
          <List>
            {sessions && sessions.length > 0 ? (
              sessions.map((session) => (
                <Paper 
                  elevation={1}
                  key={session.session_id}
                  sx={{ 
                    mb: 1.5,
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    } 
                  }}
                >
                  <ListItem
                    component="button"
                    onClick={() => handleSessionClick(session.session_id)}
                    sx={{ py: 1.5 }}
                  >
                    <Avatar 
                      sx={{ 
                        mr: 2, 
                        bgcolor: 'primary.light',
                        width: 38,
                        height: 38
                      }}
                    >
                      {(session.title || 'S')[0].toUpperCase()}
                    </Avatar>
                    <ListItemText 
                      primary={session.title || `Session ${session.session_id.substring(0, 8)}...`} 
                      secondary={`ID: ${session.session_id.substring(0, 8)}...`}
                      primaryTypographyProps={{
                        fontWeight: 500,
                        noWrap: true
                      }}
                      secondaryTypographyProps={{
                        noWrap: true
                      }}
                    />
                  </ListItem>
                </Paper>
              ))
            ) : (
              <Typography variant="body2" sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                No previous sessions found
              </Typography>
            )}
          </List>
        )}
      </Box>
    </Box>
  );

  if (isDrawer) {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: '280px',
            boxSizing: 'border-box',
          },
        }}
      >
        {content}
      </Drawer>
    );
  }
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {content}
    </Paper>
  );
};
 
export default ChatList;