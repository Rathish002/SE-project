import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import 'jest-axe/extend-expect';
import FriendList from './FriendList';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

const mockFriends = [
    { uid: '1', name: 'Alice', email: 'alice@test.com', online: true, lastActive: Date.now() },
    { uid: '2', name: 'Bob', email: 'bob@test.com', online: false, lastActive: Date.now() - 100000 }
];

describe('FriendList Component', () => {
    test('renders empty message if no friends', () => {
        render(<FriendList friends={[]} currentUid="user1" onStartChat={jest.fn()} />);
        expect(screen.getByText('collaboration.friends.empty')).toBeInTheDocument();
    });

    test('renders friends list', () => {
        render(<FriendList friends={mockFriends} currentUid="user1" onStartChat={jest.fn()} />);
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    test('calls onStartChat when start chat button clicked', () => {
        const mockOnStartChat = jest.fn();
        render(<FriendList friends={mockFriends} currentUid="user1" onStartChat={mockOnStartChat} />);

        const startChatButtons = screen.getAllByRole('button', { name: 'collaboration.friends.startChat' });
        fireEvent.click(startChatButtons[0]);
        expect(mockOnStartChat).toHaveBeenCalledWith('1');
    });

    test('should not have accessibility violations', async () => {
        const { container } = render(<FriendList friends={mockFriends} currentUid="user1" onStartChat={jest.fn()} />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
