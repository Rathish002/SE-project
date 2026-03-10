import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import 'jest-axe/extend-expect';
import Collaboration from './Collaboration';

// Mock dependencies
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('../services/friendService', () => ({
    subscribeToFriends: jest.fn(() => jest.fn()),
    subscribeToFriendRequests: jest.fn(() => jest.fn()),
}));
jest.mock('../services/chatService', () => ({
    subscribeToConversations: jest.fn(() => jest.fn()),
}));

describe('Collaboration Component', () => {
    const mockUser = { uid: 'user123', email: 'test@example.com' } as any;

    test('renders loading state initially or welcome state', () => {
        render(<Collaboration currentUser={mockUser} focusMode={false} onFocusModeChange={jest.fn()} />);
        // Depends on state updates, but 'Find Friends' should eventually render.
        expect(screen.getByText('Find Friends')).toBeInTheDocument();
    });

    test('renders tabs correctly', () => {
        render(<Collaboration currentUser={mockUser} focusMode={false} onFocusModeChange={jest.fn()} />);
        expect(screen.getByText(/collaboration.tabs.chats/)).toBeInTheDocument();
        expect(screen.getByText(/collaboration.tabs.groups/)).toBeInTheDocument();
        expect(screen.getByText(/collaboration.tabs.friends/)).toBeInTheDocument();
    });

    test('should not have accessibility violations', async () => {
        const { container } = render(<Collaboration currentUser={mockUser} focusMode={false} onFocusModeChange={jest.fn()} />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
