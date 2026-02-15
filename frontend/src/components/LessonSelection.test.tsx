
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LessonSelection from './LessonSelection';
import { getAvailableLessonIds, fetchLesson } from '../services/lessonService';
import { useTranslation } from 'react-i18next';

// Mock services and hooks
jest.mock('../services/lessonService');
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));
jest.mock('../utils/languageManager', () => ({
    getLearningDirection: () => 'en-to-hi',
}));

describe('LessonSelection Component', () => {
    const mockLessonId = 1;
    const mockLessonData = {
        lesson: {
            id: 1,
            title: 'Test Lesson',
            content: 'This is a test lesson content.',
        },
        keywords: []
    };
    const onSelectLessonMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (getAvailableLessonIds as jest.Mock).mockReturnValue([mockLessonId]);
        (fetchLesson as jest.Mock).mockResolvedValue(mockLessonData);
    });

    test('renders loading state initially', () => {
        render(<LessonSelection onSelectLesson={onSelectLessonMock} />);
        expect(screen.getByText('app.loading')).toBeInTheDocument();
    });

    test('renders lesson list after loading', async () => {
        render(<LessonSelection onSelectLesson={onSelectLessonMock} />);

        await waitFor(() => {
            expect(screen.getByText('lessons.title')).toBeInTheDocument();
            expect(screen.getByText('Test Lesson')).toBeInTheDocument();
        });
    });

    test('calls onSelectLesson when start button is clicked', async () => {
        render(<LessonSelection onSelectLesson={onSelectLessonMock} />);

        await waitFor(() => {
            expect(screen.getByText('lessons.startLesson')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('lessons.startLesson'));

        expect(onSelectLessonMock).toHaveBeenCalledWith(mockLessonId);
    });

    test('renders empty state if no lessons available', async () => {
        (getAvailableLessonIds as jest.Mock).mockReturnValue([]);
        render(<LessonSelection onSelectLesson={onSelectLessonMock} />);

        await waitFor(() => {
            expect(screen.getByText('lessons.noLessons')).toBeInTheDocument();
        });
    });
});
