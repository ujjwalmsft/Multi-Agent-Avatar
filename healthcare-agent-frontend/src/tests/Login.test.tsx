import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../components/Login';
 
describe('Login Component Tests', () => {
  test('renders login button and title correctly', () => {
    render(<Login />);
    expect(screen.getByText('Login with Microsoft Entra ID')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});