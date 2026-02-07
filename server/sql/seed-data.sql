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
-- Verification Queries
-- Run these to verify data was inserted correctly:
-- SELECT COUNT(*) FROM lessons;
-- SELECT COUNT(*) FROM lesson_keywords;
-- SELECT COUNT(*) FROM evaluation_intents;
-- SELECT COUNT(*) FROM evaluation_rules;
-- SELECT lesson_id, COUNT(*) FROM evaluation_intents GROUP BY lesson_id;
-- ==========================================
