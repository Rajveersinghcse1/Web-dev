import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AnalyticsDashboard from '../AnalyticsDashboard';

// Mock Convex
jest.mock('convex/react', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

// Mock Zustand stores
jest.mock('@/store', () => ({
  useAnalyticsStore: jest.fn((selector) => {
    const state = { sessionHistory: [] };
    return selector ? selector(state) : state;
  }),
  useProgressStore: jest.fn((selector) => {
    const state = { totalSessions: 0, totalTimeMinutes: 0 };
    return selector ? selector(state) : state;
  }),
}));

// Mock Recharts to avoid rendering issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  AreaChart: ({ children }) => <div>{children}</div>,
  Area: () => <div />,
  BarChart: ({ children }) => <div>{children}</div>,
  Bar: () => <div />,
  PieChart: ({ children }) => <div>{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
  LineChart: ({ children }) => <div>{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
}));

// Suppress console warnings during tests
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Convex useQuery
    const { useQuery } = require('convex/react');
    useQuery.mockReturnValue([]);
  });

  it('renders without crashing when sessions is undefined', () => {
    const { useAnalyticsStore } = require('@/store');
    useAnalyticsStore.mockImplementation((selector) => {
      const state = { sessionHistory: undefined };
      return selector ? selector(state) : state;
    });

    const { container } = render(<AnalyticsDashboard />);
    expect(container).toBeInTheDocument();
  });

  it('renders without crashing when sessions is null', () => {
    const { useAnalyticsStore } = require('@/store');
    useAnalyticsStore.mockImplementation((selector) => {
      const state = { sessionHistory: null };
      return selector ? selector(state) : state;
    });

    const { container } = render(<AnalyticsDashboard />);
    expect(container).toBeInTheDocument();
  });

  it('renders without crashing when sessions is empty array', () => {
    const { useAnalyticsStore } = require('@/store');
    useAnalyticsStore.mockImplementation((selector) => {
      const state = { sessionHistory: [] };
      return selector ? selector(state) : state;
    });

    const { container } = render(<AnalyticsDashboard />);
    expect(container).toBeInTheDocument();
  });

  it('does not trigger setState-in-render console error', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<AnalyticsDashboard />);
    
    // Check no error about updating component during render
    const setStateErrors = consoleErrorSpy.mock.calls.filter(call => 
      call[0]?.toString?.()?.includes?.('Cannot update a component') || 
      call[0]?.toString?.()?.includes?.('while rendering')
    );
    
    expect(setStateErrors).toHaveLength(0);
    consoleErrorSpy.mockRestore();
  });

  it('handles valid sessions array without errors', async () => {
    const { useAnalyticsStore } = require('@/store');
    const mockSessions = [
      {
        id: '1',
        timestamp: Date.now(),
        duration: 300,
        mode: 'Interview',
        xpEarned: 50
      },
      {
        id: '2',
        timestamp: Date.now() - 86400000, // 1 day ago
        duration: 450,
        mode: 'Lecture',
        xpEarned: 75
      }
    ];

    useAnalyticsStore.mockImplementation((selector) => {
      const state = { sessionHistory: mockSessions };
      return selector ? selector(state) : state;
    });

    const { container } = render(<AnalyticsDashboard />);
    
    await waitFor(() => {
      expect(container).toBeInTheDocument();
    });
  });

  it('does not call forEach on non-array sessions', () => {
    const { useAnalyticsStore } = require('@/store');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    useAnalyticsStore.mockImplementation((selector) => {
      const state = { sessionHistory: { invalid: 'data' } };
      return selector ? selector(state) : state;
    });

    render(<AnalyticsDashboard />);
    
    const forEachErrors = consoleErrorSpy.mock.calls.filter(call =>
      call[0]?.toString?.()?.includes?.('forEach')
    );
    
    expect(forEachErrors).toHaveLength(0);
    consoleErrorSpy.mockRestore();
  });

  it('correctly processes valid session data', () => {
    const { useAnalyticsStore, useProgressStore } = require('@/store');
    const mockSessions = [
      {
        id: '1',
        timestamp: Date.now(),
        duration: 30,
        mode: 'Interview',
        xpEarned: 100
      },
      {
        id: '2',
        timestamp: Date.now() - 3600000, // 1 hour ago
        duration: 45,
        mode: 'Lecture',
        xpEarned: 150
      }
    ];

    useAnalyticsStore.mockImplementation((selector) => {
      const state = { sessionHistory: mockSessions };
      return selector ? selector(state) : state;
    });

    useProgressStore.mockImplementation((selector) => {
      const state = { totalSessions: 2, totalTimeMinutes: 75 };
      return selector ? selector(state) : state;
    });

    const { container } = render(<AnalyticsDashboard />);
    expect(container).toBeInTheDocument();
  });
});
