"use client";
import React from 'react';
import { Box, Button } from '@mui/material';
import { FaPlay, FaPause, FaStop } from 'react-icons/fa';

interface ControlButtonsProps {
  isSessionActive: boolean;
  startSessionIframe?: () => void;
  resumeSessionIframe?: () => void;
  stopSessionIframe: () => void;
  stopSpeaking: () => void;
  disabled?: boolean;
}
const ControlButtons: React.FC<ControlButtonsProps> = ({ 
  isSessionActive, 
  startSessionIframe, 
  resumeSessionIframe, 
  stopSessionIframe, 
  stopSpeaking,
  disabled = false
}) => {  return (
    <Box 
      display="flex" 
      justifyContent="space-between" 
      alignItems="center"
      width="100%" 
      mb={2}
    >
      {/* Always show Start Session button */}
      <Button
        variant="contained"
        color="primary"
        onClick={startSessionIframe}
        disabled={isSessionActive || disabled}
        startIcon={<FaPlay />}
        sx={{
          borderRadius: '20px',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: 'bold',
          textTransform: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: '#1565c0',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          },
        }}
      >
        Start Session
      </Button>

      {/* Conditionally show Stop Session OR Resume Session */}
      {isSessionActive ? (
        <Button
          variant="contained"
          color="error"
          disabled={disabled}
          onClick={stopSessionIframe}
          startIcon={<FaPause />}
          sx={{
            borderRadius: '20px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#c62828',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            },
          }}
        >
          Stop Session
        </Button>
      ) : (
        <Button
          variant="contained"
          color="secondary"
          onClick={resumeSessionIframe}
          disabled={isSessionActive || disabled}
          startIcon={<FaPlay />}
          sx={{
            borderRadius: '20px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'none',
            transition: 'all 0.3s ease',
            backgroundColor: '#4caf50',
            '&:hover': {
              backgroundColor: '#388e3c',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            },
          }}
        >
          Resume Session
        </Button>
      )}

      {/* Always show Stop Speaking button */}
      <Button
        variant="contained"
        color="warning"
        onClick={stopSpeaking}
        disabled={!isSessionActive || disabled}
        startIcon={<FaStop />}
        sx={{
          borderRadius: '20px',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: 'bold',
          textTransform: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: isSessionActive ? '#e65100' : '',
            boxShadow: isSessionActive ? '0 4px 8px rgba(0,0,0,0.2)' : ''
          },
        }}
      >
        Stop Speaking
      </Button>
    </Box>
  );
};

export default ControlButtons;