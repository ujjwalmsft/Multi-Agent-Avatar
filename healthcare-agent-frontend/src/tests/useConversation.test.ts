import { renderHook, act } from '@testing-library/react-hooks';

import useConversation from '../hooks/useConversation';

import apiService from '../app/services/apiService';
 
jest.mock('../src/app/services/apiService');
 
describe('useConversation hook', () => {

  beforeEach(() => {

    jest.clearAllMocks();

  });
 
  test('should start conversation successfully', async () => {

    const mockResponse = { session_id: '12345', message: 'Hello! Start chatting.' };

    (apiService.startConversation as jest.Mock).mockResolvedValue(mockResponse);
 
    const { result } = renderHook(() => useConversation());
 
    await act(async () => {

      const sessionId = await result.current.startConversation();

      expect(sessionId).toEqual('mocked-session-id');

    });
 
    expect(result.current.chatHistory).toEqual([

      { sender: 'assistant', message: 'Hello! How can I assist you today?' },

    ]);

  });
 
  it('handles user messages', async () => {

    (apiService.sendUserMessage as jest.Mock).mockResolvedValue({

      message: 'Next question?',

      is_conversation_over: false,

    });
 
    const { result } = renderHook(() => useConversation());
 
    await act(async () => {

      await result.current.handleUserMessage('mocked-session-id', 'My response');

    });
 
    expect(result.current.chatHistory).toContainEqual(

      { sender: 'user', message: 'My response' },

    );

    expect(result.current.chatHistory).toContainEqual(

      { sender: 'assistant', message: 'mocked message' },

    );

  });

});

 