import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponseBox from '../components/ResponseBox';
 
describe('ResponseBox Component Tests', () => {
  const sampleMessage = "Hello, how can I assist you today?";
 
  test('renders message from AI Avatar Assistant', () => {
    render(<ResponseBox message={sampleMessage} agentType="avatar" />);
    expect(screen.getByText(sampleMessage)).toBeInTheDocument();
    expect(screen.getByText('AI Avatar Assistant')).toBeInTheDocument();
  });
 
  test('renders message from Data Collector Agent', () => {
    render(<ResponseBox message={sampleMessage} agentType="dataCollector" />);
    expect(screen.getByText(sampleMessage)).toBeInTheDocument();
    expect(screen.getByText('Data Collector Agent')).toBeInTheDocument();
  });
 
  test('renders message from Email Agent', () => {
    render(<ResponseBox message={sampleMessage} agentType="emailAgent" />);
    expect(screen.getByText(sampleMessage)).toBeInTheDocument();
    expect(screen.getByText('Email Agent')).toBeInTheDocument();
  });
});