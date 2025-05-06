import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatHistory, { ChatMessage } from '../components/ChatHistory';
 
describe('ChatHistory Component', () => {
  const mockConversationHistory: ChatMessage[] = [
    {
      sender: 'user',
      message: 'Hello',
      timestamp: '2025-03-15T09:00:00Z',
    },
    {
      sender: 'ai_avatar',
      message: 'Hi! How can I assist you?',
      timestamp: '2025-03-15T09:01:00Z',
    },
    {
      sender: 'agent',
      agentType: 'data_collector',
      message: 'Please provide your prescription details.',
      timestamp: '2025-03-15T09:02:00Z',
    },
    ];
  
  });
 
  describe('ChatHistory Component', () => {
    test('renders no history message if empty', () => {
      render(<ChatHistory conversationHistory={[]} />);
      expect(screen.getByText(/No conversation history yet./i)).toBeInTheDocument();
    });
   
    test('renders provided conversation history', () => {
      render(<ChatHistory conversationHistory={mockHistory} />);
      expect(screen.getByText('Hi! How can I assist you?')).toBeInTheDocument();
      expect(screen.getByText(/Hi! How can I assist you?/i)).toBeInTheDocument();
      expect(screen.getByText(/Data Collector Agent:/i)).toBeInTheDocument();
    });
   
    test('renders timestamps when provided', () => {
      render(<ChatHistory conversationHistory={mockHistory} />);
      expect(screen.getByText('3/15/2025, 9:00:00 AM')).toBeInTheDocument();
      expect(screen.getByText('3/15/2025, 9:01:00 AM')).toBeInTheDocument();
    });
  });
   
  const mockHistory: ChatMessage[] = [
    {
      sender: 'user',
      message: 'Hello',
      timestamp: '2025-03-15T09:00:00Z',
    },
    {
      sender: 'ai_avatar',
      message: 'Hi! How can I assist you?',
      timestamp: '2025-03-15T09:01:00Z',
    },
];