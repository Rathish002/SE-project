/**
 * Lesson Service
 * Abstracts lesson data fetching with fallback to mock data
 * Sprint 1: Uses mock data (backend not ready)
 * Sprint 2: Will use backend API when available
 */

export interface Lesson {
  id: number;
  title: string;
  content: string;
  instructions?: string;
  image_url?: string;
}

export interface Keyword {
  keyword: string;
  explanation: string;
}

export interface LessonData {
  lesson: Lesson;
  keywords: Keyword[];
}

/**
 * Mock lesson data for Sprint 1 demo
 * Direction-aware content (English ↔ Hindi)
 */
const MOCK_LESSONS: Record<number, { en: LessonData; hi: LessonData }> = {
  1: {
    en: {
      lesson: {
        id: 1,
        title: 'Greetings and Basic Phrases',
        content: 'Hello! Welcome to your first lesson. In this lesson, you will learn how to greet people and use basic phrases in everyday conversations. Greetings are important in any language. They help you connect with others. Common greetings include "Hello", "Good morning", "Good afternoon", and "Good evening". Practice saying these phrases out loud.',
        instructions: 'Read the lesson carefully. Use the audio controls to listen. Toggle dyslexia-friendly fonts or high-contrast mode as needed.',
      },
      keywords: [
        { keyword: 'greetings', explanation: 'Words or phrases used to say hello or welcome someone' },
        { keyword: 'phrases', explanation: 'Groups of words that express a single idea' },
        { keyword: 'conversations', explanation: 'Exchanges of ideas between people through talking' },
      ],
    },
    hi: {
      lesson: {
        id: 1,
        title: 'अभिवादन और बुनियादी वाक्यांश',
        content: 'नमस्ते! आपके पहले पाठ में आपका स्वागत है। इस पाठ में, आप सीखेंगे कि लोगों को कैसे अभिवादन करें और रोजमर्रा की बातचीत में बुनियादी वाक्यांशों का उपयोग कैसे करें। अभिवादन किसी भी भाषा में महत्वपूर्ण होते हैं। वे आपको दूसरों के साथ जुड़ने में मदद करते हैं। सामान्य अभिवादन में "नमस्ते", "सुप्रभात", "नमस्कार" और "शुभ संध्या" शामिल हैं। इन वाक्यांशों को ज़ोर से बोलकर अभ्यास करें।',
        instructions: 'पाठ को ध्यान से पढ़ें। सुनने के लिए ऑडियो नियंत्रण का उपयोग करें। आवश्यकतानुसार डिस्लेक्सिया-अनुकूल फ़ॉन्ट या उच्च कंट्रास्ट मोड टॉगल करें।',
      },
      keywords: [
        { keyword: 'अभिवादन', explanation: 'नमस्ते कहने या किसी का स्वागत करने के लिए उपयोग किए जाने वाले शब्द या वाक्यांश' },
        { keyword: 'वाक्यांश', explanation: 'शब्दों के समूह जो एक विचार व्यक्त करते हैं' },
        { keyword: 'बातचीत', explanation: 'बात करके लोगों के बीच विचारों का आदान-प्रदान' },
      ],
    },
  },
  2: {
    en: {
      lesson: {
        id: 2,
        title: 'Numbers and Counting',
        content: 'Numbers are everywhere in our daily lives. We use them to count, measure, and describe quantities. In this lesson, you will learn numbers from one to one hundred. Start with the basics: one, two, three, four, five. Then move to tens: ten, twenty, thirty, forty, fifty. Practice counting objects around you. This will help you remember the numbers better.',
        instructions: 'Read slowly and practice counting. Use the Play button to listen. Toggle Dyslexia font or High Contrast for readability.',
      },
      keywords: [
        { keyword: 'numbers', explanation: 'Symbols used to represent quantities or amounts' },
        { keyword: 'counting', explanation: 'The process of determining how many items are in a group' },
        { keyword: 'quantities', explanation: 'Amounts or numbers of things' },
      ],
    },
    hi: {
      lesson: {
        id: 2,
        title: 'संख्या और गिनती',
        content: 'संख्या हमारे दैनिक जीवन में हर जगह हैं। हम उनका उपयोग गिनती करने, मापने और मात्राओं का वर्णन करने के लिए करते हैं। इस पाठ में, आप एक से सौ तक की संख्याएँ सीखेंगे। मूल बातें से शुरू करें: एक, दो, तीन, चार, पाँच। फिर दहाई पर जाएँ: दस, बीस, तीस, चालीस, पचास। अपने आसपास की वस्तुओं को गिनने का अभ्यास करें। यह आपको संख्याओं को बेहतर याद रखने में मदद करेगा।',
        instructions: 'धीरे-धीरे पढ़ें और गिनती का अभ्यास करें। सुनने के लिए प्ले बटन का उपयोग करें। पठनीयता के लिए डिस्लेक्सिया फ़ॉन्ट या उच्च कंट्रास्ट टॉगल करें।',
      },
      keywords: [
        { keyword: 'संख्या', explanation: 'मात्राओं या राशियों का प्रतिनिधित्व करने के लिए उपयोग किए जाने वाले प्रतीक' },
        { keyword: 'गिनती', explanation: 'यह निर्धारित करने की प्रक्रिया कि एक समूह में कितने आइटम हैं' },
        { keyword: 'मात्रा', explanation: 'चीजों की संख्या या मात्रा' },
      ],
    },
  },
  3: {
    en: {
      lesson: {
        id: 3,
        title: 'Family and Relationships',
        content: 'Family is important in every culture. In this lesson, you will learn vocabulary related to family members and relationships. Start with immediate family: mother, father, sister, brother. Then learn extended family: grandmother, grandfather, aunt, uncle, cousin. Understanding family relationships helps you communicate about your personal life.',
        instructions: 'Read the lesson carefully. Use the audio controls to listen. Practice saying family member names out loud.',
      },
      keywords: [
        { keyword: 'family', explanation: 'A group of people related by blood or marriage' },
        { keyword: 'relationships', explanation: 'Connections between people, especially family members' },
        { keyword: 'vocabulary', explanation: 'A collection of words used in a language' },
      ],
    },
    hi: {
      lesson: {
        id: 3,
        title: 'परिवार और रिश्ते',
        content: 'परिवार हर संस्कृति में महत्वपूर्ण है। इस पाठ में, आप परिवार के सदस्यों और रिश्तों से संबंधित शब्दावली सीखेंगे। तत्काल परिवार से शुरू करें: माँ, पिता, बहन, भाई। फिर विस्तारित परिवार सीखें: दादी, दादा, चाची, चाचा, चचेरा भाई। परिवार के रिश्तों को समझना आपको अपने व्यक्तिगत जीवन के बारे में संवाद करने में मदद करता है।',
        instructions: 'पाठ को ध्यान से पढ़ें। सुनने के लिए ऑडियो नियंत्रण का उपयोग करें। परिवार के सदस्यों के नाम ज़ोर से बोलकर अभ्यास करें।',
      },
      keywords: [
        { keyword: 'परिवार', explanation: 'रक्त या विवाह से संबंधित लोगों का समूह' },
        { keyword: 'रिश्ते', explanation: 'लोगों के बीच संबंध, विशेष रूप से परिवार के सदस्य' },
        { keyword: 'शब्दावली', explanation: 'एक भाषा में उपयोग किए जाने वाले शब्दों का संग्रह' },
      ],
    },
  },
};

/**
 * Fetch lesson data
 * Tries backend API first, falls back to mock data
 */
export const fetchLesson = async (
  lessonId: number,
  learningDirection: 'en-to-hi' | 'hi-to-en'
): Promise<LessonData> => {
  // Try backend API first
  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/lesson/${lessonId}`);
    
    if (response.ok) {
      const data = await response.json();
      return {
        lesson: data.lesson,
        keywords: data.keywords || [],
      };
    }
  } catch (error) {
    // Backend not available, use mock data
    console.log('Backend not available, using mock data');
  }

  // Fallback to mock data
  const mockData = MOCK_LESSONS[lessonId];
  if (!mockData) {
    throw new Error(`Lesson ${lessonId} not found`);
  }

  // Return direction-appropriate content
  return learningDirection === 'hi-to-en' ? mockData.en : mockData.hi;
};

/**
 * Get list of available lesson IDs
 */
export const getAvailableLessonIds = (): number[] => {
  return Object.keys(MOCK_LESSONS).map(Number).sort((a, b) => a - b);
};
