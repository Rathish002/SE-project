const fs = require('fs');
const path = require('path');

const hiPath = path.join(__dirname, '../frontend/src/i18n/hi.json');
const sqlPath = path.join(__dirname, 'sql/seed-data.sql');

const hiData = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
const lessonData = hiData.lessonData;

let sqlLines = fs.readFileSync(sqlPath, 'utf8').split('\n');

// Find where -- EXERCISES TABLE is
let cutIndex = -1;
for (let i = 0; i < sqlLines.length; i++) {
    if (sqlLines[i].includes('-- EXERCISES TABLE')) {
        cutIndex = i - 1; // including the previous ============= lines
        break;
    }
}

if (cutIndex === -1) {
    console.error("Could not find cut line");
    process.exit(1);
}

const baseSql = sqlLines.slice(0, cutIndex - 1).join('\n') + '\n\n';

let newSql = `-- ==========================================
-- EXERCISES TABLE
-- ==========================================

`;

let exercisesInsert = `INSERT INTO exercises (id, lesson_id, title, instructions_text) VALUES\n`;
let exerciseStepsInsert = `INSERT INTO exercise_steps (id, exercise_id, step_number, prompt, hint_1, correct_option_id) VALUES\n`;
let exerciseStepOptionsInsert = `INSERT INTO exercise_step_options (id, step_id, option_text, option_order) VALUES\n`;

let exercisesVals = [];
let stepsVals = [];
let optionsVals = [];

let runningStepId = 1;
let runningOptionId = 1;

for (let i = 1; i <= 5; i++) {
    const lessonKey = 'lesson-' + i;
    const ldata = lessonData[lessonKey];
    if (!ldata) continue;

    // remove single quotes by escaping them
    const safeTitle = ldata.title.replace(/'/g, "''");
    exercisesVals.push(`  (${i}, ${i}, '${safeTitle}', 'सही विकल्प चुनें')`);

    ldata.steps.forEach((step, stepIndex) => {
        let correctOptId = -1;

        const optionIdsForThisStep = [];

        step.options.forEach((opt, optIndex) => {
            const currentOptId = runningOptionId++;
            if (opt === step.correct) {
                correctOptId = currentOptId;
            }
            const safeOpt = opt.replace(/'/g, "''");
            optionIdsForThisStep.push(`  (${currentOptId}, ${runningStepId}, '${safeOpt}', ${optIndex + 1})`);
        });

        if (correctOptId === -1) {
            console.error(`Could not find correct answer for step ${step.content}`);
        }

        const safePrompt = step.content.replace(/'/g, "''");
        const hint = (step.hints && step.hints[0]) ? step.hints[0].replace(/'/g, "''") : 'कोई संकेत नहीं';

        stepsVals.push(`  (${runningStepId}, ${i}, ${stepIndex + 1}, '${safePrompt}', '${hint}', ${correctOptId})`);
        optionsVals.push(...optionIdsForThisStep);

        runningStepId++;
    });
}

newSql += exercisesInsert + exercisesVals.join(',\n') + ';\n\n';
newSql += exerciseStepsInsert + stepsVals.join(',\n') + ';\n\n';
newSql += exerciseStepOptionsInsert + optionsVals.join(',\n') + ';\n\n';

fs.writeFileSync(sqlPath, baseSql + newSql);
console.log('Successfully regenerated seed-data.sql exercises');
