import React from 'react';
import { Typography, Box } from '@mui/material';
import Logout from './Logout';

interface WelcomeMessageProps {
  name: string;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ name }) => {
  return (
    <Box sx={{ padding: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box sx={{ textAlign: 'center', flexGrow: 1 }}>
        <Typography variant="h5" gutterBottom>
          Hey {name}, Welcome to the Demo
        </Typography>
        <Typography variant="body1">
          Ask your questions
        </Typography>
      </Box>
      <Logout />
    </Box>
  );
};

export default WelcomeMessage;