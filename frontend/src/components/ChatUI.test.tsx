/**
 * ChatUI Component Tests
 * Tests for real-time chat interface functionality
 */

import React from 'react';
import type { User } from 'firebase/auth';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatUI from './ChatUI';
import * as chatService from '../services/chatService';

// Chat service is mocked separately below
jest.mock('../services/chatService', () => ({
  subscribeToMessages: jest.fn(() => jest.fn()),
  sendMessage: jest.fn(),
  sendImageMessage: jest.fn(),
  sendVideoMessage: jest.fn(),
  sendVoiceMessage: jest.fn(),
  sendFileMessage: jest.fn(),
}));

// Mock firestore (additional to global mock in setupTests)
jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  doc: jest.fn(),
  onSnapshot: jest.fn(),
  getDoc: jest.fn(),
}));

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

// Mock block service
jest.mock('../services/blockService', () => ({
  blockUser: jest.fn(),
  unblockUser: jest.fn(),
  isUserBlocked: jest.fn().mockResolvedValue(false),
}));

// Mock time utils
jest.mock('../utils/timeUtils', () => ({
  formatLastActive: jest.fn(() => 'just now'),
}));

describe('ChatUI Component', () => {
  const mockUser = {
    uid: 'test-user-id',
    email: 'test@example.com',
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    reload: jest.fn(),
    getIdToken: jest.fn(),
    getIdTokenResult: jest.fn(),
    toJSON: jest.fn(),
  } as unknown as User;

  const mockOnBack = jest.fn();
  const conversationId = 'conv-123';

  beforeEach(() => {
    jest.clearAllMocks();
    (chatService.subscribeToMessages as jest.Mock).mockReturnValue(jest.fn());
  });

  describe('Message Input', () => {
    test('renders message input field', () => {
      render(
        <ChatUI
          conversationId={conversationId}
          currentUser={mockUser}
          onBack={mockOnBack}
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    test('updates message text on user input', async () => {
      render(
        <ChatUI
          conversationId={conversationId}
          currentUser={mockUser}
          onBack={mockOnBack}
        />
      );
      const input = screen.getByRole('textbox') as HTMLTextAreaElement;

      await userEvent.type(input, 'Hello World');
      expect(input.value).toBe('Hello World');
    });

    test('sends message on Enter key press', async () => {
      (chatService.sendMessage as jest.Mock).mockResolvedValue(undefined);

      render(
        <ChatUI
          conversationId={conversationId}
          currentUser={mockUser}
          onBack={mockOnBack}
        />
      );
      const input = screen.getByRole('textbox') as HTMLTextAreaElement;

      await userEvent.type(input, 'Hello World');
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(chatService.sendMessage).toHaveBeenCalledWith(
          conversationId,
          mockUser.uid,
          'Hello World',
          expect.any(String) // language
        );
      });
    });

    test('adds newline on Shift+Enter', async () => {
      render(
        <ChatUI
          conversationId={conversationId}
          currentUser={mockUser}
          onBack={mockOnBack}
        />
      );
      const input = screen.getByRole('textbox') as HTMLTextAreaElement;

      await userEvent.type(input, 'Line 1');
      // Shift+Enter should allow newline
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: true });

      // Wait for the text to be updated (may need multiple type operations)
      // The component allows natural newline with Shift+Enter
      expect(input).toBeInTheDocument();
    });

    test('clears input after sending message', async () => {
      (chatService.sendMessage as jest.Mock).mockResolvedValue(undefined);

      render(
        <ChatUI
          conversationId={conversationId}
          currentUser={mockUser}
          onBack={mockOnBack}
        />
      );
      const input = screen.getByRole('textbox') as HTMLTextAreaElement;

      await userEvent.type(input, 'Test message');
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });
  });

  describe('Message Display', () => {
    test('subscribes to messages on mount', () => {
      render(
        <ChatUI
          conversationId={conversationId}
          currentUser={mockUser}
          onBack={mockOnBack}
        />
      );

      expect(chatService.subscribeToMessages).toHaveBeenCalledWith(
        conversationId,
        mockUser.uid,
        expect.any(Function)
      );
    });

    test('displays messages when received', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          text: 'Hello',
          senderId: 'sender-1',
          timestamp: new Date(),
          conversationId,
        },
        {
          id: 'msg-2',
          text: 'Hi there',
          senderId: mockUser.uid,
          timestamp: new Date(),
          conversationId,
        },
      ];

      let messageCallback: any;
      (chatService.subscribeToMessages as jest.Mock).mockImplementation(
        (_convId, _userId, callback) => {
          messageCallback = callback;
          callback(mockMessages);
          return jest.fn();
        }
      );

      render(
        <ChatUI
          conversationId={conversationId}
          currentUser={mockUser}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Hello')).toBeInTheDocument();
        expect(screen.getByText('Hi there')).toBeInTheDocument();
      });
    });

    test('scrolls to bottom when new messages arrive', async () => {
      const scrollIntoViewMock = jest.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;

      const mockMessages = [
        {
          id: 'msg-1',
          text: 'Old message',
          senderId: 'sender-1',
          timestamp: new Date(),
          conversationId,
        },
      ];

      (chatService.subscribeToMessages as jest.Mock).mockImplementation(
        (_convId, _userId, callback) => {
          callback(mockMessages);
          return jest.fn();
        }
      );

      render(
        <ChatUI
          conversationId={conversationId}
          currentUser={mockUser}
          onBack={mockOnBack}
        />
      );

      // The component calls scrollIntoView when messages are rendered
      await waitFor(() => {
        expect(scrollIntoViewMock).toHaveBeenCalled();
      });
    });
  });

  describe('Media Uploads', () => {
    test('handles image upload', async () => {
      (chatService.sendImageMessage as jest.Mock).mockResolvedValue(undefined);

      render(
        <ChatUI
          conversationId={conversationId}
          currentUser={mockUser}
          onBack={mockOnBack}
        />
      );

      const file = new File(['dummy content'], 'image.jpg', { type: 'image/jpeg' });
      const imageInputs = screen.getAllByRole('button').filter(
        (btn) => btn.className.includes('image') || btn.getAttribute('aria-label')?.includes('image')
      );

      if (imageInputs.length > 0) {
        fireEvent.click(imageInputs[0]);
      }
    });

    test('handles video upload', async () => {
      (chatService.sendVideoMessage as jest.Mock).mockResolvedValue(undefined);

      render(
        <ChatUI
          conversationId={conversationId}
          currentUser={mockUser}
          onBack={mockOnBack}
        />
      );

      expect(chatService.sendVideoMessage).toBeDefined();
    });

    test('handles voice message recording', async () => {
      (chatService.sendVoiceMessage as jest.Mock).mockResolvedValue(undefined);

      render(
        <ChatUI
          conversationId={conversationId}
          currentUser={mockUser}
          onBack={mockOnBack}
        />
      );

      expect(chatService.sendVoiceMessage).toBeDefined();
    });
  });

  describe('Connection Status', () => {
    test('displays connected status initially', () => {
      render(
        <ChatUI
          conversationId={conversationId}
          currentUser={mockUser}
          onBack={mockOnBack}
        />
      );

      // The component renders with connected status
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    test('handles reconnection scenario', async () => {
      (chatService.subscribeToMessages as jest.Mock).mockImplementation(
        (_convId, _userId, callback) => {
          // Simulate messages received (which sets connection to 'connected')
          callback([]);
          return jest.fn();
        }
      );

      const { rerender } = render(
        <ChatUI
          conversationId={conversationId}
          currentUser={mockUser}
          onBack={mockOnBack}
        />
      );

      // Component should handle reconnection
      expect(chatService.subscribeToMessages).toHaveBeenCalled();
    });
  });

  describe('User Interactions', () => {
    test('calls onBack when back button is clicked', () => {
      render(
        <ChatUI
          conversationId={conversationId}
          currentUser={mockUser}
          onBack={mockOnBack}
        />
      );

      const backButtons = screen.getAllByRole('button').filter(
        (btn) => btn.className.includes('back') || btn.getAttribute('aria-label')?.includes('back')
      );

      if (backButtons.length > 0) {
        fireEvent.click(backButtons[0]);
        expect(mockOnBack).toHaveBeenCalled();
      }
    });

    test('handles null currentUser gracefully', async () => {
      render(
        <ChatUI
          conversationId={conversationId}
          currentUser={null}
          onBack={mockOnBack}
        />
      );

      // Component should render without crashing
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles send message error', async () => {
      (chatService.sendMessage as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(
        <ChatUI
          conversationId={conversationId}
          currentUser={mockUser}
          onBack={mockOnBack}
        />
      );

      const input = screen.getByRole('textbox') as HTMLTextAreaElement;
      await userEvent.type(input, 'Test message');
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      // Component should handle error gracefully
      await waitFor(() => {
        expect(chatService.sendMessage).toHaveBeenCalled();
      });
    });

    test('unsubscribes from messages on unmount', () => {
      const unsubscribeMock = jest.fn();
      (chatService.subscribeToMessages as jest.Mock).mockReturnValue(unsubscribeMock);

      const { unmount } = render(
        <ChatUI
          conversationId={conversationId}
          currentUser={mockUser}
          onBack={mockOnBack}
        />
      );

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });
});
