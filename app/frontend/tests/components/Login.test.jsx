import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../src/components/Login';

vi.mock('../../src/services/api', () => ({
  authApi: {
    login: vi.fn(() => Promise.resolve({ data: { token: 'fake-token' } })),
  },
}));

const renderWithRouter = (component) => render(<BrowserRouter>{component}</BrowserRouter>);

describe('Login Component', () => {
  it('renders login form', () => {
    renderWithRouter(<Login />);
    expect(screen.getByText('Login to SecureTrack')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('updates email and password fields', () => {
    renderWithRouter(<Login />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@test.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('has a link to register', () => {
    renderWithRouter(<Login />);
    expect(screen.getByText('Register')).toBeInTheDocument();
  });
});
