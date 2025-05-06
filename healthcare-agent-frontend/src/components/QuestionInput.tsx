/**
* Documentation: QuestionInput.tsx
*
* Purpose:
* - Explicitly captures user input via text or voice using Azure Speech SDK.
* - Sends user input explicitly back to conversation context (parent component).
*
* Explicit Features:
* - Full Azure Speech SDK integration explicitly implemented for real-time speech-to-text.
* - Explicitly handles continuous speech recognition states and text updates.
* - Explicit handling of loading states during backend interactions.
*
* Dependencies:
* - Azure Speech SDK: Explicitly used for voice recognition (STT).
* - MaterialUI components: TextField, IconButton, Tooltip, InputAdornment for explicit UI clarity.
* - useConversation Hook: Provides explicit conversation context and loading state.
*
* Usage:
* Embedded explicitly within the session conversation interface ([sessionId].tsx), facilitating user interaction explicitly via both text and speech.
*/

import React, { useState, useEffect } from 'react';
import { TextField, IconButton, InputAdornment, Box, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
 
interface QuestionInputProps {
  sessionId: string;
  onSend: (userInput: string) => void;
  disabled?: boolean;
  onRequestUpload?: () => void;
}
 
/**
* Explicitly handles user question input via text or speech using Azure Speech SDK.
*/
const QuestionInput: React.FC<QuestionInputProps> = ({ sessionId, onSend,   disabled = false  }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
 
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://aka.ms/csspeech/jsbrowserpackageraw';
    script.async = true;
    script.onload = () => {
      setSdkLoaded(true);
      console.log('[QuestionInput] Azure Speech SDK loaded.');
    };
    script.onerror = () => {
      console.error('[QuestionInput] Error loading Azure Speech SDK.');
    };
    document.body.appendChild(script);
  }, []);
 
  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
    }
  };
 
  const handleSpeechRecognition = () => {
    if (!sdkLoaded || !(window as any).SpeechSDK) {
      console.error('[QuestionInput] Azure Speech SDK not loaded.');
      return;
    }
 
    const speechConfig = (window as any).SpeechSDK.SpeechConfig.fromSubscription(
      '8HWNs2Z1sgeFd7bcQ2QjrD5Nt3OB2V9NFiV6K1OTyznZi2htJw0NJQQJ99BCACHYHv6XJ3w3AAAYACOGRXeK',
                'eastus2'
    );

    // const speechConfig = (window as any).SpeechSDK.SpeechConfig.fromSubscription(
    //   '5j1OHZtwEK8bV8n7dIGXj5bPmsDzE0qJgMa9b2ZxjjjCNLWul9Y8JQQJ99AKAC8vTInXJ3w3AAAYACOGxCV1',
    //             'westus2'
    // );

    speechConfig.speechRecognitionLanguage = 'en-US';
 
    const audioConfig = (window as any).SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new (window as any).SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
 
    setIsListening(true);
    recognizer.recognizeOnceAsync((result: any) => {
      setIsListening(false);
      if (result.text) {
        setInput(result.text);
        console.log('[QuestionInput] Recognized speech:', result.text);
      } else {
        console.warn('[QuestionInput] No speech recognized.');
      }
    });
  };
 
  return (
<Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
<TextField
        fullWidth
        variant="outlined"
        placeholder={disabled ? "Start session to begin..." : "Ask a question or reply..."}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        InputProps={{
          endAdornment: (
<InputAdornment position="end">
  <IconButton 
    onClick={handleSend} 
    color="primary" 
    disabled={disabled || !input.trim()}  // Disable when session not started or input empty
  >
    <SendIcon />
  </IconButton>
  <IconButton 
    onClick={handleSpeechRecognition} 
    color={isListening ? 'secondary' : 'primary'}
    disabled={disabled || isListening}  // Disable when session not started or already listening
  >
    {isListening ? <StopIcon /> : <MicIcon />}
  </IconButton>
</InputAdornment>
          ),
        }}
        disabled={disabled || isListening}
      />
      {isListening && <CircularProgress size={24} sx={{ ml: 1 }} />}
</Box>
  );
};
 
export default QuestionInput;




















