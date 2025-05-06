"use client";
 
import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import ControlButtons from './controlButtons';

interface AvatarStreamProps {
  onSessionStateChange?: (isActive: boolean) => void;
}

const AvatarStream: React.FC<AvatarStreamProps> = ({ onSessionStateChange }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
 
  useEffect(() => {
    console.log("AvatarStream component loaded.");
 
    const iframe = iframeRef.current;
    if (!iframe) {
      console.error("Avatar iframe not found.");
    } else {
      iframe.onload = () => {
        console.log("AI Avatar iframe loaded successfully.");
      };
      iframe.onerror = () => {
        console.error("Error loading AI Avatar iframe.");
      };
    }
  }, []);
  useEffect(() => {
    const handleSpeakEvent = (event: MessageEvent) => {
      if (event.data.type === 'SPEAK' && iframeRef.current) {
        iframeRef.current.contentWindow?.postMessage({
          type: 'SPEAK',
          text: event.data.text,
        }, '*');
      }
    };
   
    window.addEventListener('message', handleSpeakEvent);
   
    return () => {
      window.removeEventListener('message', handleSpeakEvent);
    };
  }, []);
  const startSessionIframe = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({ type: 'START_SESSION' }, '*');
      setIsSessionActive(true);
          // Notify parent
    if (onSessionStateChange) onSessionStateChange(true);
    
    // Wait for session to initialize, then speak welcome message directly
    setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.contentWindow?.postMessage({ 
          type: 'SPEAK', 
          text: "Session started. I'm ready to assist you with your medical questions." 
        }, '*');
      }
    }, 1500); // Use a longer delay to ensure session is ready
    }
  };
  

  const resumeSessionIframe = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({ type: 'START_SESSION' }, '*');
      setIsSessionActive(true);
    }
  };

  const stopSessionIframe = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({ type: 'STOP_SESSION' }, '*');
      setIsSessionActive(false);
      if (onSessionStateChange) onSessionStateChange(false);
    }
  };
  const stopSpeaking = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({ type: 'STOP_SPEAKING' }, '*');
    }
  };
 
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      position: 'relative',
      width: '100%' 
    }}>
      {/* AI Avatar Title */}
      <Typography variant="h6" align="center" gutterBottom>
        AI Avatar Assistant
      </Typography>
      
      <Box sx={{ 
  flexGrow: 1,
  width: '100%',
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
  // Add background for visibility during development
  backgroundColor: '#f8f8f8' // Light gray background to see container bounds
}}>
  <iframe 
    ref={iframeRef}
    src="/video.html" 
    style={{ 
      width: '100%',
      height: '100%',
      border: 'none',
      // Remove maxWidth constraint to allow full expansion
      display: 'block', // Important for proper sizing
      objectFit: 'contain' // Maintain aspect ratio
    }}
    title="Medical Avatar"
  />
</Box>
      
      {/* Control Buttons - 20% height */}
      <Box sx={{ 
  width: '100%',
  height: '15%',
  display: 'flex',
  padding: '12px 20px',  // Increased padding around the buttons
  justifyContent: 'center',
  alignItems: 'center',  // Ensure vertical centering
  boxSizing: 'border-box'
      }}>
        <ControlButtons 
          isSessionActive={isSessionActive}
          startSessionIframe={startSessionIframe}
          resumeSessionIframe={resumeSessionIframe}
          stopSessionIframe={stopSessionIframe}
          stopSpeaking={stopSpeaking}
        />
      </Box>
    </Box>
  );
};
 
export default AvatarStream;




// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable react-hooks/exhaustive-deps */
// "use client";
// import React, { useRef, useState, useEffect } from 'react';
// import { Container, Typography, Box, Button, Grid,Drawer, Paper, TextField, CircularProgress,Tooltip, List, ListItem, ListItemText, IconButton, InputAdornment } from '@mui/material';
// import { avatarAppConfig } from '@/app/layouts/ttsConfig';
// import { createAvatarSynthesizer } from '@/app/layouts/utility';
// import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
// import ApiService from '@/app/services/apiService';
// import { jwtDecode } from 'jwt-decode';
// import WelcomeMessage from './WelcomeMessage';
// import { FaMicrophone, FaStop, FaPaperPlane, FaPlay, FaPause } from 'react-icons/fa';
// import '../../public/video.js';
// import ControlButtons from './controlButtons';
// import ChatHistory from './chatHistory';
// import QuestionInput from './questionInput';
// import ResponseBox from './responseBox';
// import ChatList from './chatList';
// import { FaBars } from 'react-icons/fa';
// import {useRouter} from 'next/router';

// const AvatarStream = () => {
//   const recognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);
//   const [mySpeechText, setMySpeechText] = useState<string>('');
//   const [responseText, setResponseText] = useState<string>('');
//   const [piiResponseText, setPiiResponseText] = useState<string>('');
//   const [jobId, setJobId] = useState<string>('');
//   const [isListening, setIsListening] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [shouldAskQuestion, setShouldAskQuestion] = useState<boolean>(false);
//   const [chatHistory, setChatHistory] = useState<{ question: string; answer: string }[]>([]);
//   const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
//   const [sessions, setSessions] = useState<{ sessionId: string; name: string }[]>([]);
//   const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
//   const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
//   const iframeRef = useRef<HTMLIFrameElement>(null);
//   const [showPiiBox, setShowPiiBox] = useState<boolean>(false);
//   const {cogSvcRegion, cogSvcSubKey, voiceName } = avatarAppConfig;
//   const router = useRouter();


//   useEffect(() => {
//     if (shouldAskQuestion && mySpeechText) {
//       handleAskQuestion();
//       setShouldAskQuestion(false);
//     }
//   }, [shouldAskQuestion, mySpeechText]);

//   useEffect(() => {
//     const accessToken = localStorage.getItem('accessToken');
//     if (accessToken) {
//       try {
//         const decodedToken = jwtDecode(accessToken);
//         console.log('User:', (decodedToken as any).upn);
//         console.log('User ID:', (decodedToken as any).oid);
//         console.log('Tenant ID:', (decodedToken as any).tid);
//         console.log('Name:', (decodedToken as any).name);
//       } catch (error) {
//         console.error('Error decoding access token:', error);
//       }
//     } else {
//       console.error('No access token found in localStorage');
//     }
//   }, []);

//   useEffect(() => {
//     if (responseText) {
//       speak(responseText);
//     }
//   }, [responseText]);


//   useEffect(() => {
//     // Fetch chat sessions from the backend
//     const fetchSessions = async () => {
//       try {
//         const response = await ApiService.getChatSessions();
//         setSessions(response);
//       } catch (error) {
//         console.error('Error fetching chat sessions:', error);
//       }
//     };

//     fetchSessions();
//   }, []);


//   const handleSpeechText = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setMySpeechText(event.target.value);
//   };

//   const generateSessionId = () => {
//     return '_' + Math.random().toString(36).substr(2, 9);
//   };

//   const handleUserQuery = async (query: string) => {
//     setLoading(true);
//     try {
//       const sessionId = localStorage.getItem("sessionId") || generateSessionId();
//       localStorage.setItem("sessionId", sessionId); // Save the session ID in localStorage
//       console.log(localStorage.getItem("sessionId"), 'session ID on handleUserQuery');
//       const answer = await ApiService.getPromptAnswer(query, sessionId);
//       setResponseText(answer);
//       setChatHistory((prev) => [...prev, { question: query, answer }]);
//       if (jobId) {
//         setJobId(jobId);
//       }
//       const piiResponse = await ApiService.recognizePii(answer);
//       const piiEntities = piiResponse.pii_entities;
  
//       // Mask the sensitive information in the answer
//       let maskedAnswer = answer;
//       piiEntities.forEach((entity: { text: string; category: string }) => {
//         if (['Organization', 'Email', 'PhoneNumber'].includes(entity.category)) {
//           const mask = '*'.repeat(entity.text.length);
//           const regex = new RegExp(entity.text, 'g');
//           maskedAnswer = maskedAnswer.replace(regex, mask);
//         }
//       });
  
//       setPiiResponseText(maskedAnswer);
//     } catch (error) {
//       console.error('Error fetching response:', error);
//     }
//     setLoading(false);
//   };

//   const handleAskQuestion = () => {
//     handleUserQuery(mySpeechText);
//   };

//   const startListening = () => {
//     const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(cogSvcSubKey, cogSvcRegion);
//     const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
//     const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

//     recognizer.recognized = (s, e) => {
//       if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
//         setMySpeechText(e.result.text);
//       }
//     };

//     recognizerRef.current = recognizer;
//     recognizer.startContinuousRecognitionAsync();
//     setIsListening(true);
//   };

//   const stopListening = () => {
//     if (recognizerRef.current) {
//       recognizerRef.current.stopContinuousRecognitionAsync(() => {
//         recognizerRef.current = null;
//         setIsListening(false);
//         setShouldAskQuestion(true);
//       });
//     }
//   };
//   const stopSpeaking = () => {
//     if (iframeRef.current) {
//       iframeRef.current.contentWindow?.postMessage({ type: 'STOP_SPEAKING' }, '*');
//     }
//   };
//   const getUserName = () => {
//     const accessToken = localStorage.getItem('accessToken');
//     if (accessToken) {
//       try {
//         const decodedToken = jwtDecode(accessToken);
//         return (decodedToken as any).name;
//       } catch (error) {
//         console.error('Error decoding access token:', error);
//       }
//     } else {
//       console.error('No access token found in localStorage');
//     }
//     return '';
//   };

//   const startSessionIframe = () => {
//     if (iframeRef.current) {
//       iframeRef.current.contentWindow?.postMessage({ type: 'START_SESSION' }, '*');
//       setIsSessionActive(true);
//       const sessionId = generateSessionId();
//       localStorage.setItem("sessionId", sessionId);
//       console.log(localStorage.getItem("sessionId"), 'session ID on startsession');
//     }
//   };

//   const stopSessionIframe = () => {
//     if (iframeRef.current) {
//       iframeRef.current.contentWindow?.postMessage({ type: 'STOP_SESSION' }, '*');
//       setIsSessionActive(false);
//       console.log(localStorage.getItem("sessionId"), 'session ID on stopsession');
//       localStorage.removeItem("sessionId");
//     }
//   };

//   const speak = (text: string) => {
//     if (iframeRef.current) {
//       iframeRef.current.contentWindow?.postMessage({ type: 'SPEAK', text }, '*');
//     }
//   };


//   const handleSelectSession = async (sessionId: string) => {
//     setSelectedSessionId(sessionId);
//     router.push(`/session/${sessionId}`);
//   };


//   return (
//     <Container maxWidth="xl" disableGutters sx={{ height: '90vh', display: 'flex', flexDirection: 'column' }}>
//       <Box sx={{ width: '100%', flexShrink: 0 }}>
//         <WelcomeMessage name={getUserName()} />
//       </Box>
//       <Box sx={{ width: '100%', display: 'flex', flex: 1 }}>
//         <Grid container spacing={2} sx={{ flex: 1, overflow: 'hidden' }}>
//           <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 3 }}>
//             <Paper elevation={5} sx={{ padding: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
//               <Box display="flex" flexDirection="column" alignItems="center" sx={{ height: '100%', overflow: 'hidden' }}>
//                 <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
//                   <iframe ref={iframeRef} src="video.html" style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', top: 0, left: 0 }}></iframe>
//                 </Box>
//                 <ControlButtons
//                   isSessionActive={isSessionActive}
//                   startSessionIframe={startSessionIframe}
//                   stopSessionIframe={stopSessionIframe}
//                   stopSpeaking={stopSpeaking}
//                 />
//                 <QuestionInput
//                   mySpeechText={mySpeechText}
//                   handleSpeechText={handleSpeechText}
//                   isSessionActive={isSessionActive}
//                   isListening={isListening}
//                   startListening={startListening}
//                   stopListening={stopListening}
//                   handleAskQuestion={handleAskQuestion}
//                 />
//                 <Button
//                   variant="contained"
//                   color="primary"
//                   sx={{
//                     borderRadius: '20px',
//                     padding: '10px 20px',
//                     fontSize: '16px',
//                     fontWeight: 'bold',
//                     textTransform: 'none',
//                     transition: 'background-color 0.3s ease',
//                     '&:hover': {
//                       backgroundColor: '#b71c1c',
//                     },
//                     '&:active': {
//                       backgroundColor: '#d32f2f',
//                     },
//                   }}
//                   disabled={!isSessionActive}
//                   style={{ marginTop: '16px' }}
//                   onClick={() => setShowPiiBox(!showPiiBox)}
//                 >
//                   {showPiiBox ? "Show Response Box" : "Show Pii Box"}
//                 </Button>
//                 <ResponseBox
//                   responseText={responseText}
//                   piiResponseText={piiResponseText}
//                   showPiiBox={showPiiBox}
//                 />
//               </Box>
//             </Paper>
//           </Grid>
//           <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 3 }}>
//             <ChatHistory chatHistory={chatHistory} />
//           </Grid>
//         </Grid>
//       </Box>
//       <IconButton
//         onClick={() => setDrawerOpen(true)}
//         sx={{
//           position: 'fixed',
//           top: 16,
//           left: 16,
//           zIndex: 1000,
//           backgroundColor: 'white',
//           borderRadius: '50%',
//           boxShadow: 3,
//         }}
//       >
//         <FaBars />
//       </IconButton>
//       <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
//          <ChatList sessions={sessions} onSelectSession={handleSelectSession} selectedSessionId={selectedSessionId} />
//       </Drawer>
//     </Container>
//   );
// };

// export default AvatarStream;