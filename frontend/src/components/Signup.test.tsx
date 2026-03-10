import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import 'jest-axe/extend-expect';
import Signup from './Signup';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('firebase/auth', () => ({
    createUserWithEmailAndPassword: jest.fn(),
    signInWithPopup: jest.fn(),
    getAuth: jest.fn(),
}));

jest.mock('../firebase', () => ({
    auth: {},
    googleProvider: {},
}));

describe('Signup Component', () => {
    const mockSwitchToLogin = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders signup form correctly', () => {
        render(<Signup onSwitchToLogin={mockSwitchToLogin} />);
        expect(screen.getByLabelText('auth.signup.email')).toBeInTheDocument();
        expect(screen.getByLabelText('auth.signup.password')).toBeInTheDocument();
        expect(screen.getByLabelText('auth.signup.confirmPassword')).toBeInTheDocument();
    });

    test('shows error if passwords do not match', async () => {
        render(<Signup onSwitchToLogin={mockSwitchToLogin} />);

        fireEvent.change(screen.getByLabelText('auth.signup.password'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText('auth.signup.confirmPassword'), { target: { value: 'password456' } });
        fireEvent.click(screen.getByRole('button', { name: 'auth.signup.submit' }));

        expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
        expect(screen.getByRole('alert')).toHaveTextContent('auth.errors.passwordsNoMatch');
    });

    test('should not have accessibility violations', async () => {
        const { container } = render(<Signup onSwitchToLogin={mockSwitchToLogin} />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
