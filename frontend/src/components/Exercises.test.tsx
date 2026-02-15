
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Exercises from './Exercises';
import { fetchExercisesByLesson, submitAnswer } from '../services/exerciseService';

// Mock services
jest.mock('../services/exerciseService');

// Mock child components
jest.mock('./ExercisesContent', () => () => <div data-testid="exercises-content">Content</div>);
jest.mock('./ExercisesFeedback', () => ({ isCorrect, message, onRetry }: any) => (
    <div data-testid="exercises-feedback">
        {message}
        {isCorrect === false && <button onClick={onRetry}>Retry</button>}
    </div>
));
jest.mock('./ExercisesTTSButton', () => () => <button>TTS</button>);

describe('Exercises Component', () => {
    const mockLessonId = 1;
    const mockNavigate = jest.fn();
    const mockBackToLesson = jest.fn();

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
                type: "free",
                instruction: "Write something",
                content: "Question 2",
                task: "Task 2",
            }
        ],
        microSteps: ["Step 1", "Step 2"]
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock updated hook behavior or prop passing if Service was used directly
        // But Exercises.tsx uses local state `initialLessons` currently, 
        // effectively ignoring `fetchExercisesByLesson` in the provided code snippet unless `lessonId` triggers a filter.
        // The provided code shows it uses `initialLessons` from data file.
        // We will mock the data file import if possible, but jest.mock hoisting makes it tricky for a non-default export in same file.
        // STICKING TO THE LOGIC: The component uses `initialLessons`.
        // However, I see `fetchExercisesByLesson` imported. Let's assume we can mock it?
        // Wait, the component implementation provided shows:
        // `const [lessons, setLessons] = useState<Lesson[]>(initialLessons);`
        // And an effect: `if (lessonId) { ... } // commented out logic`
        // So it effectively ALWAYS uses `initialLessons`.

        // This makes testing tricky if we rely on `initialLessons`. 
        // We can mock the data module to control `initialLessons`.
    });

    // Mocking the data module
    jest.mock('../data/exercisesData', () => ({
        lessons: [mockLessonData]
    }));

    test('renders exercise step', async () => {
        // We need to re-require or rely on the mock being applied before render
        // Since `jest.mock` is hoisted, it should work if we define it at top level.
    });
});

// Re-writing the test file to properly mock the data module which is used for state initialization
jest.mock('../data/exercisesData', () => ({
    lessons: [
        {
            id: "1",
            title: "Test Lesson",
            difficulty: "easy",
            steps: [
                {
                    type: "choice",
                    instruction: "Select answer",
                    content: "Question 1",
                    task: "Task 1", // Ensure this matches what is rendered
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
        }
    ]
}));

describe('Exercises Component Tests', () => {

    test('renders the first step correctly', () => {
        render(<Exercises lessonId={1} />);

        // Check for instruction
        expect(screen.getByText("Select answer")).toBeInTheDocument();
        // Check for task content
        expect(screen.getByText("Task 1")).toBeInTheDocument();
        // Check for child component
        expect(screen.getByTestId("exercises-content")).toBeInTheDocument();
    });

    test('calculates and displays progress', () => {
        render(<Exercises lessonId={1} />);
        // 0% initially
        expect(screen.getByText("0%")).toBeInTheDocument();
    });

    test('renders focus mode toggle', () => {
        render(<Exercises lessonId={1} />);
        const focusBtn = screen.getByText(/Focus Mode/i);
        expect(focusBtn).toBeInTheDocument();

        fireEvent.click(focusBtn);
        expect(screen.getByText("Exit Focus")).toBeInTheDocument();
    });

    // Note: Since `ExercisesContent` handles the interaction logic (checking answers), 
    // and we mocked it, we can't easily test "Next Step" logic without making `ExercisesContent` 
    // real or exposing the handler.
    // However, `Exercises.tsx` passes `checkAnswer` and `setAnswer` to `ExercisesContent`.
    // We can verify those props are passed if we want, or do an integration test.
    // Given the constraints and the provided code, checking rendering and mode toggling is appropriate.
});
