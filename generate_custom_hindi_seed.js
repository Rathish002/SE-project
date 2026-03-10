const fs = require('fs');

const lessonsData = [
    {
        id: 1,
        title: 'अभिवादन और बुनियादी वाक्यांश',
        exercises: [
            {
                id: 1,
                title: 'अभिवादन की पहचान',
                instructions: 'सही अभिवादन चुनें',
                steps: [
                    { prompt: 'क्या कहा जाता है जब आप किसी से मिलते हैं?', hint: 'यह सबसे आम अभिवादन है', correct: 'नमस्ते', wrong: ['अलविदा', 'धन्यवाद', 'माफ़ करें'] },
                    { prompt: 'सुबह के समय का उचित अभिवादन क्या है?', hint: 'इसमें "सुबह" शब्द शामिल है', correct: 'सुप्रभात', wrong: ['शुभ रात्रि', 'शुभ संध्या', 'दोपहर'] },
                    { prompt: 'शाम को किसी से मिलने पर क्या कहते हैं?', hint: 'संध्या का समय', correct: 'शुभ संध्या', wrong: ['सुप्रभात', 'नमस्ते', 'शुभ रात्रि'] },
                    { prompt: '"नमस्ते" के अलावा कौन सा शब्द उपयोग किया जा सकता है?', hint: 'यह थोड़ा अधिक औपचारिक है', correct: 'नमस्कार', wrong: ['अलविदा', 'शुक्रिया', 'सुप्रभात'] },
                    { prompt: 'संवाद में अभिवादन क्यों महत्वपूर्ण है?', hint: 'यह लोगों को जोड़ने में मदद करता है', correct: 'जुड़ने के लिए', wrong: ['लड़ने के लिए', 'भागने के लिए', 'सोने के लिए'] },
                    { prompt: 'क्या ज़ोर से बोलकर अभ्यास करना ज़रूरी है?', hint: 'पाठ के अंत में सलाह', correct: 'हाँ', wrong: ['नहीं', 'कभी नहीं', 'शायद'] }
                ]
            }
        ]
    },
    {
        id: 2,
        title: 'संख्या और गिनती',
        exercises: [
            {
                id: 2,
                title: 'गिनती का ज्ञान',
                instructions: 'संख्याओं को सही क्रम में पहचानें',
                steps: [
                    { prompt: 'गिनती कहाँ से शुरू होती है (इस पाठ में)?', hint: 'सबसे पहली संख्या', correct: 'एक', wrong: ['दस', 'शून्य', 'सौ'] },
                    { prompt: '"चार" के बाद कौन सी संख्या आती है?', hint: 'चार और एक', correct: 'पाँच', wrong: ['तीन', 'छः', 'दो'] },
                    { prompt: 'दहाई की शुरुआत किस संख्या से होती है (पाठ के अनुसार)?', hint: 'दस का गुणक', correct: 'दस', wrong: ['एक', 'सौ', 'बीस'] },
                    { prompt: '"बीस" के बाद दहाई में कौन सी संख्या आती है?', hint: 'दस जोड़ने पर', correct: 'तीस', wrong: ['दस', 'पचास', 'चालीस'] },
                    { prompt: 'संख्याओं को बेहतर याद रखने के लिए क्या करना चाहिए?', hint: 'आसपास की चीज़ों का उपयोग करें', correct: 'वस्तुओं को गिनें', wrong: ['किताबें पढ़ें', 'सो जाएँ', 'टीवी देखें'] },
                    { prompt: 'हम संख्याओं का उपयोग किसलिए करते हैं (पाठ के अनुसार)?', hint: 'मात्रा बताने के लिए', correct: 'गिनने और मापने के लिए', wrong: ['खाने के लिए', 'खेलने के लिए', 'दौड़ने के लिए'] }
                ]
            }
        ]
    },
    {
        id: 3,
        title: 'परिवार और रिश्ते',
        exercises: [
            {
                id: 3,
                title: 'रिश्तों की समझ',
                instructions: 'परिवार के सदस्यों को पहचानें',
                steps: [
                    { prompt: 'दिए गए पाठ में तत्काल परिवार का हिस्सा कौन है?', hint: 'माता-पिता', correct: 'माँ', wrong: ['दादी', 'चाचा', 'दादा'] },
                    { prompt: 'दिए गए पाठ में विस्तारित परिवार का हिस्सा कौन है?', hint: 'माता-पिता के माता-पिता', correct: 'दादी', wrong: ['भाई', 'बहन', 'पिता'] },
                    { prompt: 'परिवार कहाँ महत्वपूर्ण है?', hint: 'हर जगह', correct: 'हर संस्कृति में', wrong: ['केवल भारत में', 'केवल शहरों में', 'कहीं नहीं'] },
                    { prompt: 'विस्तारित परिवार में और कौन आता है (पाठ के अनुसार)?', hint: 'माता-पिता के भाई-बहन', correct: 'चाची और चाचा', wrong: ['दोस्त', 'शिक्षक', 'पड़ोसी'] },
                    { prompt: 'तत्काल परिवार में माँ के अलावा और कौन है?', hint: 'पुरुष अभिभावक', correct: 'पिता', wrong: ['दादा', 'चाचा', 'दोस्त'] },
                    { prompt: 'परिवार के रिश्तों को समझने से क्या मदद मिलती है?', hint: 'बातचीत में', correct: 'व्यक्तिगत जीवन के बारे में संवाद', wrong: ['नौकरी पाने में', 'पैसे कमाने में', 'खेलने में'] }
                ]
            }
        ]
    },
    {
        id: 4,
        title: 'वाक्य संरचना',
        exercises: [
            {
                id: 4,
                title: 'कर्ता और क्रिया',
                instructions: 'वाक्य के हिस्सों को पहचानें',
                steps: [
                    { prompt: 'एक वाक्य के कितने मुख्य भाग होते हैं?', hint: 'कर्ता, क्रिया, कर्म', correct: 'तीन', wrong: ['दो', 'चार', 'पाँच'] },
                    { prompt: 'जो क्रिया करता है, उसे क्या कहते हैं?', hint: 'काम करने वाला', correct: 'कर्ता', wrong: ['कर्म', 'क्रिया', 'विशेषण'] },
                    { prompt: 'कार्य बताने वाले शब्द को क्या कहते हैं?', hint: 'एक्शन वर्ड', correct: 'क्रिया', wrong: ['कर्ता', 'कर्म', 'संज्ञा'] },
                    { prompt: '"मैं चावल खाता हूँ" में कर्ता कौन है?', hint: 'कौन खा रहा है?', correct: 'मैं', wrong: ['चावल', 'खाता हूँ', 'हूँ'] },
                    { prompt: '"वह किताब पढ़ती है" में कर्म क्या है?', hint: 'क्या पढ़ा जा रहा है?', correct: 'किताब', wrong: ['वह', 'पढ़ती', 'है'] },
                    { prompt: '"वे फुटबॉल खेलते हैं" में क्रिया क्या है?', hint: 'कार्य क्या हो रहा है?', correct: 'खेलते हैं', wrong: ['वे', 'फुटबॉल', 'हैं'] }
                ]
            }
        ]
    },
    {
        id: 5,
        title: 'रोजमर्रा की शब्दावली',
        exercises: [
            {
                id: 5,
                title: 'दैनिक वस्तुओं की पहचान',
                instructions: 'सामान्य शब्दों का अर्थ समझें',
                steps: [
                    { prompt: 'सेब कैसा होता है (पाठ के अनुसार)?', hint: 'स्वाद और स्वास्थ्य', correct: 'मीठा और स्वास्थ्यवर्धक', wrong: ['कड़वा', 'नमकीन', 'अस्वास्थ्यकर'] },
                    { prompt: 'हम नई चीजें सीखने के लिए किसका उपयोग करते हैं?', hint: 'पढ़ने के लिए', correct: 'किताबें', wrong: ['सेब', 'पानी', 'दोस्त'] },
                    { prompt: 'स्वस्थ रहने के लिए हमें रोजाना किसकी जरूरत होती है?', hint: 'पीने की चीज़', correct: 'पानी', wrong: ['सेब', 'किताबें', 'शिक्षक'] },
                    { prompt: 'हमें सीखने में कौन मदद करता है?', hint: 'जो स्कूलों में काम करते हैं', correct: 'शिक्षक', wrong: ['दोस्त', 'सेब', 'किताब'] },
                    { prompt: 'हम किसके साथ खेलते और बात करते हैं?', hint: 'जिसे हम पसंद करते हैं', correct: 'दोस्त', wrong: ['शिक्षक', 'किताब', 'पानी'] },
                    { prompt: 'इन शब्दों को सीखने से क्या फायदा होता है?', hint: 'दैनिक जीवन में', correct: 'बेहतर संवाद', wrong: ['भूख मिटना', 'प्यास बुझना', 'नींद आना'] }
                ]
            }
        ]
    }
];

const generateSqlValue = (str) => {
    return `'${str.replace(/'/g, "''")}'`;
};

let sqlOutput = `-- ==========================================
-- CUSTOM EXERCISE SEED (Hindi/English matching)
-- This file drops existing exercises and generates 
-- EXACTLY 5 lessons with 6 steps each (30 total)
-- ==========================================

DELETE FROM exercise_step_options;
DELETE FROM exercise_steps;
DELETE FROM exercises;

`;

let exerciseIdCounter = 1;
let stepIdCounter = 1;
let optionIdCounter = 1;

lessonsData.forEach(lesson => {
    sqlOutput += `\n-- ==========================================\n-- LESSON ${lesson.id}: ${lesson.title}\n-- ==========================================\n\n`;

    lesson.exercises.forEach(exercise => {
        sqlOutput += `INSERT INTO exercises (id, lesson_id, title, instructions_text) VALUES\n`;
        sqlOutput += `  (${exerciseIdCounter}, ${lesson.id}, ${generateSqlValue(exercise.title)}, ${generateSqlValue(exercise.instructions)});\n\n`;

        // Generate Steps
        sqlOutput += `INSERT INTO exercise_steps (id, exercise_id, step_number, prompt, hint_1, correct_option_id) VALUES\n`;

        let stepRows = [];
        let optionRows = [];

        exercise.steps.forEach((step, index) => {
            let correctOptionId = optionIdCounter;
            stepRows.push(`  (${stepIdCounter}, ${exerciseIdCounter}, ${index + 1}, ${generateSqlValue(step.prompt)}, ${generateSqlValue(step.hint)}, ${correctOptionId})`);

            // Shuffle options randomly
            let options = [...step.wrong];
            // Randomly insert correct option 
            const correctPos = Math.floor(Math.random() * (options.length + 1));
            options.splice(correctPos, 0, step.correct);

            options.forEach((optText, optIndex) => {
                let isCorrect = optText === step.correct;
                let optId = isCorrect ? correctOptionId : optionIdCounter;
                optionRows.push(`  (${optId}, ${stepIdCounter}, ${generateSqlValue(optText)}, ${optIndex + 1})`);
                optionIdCounter++;
            });

            stepIdCounter++;
        });

        sqlOutput += stepRows.join(',\n') + ';\n\n';

        // Generate Options
        sqlOutput += `INSERT INTO exercise_step_options (id, step_id, option_text, option_order) VALUES\n`;
        sqlOutput += optionRows.join(',\n') + ';\n\n';

        exerciseIdCounter++;
    });
});

fs.writeFileSync('server/sql/custom-seed-data.sql', sqlOutput);
console.log('Successfully generated complete custom SQL seed data with exactly 30 steps matching the user subtopics.');
