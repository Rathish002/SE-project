const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '../frontend/src/i18n/en.json');
const hiPath = path.join(__dirname, '../frontend/src/i18n/hi.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hiData = JSON.parse(fs.readFileSync(hiPath, 'utf8'));

let out = '';

for (let i = 1; i <= 5; i++) {
    const lessonKey = 'lesson-' + i;
    const enLesson = enData.lessonData[lessonKey];
    const hiLesson = hiData.lessonData[lessonKey];
    if (!enLesson || !hiLesson) continue;

    enLesson.steps.forEach((step, stepIndex) => {
        out += `Lesson ${i} Step ${stepIndex + 1}\n`;
        out += `EN Options: ${JSON.stringify(step.options)}\n`;
        out += `HI Options: ${JSON.stringify(hiLesson.steps[stepIndex].options)}\n`;
        out += `EN Correct: ${step.correct}\n`;
        out += `HI Correct: ${hiLesson.steps[stepIndex].correct}\n`;
        out += `\n`;
    });
}

fs.writeFileSync('align_options.txt', out);
console.log('Done');
