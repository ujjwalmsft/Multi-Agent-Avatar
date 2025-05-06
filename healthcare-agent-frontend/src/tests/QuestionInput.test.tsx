import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuestionInput from '../components/QuestionInput';
describe('QuestionInput component tests', () => {
  const mockOnSend = jest.fn();
  test('renders input box and buttons', () => {
    render(<QuestionInput onSend={mockOnSend} />);
    expect(screen.getByPlaceholderText(/Type your answer/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Activate speech input')).toBeInTheDocument();
    expect(screen.getByLabelText('Send Message')).toBeInTheDocument();
  });
  test('handles text input', () => {
    render(<QuestionInput onSend={mockOnSend} />);
    fireEvent.change(screen.getByPlaceholderText(/Type your answer/i), {
      target: { value: 'Hello' },
    });
    fireEvent.click(screen.getByLabelText('Send Message'));
    expect(mockOnSend).toHaveBeenCalledWith('Hello');
  });
  test('handles speech recognition properly', () => {
    render(<QuestionInput onSend={mockOnSend} />);
    const micButton = screen.getByText('🎙️');
    expect(micButton).toBeInTheDocument();
  });
});
 