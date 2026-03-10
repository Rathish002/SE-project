import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import 'jest-axe/extend-expect';
import Login from './Login';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: jest.fn(),
    signInWithPopup: jest.fn(),
    getAuth: jest.fn(),
}));

jest.mock('../firebase', () => ({
    auth: {},
    googleProvider: {},
}));

describe('Login Component', () => {
    const mockSwitchToSignup = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders login form correctly', () => {
        render(<Login onSwitchToSignup={mockSwitchToSignup} />);
        expect(screen.getByLabelText('auth.login.email')).toBeInTheDocument();
        expect(screen.getByLabelText('auth.login.password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'auth.login.submit' })).toBeInTheDocument();
    });

    test('calls signInWithEmailAndPassword on form submit', async () => {
        (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({});
        render(<Login onSwitchToSignup={mockSwitchToSignup} />);

        fireEvent.change(screen.getByLabelText('auth.login.email'), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByLabelText('auth.login.password'), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: 'auth.login.submit' }));

        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@test.com', 'password123');
    });

    test('calls onSwitchToSignup when switch button clicked', () => {
        render(<Login onSwitchToSignup={mockSwitchToSignup} />);
        fireEvent.click(screen.getByRole('button', { name: 'auth.login.signUp' }));
        expect(mockSwitchToSignup).toHaveBeenCalled();
    });

    test('should not have accessibility violations', async () => {
        const { container } = render(<Login onSwitchToSignup={mockSwitchToSignup} />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
