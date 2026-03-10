import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import 'jest-axe/extend-expect';
import Home from './Home';

// Mock dependencies
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('../utils/languageManager', () => ({
    getInterfaceLanguage: () => 'en',
    getLearningDirection: () => 'en-to-hi',
}));
jest.mock('../utils/activityTracker', () => ({
    loadActivity: () => ({ lastConversationName: 'Bob', lastFriendName: 'Alice' }),
}));
jest.mock('../services/presenceService', () => ({
    setupPresenceSystem: jest.fn(() => jest.fn()),
}));
jest.mock('../services/friendService', () => ({
    setupAcceptanceListener: jest.fn(() => jest.fn()),
}));
jest.mock('../services/progressService', () => ({
    fetchUserStats: jest.fn().mockResolvedValue({ lessonsStarted: 5, lessonsCompleted: 2 }),
}));

describe('Home Component', () => {
    const mockUser = { uid: 'user123', email: 'test@example.com', displayName: 'Test User' } as any;

    test('renders Home dashboard elements', () => {
        render(<Home currentUser={mockUser} />);
        expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
        expect(screen.getByText('home.interfaceLanguage')).toBeInTheDocument();
        expect(screen.getByText('home.learningDirection')).toBeInTheDocument();
    });

    test('should not have accessibility violations', async () => {
        const { container } = render(<Home currentUser={mockUser} />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
