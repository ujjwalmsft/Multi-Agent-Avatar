import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AvatarChatContainer from '../components/AvatarChatContainer';
import { useConversation } from '../hooks/useConversation';
 
jest.mock('../hooks/useConversation');
 
describe('AvatarChatContainer', () => {
  beforeEach(() => {
    (useConversation as jest.Mock).mockReturnValue({
      sessionId: '123456',
      conversationHistory: [],
      activeAgent: 'data_collector',
      currentAssistantMessage: 'Hello! Upload your prescription or answer questions.',
      chatList: [{ sessionId: '1', title: 'Session 1' }],
      startNewConversation: jest.fn(),
      sendMessage: jest.fn(),
      uploadPrescription: jest.fn(),
      finalizeConversation: jest.fn(),
      fetchChatList: jest.fn(),
      loadChatSession: jest.fn(),
    });
  });
 
  test('renders main container elements', () => {
    render(<AvatarChatContainer />);
 
    expect(screen.getByText('Medical Agent AI Assistant')).toBeInTheDocument();
    expect(screen.getByText('Historical Sessions')).toBeInTheDocument();
    expect(screen.getByText('Chat History')).toBeInTheDocument();
    expect(screen.getByText('Current Agent:')).toBeInTheDocument();
  });
});