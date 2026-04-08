import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../../src/components/Dashboard';

vi.mock('../../src/services/api', () => ({
  incidentApi: {
    stats: vi.fn(() =>
      Promise.resolve({
        data: {
          total: 10,
          bySeverity: { HIGH: 5, LOW: 5 },
          byStatus: { OPEN: 7, CLOSED: 3 },
        },
      })
    ),
  },
}));

describe('Dashboard Component', () => {
  it('renders loading state initially', () => {
    render(<Dashboard />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders stats after loading', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });
});
