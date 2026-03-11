const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '../frontend/src/i18n/en.json');
const hiPath = path.join(__dirname, '../frontend/src/i18n/hi.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hiData = JSON.parse(fs.readFileSync(hiPath, 'utf8'));

const dictionary = {
    "Namaste": "नमस्ते",
    "Sorry": "माफ़ करें",
    "Goodbye": "अलविदा",
    "Thank you": "धन्यवाद",
    "Good morning": "सुप्रभात",
    "Afternoon": "दोपहर",
    "Good night": "शुभ रात्रि",
    "Good evening": "शुभ संध्या",
    "Namaskar": "नमस्कार",
    "To fight": "लड़ने के लिए",
    "To connect": "जुड़ने के लिए",
    "To sleep": "सोने के लिए",
    "To run away": "भागने के लिए",
    "Maybe": "शायद",
    "Never": "कभी नहीं",
    "No": "नहीं",
    "Yes": "हाँ",
    "One": "एक",
    "Hundred": "सौ",
    "Ten": "दस",
    "Zero": "शून्य",
    "Five": "पाँच",
    "Three": "तीन",
    "Six": "छः",
    "Two": "दो",
    "Twenty": "बीस",
    "Thirty": "तीस",
    "Fifty": "पचास",
    "Forty": "चालीस",
    "Watch TV": "टीवी देखें",
    "Go to sleep": "सो जाएँ",
    "Read books": "किताबें पढ़ें",
    "Count objects": "वस्तुओं को गिनें",
    "For running": "दौड़ने के लिए",
    "For playing": "खेलने के लिए",
    "For eating": "खाने के लिए",
    "For counting and measuring": "गिनने और मापने के लिए",
    "Uncle": "चाचा",
    "Mother": "माँ",
    "Grandmother": "दादी",
    "Grandfather": "दादा",
    "Brother": "भाई",
    "Sister": "बहन",
    "Father": "पिता",
    "Nowhere": "कहीं नहीं",
    "Only in cities": "केवल शहरों में",
    "Only in India": "केवल भारत में",
    "In every culture": "हर संस्कृति में",
    "Neighbors": "पड़ोसी",
    "Teachers": "शिक्षक",
    "Friends": "दोस्त",
    "Aunt and Uncle": "चाची और चाचा",
    "Friend": "दोस्त",
    "Communicate about personal life": "व्यक्तिगत जीवन के बारे में संवाद",
    "In getting a job": "नौकरी पाने में",
    "In earning money": "पैसे कमाने में",
    "In playing": "खेलने में",
    "Four": "चार",
    "Object": "कर्म",
    "Adjective": "विशेषण",
    "Subject": "कर्ता",
    "Verb": "क्रिया",
    "Noun": "संज्ञा",
    "eat": "खाता हूँ",
    "rice": "चावल",
    "am": "हूँ",
    "I": "मैं",
    "a": "है",
    "She": "वह",
    "book": "किताब",
    "reads": "पढ़ती",
    "are": "हैं",
    "football": "फुटबॉल",
    "They": "वे",
    "play": "खेलते हैं",
    "Bitter": "कड़वा",
    "Salty": "नमकीन",
    "Unhealthy": "अस्वास्थ्यकर",
    "Sweet and healthy": "मीठा और स्वास्थ्यवर्धक",
    "Water": "पानी",
    "Apple": "सेब",
    "Books": "किताबें",
    "Book": "किताब",
    "Teacher": "शिक्षक",
    "Better communication": "बेहतर संवाद",
    "Satisfying hunger": "भूख मिटना",
    "Feeling sleepy": "नींद आना",
    "Quenching thirst": "प्यास बुझना"
};

for (let i = 1; i <= 5; i++) {
    const lessonKey = 'lesson-' + i;
    const enLesson = enData.lessonData[lessonKey];
    const hiLesson = hiData.lessonData[lessonKey];
    if (!enLesson || !hiLesson) continue;

    enLesson.steps.forEach((step, stepIndex) => {
        const alignedOptions = [];
        step.options.forEach(opt => {
            const hiOpt = dictionary[opt];
            if (!hiOpt) {
                console.error("MISSING DICTIONARY TRANSLATION FOR:", opt);
                alignedOptions.push("MISSING");
            } else {
                alignedOptions.push(hiOpt);
            }
        });

        hiLesson.steps[stepIndex].options = alignedOptions;
        hiLesson.steps[stepIndex].correct = dictionary[step.correct];
    });
}

fs.writeFileSync(hiPath, JSON.stringify(hiData, null, 2), 'utf8');
console.log('Successfully aligned hi.json to en.json');
