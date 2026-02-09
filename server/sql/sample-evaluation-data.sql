-- ==========================================
-- Sample Evaluation Data for Testing
-- Insert evaluation questions and keywords into your database
-- ==========================================

-- Run this file after setting up the main schema:
-- psql -U postgres -d se_project_db -f server/sql/sample-evaluation-data.sql

-- ==========================================
-- Lesson 1: Greetings and Basic Phrases
-- ==========================================

-- Insert evaluation questions for Lesson 1
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

-- Insert evaluation keywords for Lesson 1
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

-- ==========================================
-- Lesson 2: Numbers and Counting
-- ==========================================

-- Insert evaluation questions for Lesson 2
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

-- Insert evaluation keywords for Lesson 2
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

-- ==========================================
-- Lesson 3: Family and Relationships
-- ==========================================

-- Insert evaluation questions for Lesson 3
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

-- Insert evaluation keywords for Lesson 3
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

-- ==========================================
-- Lesson 4: Food and Dining
-- ==========================================

-- Insert evaluation questions for Lesson 4
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

-- Insert evaluation keywords for Lesson 4
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

-- ==========================================
-- Lesson 5: Daily Activities
-- ==========================================

-- Insert evaluation questions for Lesson 5
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

-- Insert evaluation keywords for Lesson 5
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
-- To verify the data was inserted correctly:
-- SELECT COUNT(*) FROM evaluation_intents;
-- SELECT COUNT(*) FROM evaluation_rules;
-- SELECT lesson_id, COUNT(*) FROM evaluation_intents GROUP BY lesson_id;
-- ==========================================


