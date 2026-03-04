-- ==========================================
-- Complete Seed Data for SE Project Database
-- Populates lessons, lesson_keywords, evaluation_intents, and evaluation_rules
-- ==========================================

-- Run this file after setting up the schema:
-- psql -U postgres -d se_project_db -f server/sql/seed-data.sql

-- ==========================================
-- LESSONS TABLE
-- ==========================================

INSERT INTO lessons (title, language_code, text_content, english_text_content)
VALUES
  (
    'अभिवादन और बुनियादी वाक्यांश',
    'hi',
    'नमस्ते एक सामान्य अभिवादन है। आप नमस्कार भी कह सकते हैं। सुबह में आप सुप्रभात कह सकते हैं। किसी को धन्यवाद देने के लिए आप शुक्रिया या धन्यवाद कह सकते हैं। किसी से मिलकर खुशी व्यक्त करने के लिए आप "मुझे आपसे मिलकर खुशी हुई" कह सकते हैं।',
    'Greetings and Basic Phrases. Namaste is a common greeting. You can also say Namaskar. In the morning, you can say Suprabhat (good morning). To thank someone, you can say Shukriya or Dhanyavaad. To express happiness at meeting someone, you can say "Mujhe aapse milkar khushi hui" (I am happy to meet you).'
  ),
  (
    'संख्या और गिनती',
    'hi',
    'आइए हिंदी में संख्या सीखें। एक, दो, तीन, चार, पाँच, छः, सात, आठ, नौ, दस। ये 1 से 10 तक की संख्याएं हैं। बीस 20 है और सौ 100 है। पच्चीस 25 है जो 20 और 5 को मिलाकर बनता है।',
    'Numbers and Counting. Let us learn numbers in Hindi. Ek, Do, Teen, Char, Panch, Chhah, Saat, Aath, Nau, Das. These are numbers from 1 to 10. Bees is 20 and Sau is 100. Pachees is 25 which is formed by combining 20 and 5.'
  ),
  (
    'परिवार और रिश्ते',
    'hi',
    'परिवार हमारे जीवन का महत्वपूर्ण हिस्सा है। माँ को माता भी कहते हैं। पिता को बाप भी कहते हैं। आपकी बहन को बहन कहते हैं और भाई को भाई कहते हैं। बड़े भाई को भैया कहते हैं। दादी और नानी दोनों दादा-दादी हैं। दादा और नाना दोनों दादा हैं।',
    'Family and Relationships. Family is an important part of our lives. Mother is called Maa or Mata. Father is called Pita or Baap. Your sister is called Bahan and brother is called Bhai. An older brother is called Bhaiya. Grandmother is called Dadi (paternal) or Nani (maternal). Grandfather is called Dada (paternal) or Nana (maternal).'
  ),
  (
    'भोजन और भोजन करना',
    'hi',
    'भोजन हमारे जीवन के लिए आवश्यक है। भारतीय खाने में रोटी, चावल, दाल और सब्जियाँ होती हैं। रोटी गेहूँ से बना एक प्रमुख भोजन है। चावल एक अनाज है। दाल प्रोटीन का स्रोत है। बिरयानी चावल और मांस या सब्जियों का एक स्वादिष्ट व्यंजन है। पानी हर भोजन के साथ महत्वपूर्ण है।',
    'Food and Dining. Food is essential for our lives. Indian food includes Roti, Chawal (rice), Daal (lentils), and Sabzi (vegetables). Roti is a staple bread made from wheat. Rice is a grain. Daal is a source of protein. Biryani is a delicious dish made with rice and meat or vegetables. Water is important with every meal.'
  ),
  (
    'दैनिक गतिविधियाँ',
    'hi',
    'हम हर दिन कई गतिविधियाँ करते हैं। सुबह जल्दी उठना अच्छी आदत है। नहाना स्वच्छता के लिए महत्वपूर्ण है। नाश्ता दिन की शुरुआत के लिए आवश्यक है। पढ़ाई करना हमारी शिक्षा के लिए जरूरी है। काम करना हमारी जिम्मेदारी है। रात को जल्दी सोना स्वास्थ्य के लिए अच्छा है।',
    'Daily Activities. We do many activities every day. Waking up early in the morning is a good habit. Bathing is important for hygiene. Breakfast is essential to start the day. Studying is necessary for our education. Working is our responsibility. Going to bed early at night is good for health.'
  );

-- ==========================================
-- LESSON KEYWORDS TABLE
-- ==========================================

-- Lesson 1: Greetings and Basic Phrases
INSERT INTO lesson_keywords (lesson_id, keyword, expanation)
VALUES
  (1, 'नमस्ते', 'A common greeting meaning hello or goodbye'),
  (1, 'नमस्कार', 'A formal greeting'),
  (1, 'सुप्रभात', 'Good morning greeting'),
  (1, 'शुक्रिया', 'A way to say thank you'),
  (1, 'धन्यवाद', 'Expression of gratitude'),
  (1, 'खुशी', 'The feeling of happiness'),
  (1, 'अभिवादन', 'Greeting someone'),
  (1, 'विनम्रता', 'Polite and respectful behavior');

-- Lesson 2: Numbers and Counting
INSERT INTO lesson_keywords (lesson_id, keyword, expanation)
VALUES
  (2, 'एक', 'Number 1'),
  (2, 'दो', 'Number 2'),
  (2, 'तीन', 'Number 3'),
  (2, 'चार', 'Number 4'),
  (2, 'पाँच', 'Number 5'),
  (2, 'छः', 'Number 6'),
  (2, 'सात', 'Number 7'),
  (2, 'आठ', 'Number 8'),
  (2, 'नौ', 'Number 9'),
  (2, 'दस', 'Number 10'),
  (2, 'बीस', 'Number 20'),
  (2, 'सौ', 'Number 100');

-- Lesson 3: Family and Relationships
INSERT INTO lesson_keywords (lesson_id, keyword, expanation)
VALUES
  (3, 'माँ', 'Female parent'),
  (3, 'पिता', 'Male parent'),
  (3, 'भाई', 'Male sibling'),
  (3, 'बहन', 'Female sibling'),
  (3, 'दादा', 'Paternal grandfather'),
  (3, 'दादी', 'Paternal grandmother'),
  (3, 'नाना', 'Maternal grandfather'),
  (3, 'नानी', 'Maternal grandmother'),
  (3, 'परिवार', 'All relatives and family'),
  (3, 'भैया', 'Older brother');

-- Lesson 4: Food and Dining
INSERT INTO lesson_keywords (lesson_id, keyword, expanation)
VALUES
  (4, 'खाना', 'Food or a meal'),
  (4, 'रोटी', 'Flatbread made from wheat'),
  (4, 'चावल', 'Rice grain'),
  (4, 'दाल', 'Lentils or pulses'),
  (4, 'सब्जी', 'Vegetables'),
  (4, 'बिरयानी', 'Rice dish with meat or vegetables'),
  (4, 'पानी', 'Water liquid for drinking'),
  (4, 'रेस्तरां', 'Restaurant where food is served'),
  (4, 'भोजन', 'Food or meal'),
  (4, 'माँगना', 'To request or ask for something');

-- Lesson 5: Daily Activities
INSERT INTO lesson_keywords (lesson_id, keyword, expanation)
VALUES
  (5, 'उठना', 'To wake up from bed'),
  (5, 'नहाना', 'To bathe or take a shower'),
  (5, 'खाना', 'To eat food or meal'),
  (5, 'पढ़ाई', 'To study or learning'),
  (5, 'काम', 'To work or job'),
  (5, 'सोना', 'To sleep'),
  (5, 'दिनचर्या', 'Daily routine or schedule'),
  (5, 'गतिविधि', 'Activity or action'),
  (5, 'सुबह', 'Morning or early part of the day'),
  (5, 'नाश्ता', 'Breakfast or morning meal');

-- ==========================================
-- EVALUATION INTENTS TABLE
-- ==========================================

-- Lesson 1: Greetings and Basic Phrases
INSERT INTO evaluation_intents (lesson_id, question, reference_answer)
VALUES
  (
    1,
    'आप सुबह में किसी को कैसे नमस्ते करते हैं?',
    'नमस्ते, नमस्कार, सुप्रभात'
  ),
  (
    1,
    'आप हिंदी में अपना परिचय कैसे देते हैं?',
    'मेरा नाम [नाम] है। मुझे आपसे मिलकर खुशी हुई।'
  ),
  (
    1,
    'धन्यवाद कहने का विनम्र तरीका क्या है?',
    'शुक्रिया, धन्यवाद'
  );

-- Lesson 2: Numbers and Counting
INSERT INTO evaluation_intents (lesson_id, question, reference_answer)
VALUES
  (
    2,
    'हिंदी में 1 से 10 तक गिनती करें।',
    'एक, दो, तीन, चार, पाँच, छः, सात, आठ, नौ, दस'
  ),
  (
    2,
    'हिंदी में 25 को कैसे कहते हैं?',
    'पच्चीस'
  ),
  (
    2,
    '100 के लिए हिंदी शब्द क्या है?',
    'सौ'
  );

-- Lesson 3: Family and Relationships
INSERT INTO evaluation_intents (lesson_id, question, reference_answer)
VALUES
  (
    3,
    'माँ और पिता के लिए हिंदी शब्द क्या हैं?',
    'माँ, माता, पिता, बाप'
  ),
  (
    3,
    'आप हिंदी में अपने भाई-बहनों का वर्णन कैसे करते हैं?',
    'बहन, भाई, भैया'
  ),
  (
    3,
    'दादी के लिए रिश्ते का शब्द क्या है?',
    'नानी, दादी, नाना, दादा'
  );

-- Lesson 4: Food and Dining
INSERT INTO evaluation_intents (lesson_id, question, reference_answer)
VALUES
  (
    4,
    'आप हिंदी में रेस्तरां में खाना कैसे मंगवाते हैं?',
    'मुझे [खाना] दो, कृपया [खाना] दे दो'
  ),
  (
    4,
    'आपने कुछ सामान्य भारतीय खाद्य पदार्थों के बारे में सीखा है?',
    'रोटी, चावल, दाल, सब्जी, बिरयानी'
  ),
  (
    4,
    'आप रेस्तरां में पानी कैसे माँगते हैं?',
    'पानी दो, एक गिलास पानी दे दो'
  );

-- Lesson 5: Daily Activities
INSERT INTO evaluation_intents (lesson_id, question, reference_answer)
VALUES
  (
    5,
    'हिंदी में अपनी सुबह की दिनचर्या का वर्णन करें।',
    'मैं उठता/उठती हूँ, नाश्ता करता/ करती हूँ, तैयार होता/होती हूँ, काम पर जाता/जाती हूँ'
  ),
  (
    5,
    'इस पाठ में आपने कौन-कौन सी दैनिक गतिविधियाँ सीखीं?',
    'उठना, नहाना, खाना, पढ़ाई करना, काम करना, सोना'
  ),
  (
    5,
    'हिंदी में "मैं पढ़ रहा/रही हूँ" कैसे कहते हैं?',
    'मैं पढ़ाई कर रहा/रही हूँ, मैं पढ़ रहा/रही हूँ'
  );

-- ==========================================
-- EVALUATION RULES TABLE
-- ==========================================

-- Lesson 1: Greetings and Basic Phrases
INSERT INTO evaluation_rules (lesson_id, keyword, weight, evaluation_intent_id)
VALUES
  (1, 'नमस्ते', 1.5, 1),
  (1, 'अभिवादन', 1.0, 1),
  (1, 'सुबह', 1.0, 1),
  (1, 'परिचय', 1.0, 2),
  (1, 'धन्यवाद', 1.2, 3),
  (1, 'शुक्रिया', 1.5, 3),
  (1, 'नमस्कार', 1.0, 1),
  (1, 'विनम्रता', 0.8, 1);

-- Lesson 2: Numbers and Counting
INSERT INTO evaluation_rules (lesson_id, keyword, weight, evaluation_intent_id)
VALUES
  (2, 'संख्या', 1.5, 4),
  (2, 'गिनती', 1.0, 4),
  (2, 'एक', 0.8, 4),
  (2, 'दो', 0.8, 4),
  (2, 'तीन', 0.8, 4),
  (2, 'चार', 0.8, 4),
  (2, 'पाँच', 0.8, 4),
  (2, 'दस', 0.8, 4),
  (2, 'सौ', 1.2, 6),
  (2, 'बीस', 1.0, 5);

-- Lesson 3: Family and Relationships
INSERT INTO evaluation_rules (lesson_id, keyword, weight, evaluation_intent_id)
VALUES
  (3, 'परिवार', 1.5, 7),
  (3, 'माँ', 1.0, 7),
  (3, 'पिता', 1.0, 7),
  (3, 'माता', 1.0, 7),
  (3, 'बाप', 1.0, 7),
  (3, 'बहन', 0.9, 8),
  (3, 'भाई', 0.9, 8),
  (3, 'भैया', 0.9, 8),
  (3, 'दादी', 0.8, 9),
  (3, 'नानी', 0.8, 9),
  (3, 'दादा', 0.8, 9);

-- Lesson 4: Food and Dining
INSERT INTO evaluation_rules (lesson_id, keyword, weight, evaluation_intent_id)
VALUES
  (4, 'खाना', 1.5, 10),
  (4, 'भोजन', 1.0, 10),
  (4, 'रोटी', 1.0, 11),
  (4, 'चावल', 1.0, 11),
  (4, 'दाल', 0.9, 11),
  (4, 'सब्जी', 0.9, 11),
  (4, 'बिरयानी', 0.8, 11),
  (4, 'पानी', 1.0, 12),
  (4, 'रेस्तरां', 0.9, 10),
  (4, 'माँगना', 0.8, 10);

-- Lesson 5: Daily Activities
INSERT INTO evaluation_rules (lesson_id, keyword, weight, evaluation_intent_id)
VALUES
  (5, 'गतिविधियाँ', 1.5, 13),
  (5, 'दैनिक', 1.0, 13),
  (5, 'दिनचर्या', 1.0, 13),
  (5, 'उठना', 0.9, 14),
  (5, 'नहाना', 0.9, 14),
  (5, 'खाना', 0.8, 14),
  (5, 'पढ़ाई', 1.0, 15),
  (5, 'काम', 0.9, 14),
  (5, 'सोना', 0.8, 14),
  (5, 'सुबह', 0.7, 13);

-- ==========================================
-- EXERCISES TABLE
-- ==========================================

-- Lesson 1: Greetings and Basic Phrases
INSERT INTO exercises (lesson_id, title, instructions_text)
VALUES
  (1, 'Greeting Matching Exercise', 'Match the Hindi greeting with its meaning'),
  (1, 'Basic Phrases Practice', 'Select the appropriate phrase for each situation'),
  (1, 'Thank You Expressions', 'Learn different ways to express gratitude in Hindi');

-- Lesson 2: Numbers and Counting
INSERT INTO exercises (lesson_id, title, instructions_text)
VALUES
  (2, 'Number Recognition', 'Match Hindi numbers with their values'),
  (2, 'Counting Sequence', 'Fill in the missing numbers in the sequence'),
  (2, 'Number Writing Challenge', 'Write numbers in Hindi from 1 to 20');

-- Lesson 3: Family and Relationships
INSERT INTO exercises (lesson_id, title, instructions_text)
VALUES
  (3, 'Family Member Identification', 'Identify family members and their relationships'),
  (3, 'Relationship Mapping', 'Match family members with Hindi terms'),
  (3, 'Family Vocabulary Quiz', 'Test your knowledge of family-related words');

-- Lesson 4: Food and Dining
INSERT INTO exercises (lesson_id, title, instructions_text)
VALUES
  (4, 'Food Item Recognition', 'Identify common Indian food items'),
  (4, 'Restaurant Ordering', 'Practice ordering food at a restaurant'),
  (4, 'Food Preferences Quiz', 'Talk about your favorite foods in Hindi');

-- Lesson 5: Daily Activities
INSERT INTO exercises (lesson_id, title, instructions_text)
VALUES
  (5, 'Daily Routine Sequencing', 'Arrange daily activities in correct order'),
  (5, 'Activity Identification', 'Match activities with their descriptions'),
  (5, 'Morning Routine Building', 'Build your morning routine in Hindi');

-- ==========================================
-- EXERCISE STEPS TABLE (Lesson 1: Greetings)
-- ==========================================

-- Exercise 1: Greeting Matching Exercise
INSERT INTO exercise_steps (exercise_id, step_number, prompt, hint_1, correct_option_id)
VALUES
  (1, 1, 'What does नमस्ते mean?', 'A common way to greet someone', 3),
  (1, 2, 'When do you say सुप्रभात?', 'Hint: It is used in the morning', 7),
  (1, 3, 'Which is a formal greeting?', 'Hint: More formal than नमस्ते', 11),
  (1, 4, 'How do you say goodbye in Hindi?', 'Hint: Similar to hello', 15);

-- Exercise 2: Basic Phrases Practice
INSERT INTO exercise_steps (exercise_id, step_number, prompt, hint_1, correct_option_id)
VALUES
  (2, 1, 'What to say when meeting someone for the first time?', 'Express your happiness at meeting them', 19),
  (2, 2, 'How to respond to a greeting?', 'Greet them back respectfully', 23),
  (2, 3, 'What is a polite way to ask for something?', 'Use the word please', 27),
  (2, 4, 'How to introduce yourself?', 'State your name and express pleasure', 31);

-- Exercise 3: Thank You Expressions
INSERT INTO exercise_steps (exercise_id, step_number, prompt, hint_1, correct_option_id)
VALUES
  (3, 1, 'What is the most common way to say thank you?', 'Hint: Two similar words', 35),
  (3, 2, 'An informal way to express gratitude?', 'Hint: Often used in casual settings', 39),
  (3, 3, 'What does खुशी mean?', 'Hint: A positive emotion', 43),
  (3, 4, 'How do you politely respond to thanks?', 'Hint: Means you are welcome', 47);

-- ==========================================
-- EXERCISE STEP OPTIONS (Lesson 1)
-- ==========================================

-- Step 1.1 options (correct: Hello/Goodbye)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (1, 'Father', 1),
  (1, 'Food', 2),
  (1, 'Hello/Goodbye', 3),
  (1, 'Thank you', 4);

-- Step 1.2 options (correct: In the morning)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (2, 'At noon', 1),
  (2, 'In the morning', 2),
  (2, 'At night', 3),
  (2, 'Anytime', 4);

-- Step 1.3 options (correct: नमस्कार)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (3, 'नमस्ते', 1),
  (3, 'नमस्कार', 2),
  (3, 'सुप्रभात', 3),
  (3, 'धन्यवाद', 4);

-- Step 1.4 options (correct: नमस्ते)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (4, 'खुदा हाफिज', 1),
  (4, 'नमस्ते', 2),
  (4, 'फिर मिलेंगे', 3),
  (4, 'अलविदा', 4);

-- Step 2.1 options (correct: "मुझे आपसे मिलकर खुशी हुई")
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (5, 'मैं व्यस्त हूँ', 1),
  (5, '"मुझे आपसे मिलकर खुशी हुई"', 2),
  (5, 'नमस्ते', 3),
  (5, 'कैसे हो?', 4);

-- Step 2.2 options (correct: नमस्ते/नमस्कार)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (6, 'नमस्ते/नमस्कार', 1),
  (6, 'अलविदा', 2),
  (6, 'धन्यवाद', 3),
  (6, 'खुशी हुई', 4);

-- Step 2.3 options (correct: कृपया)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (7, 'तुरंत', 1),
  (7, 'कभी नहीं', 2),
  (7, 'कृपया', 3),
  (7, 'मना', 4);

-- Step 2.4 options (correct: "मेरा नाम [नाम] है। मुझे आपसे मिलकर खुशी हुई।")
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (8, '"मेरा नाम [नाम] है। मुझे आपसे मिलकर खुशी हुई।"', 1),
  (8, '"मैं अच्छा हूँ। तुम कैसे हो?"', 2),
  (8, '"धन्यवाद, आप कैसे हैं?"', 3),
  (8, '"नमस्ते और अलविदा"', 4);

-- Step 3.1 options (correct: धन्यवाद/शुक्रिया)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (9, 'खुशी', 1),
  (9, 'धन्यवाद/शुक्रिया', 2),
  (9, 'नमस्ते', 3),
  (9, 'परिवार', 4);

-- Step 3.2 options (correct: शुक्रिया)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (10, 'नमस्ते', 1),
  (10, 'शुक्रिया', 2),
  (10, 'अलविदा', 3),
  (10, 'सुप्रभात', 4);

-- Step 3.3 options (correct: Happiness)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (11, 'Sadness', 1),
  (11, 'Happiness', 2),
  (11, 'Anger', 3),
  (11, 'Fear', 4);

-- Step 3.4 options (correct: कृपया/स्वागत है)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (12, 'मान नहीं', 1),
  (12, 'कृपया/स्वागत है', 2),
  (12, 'धन्यवाद', 3),
  (12, 'अलविदा', 4);

-- ==========================================
-- EXERCISE STEPS TABLE (Lesson 2: Numbers)
-- ==========================================

-- Exercise 4: Number Recognition
INSERT INTO exercise_steps (id, exercise_id, step_number, prompt, hint_1, correct_option_id)
VALUES
  (49, 4, 1, 'What is the Hindi word for number 1?', 'First number in sequence', 51),
  (50, 4, 2, 'How do you say 5 in Hindi?', 'Midpoint of 1-10', 55),
  (51, 4, 3, 'What is 10 called in Hindi?', 'The complete first sequence', 59),
  (52, 4, 4, 'How do you say 20 in Hindi?', 'Double the number 10', 63);

-- Exercise 5: Counting Sequence
INSERT INTO exercise_steps (id, exercise_id, step_number, prompt, hint_1, correct_option_id)
VALUES
  (53, 5, 1, 'Complete the sequence: 1, 2, 3, ___, 5', 'The fourth number', 67),
  (54, 5, 2, 'What comes after 7?', 'Hint: 7 + 1 = ?', 71),
  (55, 5, 3, 'Fill in: ___, 6, 7, 8, ___', 'Consecutive numbers', 75);

-- Exercise 6: Number Writing Challenge
INSERT INTO exercise_steps (id, exercise_id, step_number, prompt, hint_1, correct_option_id)
VALUES
  (56, 6, 1, 'What is 15 in Hindi?', 'Hint: 10 + 5 = पंद्रह', 79),
  (57, 6, 2, 'How do you write 25 in Hindi?', 'Hint: 20 + 5 = पच्चीस', 83),
  (58, 6, 3, 'What is 100 in Hindi?', 'The biggest number in this lesson', 87);

-- ==========================================
-- EXERCISE STEP OPTIONS (Lesson 2)
-- ==========================================

-- Step 4.1 options (correct: एक)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (49, 'दो', 1),
  (49, 'एक', 2),
  (49, 'तीन', 3),
  (49, 'चार', 4);

-- Step 4.2 options (correct: पाँच)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (50, 'चार', 1),
  (50, 'पाँच', 2),
  (50, 'छः', 3),
  (50, 'सात', 4);

-- Step 4.3 options (correct: दस)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (51, 'नौ', 1),
  (51, 'दस', 2),
  (51, 'ग्यारह', 3),
  (51, 'बारह', 4);

-- Step 4.4 options (correct: बीस)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (52, 'बारह', 1),
  (52, 'पंद्रह', 2),
  (52, 'बीस', 3),
  (52, 'पचास', 4);

-- Step 5.1 options (correct: चार)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (53, 'चार', 1),
  (53, 'तीन', 2),
  (53, 'छः', 3),
  (53, 'दो', 4);

-- Step 5.2 options (correct: आठ)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (54, 'आठ', 1),
  (54, 'नौ', 2),
  (54, 'छः', 3),
  (54, 'सात', 4);

-- Step 5.3 options (correct: 5, 9)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (55, '5, 9', 1),
  (55, '6, 8', 2),
  (55, '7, 9', 3),
  (55, '4, 8', 4);

-- Step 6.1 options (correct: पंद्रह)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (56, 'दस', 1),
  (56, 'पंद्रह', 2),
  (56, 'बीस', 3),
  (56, 'बारह', 4);

-- Step 6.2 options (correct: पच्चीस)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (57, 'पंद्रह', 1),
  (57, 'बीस', 2),
  (57, 'पच्चीस', 3),
  (57, 'तीस', 4);

-- Step 6.3 options (correct: सौ)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (58, 'पचास', 1),
  (58, 'सत्तर', 2),
  (58, 'नब्बे', 3),
  (58, 'सौ', 4);

-- ==========================================
-- EXERCISE STEPS TABLE (Lesson 3: Family)
-- ==========================================

-- Exercise 7: Family Member Identification
INSERT INTO exercise_steps (id, exercise_id, step_number, prompt, hint_1, correct_option_id)
VALUES
  (89, 7, 1, 'Who is your mother''s mother?', 'Hint: Grand + Mother', 91),
  (90, 7, 2, 'What do you call your father''s male sibling?', 'Hint: Uncle in English', 95),
  (91, 7, 3, 'Who is your father''s wife?', 'Hint: Female parent', 99),
  (92, 7, 4, 'What is a word for brother in Hindi?', 'Hint: Common family term', 103);

-- Exercise 8: Relationship Mapping
INSERT INTO exercise_steps (id, exercise_id, step_number, prompt, hint_1, correct_option_id)
VALUES
  (93, 8, 1, 'Match: माता', 'Hint: Mother related', 107),
  (94, 8, 2, 'Match: भैया', 'Hint: Brother related', 111),
  (95, 8, 3, 'Match: नानी', 'Hint: Grandmother (maternal)', 115);

-- Exercise 9: Family Vocabulary Quiz
INSERT INTO exercise_steps (id, exercise_id, step_number, prompt, hint_1, correct_option_id)
VALUES
  (96, 9, 1, 'What does परिवार mean?', 'All relatives together', 119),
  (97, 9, 2, 'How do you say "my sister" in Hindi?', 'Possessive form of बहन', 123),
  (98, 9, 3, 'Who are your पिता''s parents?', 'Paternal grandparents', 127);

-- ==========================================
-- EXERCISE STEP OPTIONS (Lesson 3)
-- ==========================================

-- Step 7.1 options (correct: दादी/नानी)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (89, 'माता', 1),
  (89, 'दादी/नानी', 2),
  (89, 'बहन', 3),
  (89, 'चाची', 4);

-- Step 7.2 options (correct: चाचा)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (90, 'भैया', 1),
  (90, 'चाचा', 2),
  (90, 'दादा', 3),
  (90, 'नाना', 4);

-- Step 7.3 options (correct: माता/माँ)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (91, 'बहन', 1),
  (91, 'माता/माँ', 2),
  (91, 'चाची', 3),
  (91, 'आंटी', 4);

-- Step 7.4 options (correct: भाई)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (92, 'भाई', 1),
  (92, 'दादा', 2),
  (92, 'पिता', 3),
  (92, 'नाना', 4);

-- Step 8.1 options (correct: Mother)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (93, 'Father', 1),
  (93, 'Mother', 2),
  (93, 'Sister', 3),
  (93, 'Grandmother', 4);

-- Step 8.2 options (correct: Older Brother)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (94, 'Younger Brother', 1),
  (94, 'Older Brother', 2),
  (94, 'Uncle', 3),
  (94, 'Grandfather', 4);

-- Step 8.3 options (correct: Maternal Grandmother)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (95, 'Paternal Grandmother', 1),
  (95, 'Maternal Grandmother', 2),
  (95, 'Paternal Grandfather', 3),
  (95, 'Maternal Grandfather', 4);

-- Step 9.1 options (correct: Family)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (96, 'Friends', 1),
  (96, 'Family', 2),
  (96, 'Neighbors', 3),
  (96, 'Teachers', 4);

-- Step 9.2 options (correct: मेरी बहन)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (97, 'बहन का', 1),
  (97, 'मेरी बहन', 2),
  (97, 'बहन है', 3),
  (97, 'बहन को', 4);

-- Step 9.3 options (correct: दादा-दादी)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (98, 'नाना-नानी', 1),
  (98, 'दादा-दादी', 2),
  (98, 'माता-पिता', 3),
  (98, 'भाई-बहन', 4);

-- ==========================================
-- EXERCISE STEPS TABLE (Lesson 4: Food)
-- ==========================================

-- Exercise 10: Food Item Recognition
INSERT INTO exercise_steps (id, exercise_id, step_number, prompt, hint_1, correct_option_id)
VALUES
  (129, 10, 1, 'What is रोटी?', 'Hint: Flatbread made from wheat', 131),
  (130, 10, 2, 'What is दाल?', 'Hint: Protein source, made from lentils', 135),
  (131, 10, 3, 'What is a famous Indian rice dish?', 'Hint: Biryani', 139),
  (132, 10, 4, 'What is essential to drink with meals?', 'Hint: Water', 143);

-- Exercise 11: Restaurant Ordering
INSERT INTO exercise_steps (id, exercise_id, step_number, prompt, hint_1, correct_option_id)
VALUES
  (133, 11, 1, 'How do you ask for food at a restaurant?', 'Hint: Use माँगना (to ask for)', 147),
  (134, 11, 2, 'What do you say to order water?', 'Hint: Polite request', 151),
  (135, 11, 3, 'How to ask for rice in Hindi?', 'Hint: चावल please', 155);

-- Exercise 12: Food Preferences Quiz
INSERT INTO exercise_steps (id, exercise_id, step_number, prompt, hint_1, correct_option_id)
VALUES
  (136, 12, 1, 'What does खाना mean?', 'Hint: Basic necessity', 159),
  (137, 12, 2, 'Where do you go to eat?', 'Hint: Restaurant', 163),
  (138, 12, 3, 'What is सब्जी?', 'Hint: Plant-based food component', 167);

-- ==========================================
-- EXERCISE STEP OPTIONS (Lesson 4)
-- ==========================================

-- Step 10.1 options (correct: Flatbread)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (129, 'Rice', 1),
  (129, 'Flatbread', 2),
  (129, 'Meat', 3),
  (129, 'Bread', 4);

-- Step 10.2 options (correct: Lentils)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (130, 'Rice', 1),
  (130, 'Lentils', 2),
  (130, 'Vegetables', 3),
  (130, 'Bread', 4);

-- Step 10.3 options (correct: बिरयानी)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (131, 'बिरयानी', 1),
  (131, 'रोटी', 2),
  (131, 'दाल', 3),
  (131, 'सब्जी', 4);

-- Step 10.4 options (correct: पानी)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (132, 'दूध', 1),
  (132, 'चाय', 2),
  (132, 'पानी', 3),
  (132, 'जूस', 4);

-- Step 11.1 options (correct: "मुझे [खाना] दो" या "कृपया [खाना] दे दो")
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (133, '"नमस्ते, [खाना] है?"', 1),
  (133, '"मुझे [खाना] दो" या "कृपया [खाना] दे दो"', 2),
  (133, '"क्या यह अच्छा है?"', 3),
  (133, '"धन्यवाद, अलविदा"', 4);

-- Step 11.2 options (correct: "पानी दो" या "एक गिलास पानी दे दो")
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (134, '"चाय दो"', 1),
  (134, '"पानी दो" या "एक गिलास पानी दे दो"', 2),
  (134, '"दूध दो"', 3),
  (134, '"खाना दो"', 4);

-- Step 11.3 options (correct: "चावल दो" या "कृपया चावल दे दो")
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (135, '"रोटी दो"', 1),
  (135, '"चावल दो" या "कृपया चावल दे दो"', 2),
  (135, '"दाल दो"', 3),
  (135, '"सब्जी दो"', 4);

-- Step 12.1 options (correct: Food)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (136, 'Water', 1),
  (136, 'Food', 2),
  (136, 'Happiness', 3),
  (136, 'Family', 4);

-- Step 12.2 options (correct: Restaurant)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (137, 'School', 1),
  (137, 'Home', 2),
  (137, 'Restaurant', 3),
  (137, 'Park', 4);

-- Step 12.3 options (correct: Vegetables)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (138, 'Fruits', 1),
  (138, 'Vegetables', 2),
  (138, 'Meat', 3),
  (138, 'Bread', 4);

-- ==========================================
-- EXERCISE STEPS TABLE (Lesson 5: Daily Activities)
-- ==========================================

-- Exercise 13: Daily Routine Sequencing
INSERT INTO exercise_steps (id, exercise_id, step_number, prompt, hint_1, correct_option_id)
VALUES
  (169, 13, 1, 'What do you do first in the morning?', 'Hint: Opening your eyes', 171),
  (170, 13, 2, 'What comes after waking up?', 'Hint: Personal hygiene', 175),
  (171, 13, 3, 'What do you do after bathing?', 'Hint: First meal of the day', 179),
  (172, 13, 4, 'What is the last activity of the day?', 'Hint: Rest at night', 183);

-- Exercise 14: Activity Identification
INSERT INTO exercise_steps (id, exercise_id, step_number, prompt, hint_1, correct_option_id)
VALUES
  (173, 14, 1, 'What does पढ़ाई करना mean?', 'Hint: Educational activity', 187),
  (174, 14, 2, 'What is काम?', 'Hint: Professional responsibility', 191),
  (175, 14, 3, 'What does दिनचर्या mean?', 'Hint: Daily schedule', 195);

-- Exercise 15: Morning Routine Building
INSERT INTO exercise_steps (id, exercise_id, step_number, prompt, hint_1, correct_option_id)
VALUES
  (176, 15, 1, 'How do you describe waking up early?', 'Hint: जल्दी उठना', 199),
  (177, 15, 2, 'What is important for cleanliness?', 'Hint: Bathing', 203),
  (178, 15, 3, 'Why is breakfast important?', 'Hint: Starts the day with energy', 207);

-- ==========================================
-- EXERCISE STEP OPTIONS (Lesson 5)
-- ==========================================

-- Step 13.1 options (correct: उठना)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (169, 'नहाना', 1),
  (169, 'उठना', 2),
  (169, 'खाना', 3),
  (169, 'सोना', 4);

-- Step 13.2 options (correct: नहाना)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (170, 'नहाना', 1),
  (170, 'खाना', 2),
  (170, 'काम करना', 3),
  (170, 'पढ़ना', 4);

-- Step 13.3 options (correct: नाश्ता करना)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (171, 'नाश्ता करना', 1),
  (171, 'काम करना', 2),
  (171, 'पढ़ना', 3),
  (171, 'सोना', 4);

-- Step 13.4 options (correct: सोना)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (172, 'सोना', 1),
  (172, 'खाना', 2),
  (172, 'काम करना', 3),
  (172, 'पढ़ना', 4);

-- Step 14.1 options (correct: Studying)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (173, 'Working', 1),
  (173, 'Studying', 2),
  (173, 'Playing', 3),
  (173, 'Sleeping', 4);

-- Step 14.2 options (correct: Job/Work)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (174, 'School', 1),
  (174, 'Job/Work', 2),
  (174, 'Home', 3),
  (174, 'Play', 4);

-- Step 14.3 options (correct: Daily Routine)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (175, 'Daily Schedule', 1),
  (175, 'Daily Routine', 2),
  (175, 'Family', 3),
  (175, 'Friends', 4);

-- Step 15.1 options (correct: "जल्दी उठना अच्छी आदत है")
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (176, '"देर से उठना"', 1),
  (176, '"जल्दी उठना अच्छी आदत है"', 2),
  (176, '"रात भर जागना"', 3),
  (176, '"दोपहर को सोना"', 4);

-- Step 15.2 options (correct: नहाना)
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (177, 'खेलना', 1),
  (177, 'नहाना', 2),
  (177, 'पढ़ना', 3),
  (177, 'काम करना', 4);

-- Step 15.3 options (correct: "बिना नाश्ते के दिन शुरू करना ठीक नहीं है")
INSERT INTO exercise_step_options (step_id, option_text, option_order)
VALUES
  (178, '"नाश्ता दिन की शुरुआत के लिए आवश्यक है"', 1),
  (178, '"नाश्ते की कोई आवश्यकता नहीं है"', 2),
  (178, '"रात को नाश्ता करना अच्छा है"', 3),
  (178, '"नाश्ता केवल विशेष दिनों के लिए है"', 4);

-- ==========================================
-- LESSON 6: Scaffold Learning (Added per user request)
-- ==========================================

INSERT INTO lessons (id, title, language_code, text_content, english_text_content)
VALUES (
  6, 
  'Scaffold Learning', 
  'en', 
  'Scaffolding is a way to learn new things step by step. Just like a building needs support while it is being built, learners need support too. We start with a lot of help, and then slowly take it away as you get better. This helps you learn difficult things easily. You are never alone; there is always support when you need it.', 
  'Scaffolding is a way to learn new things step by step. Just like a building needs support while it is being built, learners need support too. We start with a lot of help, and then slowly take it away as you get better. This helps you learn difficult things easily. You are never alone; there is always support when you need it.'
);

INSERT INTO lesson_keywords (lesson_id, keyword, expanation)
VALUES
  (6, 'Scaffolding', 'Support given during the learning process'),
  (6, 'Support', 'Help provided to make tasks easier'),
  (6, 'Step-by-step', 'Doing things one small part at a time');

INSERT INTO exercises (id, lesson_id, title, instructions_text)
VALUES
  (16, 6, 'Scaffolding Basics', 'Understand the core concept of scaffolding'),
  (17, 6, 'Support Types', 'Identify different ways to support learning'),
  (18, 6, 'Growth Mindset', 'Learn how challenges help you grow');

-- Exercise 16: Scaffolding Basics
INSERT INTO exercise_steps (id, exercise_id, step_number, prompt, hint_1, correct_option_id)
VALUES
  (179, 16, 1, 'What is scaffolding like?', 'Hint: Think of a building', 20208),
  (180, 16, 2, 'What happens to support over time?', 'Hint: It changes', 20213),
  (181, 16, 3, 'Why do we use scaffolding?', 'Hint: To help learning', 20217);

-- Exercise 17: Support Types
INSERT INTO exercise_steps (id, exercise_id, step_number, prompt, hint_1, correct_option_id)
VALUES
  (182, 17, 1, 'Which is a visual support?', 'Hint: Something you see', 20220),
  (183, 17, 2, 'Which is a verbal support?', 'Hint: Something you hear', 20224),
  (184, 17, 3, 'Which is a social support?', 'Hint: Involving people', 20228);

-- Exercise 18: Growth Mindset
INSERT INTO exercise_steps (id, exercise_id, step_number, prompt, hint_1, correct_option_id)
VALUES
  (185, 18, 1, 'Mistakes are...', 'Hint: Positive view', 20232),
  (186, 18, 2, 'If I find it hard, I should...', 'Hint: Don''t stop', 20236),
  (187, 18, 3, 'My brain grows when I...', 'Hint: Challenge', 20240);


-- Step 16.1 (Correct: 20208)
INSERT INTO exercise_step_options (id, step_id, option_text, option_order) VALUES
  (20208, 179, 'A Support Structure', 1),
  (20209, 179, 'A Race Car', 2),
  (20210, 179, 'A Wall', 3),
  (20211, 179, 'A Trap', 4);

-- Step 16.2 (Correct: 20213)
INSERT INTO exercise_step_options (id, step_id, option_text, option_order) VALUES
  (20212, 180, 'It increases', 1),
  (20213, 180, 'It decreases (fades)', 2),
  (20214, 180, 'It stays the same', 3),
  (20215, 180, 'It stops', 4);

-- Step 16.3 (Correct: 20217)
INSERT INTO exercise_step_options (id, step_id, option_text, option_order) VALUES
  (20216, 181, 'To make it harder', 1),
  (20217, 181, 'To make it easier', 2),
  (20218, 181, 'To confuse you', 3),
  (20219, 181, 'To waste time', 4);

-- Step 17.1 (Correct: 20220)
INSERT INTO exercise_step_options (id, step_id, option_text, option_order) VALUES
  (20220, 182, 'Pictures/Diagrams', 1),
  (20221, 182, 'Talking', 2),
  (20222, 182, 'Running', 3),
  (20223, 182, 'Sleeping', 4);

-- Step 17.2 (Correct: 20224)
INSERT INTO exercise_step_options (id, step_id, option_text, option_order) VALUES
  (20224, 183, 'Explanations', 1),
  (20225, 183, 'Images', 2),
  (20226, 183, 'Gestures', 3),
  (20227, 183, 'Silence', 4);

-- Step 17.3 (Correct: 20228)
INSERT INTO exercise_step_options (id, step_id, option_text, option_order) VALUES
  (20228, 184, 'Working with a friend', 1),
  (20229, 184, 'Working alone', 2),
  (20230, 184, 'Sleeping', 3),
  (20231, 184, 'Ignoring others', 4);

-- Step 18.1 (Correct: 20232)
INSERT INTO exercise_step_options (id, step_id, option_text, option_order) VALUES
  (20232, 185, 'Opportunities to learn', 1),
  (20233, 185, 'Bad things', 2),
  (20234, 185, 'Failures', 3),
  (20235, 185, 'Scary', 4);

-- Step 18.2 (Correct: 20236)
INSERT INTO exercise_step_options (id, step_id, option_text, option_order) VALUES
  (20236, 186, 'Keep trying', 1),
  (20237, 186, 'Give up', 2),
  (20238, 186, 'Cry', 3),
  (20239, 186, 'Get angry', 4);

-- Step 18.3 (Correct: 20240)
INSERT INTO exercise_step_options (id, step_id, option_text, option_order) VALUES
  (20240, 187, 'Face challenges', 1),
  (20241, 187, 'Do nothing', 2),
  (20242, 187, 'Watch TV', 3),
  (20243, 187, 'Sleep', 4);

-- ==========================================
-- Verification Queries
-- Run these to verify data was inserted correctly:
-- SELECT COUNT(*) FROM lessons;
-- SELECT COUNT(*) FROM lesson_keywords;
-- SELECT COUNT(*) FROM evaluation_intents;
-- SELECT COUNT(*) FROM evaluation_rules;
-- SELECT COUNT(*) FROM exercises;
-- SELECT COUNT(*) FROM exercise_steps;
-- SELECT COUNT(*) FROM exercise_step_options;
-- SELECT lesson_id, COUNT(*) FROM exercises GROUP BY lesson_id;
-- SELECT exercise_id, COUNT(*) FROM exercise_steps GROUP BY exercise_id;
-- ==========================================
