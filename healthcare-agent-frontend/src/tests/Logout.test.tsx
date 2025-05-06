import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Logout from '../components/Logout';
import { PublicClientApplication } from '@azure/msal-browser';
 
// Mock MSAL logout
jest.mock('@azure/msal-browser', () => ({
  PublicClientApplication: jest.fn().mockImplementation(() => ({
    logoutRedirect: jest.fn(),
  })),
}));
 
describe('Logout Component', () => {
  it('renders logout button', () => {
    render(<Logout />);
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
 
  it('initiates logout on button click', () => {
    const logoutRedirectMock = jest.fn();
    (PublicClientApplication as unknown as jest.Mock).mockReturnValue({
      logoutRedirect: logoutRedirectMock,
    });
 
    const { getByText } = render(<Logout />);
    fireEvent.click(getByText('Logout'));
 
    expect(logoutRedirectMock).toHaveBeenCalled();
  });
});