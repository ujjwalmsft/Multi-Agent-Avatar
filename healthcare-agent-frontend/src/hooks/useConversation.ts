/**
* Documentation: useConversation.ts
*
* Purpose:
* Custom React hook explicitly managing session state and chat interactions.
* Provides clear abstraction layer for frontend-backend interactions including explicit Speech SDK integration at component level.
*
* Explicit Features:
* - Explicit handling of session initialization for new and existing sessions.
* - Explicitly manages loading states and conversation history.
* - Explicit methods provided for sending user messages, uploading prescription images, finalizing conversations, and loading session histories.
*
* Dependencies:
* - apiService: Explicit backend API communication methods.
*
* Usage:
* Explicitly imported and used within conversation components and pages ([sessionId].tsx, QuestionInput.tsx, ChatHistory.tsx, etc.)
*/

import { useState, useEffect, useCallback } from 'react';
import apiService from '../app/services/apiService';
 
interface ConversationEntry {
  sender: 'user' | 'avatar' | 'agent';
  message: string;
  timestamp: string;
}
 
const useConversation = (sessionId: string | null) => {
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId);
  const [loading, setLoading] = useState<boolean>(false);
  const [messageisLoading, setMessageisLoading] = useState(false);
  useEffect(() => {
    if (currentSessionId) {
      loadConversationHistory(currentSessionId);
    }
  }, [currentSessionId]);
 
  /**
   * Explicitly loads conversation history for an existing session.
   */
  const loadConversationHistory = useCallback(async (existingSessionId: string) => {
    setLoading(true);
    try {
      console.log(`[useConversation] Loading history for session: ${existingSessionId}`);
      const response = await apiService.getConversationHistory(existingSessionId);
      
      // Debug the raw response
      console.log('[useConversation] Raw history response:', response);
      
      // Convert from backend format (role/content) to frontend format (sender/message)
      if (response && response.history && Array.isArray(response.history)) {
        const convertedHistory = response.history.map((item: { sender: any; message: any; role: string; content: any; }) => {
          // Check if this is already in frontend format
          if (item.sender && item.message) {
            return item;
          }
          
          // Convert from backend format
          if (item.role && item.content) {
            // Map roles to sender types
            let sender = 'system';
            if (item.role === 'user') {
              sender = 'user';
            } else if (item.role === 'assistant') {
              sender = 'avatar';
            }
            
            return {
              sender,
              message: item.content,
              timestamp: new Date().toISOString()
            };
          }
          
          // Fallback for unrecognized format
          console.warn('[useConversation] Unrecognized message format:', item);
          return null;
        }).filter(Boolean); // Remove any null entries
        
        console.log('[useConversation] Converted history:', convertedHistory);
        setConversationHistory(convertedHistory);
      } else {
        console.warn('[useConversation] No history found or invalid format');
        setConversationHistory([]);
      }
    } catch (error) {
      console.error('[useConversation] Error loading history:', error);
      setConversationHistory([]); // explicitly handle errors gracefully
    } finally {
      setLoading(false);
    }
  }, []);
 
  /**
   * Explicitly starts a new conversation session.
   * Returns a structured object containing session_id and initial message.
   */

  const startConversation = useCallback(async () => {
    setLoading(true);
    try {
      const { session_id, message } = await apiService.startConversation();
      setCurrentSessionId(session_id);
      setConversationHistory([{
        sender: 'avatar',
        message,
        timestamp: new Date().toISOString(),
      }]);
      return { session_id, message };
    } catch (error) {
      console.error('[useConversation] Error starting conversation:', error);
    } finally {
      setLoading(false);
    }
  }, []);


  const sendUserMessage = useCallback(async (userInput: string) => {
    if (!currentSessionId) return; 
    setMessageisLoading(true);  
    try {  
      const response = await apiService.sendUserMessage(currentSessionId, userInput);  
      setConversationHistory(prevHistory => ([  
        ...(Array.isArray(prevHistory) ? prevHistory : []),  
        { sender: 'user', message: userInput, timestamp: new Date().toISOString() },  
        { sender: 'avatar', message: response.message, timestamp: new Date().toISOString() },  
      ]));  
      console.log('[useConversation] User message sent:', response);  
      return response;  
    } catch (error) {
      console.error('[useConversation] Error sending user message:', error);
    } finally {
      setMessageisLoading(false);
    }
  }, [currentSessionId]);  
 
  const uploadPrescription = useCallback(async (file: File) => {
    if (!currentSessionId) return;
    setLoading(true);
    
    try {
      // Capture the session ID locally to ensure it doesn't change mid-operation
      const sessionIdForUpload = currentSessionId;
      
      // Add upload message immediately to provide instant feedback
      setConversationHistory(prevHistory => [
        ...(Array.isArray(prevHistory) ? prevHistory : []),
        { 
          sender: 'user', 
          message: `[Uploading prescription: ${file.name}...]`, 
          timestamp: new Date().toISOString() 
        }
      ]);
      
      // Make the API call with the captured session ID
      const result = await apiService.uploadPrescription(sessionIdForUpload, file);
      console.log('This isthe complete result int eh uplaod prescriptions',result);
      console.log('THIS IS THE RESULT IN UPLOAD PRESCIPRTION',result.message);
      
      // Update the conversation history, preserving all previous messages
      setConversationHistory(prevHistory => {
        // Filter out the temporary upload message if it exists
        const filteredHistory = prevHistory.filter(entry => 
          !entry.message.includes(`[Uploading prescription: ${file.name}...]`)
        );
        
        // Add the final messages
        return [
          ...filteredHistory,
          { 
            sender: 'user', 
            message: `[Uploaded prescription: ${file.name}]`, 
            timestamp: new Date().toISOString() 
          },
          { 
            sender: 'avatar', 
            message: result.message, 
            timestamp: new Date().toISOString() 
          },
        ];
      });
      
      // Log success
      console.log('[useConversation] Prescription uploaded successfully:', result);
      
      // Return result for any additional processing
      return result;
    } catch (error) {
      console.error('[useConversation] Error uploading prescription:', error);
      
      // Show error in conversation
      setConversationHistory(prevHistory => [
        ...(Array.isArray(prevHistory) ? prevHistory : []),
        { 
          sender: 'avatar', 
          message: 'Sorry, there was an error uploading your prescription. Please try again.', 
          timestamp: new Date().toISOString() 
        }
      ]);
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentSessionId]);


  const finalizeConversation = useCallback(async () => {
    if (!currentSessionId) return;
    setLoading(true);
    try {
      const { message } = await apiService.finalizeConversation(currentSessionId);
      setConversationHistory(prevHistory => [
        ...prevHistory,
        { sender: 'agent', message, timestamp: new Date().toISOString() },
      ]);
    } catch (error) {
      console.error('[useConversation] Error finalizing conversation:', error);
    } finally {
      setLoading(false);
    }
  }, [currentSessionId]);
 
  return {
    conversationHistory,
    sessionId: currentSessionId,
    loading,
    startConversation,
    messageisLoading,
    sendUserMessage,
    loadConversationHistory,
    uploadPrescription,
    finalizeConversation,
  };
};
 
export default useConversation;
 
