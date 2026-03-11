import { Lesson } from '../types/ExerciseTypes';

export const fetchExercisesByLesson = async (lessonId: number): Promise<Lesson[]> => {
    try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/exercises/lesson/${lessonId}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch exercises: ${response.statusText}`);
        }

        const data = await response.json();

        // If the backend returns no exercises, just return an empty array
        if (!data.exercises || data.exercises.length === 0) {
            return [];
        }

        // Transform backend data to match frontend Lesson structure
        return data.exercises.map((ex: any) => ({
            id: ex.id.toString(),
            title: ex.title,
            description: ex.instructions_text,
            category: 'Language',
            difficulty: 'basic',
            microSteps: ["Read", "Practice", "Learn"],
            steps: ex.steps.map((step: any) => ({
                type: 'choice',
                content: step.prompt,
                task: step.prompt,
                instruction: step.prompt,
                options: step.options?.map((o: any) => o.text) || [],
                correct: step.options?.find((o: any) => o.id === step.correct_option_id)?.text || '',
                stepId: step.step_id,
                hints: [step.hint_1, step.hint_2, step.hint_3].filter(Boolean),
            }))
        }));
    } catch (error: any) {
        console.error('Error fetching exercises from backend:', error);
        const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3001';
        throw new Error(`[Targeting ${apiUrl}] ${error.message || 'Unknown network error'}. Please ensure the backend is running.`);
    }
};

export const saveExerciseProgress = async (
    userId: string,
    exerciseId: number,
    currentStep: number,
    completedSteps: number,
    isCompleted: boolean
) => {
    try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3001';
        await fetch(`${apiUrl}/exercises/progress`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                exerciseId,
                currentStep,
                completedSteps,
                isCompleted
            }),
        });
    } catch (error) {
        console.error('Error saving progress:', error);
    }
};

export const submitAnswer = async (
    userId: string,
    stepId: number,
    selectedOptionId: number
) => {
    try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3001';
        const response = await fetch(`${apiUrl}/exercises/answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                stepId,
                selectedOptionId
            }),
        });
        return await response.json();
    } catch (error) {
        console.error('Error submitting answer:', error);
        return { correct: false, feedback: 'Error submitting answer' };
    }
};
