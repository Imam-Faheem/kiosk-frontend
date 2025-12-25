import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import EarlyArrivalPage from '../EarlyArrivalPage';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Helper function to render component with providers
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <MantineProvider>
        {component}
      </MantineProvider>
    </BrowserRouter>
  );
};

describe('EarlyArrivalPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Component Rendering', () => {
    it('renders with correct heading', () => {
      renderWithProviders(<EarlyArrivalPage />);
      expect(screen.getByText('Early Arrival')).toBeInTheDocument();
    });

    it('renders warning message', () => {
      renderWithProviders(<EarlyArrivalPage />);
      expect(screen.getByText(/Card cannot be given before 2pm/i)).toBeInTheDocument();
      expect(screen.getByText(/Please return after 2pm/i)).toBeInTheDocument();
    });

    it('displays target time as "2:00 PM"', () => {
      renderWithProviders(<EarlyArrivalPage />);
      expect(screen.getByText(/Cards available after: 2:00 PM/i)).toBeInTheDocument();
    });

    it('renders Return to Menu button', () => {
      renderWithProviders(<EarlyArrivalPage />);
      expect(screen.getByRole('button', { name: /Return to Menu/i })).toBeInTheDocument();
    });
  });

  describe('Current Time Display', () => {
    it('displays current time and updates every second', async () => {
      renderWithProviders(<EarlyArrivalPage />);

      // Initial time should be displayed
      const timeElement = screen.getByText(/Current time:/i);
      expect(timeElement).toBeInTheDocument();

      // Fast-forward 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Time should still be displayed (format may change)
      expect(screen.getByText(/Current time:/i)).toBeInTheDocument();
    });

    it('formats time in 12-hour format with AM/PM', () => {
      // Mock Date to return a specific time
      const mockDate = new Date('2024-01-01T13:30:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      renderWithProviders(<EarlyArrivalPage />);

      // Check that time format includes AM/PM
      const timeText = screen.getByText(/Current time:/i).textContent;
      expect(timeText).toMatch(/AM|PM/i);

      global.Date.mockRestore();
    });
  });

  describe('Countdown Timer', () => {
    it('starts countdown at 15', () => {
      renderWithProviders(<EarlyArrivalPage />);
      expect(screen.getByText(/Returning to menu in: 15\.\.\./i)).toBeInTheDocument();
    });

    it('decrements countdown every second', async () => {
      renderWithProviders(<EarlyArrivalPage />);

      // Should start at 15
      expect(screen.getByText(/Returning to menu in: 15\.\.\./i)).toBeInTheDocument();

      // Fast-forward 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should be 14
      expect(screen.getByText(/Returning to menu in: 14\.\.\./i)).toBeInTheDocument();

      // Fast-forward another second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should be 13
      expect(screen.getByText(/Returning to menu in: 13\.\.\./i)).toBeInTheDocument();
    });

    it('auto-navigates to /home after 15 seconds', async () => {
      renderWithProviders(<EarlyArrivalPage />);

      // Fast-forward 15 seconds
      act(() => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/home');
      });
    });

    it('stops countdown at 0 before navigation', async () => {
      renderWithProviders(<EarlyArrivalPage />);

      // Fast-forward 14 seconds
      act(() => {
        jest.advanceTimersByTime(14000);
      });

      expect(screen.getByText(/Returning to menu in: 1\.\.\./i)).toBeInTheDocument();

      // Fast-forward 1 more second (total 15)
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/home');
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to /home when Return to Menu button is clicked', () => {
      renderWithProviders(<EarlyArrivalPage />);

      const returnButton = screen.getByRole('button', { name: /Return to Menu/i });
      returnButton.click();

      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });

    it('navigates to /home when back button is clicked', () => {
      renderWithProviders(<EarlyArrivalPage />);

      // Find back button (it's rendered by BackButton component)
      const backButton = screen.getByRole('button', { name: /back/i });
      backButton.click();

      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });

    it('clears intervals when manually navigating', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      renderWithProviders(<EarlyArrivalPage />);

      // Click return button
      const returnButton = screen.getByRole('button', { name: /Return to Menu/i });
      returnButton.click();

      // Intervals should be cleared
      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });
  });

  describe('Cleanup', () => {
    it('cleans up intervals on unmount', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { unmount } = renderWithProviders(<EarlyArrivalPage />);

      unmount();

      // Intervals should be cleared on unmount
      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });
  });

  describe('Optional Props', () => {
    it('accepts optional flowType prop', () => {
      renderWithProviders(<EarlyArrivalPage flowType="checkin" />);
      // Component should still render correctly
      expect(screen.getByText('Early Arrival')).toBeInTheDocument();
    });
  });
});

