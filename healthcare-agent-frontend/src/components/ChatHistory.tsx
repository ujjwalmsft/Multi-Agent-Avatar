import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, CircularProgress, Tooltip, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import apiService from '@/app/services/apiService'; 
// Interface for Chat Messages
export interface ChatMessage {
  sender: 'user' | 'ai_avatar' | 'agent';
  agentType?: 'data_collector' | 'email_agent';
  message: string;
  timestamp?: string;
  id?: string;
  maskedMessage?: string;
  showMasked?: boolean;
}
 
// CosmosDB message format
interface CosmosMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}
 
// Props definition including loading state clearly
interface ChatHistoryProps {
  conversationHistory: ChatMessage[] | CosmosMessage[] | { history?: ChatMessage[]; conversation_history?: { history: ChatMessage[] } };
  loading?: boolean;
}
 
/**
* ChatHistory component displays conversation history between user and avatar or backend agents.
* It manages loading animation clearly to enhance user experience during response processing.
*/
const ChatHistory: React.FC<ChatHistoryProps> = ({ conversationHistory, loading }) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
   // Track which messages are being processed and their masked versions
   const [processingIds, setProcessingIds] = useState<Set<string | number>>(new Set());
   const [maskedMessages, setMaskedMessages] = useState<Map<string | number, string>>(new Map());
   const [visibleMasks, setVisibleMasks] = useState<Set<string | number>>(new Set());
 

  // Process PII for a specific message
  const handlePiiCheck = async (message: ChatMessage, index: number) => {
    const messageId = message.id || index;
    
    // If we already have processed this message, just toggle visibility
    if (maskedMessages.has(messageId)) {
      togglePiiVisibility(messageId);
      return;
    }
    
    // Show loading state
    setProcessingIds(prev => new Set(prev).add(messageId));
    
    try {
      // Call API to get PII entities
      const response = await apiService.recognizePii(message.message);
      
      // Create masked version
      let maskedText = message.message;
      
      if (response.entities) {
        // Sort entities by length (descending) to handle overlapping entities properly
        const sortedEntities = [...response.entities].sort((a, b) => 
          b.text.length - a.text.length
        );
        
        // Replace each entity with asterisks
        sortedEntities.forEach((entity: { text: string; category: string }) => {
          if (['Organization', 'Email', 'PhoneNumber', 'Person', 'Address', 'Quantity'].includes(entity.category)) {
            const mask = '*'.repeat(entity.text.length);
            // Use word boundaries when possible to avoid partial replacements
            const regex = new RegExp(entity.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            maskedText = maskedText.replace(regex, mask);
          }
        });
      }
      
      // Store masked version
      setMaskedMessages(prev => new Map(prev).set(messageId, maskedText));
      
      // Show the masked version
      setVisibleMasks(prev => new Set(prev).add(messageId));
    } catch (error) {
      console.error('Error processing PII:', error);
    } finally {
      // Remove loading state
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  };

    // Toggle between masked and original text
    const togglePiiVisibility = (messageId: string | number) => {
      setVisibleMasks(prev => {
        const newSet = new Set(prev);
        if (newSet.has(messageId)) {
          newSet.delete(messageId);
        } else {
          newSet.add(messageId);
        }
        return newSet;
      });
    };

  // Transforming Cosmos DB messages format to consistent UI format
  const transformMessages = (): ChatMessage[] => {
    if (!conversationHistory) return [];
 
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      if ('role' in conversationHistory[0]) {
        return (conversationHistory as CosmosMessage[]).map(msg => ({
          sender: msg.role === 'user' ? 'user' : 'ai_avatar',
          message: msg.content,
          timestamp: msg.timestamp || new Date().toISOString(),
        }));
      } else if ('sender' in conversationHistory[0]) {
        return conversationHistory as ChatMessage[];
      }
    } else if ('history' in conversationHistory) {
      return conversationHistory.history || [];
    } else if (
      'conversation_history' in conversationHistory &&
      conversationHistory.conversation_history?.history
    ) {
      return conversationHistory.conversation_history.history || [];
    }
 
    return [];
  };
 
  const messages = transformMessages();
 
  // Auto-scroll to latest message on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);
 
// The return part needs to be updated - rest can stay the same
return (
  <Box sx={{ position: 'relative', p: 2, maxHeight: '70vh', overflowY: 'auto' }}>
    {messages.length === 0 && !loading && (
      <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
        No conversation history yet.
      </Typography>
    )}
 
    {messages.map((msg, index) => {
      const messageId = msg.id || index;
      const isProcessing = processingIds.has(messageId);
      const hasMaskedVersion = maskedMessages.has(messageId);
      const showMasked = visibleMasks.has(messageId);
      
      return (
        <Box
          key={index}
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: msg.sender === 'user' ? '#f0f4ff' : '#f1f8e9',
            maxWidth: '80%',
            ml: msg.sender === 'user' ? 'auto' : 0,
            mr: msg.sender === 'user' ? 0 : 'auto',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" color="textSecondary">
              {msg.sender === 'user' ? '👤 User' : msg.sender === 'ai_avatar' ? '🤖 Assistant' : `Agent (${msg.agentType})`}
            </Typography>
            
            {/* PII Button - Only show for AI messages */}
            {msg.sender !== 'user' && (
              <Tooltip title={hasMaskedVersion ? (showMasked ? "Show Original" : "Show Masked") : "Check for Sensitive Info"}>
                <IconButton 
                  size="small"
                  onClick={() => handlePiiCheck(msg, index)}
                  disabled={isProcessing}
                  sx={{ ml: 1, p: 0.5 }}
                >
                  {isProcessing ? (
                    <CircularProgress size={16} />
                  ) : showMasked ? (
                    <VisibilityOffIcon fontSize="small" />
                  ) : (
                    <VisibilityIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </Box>
          
          <Typography variant="body1">
            {hasMaskedVersion && showMasked ? maskedMessages.get(messageId) : msg.message}
          </Typography>
          
          {msg.timestamp && (
            <Typography variant="caption" color="textSecondary" display="block" textAlign="right" mt={0.5}>
              {new Date(msg.timestamp).toLocaleString()}
            </Typography>
          )}
        </Box>
      );
    })}
 
    {loading && (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          mb: 2,
          p: 2,
          borderRadius: 2,
          backgroundColor: '#e0e0e0',
          maxWidth: '80%',
        }}
      >
        <Typography variant="subtitle2" color="textSecondary">
          🤖 Assistant
        </Typography>
        <Typography variant="body1" sx={{ ml: 1 }}>
          Processing your request...
          <CircularProgress size={16} sx={{ ml: 1 }} />
        </Typography>
      </Box>
    )}
 
    <div ref={messagesEndRef} />
  </Box>
);
};
 
export default ChatHistory;
 