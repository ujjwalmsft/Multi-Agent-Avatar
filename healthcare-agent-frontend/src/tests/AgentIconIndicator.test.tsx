import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AgentIconIndicator from '../components/AgentIconIndicator';
 
describe('AgentIconIndicator Component Tests', () => {
  test('renders Data Collection Agent icon and label', () => {
    render(<AgentIconIndicator currentAgent="dataCollector" />);
    expect(screen.getByText('Data Collection Agent')).toBeInTheDocument();
  });
 
  test('renders Email Agent icon and label', () => {
    render(<AgentIconIndicator currentAgent="emailAgent" />);
    expect(screen.getByText('Email Agent')).toBeInTheDocument();
  });
 
  test('renders AI Avatar Assistant icon and label', () => {
    render(<AgentIconIndicator currentAgent="avatar" />);
    expect(screen.getByText('AI Avatar Assistant')).toBeInTheDocument();
  });
});