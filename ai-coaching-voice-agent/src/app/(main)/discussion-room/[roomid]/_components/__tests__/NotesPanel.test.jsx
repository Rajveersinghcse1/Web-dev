import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NotesPanel from '../NotesPanel';

// Mock the toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
  },
}));

describe('NotesPanel', () => {
  const mockSetEnableFeedbackNotes = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default notes', () => {
    render(
      <NotesPanel 
        enableFeedbackNotes={false} 
        setEnableFeedbackNotes={mockSetEnableFeedbackNotes} 
      />
    );

    expect(screen.getByText('Session Notes')).toBeInTheDocument();
    expect(screen.getByText('Focus on maintaining eye contact during the introduction.')).toBeInTheDocument();
  });

  it('allows adding a new note', () => {
    render(
      <NotesPanel 
        enableFeedbackNotes={false} 
        setEnableFeedbackNotes={mockSetEnableFeedbackNotes} 
      />
    );

    const input = screen.getByPlaceholderText('Add a quick note...');
    const addButton = screen.getByTestId('add-note-button');

    fireEvent.change(input, { target: { value: 'My new test note' } });
    fireEvent.click(addButton);

    expect(screen.getByText('My new test note')).toBeInTheDocument();
  });

  it('toggles auto-notes', () => {
    render(
      <NotesPanel 
        enableFeedbackNotes={false} 
        setEnableFeedbackNotes={mockSetEnableFeedbackNotes} 
      />
    );

    const toggleButton = screen.getByText('Enable');
    fireEvent.click(toggleButton);

    expect(mockSetEnableFeedbackNotes).toHaveBeenCalledWith(true);
  });

  it('generates auto-notes from conversation', () => {
    const mockConversation = [
      { role: 'model', content: 'I suggest you try to speak slower.' }
    ];

    render(
      <NotesPanel 
        enableFeedbackNotes={true} 
        setEnableFeedbackNotes={mockSetEnableFeedbackNotes}
        conversation={mockConversation}
      />
    );

    // The heuristic looks for "suggest", "try", or "remember"
    expect(screen.getByText('I suggest you try to speak slower.')).toBeInTheDocument();
  });
});
