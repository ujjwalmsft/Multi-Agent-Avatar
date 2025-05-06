import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ChatHistory from '@/components/ChatHistory';
import apiService from '@/app/services/apiService';
import useConversation from '@/hooks/useConversation';
import ChatList from '@/components/ChatList';
 
jest.mock('../src/app/services/apiService');
jest.mock('../src/hooks/useConversation');
 
describe('ChatList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
 
  test('renders chat sessions correctly', async () => {
    (apiService.getAllSessions as jest.Mock).mockResolvedValue({
      sessions: [
        { session_id: '1710473012.345', created_at: '2024-03-15T10:50:12Z' },
      ],
    });
 
    render(<ChatList />);
 
    await waitFor(() => {
      expect(screen.getByText(/Session:/)).toBeInTheDocument();
      expect(screen.getByText(/Created:/)).toBeInTheDocument();
    });
  });
 
  test('handles session selection correctly', async () => {
    (apiService.getAllSessions as jest.Mock).mockResolvedValue({
      sessions: [{ session_id: '1710473012.345', created_at: '2024-03-15T10:50:12Z' }],
    });
 
    const mockLoadConversationHistory = jest.fn();
    (useConversation as jest.Mock).mockReturnValue({
      loadConversationHistory: mockLoadConversationHistory,
    });
 
    render(<ChatList />);
 
    await waitFor(() => screen.getByText(/Session:/));
 
    fireEvent.click(screen.getByText(/Session:/));
    expect(mockLoadConversationHistory).toHaveBeenCalledWith('1710473012.345');
  });
});