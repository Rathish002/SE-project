import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Exercises from './Exercises';
import { fetchExercisesByLesson } from '../services/exerciseService';

// Mock services
jest.mock('../services/exerciseService', () => ({
    fetchExercisesByLesson: jest.fn(),
    submitAnswer: jest.fn(),
    saveExerciseProgress: jest.fn()
}));

// Mock child components
jest.mock('./ExercisesContent', () => () => <div data-testid="exercises-content">Content</div>);
jest.mock('./ExercisesFeedback', () => ({ isCorrect, message, onRetry }: any) => (
    <div data-testid="exercises-feedback">
        {message}
        {isCorrect === false && <button onClick={onRetry}>Retry</button>}
    </div>
));
jest.mock('./ExercisesTTSButton', () => () => <button>TTS</button>);

describe('Exercises Component Tests', () => {
    const mockLessonData = {
        id: "1",
        title: "Test Lesson",
        difficulty: "easy",
        steps: [
            {
                type: "choice",
                instruction: "Select answer",
                content: "Question 1",
                task: "Task 1",
                options: ["Option A", "Option B"],
                correct: "Option A",
                hints: ["Hint 1"]
            },
            {
                type: "choice",
                instruction: "Second Step",
                content: "Question 2",
                task: "Task 2",
                options: ["Yes", "No"],
                correct: "Yes",
                hints: []
            }
        ],
        microSteps: ["Step 1", "Step 2"]
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (fetchExercisesByLesson as jest.Mock).mockResolvedValue([mockLessonData]);
    });

    test('renders loading state initially', async () => {
        render(<Exercises lessonId={1} />);
        expect(screen.getByText("Loading exercises...")).toBeInTheDocument();

        // Wait for async fetch to finish before exiting test to prevent act() warnings
        await screen.findByText("Select answer");
    });

    test('renders the first step correctly after loading', async () => {
        render(<Exercises lessonId={1} />);

        // Wait for the instruction text to appear (this wraps act implicitly)
        const instruction = await screen.findByText("Select answer");
        expect(instruction).toBeInTheDocument();

        // Check for task content
        expect(screen.getByText("Task 1")).toBeInTheDocument();
        // Check for child component
        expect(screen.getByTestId("exercises-content")).toBeInTheDocument();
    });

    test('calculates and displays progress after loading', async () => {
        render(<Exercises lessonId={1} />);

        // Wait for it to render
        const progress = await screen.findByText("0%");
        expect(progress).toBeInTheDocument();
    });

    test('renders focus mode toggle after loading', async () => {
        render(<Exercises lessonId={1} />);

        const focusBtn = await screen.findByText(/exercises\.controls\.focusMode/i);
        expect(focusBtn).toBeInTheDocument();

        fireEvent.click(focusBtn);
        expect(screen.getByText(/exercises\.controls\.exitFocus/i)).toBeInTheDocument();
    });
});

