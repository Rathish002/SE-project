import { lessons } from './src/data/exercisesData.ts';
import fs from 'fs';

const extracted = lessons.reduce((acc, lesson) => {
    acc[lesson.id] = {
        title: lesson.title,
        description: lesson.description,
        microSteps: lesson.microSteps,
        steps: lesson.steps.map(step => {
            const stepData: any = {
                content: step.content,
                task: step.task,
                instruction: step.instruction,
                hints: step.hints
            };
            if (step.options) stepData.options = step.options;
            if (step.correct) stepData.correct = step.correct;
            if (step.answer) stepData.answer = step.answer;
            if (step.words) stepData.words = step.words;
            if (step.imageOptions) {
                stepData.imageOptions = step.imageOptions.map(io => ({
                    id: io.id,
                    label: io.label,
                    alt: io.alt
                }));
            }
            return stepData;
        })
    };
    return acc;
}, {} as Record<string, any>);

fs.writeFileSync('extracted_en.json', JSON.stringify(extracted, null, 2));
console.log('Extraction complete');
