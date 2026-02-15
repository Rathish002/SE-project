
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Learning from './Learning';
import { fetchLesson, getAvailableLessonIds } from '../services/lessonService';
import { useAccessibility } from '../contexts/AccessibilityContext';

// Mock services and hooks
jest.mock('../services/lessonService');
jest.mock('../contexts/AccessibilityContext');
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));
jest.mock('../utils/languageManager', () => ({
    getLearningDirection: () => 'en-to-hi',
}));

// Mock ErrorFallback to avoid issues if error state is triggered
jest.mock('./ErrorFallback', () => () => <div>Error Fallback</div>);
jest.mock('./Evaluation', () => () => <div>Evaluation Component</div>);

describe('Learning Component', () => {
    const mockLessonId = 1;
    const mockOnNavigateToExercises = jest.fn();
    const mockOnBack = jest.fn();
    const mockOnFocusModeChange = jest.fn();

    const mockLessonData = {
        lesson: {
            id: 1,
            title: 'Test Lesson',
            content: 'Test content',
        },
        keywords: []
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (fetchLesson as jest.Mock).mockResolvedValue(mockLessonData);
        (getAvailableLessonIds as jest.Mock).mockReturnValue([1]);
        (useAccessibility as jest.Mock).mockReturnValue({
            preferences: { audioSpeed: 1 },
            updateAudioSpeed: jest.fn(),
        });
    });

    test('renders "Go to Exercises" button and handles click', async () => {
        render(
            <Learning
                lessonId={mockLessonId}
                onBack={mockOnBack}
                focusMode={false}
                onFocusModeChange={mockOnFocusModeChange}
                onNavigateToExercises={mockOnNavigateToExercises}
            />
        );

        // Wait for lesson to load
        await waitFor(() => {
            expect(screen.getByText('Test Lesson')).toBeInTheDocument();
        });

        // Check for button
        const exercisesBtn = screen.getByText('lessons.goToExercises');
        expect(exercisesBtn).toBeInTheDocument();

        // Click button
        fireEvent.click(exercisesBtn);

        expect(mockOnNavigateToExercises).toHaveBeenCalledTimes(1);
    });
});
