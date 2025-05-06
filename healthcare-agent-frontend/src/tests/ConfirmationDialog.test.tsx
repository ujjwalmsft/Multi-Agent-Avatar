import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ConfirmationDialog from '../components/ConfirmationDialog';



describe('ConfirmationDialog Component Tests', () => {
  const mockDetails = {
    name: 'John Doe',
    age: 30,
    medicine: 'Paracetamol',
  };
 
  test('renders dialog with provided user details', () => {
    render(
<ConfirmationDialog
        open={true}
        userDetails={mockDetails}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
 
    expect(screen.getByText(/Confirm Your Details/i)).toBeInTheDocument();
    expect(screen.getByText(/name: John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/age: 30/i)).toBeInTheDocument();
    expect(screen.getByText(/medicine: Paracetamol/i)).toBeInTheDocument();
  });
 
  test('calls onConfirm when Confirm button clicked', async () => {
    const onConfirm = jest.fn();
    render(
<ConfirmationDialog
        open={true}
        userDetails={mockDetails}
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    );
    userEvent.click(screen.getByText('Confirm'));
    expect(onConfirm).toHaveBeenCalled();
  });
 
  test('calls onCancel when Update button clicked', async () => {
    const onCancel = jest.fn();
    render(
<ConfirmationDialog
        open={true}
        userDetails={mockDetails}
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />
    );
 
    await userEvent.click(screen.getByText(/Update/i));
    expect(onCancel).toHaveBeenCalled();
  });
});