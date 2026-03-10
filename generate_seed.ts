import * as fs from 'fs';
import * as path from 'path';

// Load the compiled lessons data
// We'll use ts-node to run this script so we can import the TS file directly
import { lessons } from './frontend/src/data/exercisesData';

let sql = '-- ==========================================\n';
sql += '-- Complete Seed Data for SE Project Database\n';
sql += '-- Generated from frontend mock data\n';
sql += '-- ==========================================\n\n';

sql += 'BEGIN;\n\n';

sql += '-- Clear existing data\n';
sql += 'TRUNCATE TABLE exercise_step_options, exercise_steps, exercises, evaluation_rules, evaluation_intents, lesson_keywords, lessons RESTART IDENTITY CASCADE;\n\n';

// Mapping from string IDs used in frontend to integer IDs for Database
const idMap: Record<string, number> = {
    'verb-1': 1, 'adj-1': 2, 'sent-1': 3, 'pronouns-1': 4,
    'emo-1': 5, 'emo-2': 6,
    'social-1': 7, 'social-2': 8, 'social-3': 9,
    'daily-1': 10, 'daily-2': 11,
    'safety-1': 12, 'safety-2': 13
};

// Help escape SQL strings
const escapeSql = (str: string | undefined): string => {
    if (!str) return 'NULL';
    return `'${str.replace(/'/g, "''")}'`;
};

sql += '-- ==========================================\n';
sql += '-- 1. LESSONS TABLE\n';
sql += '-- ==========================================\n\n';

sql += 'INSERT INTO lessons (id, title, language_code, text_content, english_text_content)\nVALUES\n';

const lessonValues = lessons.map(lesson => {
    const lessonId = idMap[lesson.id as string] || 99;
    const content = escapeSql(lesson.description);
    return `  (${lessonId}, ${escapeSql(lesson.title)}, 'en', ${content}, ${content})`;
});

sql += lessonValues.join(',\n') + ';\n\n';

sql += '-- ==========================================\n';
sql += '-- 2. LESSON KEYWORDS (Mocked based on words array if present)\n';
sql += '-- ==========================================\n\n';

sql += 'INSERT INTO lesson_keywords (lesson_id, keyword, expanation)\nVALUES\n';
const keywordValues: string[] = [];

lessons.forEach(lesson => {
    const lessonId = idMap[lesson.id as string] || 99;
    let addedAny = false;
    lesson.steps.forEach(step => {
        if (step.words) {
            step.words.forEach(word => {
                keywordValues.push(`  (${lessonId}, ${escapeSql(word)}, 'Vocabulary word from lesson')`);
                addedAny = true;
            });
        }
    });
    // Add a default keyword if none found to satisfy DB structure if needed
    if (!addedAny) {
        keywordValues.push(`  (${lessonId}, ${escapeSql(lesson.category)}, 'Primary Category')`);
    }
});
sql += keywordValues.join(',\n') + ';\n\n';

sql += '-- ==========================================\n';
sql += '-- 3. EXERCISES TABLE\n';
sql += '-- ==========================================\n\n';

sql += 'INSERT INTO exercises (id, lesson_id, title, instructions_text)\nVALUES\n';
const exerciseValues: string[] = [];
// Assuming 1 exercise per lesson to match frontend structure 1:1
lessons.forEach(lesson => {
    const lessonId = idMap[lesson.id as string] || 99;
    exerciseValues.push(`  (${lessonId}, ${lessonId}, ${escapeSql(lesson.title + ' Exercise')}, ${escapeSql(lesson.description)})`);
});
sql += exerciseValues.join(',\n') + ';\n\n';


let globalStepId = 1;
let globalOptionId = 1;
const stepValues: string[] = [];
const optionValues: string[] = [];

lessons.forEach(lesson => {
    const exerciseId = idMap[lesson.id as string] || 99;

    lesson.steps.forEach((step, index) => {
        const stepNumber = index + 1;
        const currentStepId = globalStepId++;

        let correctOptionId = 'NULL';

        // Process options
        if (step.options) {
            step.options.forEach((opt, optIndex) => {
                const optId = globalOptionId++;
                optionValues.push(`  (${optId}, ${currentStepId}, ${escapeSql(opt)}, ${optIndex + 1})`);
                if (opt === step.correct || (Array.isArray(step.answer) ? step.answer.includes(opt) : step.answer === opt)) {
                    correctOptionId = optId.toString();
                }
            });
        } else if (step.imageOptions) {
            step.imageOptions.forEach((opt, optIndex) => {
                const optId = globalOptionId++;
                optionValues.push(`  (${optId}, ${currentStepId}, ${escapeSql(opt.label || opt.alt)}, ${optIndex + 1})`);
                if (opt.id === step.correct || opt.id === step.answer) {
                    correctOptionId = optId.toString();
                }
            });
        } else if (step.answer) {
            // For fill/build, we might just store the text answer in the correct option for reference
            const optId = globalOptionId++;
            const ansText = Array.isArray(step.answer) ? step.answer[0] : step.answer;
            optionValues.push(`  (${optId}, ${currentStepId}, ${escapeSql(ansText)}, 1)`);
            correctOptionId = optId.toString();
        }

        const promptText = step.task || step.content || '';
        const hintText = step.hints ? step.hints[0] : '';

        stepValues.push(`  (${currentStepId}, ${exerciseId}, ${stepNumber}, ${escapeSql(promptText)}, ${escapeSql(hintText)}, ${correctOptionId})`);
    });
});

sql += '-- ==========================================\n';
sql += '-- 4. EXERCISE STEPS TABLE\n';
sql += '-- ==========================================\n\n';

sql += 'INSERT INTO exercise_steps (id, exercise_id, step_number, prompt, hint_1, correct_option_id)\nVALUES\n';
sql += stepValues.join(',\n') + ';\n\n';

sql += '-- ==========================================\n';
sql += '-- 5. EXERCISE STEP OPTIONS TABLE\n';
sql += '-- ==========================================\n\n';

if (optionValues.length > 0) {
    sql += 'INSERT INTO exercise_step_options (id, step_id, option_text, option_order)\nVALUES\n';
    sql += optionValues.join(',\n') + ';\n\n';
}

sql += 'COMMIT;\n';

fs.writeFileSync('server/sql/seed-data.sql', sql);
console.log('Successfully generated server/sql/seed-data.sql');
