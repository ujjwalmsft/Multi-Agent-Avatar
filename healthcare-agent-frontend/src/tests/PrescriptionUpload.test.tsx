import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PrescriptionUpload from '../components/PrescriptionUpload';
import apiService from '../app/services/apiService';
 
jest.mock('../app/services/apiService');
 
describe('PrescriptionUpload Component Tests', () => {
  const mockSessionId = 'testSession123';
  const mockExtractedDetails = { medicine: 'Paracetamol', dosage: '500mg' };
  const mockFile = new File(['dummy content'], 'prescription.jpg', { type: 'image/jpeg' });
 
  beforeEach(() => {
    (apiService.uploadPrescription as jest.Mock).mockResolvedValue({
      data: { extracted_details: mockExtractedDetails }
    });
  });
 
  test('renders file upload UI elements', () => {
    render(<PrescriptionUpload sessionId={mockSessionId} onDetailsExtracted={jest.fn()} />);
    expect(screen.getByText(/Upload Prescription Image/i)).toBeInTheDocument();
    expect(screen.getByText(/Select File/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload and Extract Details/i)).toBeInTheDocument();
  });
 
  test('handles file selection', () => {
    render(<PrescriptionUpload sessionId={mockSessionId} onDetailsExtracted={jest.fn()} />);
    const fileInput = screen.getByLabelText(/Select File/i).querySelector('input[type="file"]')!;
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
    expect(screen.getByText('prescription.jpg')).toBeInTheDocument();
  });
 
  test('uploads file and extracts details', async () => {
    const mockOnDetailsExtracted = jest.fn();
    render(<PrescriptionUpload sessionId={mockSessionId} onDetailsExtracted={mockOnDetailsExtracted} />);
 
    const fileInput = screen.getByLabelText(/Select File/i).querySelector('input[type="file"]')!;
    fireEvent.change(fileInput, { target: { files: [mockFile] } });
 
    fireEvent.click(screen.getByText(/Upload and Extract Details/i));
 
    await waitFor(() => {
      expect(apiService.uploadPrescription).toHaveBeenCalled();
      expect(screen.getByText(/Upload successful! Details extracted./i)).toBeInTheDocument();
      expect(mockOnDetailsExtracted).toHaveBeenCalledWith(mockExtractedDetails);
    });
  });
});