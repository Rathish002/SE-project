const fs = require('fs');
const path = require('path');

const tsFilePath = path.join(__dirname, 'frontend', 'src', 'data', 'exercisesData.ts');
const enFilePath = path.join(__dirname, 'frontend', 'src', 'i18n', 'en.json');
const hiFilePath = path.join(__dirname, 'frontend', 'src', 'i18n', 'hi.json');

const newLessons = [
    {
        id: "lesson-1",
        title_en: "Greetings and Basic Phrases",
        title_hi: "अभिवादन और बुनियादी वाक्यांश",
        desc_en: "Learn to greet people and use basic phrases in everyday conversation.",
        desc_hi: "नमस्ते! आपके पहले पाठ में आपका स्वागत है। इस पाठ में, आप सीखेंगे कि लोगों को कैसे अभिवादन करें और रोजमर्रा की बातचीत में बुनियादी वाक्यांशों का उपयोग कैसे करें। अभिवादन किसी भी भाषा में महत्वपूर्ण होते हैं। वे आपको दूसरों के साथ जुड़ने में मदद करते हैं। सामान्य अभिवादन में 'नमस्ते', 'सुप्रभात', 'नमस्कार' और 'शुभ संध्या' शामिल हैं। इन वाक्यांशों को ज़ोर से बोलकर अभ्यास करें।",
        steps_en: [
            { prompt: "What is said when you meet someone?", hint: "It is the most common greeting", correct: "Namaste", wrong: ["Goodbye", "Thank you", "Sorry"] },
            { prompt: "What is the proper greeting for the morning?", hint: "It includes the word for morning", correct: "Good morning", wrong: ["Good night", "Good evening", "Afternoon"] },
            { prompt: "What do you say when meeting someone in the evening?", hint: "Time of evening", correct: "Good evening", wrong: ["Good morning", "Namaste", "Good night"] },
            { prompt: "Which word can be used besides 'Namaste'?", hint: "It is slightly more formal", correct: "Namaskar", wrong: ["Goodbye", "Thank you", "Good morning"] },
            { prompt: "Why are greetings important in communication?", hint: "It helps to connect people", correct: "To connect", wrong: ["To fight", "To run away", "To sleep"] },
            { prompt: "Is it important to practice speaking out loud?", hint: "Advice at the end of the lesson", correct: "Yes", wrong: ["No", "Never", "Maybe"] }
        ],
        steps_hi: [
            { prompt: "क्या कहा जाता है जब आप किसी से मिलते हैं?", hint: "यह सबसे आम अभिवादन है", correct: "नमस्ते", wrong: ["अलविदा", "धन्यवाद", "माफ़ करें"] },
            { prompt: "सुबह के समय का उचित अभिवादन क्या है?", hint: "इसमें 'सुबह' शब्द शामिल है", correct: "सुप्रभात", wrong: ["शुभ रात्रि", "शुभ संध्या", "दोपहर"] },
            { prompt: "शाम को किसी से मिलने पर क्या कहते हैं?", hint: "संध्या का समय", correct: "शुभ संध्या", wrong: ["सुप्रभात", "नमस्ते", "शुभ रात्रि"] },
            { prompt: "'नमस्ते' के अलावा कौन सा शब्द उपयोग किया जा सकता है?", hint: "यह थोड़ा अधिक औपचारिक है", correct: "नमस्कार", wrong: ["अलविदा", "शुक्रिया", "सुप्रभात"] },
            { prompt: "संवाद में अभिवादन क्यों महत्वपूर्ण है?", hint: "यह लोगों को जोड़ने में मदद करता है", correct: "जुड़ने के लिए", wrong: ["लड़ने के लिए", "भागने के लिए", "सोने के लिए"] },
            { prompt: "क्या ज़ोर से बोलकर अभ्यास करना ज़रूरी है?", hint: "पाठ के अंत में सलाह", correct: "हाँ", wrong: ["नहीं", "कभी नहीं", "शायद"] }
        ]
    },
    {
        id: "lesson-2",
        title_en: "Numbers and Counting",
        title_hi: "संख्या और गिनती",
        desc_en: "Numbers are everywhere in our daily lives. We use them for counting, measuring, and describing quantities.",
        desc_hi: "संख्या हमारे दैनिक जीवन में हर जगह हैं। हम उनका उपयोग गिनती करने, मापने और मात्राओं का वर्णन करने के लिए करते हैं। इस पाठ में, आप एक से सौ तक की संख्याएँ सीखेंगे। मूल बातें से शुरू करें: एक, दो, तीन, चार, पाँच। फिर दहाई पर जाएँ: दस, बीस, तीस, चालीस, पचास। अपने आसपास की वस्तुओं को गिनने का अभ्यास करें। यह आपको संख्याओं को बेहतर याद रखने में मदद करेगा।",
        steps_en: [
            { prompt: "Where does counting start (in this lesson)?", hint: "The first number", correct: "One", wrong: ["Ten", "Zero", "Hundred"] },
            { prompt: "Which number comes after 'four'?", hint: "Four and one", correct: "Five", wrong: ["Three", "Six", "Two"] },
            { prompt: "With which number does the tens place begin (according to the lesson)?", hint: "Multiple of ten", correct: "Ten", wrong: ["One", "Hundred", "Twenty"] },
            { prompt: "Which number comes in the tens place after 'twenty'?", hint: "Adding ten", correct: "Thirty", wrong: ["Ten", "Fifty", "Forty"] },
            { prompt: "What should be done to remember numbers better?", hint: "Use things around you", correct: "Count objects", wrong: ["Read books", "Go to sleep", "Watch TV"] },
            { prompt: "What do we use numbers for (according to the lesson)?", hint: "To show quantity", correct: "For counting and measuring", wrong: ["For eating", "For playing", "For running"] }
        ],
        steps_hi: [
            { prompt: "गिनती कहाँ से शुरू होती है (इस पाठ में)?", hint: "सबसे पहली संख्या", correct: "एक", wrong: ["दस", "शून्य", "सौ"] },
            { prompt: "'चार' के बाद कौन सी संख्या आती है?", hint: "चार और एक", correct: "पाँच", wrong: ["तीन", "छः", "दो"] },
            { prompt: "दहाई की शुरुआत किस संख्या से होती है (पाठ के अनुसार)?", hint: "दस का गुणक", correct: "दस", wrong: ["एक", "सौ", "बीस"] },
            { prompt: "'बीस' के बाद दहाई में कौन सी संख्या आती है?", hint: "दस जोड़ने पर", correct: "तीस", wrong: ["दस", "पचास", "चालीस"] },
            { prompt: "संख्याओं को बेहतर याद रखने के लिए क्या करना चाहिए?", hint: "आसपास की चीज़ों का उपयोग करें", correct: "वस्तुओं को गिनें", wrong: ["किताबें पढ़ें", "सो जाएँ", "टीवी देखें"] },
            { prompt: "हम संख्याओं का उपयोग किसलिए करते हैं (पाठ के अनुसार)?", hint: "मात्रा बताने के लिए", correct: "गिनने और मापने के लिए", wrong: ["खाने के लिए", "खेलने के लिए", "दौड़ने के लिए"] }
        ]
    },
    {
        id: "lesson-3",
        title_en: "Family and Relationships",
        title_hi: "परिवार और रिश्ते",
        desc_en: "Family is important in every culture. In this lesson, you will learn vocabulary related to family members and relationships.",
        desc_hi: "परिवार हर संस्कृति में महत्वपूर्ण है। इस पाठ में, आप परिवार के सदस्यों और रिश्तों से संबंधित शब्दावली सीखेंगे। तत्काल परिवार से शुरू करें: माँ, पिता, बहन, भाई। फिर विस्तारित परिवार सीखें: दादी, दादा, चाची, चाचा, चचेरा भाई। परिवार के रिश्तों को समझना आपको अपने व्यक्तिगत जीवन के बारे में संवाद करने में मदद करता है।",
        steps_en: [
            { prompt: "Who is part of the immediate family in the given text?", hint: "Parents", correct: "Mother", wrong: ["Grandmother", "Uncle", "Grandfather"] },
            { prompt: "Who is part of the extended family in the given text?", hint: "Parents of parents", correct: "Grandmother", wrong: ["Brother", "Sister", "Father"] },
            { prompt: "Where is family important?", hint: "Everywhere", correct: "In every culture", wrong: ["Only in India", "Only in cities", "Nowhere"] },
            { prompt: "Who else comes in the extended family (according to text)?", hint: "Siblings of parents", correct: "Aunt and Uncle", wrong: ["Friends", "Teachers", "Neighbors"] },
            { prompt: "Who is in the immediate family besides the mother?", hint: "Male parent", correct: "Father", wrong: ["Grandfather", "Uncle", "Friend"] },
            { prompt: "What does understanding family relationships help with?", hint: "In conversation", correct: "Communicate about personal life", wrong: ["In getting a job", "In earning money", "In playing"] }
        ],
        steps_hi: [
            { prompt: "दिए गए पाठ में तत्काल परिवार का हिस्सा कौन है?", hint: "माता-पिता", correct: "माँ", wrong: ["दादी", "चाचा", "दादा"] },
            { prompt: "दिए गए पाठ में विस्तारित परिवार का हिस्सा कौन है?", hint: "माता-पिता के माता-पिता", correct: "दादी", wrong: ["भाई", "बहन", "पिता"] },
            { prompt: "परिवार कहाँ महत्वपूर्ण है?", hint: "हर जगह", correct: "हर संस्कृति में", wrong: ["केवल भारत में", "केवल शहरों में", "कहीं नहीं"] },
            { prompt: "विस्तारित परिवार में और कौन आता है (पाठ के अनुसार)?", hint: "माता-पिता के भाई-बहन", correct: "चाची और चाचा", wrong: ["दोस्त", "शिक्षक", "पड़ोसी"] },
            { prompt: "तत्काल परिवार में माँ के अलावा और कौन है?", hint: "पुरुष अभिभावक", correct: "पिता", wrong: ["दादा", "चाचा", "दोस्त"] },
            { prompt: "परिवार के रिश्तों को समझने से क्या मदद मिलती है?", hint: "बातचीत में", correct: "व्यक्तिगत जीवन के बारे में संवाद", wrong: ["नौकरी पाने में", "पैसे कमाने में", "खेलने में"] }
        ]
    },
    {
        id: "lesson-4",
        title_en: "Sentence Structure",
        title_hi: "वाक्य संरचना",
        desc_en: "A sentence has three main parts: Subject, Verb, and Object.",
        desc_hi: "एक वाक्य के तीन मुख्य भाग होते हैं: कर्ता, क्रिया और कर्म। कर्ता वह है जो क्रिया करता है। क्रिया कार्य शब्द है। कर्म क्रिया को प्राप्त करता है। आइए कुछ उदाहरण देखें: 'मैं चावल खाता हूँ' - यहाँ, 'मैं' कर्ता है, 'खाता हूँ' क्रिया है, और 'चावल' कर्म है। 'वह किताब पढ़ती है' - 'वह' कर्ता है, 'पढ़ती है' क्रिया है, और 'किताब' कर्म है। 'वे फुटबॉल खेलते हैं' - 'वे' कर्ता है, 'खेलते हैं' क्रिया है, और 'फुटबॉल' कर्म है। इस पैटर्न का उपयोग करके अपने स्वयं के वाक्य बनाने का अभ्यास करें।",
        steps_en: [
            { prompt: "How many main parts does a sentence have?", hint: "Subject, Verb, Object", correct: "Three", wrong: ["Two", "Four", "Five"] },
            { prompt: "What is the one who does the action called?", hint: "The doer", correct: "Subject", wrong: ["Object", "Verb", "Adjective"] },
            { prompt: "What is the action word called?", hint: "Action word", correct: "Verb", wrong: ["Subject", "Object", "Noun"] },
            { prompt: "Who is the subject in 'I eat rice'?", hint: "Who is eating?", correct: "I", wrong: ["rice", "eat", "am"] },
            { prompt: "What is the object in 'She reads a book'?", hint: "What is being read?", correct: "book", wrong: ["She", "reads", "a"] },
            { prompt: "What is the verb in 'They play football'?", hint: "What action is happening?", correct: "play", wrong: ["They", "football", "are"] }
        ],
        steps_hi: [
            { prompt: "एक वाक्य के कितने मुख्य भाग होते हैं?", hint: "कर्ता, क्रिया, कर्म", correct: "तीन", wrong: ["दो", "चार", "पाँच"] },
            { prompt: "जो क्रिया करता है, उसे क्या कहते हैं?", hint: "काम करने वाला", correct: "कर्ता", wrong: ["कर्म", "क्रिया", "विशेषण"] },
            { prompt: "कार्य बताने वाले शब्द को क्या कहते हैं?", hint: "एक्शन वर्ड", correct: "क्रिया", wrong: ["कर्ता", "कर्म", "संज्ञा"] },
            { prompt: "'मैं चावल खाता हूँ' में कर्ता कौन है?", hint: "कौन खा रहा है?", correct: "मैं", wrong: ["चावल", "खाता हूँ", "हूँ"] },
            { prompt: "'वह किताब पढ़ती है' में कर्म क्या है?", hint: "क्या पढ़ा जा रहा है?", correct: "किताब", wrong: ["वह", "पढ़ती", "है"] },
            { prompt: "'वे फुटबॉल खेलते हैं' में क्रिया क्या है?", hint: "कार्य क्या हो रहा है?", correct: "खेलते हैं", wrong: ["वे", "फुटबॉल", "हैं"] }
        ]
    },
    {
        id: "lesson-5",
        title_en: "Everyday Vocabulary",
        title_hi: "रोजमर्रा की शब्दावली",
        desc_en: "Let's learn some common words we use daily.",
        desc_hi: "आइए कुछ सामान्य शब्द सीखें जिनका हम रोजाना उपयोग करते हैं। सेब - सेब एक फल है। यह मीठा और स्वास्थ्यवर्धक होता है। किताब - किताब पढ़ने के लिए उपयोग की जाती है। हम नई चीजें सीखने के लिए किताबें पढ़ते हैं। पानी - पानी वह है जो हम पीते हैं। स्वस्थ रहने के लिए हमें रोजाना पानी की जरूरत होती है। शिक्षक - शिक्षक वह व्यक्ति है जो हमें सीखने में मदद करता है। शिक्षक स्कूलों में काम करते हैं। दोस्त - दोस्त वह है जिसे हम पसंद करते हैं और भरोसा करते हैं। दोस्त हमारे साथ खेलते और बात करते हैं। इन शब्दों को सीखने से आपको दैनिक जीवन में बेहतर संवाद करने में मदद मिलती है।",
        steps_en: [
            { prompt: "What is an apple like (according to the text)?", hint: "Taste and health", correct: "Sweet and healthy", wrong: ["Bitter", "Salty", "Unhealthy"] },
            { prompt: "What do we use to learn new things?", hint: "For reading", correct: "Books", wrong: ["Apple", "Water", "Friend"] },
            { prompt: "What do we need daily to stay healthy?", hint: "Something to drink", correct: "Water", wrong: ["Apple", "Books", "Teacher"] },
            { prompt: "Who helps us learn?", hint: "Those who work in schools", correct: "Teacher", wrong: ["Friend", "Apple", "Book"] },
            { prompt: "Who do we play and talk with?", hint: "Someone we like", correct: "Friend", wrong: ["Teacher", "Book", "Water"] },
            { prompt: "What is the benefit of learning these words?", hint: "In daily life", correct: "Better communication", wrong: ["Satisfying hunger", "Quenching thirst", "Feeling sleepy"] }
        ],
        steps_hi: [
            { prompt: "सेब कैसा होता है (पाठ के अनुसार)?", hint: "स्वाद और स्वास्थ्य", correct: "मीठा और स्वास्थ्यवर्धक", wrong: ["कड़वा", "नमकीन", "अस्वास्थ्यकर"] },
            { prompt: "हम नई चीजें सीखने के लिए किसका उपयोग करते हैं?", hint: "पढ़ने के लिए", correct: "किताबें", wrong: ["सेब", "पानी", "दोस्त"] },
            { prompt: "स्वस्थ रहने के लिए हमें रोजाना किसकी जरूरत होती है?", hint: "पीने की चीज़", correct: "पानी", wrong: ["सेब", "किताबें", "शिक्षक"] },
            { prompt: "हमें सीखने में कौन मदद करता है?", hint: "जो स्कूलों में काम करते हैं", correct: "शिक्षक", wrong: ["दोस्त", "सेब", "किताब"] },
            { prompt: "हम किसके साथ खेलते और बात करते हैं?", hint: "जिसे हम पसंद करते हैं", correct: "दोस्त", wrong: ["शिक्षक", "किताब", "पानी"] },
            { prompt: "इन शब्दों को सीखने से क्या फायदा होता है?", hint: "दैनिक जीवन में", correct: "बेहतर संवाद", wrong: ["भूख मिटना", "प्यास बुझना", "नींद आना"] }
        ]
    }
];

// 1. Generate new exercisesData.ts
let tsOutput = `import type { Lesson } from "../types/ExerciseTypes";\n\nexport const lessons: Lesson[] = [\n`;
newLessons.forEach(lesson => {
    tsOutput += `  {\n    id: "${lesson.id}",\n    title: "${lesson.title_en}",\n    category: "Language",\n    difficulty: "basic",\n    description: "${lesson.desc_en}",\n    microSteps: ["Read", "Practice", "Learn"],\n    steps: [\n`;

    lesson.steps_en.forEach(step => {
        // We will hardcode options in the translations, but the TS structure needs the matching count
        tsOutput += `      {\n        type: "choice",\n        content: "Question",\n        task: "Task",\n        options: ["Option 1", "Option 2", "Option 3", "Option 4"],\n        correct: "${step.correct}",\n        instruction: "Select the correct option",\n        hints: ["Hint 1", "Hint 2", "Hint 3"]\n      },\n`;
    });
    tsOutput += `    ]\n  },\n`;
});
tsOutput += `];\n`;
fs.writeFileSync(tsFilePath, tsOutput);


// 2. Generate new lessonData for en.json and hi.json
const enData = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));
const hiData = JSON.parse(fs.readFileSync(hiFilePath, 'utf8'));

enData.lessonData = {};
hiData.lessonData = {};

newLessons.forEach(lesson => {
    // English
    enData.lessonData[lesson.id] = {
        title: lesson.title_en,
        description: lesson.desc_en,
        microSteps: ["Read", "Practice", "Learn"],
        steps: lesson.steps_en.map(step => ({
            content: step.prompt,
            task: "Answer the question",
            instruction: "Select the correct option",
            hints: [step.hint, "Think carefully", "Choose the best option"],
            options: [step.correct, ...step.wrong].sort(() => Math.random() - 0.5),
            correct: step.correct
        }))
    };

    // Hindi
    hiData.lessonData[lesson.id] = {
        title: lesson.title_hi,
        description: lesson.desc_hi,
        microSteps: ["पढ़ें", "अभ्यास करें", "सीखें"],
        steps: lesson.steps_hi.map(step => ({
            content: step.prompt,
            task: "प्रश्न का उत्तर दें",
            instruction: "सही विकल्प चुनें",
            hints: [step.hint, "ध्यान से सोचें", "सबसे अच्छा विकल्प चुनें"],
            options: [step.correct, ...step.wrong].sort(() => Math.random() - 0.5),
            correct: step.correct
        }))
    };
});

fs.writeFileSync(enFilePath, JSON.stringify(enData, null, 2));
fs.writeFileSync(hiFilePath, JSON.stringify(hiData, null, 2));

console.log("Replaced frontend files successfully.");
