import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AvatarStream from '../components/AvatarStream';
 
describe('AvatarStream Component', () => {
  test('renders the AI Avatar iframe correctly', () => {
    render(<AvatarStream />);
 
    const iframe = screen.getByTitle('AI Avatar RTC');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', '/avatar/video.html');
  });
 
  test('renders component heading correctly', () => {
    render(<AvatarStream />);
    expect(screen.getByText('AI Avatar Assistant')).toBeInTheDocument();
  });
});