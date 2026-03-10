import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import 'jest-axe/extend-expect';
import Navigation from './Navigation';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

describe('Navigation Component', () => {
    const mockOnNavigate = jest.fn();

    test('renders navigation links', () => {
        render(<Navigation currentPage="home" onNavigate={mockOnNavigate} />);
        expect(screen.getByLabelText('navigation.home')).toBeInTheDocument();
        expect(screen.getByLabelText('navigation.lessons')).toBeInTheDocument();
        expect(screen.getByLabelText('navigation.collaboration')).toBeInTheDocument();
        expect(screen.getByLabelText('navigation.settings')).toBeInTheDocument();
    });

    test('calls onNavigate when link is clicked', () => {
        render(<Navigation currentPage="home" onNavigate={mockOnNavigate} />);
        fireEvent.click(screen.getByLabelText('navigation.lessons'));
        expect(mockOnNavigate).toHaveBeenCalledWith('lessons');
    });

    test('should not have accessibility violations', async () => {
        const { container } = render(<Navigation currentPage="home" onNavigate={mockOnNavigate} />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
