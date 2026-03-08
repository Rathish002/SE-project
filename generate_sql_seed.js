const fs = require('fs');

const rawData = fs.readFileSync('frontend/extracted_en.json', 'utf8');
const lessonsObj = JSON.parse(rawData);
// Convert object to array for easier mapping
const lessonsArray = Object.keys(lessonsObj).map(id => ({ id, ...lessonsObj[id] }));

let sql = '-- ==========================================\n';
sql += '-- Complete Seed Data for SE Project Database\n';
sql += '-- Generated from frontend mock data\n';
sql += '-- ==========================================\n\n';

sql += 'BEGIN;\n\n';

sql += '-- Clear existing data\n';
sql += 'TRUNCATE TABLE exercise_step_options, exercise_steps, exercises, evaluation_rules, evaluation_intents, lesson_keywords, lessons RESTART IDENTITY CASCADE;\n\n';

const idMap = {
    'verb-1': 1, 'adj-1': 2, 'sent-1': 3, 'pronouns-1': 4,
    'emo-1': 5, 'emo-2': 6,
    'social-1': 7, 'social-2': 8, 'social-3': 9,
    'daily-1': 10, 'daily-2': 11,
    'safety-1': 12, 'safety-2': 13
};

const escapeSql = (str) => {
    if (!str) return 'NULL';
    return `'${str.replace(/'/g, "''")}'`;
};

sql += '-- ==========================================\n';
sql += '-- 1. LESSONS TABLE\n';
sql += '-- ==========================================\n\n';

sql += 'INSERT INTO lessons (id, title, language_code, text_content, english_text_content)\nVALUES\n';

const lessonTitles = {
    'verb-1': 'Understanding Verbs', 'adj-1': 'Adjectives and Description', 'sent-1': 'Sentence Building', 'pronouns-1': 'Understanding Pronouns',
    'emo-1': 'Identifying Emotions', 'emo-2': 'Understanding Feelings',
    'social-1': 'Greetings and Introductions', 'social-2': 'Taking Turns', 'social-3': 'Understanding Personal Space',
    'daily-1': 'Morning Routine', 'daily-2': 'Healthy Eating Choices',
    'safety-1': 'Stranger Safety', 'safety-2': 'Road Safety'
};

const lessonValues = lessonsArray.map(lesson => {
    const lessonId = idMap[lesson.id] || 99;
    const title = lessonTitles[lesson.id] || lesson.id;
    let desc = '';
    if (lesson.steps) {
        desc = lesson.steps.map(s => s.instruction || s.task || s.content || '').join(' ');
    }
    const content = escapeSql(desc);
    return `  (${lessonId}, ${escapeSql(title)}, 'en', ${content}, ${content})`;
});

sql += lessonValues.join(',\n') + ';\n\n';

sql += '-- ==========================================\n';
sql += '-- 2. LESSON KEYWORDS\n';
sql += '-- ==========================================\n\n';

sql += 'INSERT INTO lesson_keywords (lesson_id, keyword, expanation)\nVALUES\n';
const keywordValues = [];

lessonsArray.forEach((lesson, index) => {
    const lessonId = idMap[lesson.id] || 99;
    let addedAny = false;
    if (lesson.steps) {
        lesson.steps.forEach(step => {
            if (step.words) {
                step.words.forEach(word => {
                    keywordValues.push(`  (${lessonId}, ${escapeSql(word)}, 'Vocabulary word from lesson')`);
                    addedAny = true;
                });
            }
        });
    }
    if (!addedAny) {
        keywordValues.push(`  (${lessonId}, ${escapeSql(lessonTitles[lesson.id])}, 'Primary Category')`);
    }
});
sql += keywordValues.join(',\n') + ';\n\n';

sql += '-- ==========================================\n';
sql += '-- 3. EXERCISES TABLE\n';
sql += '-- ==========================================\n\n';

sql += 'INSERT INTO exercises (id, lesson_id, title, instructions_text)\nVALUES\n';
const exerciseValues = [];
lessonsArray.forEach(lesson => {
    const lessonId = idMap[lesson.id] || 99;
    const title = lessonTitles[lesson.id] || lesson.id;
    exerciseValues.push(`  (${lessonId}, ${lessonId}, ${escapeSql(title + ' Exercise')}, ${escapeSql('Complete the exercise steps')})`);
});
sql += exerciseValues.join(',\n') + ';\n\n';

let globalStepId = 1;
let globalOptionId = 1;
const stepValues = [];
const optionValues = [];

lessonsArray.forEach(lesson => {
    const exerciseId = idMap[lesson.id] || 99;

    if (lesson.steps) {
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
                const optId = globalOptionId++;
                const ansText = Array.isArray(step.answer) ? step.answer[0] : step.answer;
                optionValues.push(`  (${optId}, ${currentStepId}, ${escapeSql(ansText)}, 1)`);
                correctOptionId = optId.toString();
            }

            const promptText = step.task || step.content || '';
            const hintText = step.hints ? step.hints[0] : '';

            stepValues.push(`  (${currentStepId}, ${exerciseId}, ${stepNumber}, ${escapeSql(promptText)}, ${escapeSql(hintText)}, ${correctOptionId})`);
        });
    }
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
