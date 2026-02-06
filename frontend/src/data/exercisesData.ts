import type { Lesson } from "../types/ExerciseTypes";

export const lessons: Lesson[] = [
  // ========== LANGUAGE LESSONS ==========
  {
    id: "verb-1",
    title: "Understanding Verbs",
    category: "Language",
    difficulty: "basic",
    description: "Learn to identify action words",
    microSteps: [
      "Read the sentence",
      "Identify the action",
      "Understand the verb"
    ],
    steps: [
      {
        type: "read",
        content: "Let's start with a simple sentence:",
        task: "She went to school.",
        instruction: "Read this sentence carefully. Notice the action happening.",
        hints: [
          "Look for words that show what someone is doing",
          "The action word tells us what 'she' did",
          "The verb in this sentence is 'went'"
        ]
      },
      {
        type: "choice",
        content: "Which word shows the action in the sentence?",
        task: "She went to school.",
        options: ["She", "went", "to", "school"],
        correct: "went",
        instruction: "Select the word that represents the action",
        hints: [
          "Think: What did she do?",
          "It's a word that shows movement or action",
          "The correct answer is 'went'"
        ],
        reinforcement: {
          word: "went",
          context: "past tense action verb"
        }
      },
      {
        type: "fill",
        content: "Now complete the sentence by filling in the verb:",
        task: "She ___ to school.",
        answer: "went",
        instruction: "Type the correct verb",
        hints: [
          "Remember: it's a past tense action",
          "It shows she traveled somewhere",
          "The answer is 'went'"
        ],
        reinforcement: {
          word: "went",
          context: "completing a sentence"
        }
      }
    ]
  },
  {
    id: "adj-1",
    title: "Adjectives and Description",
    category: "Language",
    difficulty: "guided",
    description: "Practice using descriptive words",
    microSteps: [
      "Identify the noun",
      "Find the adjective",
      "Create your own description"
    ],
    steps: [
      {
        type: "read",
        content: "Look at this descriptive sentence:",
        task: "The beautiful flower bloomed in spring.",
        instruction: "Notice how 'beautiful' describes the flower",
        hints: [
          "Adjectives describe nouns (people, places, or things)",
          "'Beautiful' tells us more about the flower",
          "Descriptive words make sentences more interesting"
        ]
      },
      {
        type: "choice",
        content: "Which word describes the flower?",
        task: "The beautiful flower bloomed in spring.",
        options: ["The", "beautiful", "flower", "spring"],
        correct: "beautiful",
        instruction: "Find the descriptive word",
        hints: [
          "What word tells us about the flower's appearance?",
          "It comes before the word 'flower'",
          "The adjective is 'beautiful'"
        ]
      },
      {
        type: "fill",
        content: "Add an adjective to describe the sunrise:",
        task: "The ___ sunrise filled the sky.",
        answer: ["beautiful", "stunning", "gorgeous", "amazing", "bright", "colorful", "golden"],
        instruction: "Type any word that describes the sunrise",
        hints: [
          "Think of words that describe how a sunrise looks",
          "Try words like: beautiful, bright, stunning, golden",
          "Any descriptive word works! Be creative."
        ]
      }
    ]
  },
  {
    id: "sent-1",
    title: "Sentence Building",
    category: "Language",
    difficulty: "independent",
    description: "Construct complete sentences independently",
    microSteps: [
      "Choose a subject",
      "Add a verb",
      "Complete the thought"
    ],
    steps: [
      {
        type: "choice",
        content: "What makes a complete sentence?",
        task: "A sentence needs certain parts to be complete.",
        options: [
          "Just a subject",
          "A subject and a verb",
          "Only descriptive words",
          "Just punctuation"
        ],
        correct: "A subject and a verb",
        instruction: "Think about what every sentence needs",
        hints: [
          "A sentence tells who or what (subject) and what they do (verb)",
          "You need both a 'doer' and an 'action'",
          "The answer is: A subject and a verb"
        ]
      },
      {
        type: "build",
        content: "Build a complete sentence by arranging these words:",
        words: ["the", "quickly", "ran", "dog"],
        correct: "The dog ran quickly",
        instruction: "Type the sentence in correct order",
        answer: "The dog ran quickly",
        hints: [
          "Start with 'The' and the subject",
          "The subject is 'dog' and the verb is 'ran'",
          "Correct order: The dog ran quickly"
        ]
      },
      {
        type: "free",
        content: "Create your own sentence about an animal:",
        task: "Write a complete sentence with a subject, verb, and descriptive word",
        instruction: "Write a complete sentence",
        hints: [
          "Example structure: The [adjective] [animal] [verb]...",
          "Make sure you have: subject (animal), action (verb), and description",
          "Example: The playful cat jumped quickly"
        ]
      }
    ]
  },
  {
    id: "pronouns-1",
    title: "Understanding Pronouns",
    category: "Language",
    difficulty: "basic",
    description: "Learn to use pronouns correctly",
    microSteps: [
      "Identify the person",
      "Choose the pronoun",
      "Replace with pronoun"
    ],
    steps: [
      {
        type: "read",
        content: "Pronouns are words that replace names:",
        task: "Instead of saying 'Sarah went to the park', we can say 'She went to the park'.",
        instruction: "Notice how 'She' replaces 'Sarah'",
        hints: [
          "Pronouns help us avoid repeating names",
          "Common pronouns: he, she, it, they, we",
          "They make sentences shorter and clearer"
        ]
      },
      {
        type: "choice",
        content: "Which pronoun can replace 'Tom' in this sentence?",
        task: "Tom likes to play soccer.",
        options: ["She", "He", "They", "It"],
        correct: "He",
        instruction: "Select the correct pronoun for Tom",
        hints: [
          "Tom is a boy's name",
          "We use 'He' for boys and men",
          "The answer is 'He'"
        ]
      },
      {
        type: "fill",
        content: "Replace the name with a pronoun:",
        task: "Maria and I went shopping. ___ bought new shoes.",
        answer: ["we", "We"],
        instruction: "Type the pronoun that replaces 'Maria and I'",
        hints: [
          "When talking about yourself and others, use 'we'",
          "Maria and I = We",
          "The answer is 'We'"
        ]
      }
    ]
  },

  // ========== EMOTIONS LESSONS ==========
  {
    id: "emo-1",
    title: "Identifying Emotions",
    category: "Emotions",
    difficulty: "guided",
    description: "Learn to recognize different feelings from faces",
    microSteps: [
      "Look at the face",
      "Think about how they feel",
      "Match the emotion"
    ],
    steps: [
      {
        type: "emotion",
        content: "Look at this face. How is this person feeling?",
        visualPrompt: "😊",
        instruction: "Select the matching emotion",
        imageOptions: [
          { id: "happy", src: "😊", alt: "Smiling face", label: "Happy" },
          { id: "sad", src: "😢", alt: "Crying face", label: "Sad" },
          { id: "angry", src: "😠", alt: "Angry face", label: "Angry" }
        ],
        correct: "happy",
        hints: [
          "Look at the mouth. Is it smiling or frowning?",
          "Smiling usually means someone is happy.",
          "Match the smile to the 'Happy' option."
        ]
      },
      {
        type: "pattern",
        content: "What comes next in the pattern?",
        visualPrompt: "😊 😢 😊 😢 ...",
        instruction: "Select the face that completes the pattern",
        imageOptions: [
          { id: "happy", src: "😊", alt: "Smiling face", label: "Happy" },
          { id: "sad", src: "😢", alt: "Crying face", label: "Sad" }
        ],
        correct: "happy",
        hints: [
          "The pattern goes: Happy, Sad, Happy, Sad...",
          "After Sad, we go back to Happy.",
          "Select the happy face."
        ]
      },
      {
        type: "choice",
        content: "When might someone feel happy?",
        task: "Think about times when you feel happy.",
        options: [
          "Getting a present",
          "Losing a toy",
          "Being sick",
          "Missing the bus"
        ],
        correct: "Getting a present",
        instruction: "Choose the situation that makes people happy",
        hints: [
          "Happy feelings come from good things",
          "Which option is a positive event?",
          "Getting a present is something nice!"
        ]
      }
    ]
  },
  {
    id: "emo-2",
    title: "Understanding Feelings",
    category: "Emotions",
    difficulty: "guided",
    description: "Learn about different emotions and when we feel them",
    microSteps: [
      "Name the feeling",
      "Understand the cause",
      "Express appropriately"
    ],
    steps: [
      {
        type: "emotion",
        content: "This person looks worried. Can you identify this feeling?",
        visualPrompt: "😟",
        instruction: "Select the emotion shown",
        imageOptions: [
          { id: "excited", src: "🤩", alt: "Excited face", label: "Excited" },
          { id: "worried", src: "😟", alt: "Worried face", label: "Worried" },
          { id: "calm", src: "😌", alt: "Calm face", label: "Calm" }
        ],
        correct: "worried",
        hints: [
          "Notice the eyebrows and mouth position",
          "This person looks concerned about something",
          "The correct answer is 'Worried'"
        ]
      },
      {
        type: "choice",
        content: "What can you do when you feel worried?",
        task: "Choose a helpful action when feeling worried.",
        options: [
          "Talk to someone you trust",
          "Keep it all inside",
          "Run away and hide",
          "Yell at others"
        ],
        correct: "Talk to someone you trust",
        instruction: "Pick the best way to handle worried feelings",
        hints: [
          "Sharing feelings with others can help",
          "Trusted adults can provide comfort",
          "Talking to someone you trust is the best choice"
        ]
      }
    ]
  },

  // ========== SOCIAL SKILLS LESSONS ==========
  {
    id: "social-1",
    title: "Greetings and Introductions",
    category: "Social Skills",
    difficulty: "basic",
    description: "Learn how to greet people and introduce yourself",
    microSteps: [
      "Learn greeting words",
      "Practice introductions",
      "Use polite phrases"
    ],
    steps: [
      {
        type: "read",
        content: "When we meet someone, we greet them:",
        task: "Common greetings: Hello, Hi, Good morning, How are you?",
        instruction: "Read these greeting words and think about when to use them",
        hints: [
          "Greetings are friendly ways to start conversations",
          "Different greetings work for different times of day",
          "Always smile when greeting someone!"
        ]
      },
      {
        type: "choice",
        content: "What's a good way to greet your teacher in the morning?",
        task: "You arrive at school and see your teacher.",
        options: [
          "Good morning!",
          "Hey dude!",
          "What's up?",
          "Yo!"
        ],
        correct: "Good morning!",
        instruction: "Choose the most appropriate greeting",
        hints: [
          "Teachers appreciate polite, formal greetings",
          "Think about the time of day",
          "'Good morning!' is respectful and friendly"
        ]
      },
      {
        type: "fill",
        content: "Complete this introduction:",
        task: "Hi, my name is ___. Nice to meet you!",
        answer: ["your name", "name", "john", "sarah", "alex", "emma"],
        instruction: "Type a name to complete the introduction",
        hints: [
          "You would say your own name here",
          "Any name works for this practice",
          "Type any first name"
        ]
      }
    ]
  },
  {
    id: "social-2",
    title: "Taking Turns",
    category: "Social Skills",
    difficulty: "guided",
    description: "Learn the importance of sharing and taking turns",
    microSteps: [
      "Understand turn-taking",
      "Practice waiting",
      "Share fairly"
    ],
    steps: [
      {
        type: "choice",
        content: "Why is taking turns important?",
        task: "Think about playing games with friends.",
        options: [
          "Everyone gets a chance to play",
          "Only I get to play",
          "It makes games boring",
          "It's not important"
        ],
        correct: "Everyone gets a chance to play",
        instruction: "Select the best reason for taking turns",
        hints: [
          "Taking turns is about fairness",
          "Everyone should have fun",
          "Sharing makes friendships stronger"
        ]
      },
      {
        type: "emotion",
        content: "How might your friend feel if you don't share?",
        visualPrompt: "😢",
        instruction: "Identify the emotion",
        imageOptions: [
          { id: "happy", src: "😊", alt: "Happy face", label: "Happy" },
          { id: "sad", src: "😢", alt: "Sad face", label: "Sad" },
          { id: "excited", src: "🤩", alt: "Excited face", label: "Excited" }
        ],
        correct: "sad",
        hints: [
          "Not sharing can hurt feelings",
          "Your friend would feel left out",
          "They would feel sad"
        ]
      },
      {
        type: "free",
        content: "Write what you would say to ask for a turn:",
        instruction: "Write a polite sentence asking for a turn",
        hints: [
          "Use words like 'please' and 'may I'",
          "Example: May I have a turn please?",
          "Being polite helps others want to share"
        ]
      }
    ]
  },
  {
    id: "social-3",
    title: "Understanding Personal Space",
    category: "Social Skills",
    difficulty: "independent",
    description: "Learn about respecting others' personal space",
    microSteps: [
      "Recognize personal space",
      "Maintain appropriate distance",
      "Respect boundaries"
    ],
    steps: [
      {
        type: "read",
        content: "Personal space is the area around someone's body:",
        task: "Everyone needs their own space to feel comfortable. We should stay about an arm's length away from others.",
        instruction: "Think about how close you stand to different people",
        hints: [
          "Personal space helps people feel safe",
          "Different relationships have different distances",
          "Always respect when someone asks for space"
        ]
      },
      {
        type: "choice",
        content: "How close should you stand to a classmate you just met?",
        task: "You're talking to a new student in your class.",
        options: [
          "About an arm's length away",
          "Very close, touching them",
          "Across the room",
          "Right in their face"
        ],
        correct: "About an arm's length away",
        instruction: "Choose the appropriate distance",
        hints: [
          "Not too close, not too far",
          "An arm's length is a good rule",
          "This gives comfortable space for conversation"
        ]
      }
    ]
  },

  // ========== DAILY LIVING LESSONS ==========
  {
    id: "daily-1",
    title: "Morning Routine",
    category: "Daily Living",
    difficulty: "basic",
    description: "Learn the steps of a healthy morning routine",
    microSteps: [
      "Wake up steps",
      "Getting ready",
      "Starting the day"
    ],
    steps: [
      {
        type: "read",
        content: "A good morning routine helps start your day right:",
        task: "Wake up → Brush teeth → Get dressed → Eat breakfast → Ready for the day!",
        instruction: "Read through these morning steps",
        hints: [
          "Routines help us remember what to do",
          "Doing things in order makes mornings easier",
          "Each step is important for a good day"
        ]
      },
      {
        type: "choice",
        content: "What should you do first after waking up?",
        task: "You just woke up. What's the first thing to do?",
        options: [
          "Brush your teeth",
          "Play video games",
          "Go back to sleep",
          "Watch TV"
        ],
        correct: "Brush your teeth",
        instruction: "Choose the healthy morning habit",
        hints: [
          "Taking care of your body comes first",
          "Brushing teeth is important for health",
          "Personal hygiene should be done early"
        ]
      },
      {
        type: "build",
        content: "Put these morning activities in the right order:",
        words: ["breakfast", "dressed", "teeth", "wake"],
        correct: "wake teeth dressed breakfast",
        answer: "wake teeth dressed breakfast",
        instruction: "Arrange the words in the correct sequence",
        hints: [
          "Start with waking up",
          "Hygiene before getting dressed",
          "Breakfast comes after getting ready"
        ]
      }
    ]
  },
  {
    id: "daily-2",
    title: "Healthy Eating Choices",
    category: "Daily Living",
    difficulty: "guided",
    description: "Learn to identify healthy food choices",
    microSteps: [
      "Recognize healthy foods",
      "Understand nutrition",
      "Make good choices"
    ],
    steps: [
      {
        type: "choice",
        content: "Which is a healthy breakfast choice?",
        task: "You're choosing what to eat for breakfast.",
        options: [
          "Oatmeal with fruit",
          "Candy and soda",
          "Just cookies",
          "Ice cream"
        ],
        correct: "Oatmeal with fruit",
        instruction: "Select the healthiest option",
        hints: [
          "Healthy foods give you energy",
          "Fruits and whole grains are good for you",
          "Oatmeal with fruit is nutritious"
        ]
      },
      {
        type: "choice",
        content: "How many servings of fruits and vegetables should you eat daily?",
        task: "Think about a balanced diet.",
        options: [
          "None",
          "One",
          "Five or more",
          "Only at dinner"
        ],
        correct: "Five or more",
        instruction: "Choose the recommended amount",
        hints: [
          "Fruits and vegetables are very important",
          "We need several servings each day",
          "Five or more servings is the goal"
        ]
      }
    ]
  },

  // ========== SAFETY LESSONS ==========
  {
    id: "safety-1",
    title: "Stranger Safety",
    category: "Safety",
    difficulty: "basic",
    description: "Learn how to stay safe around people you don't know",
    microSteps: [
      "Identify strangers",
      "Know safety rules",
      "Get help when needed"
    ],
    steps: [
      {
        type: "read",
        content: "A stranger is someone you don't know:",
        task: "It's okay to be polite, but never go anywhere with a stranger or accept things from them without asking a trusted adult first.",
        instruction: "Remember this important safety rule",
        hints: [
          "Strangers are people you haven't met before",
          "Always stay with trusted adults",
          "Your safety is most important"
        ]
      },
      {
        type: "choice",
        content: "A stranger offers you candy. What should you do?",
        task: "You're at the park and someone you don't know offers you candy.",
        options: [
          "Say 'No thank you' and tell a trusted adult",
          "Take the candy",
          "Go with them to get more",
          "Keep it a secret"
        ],
        correct: "Say 'No thank you' and tell a trusted adult",
        instruction: "Choose the safest action",
        hints: [
          "Never accept things from strangers",
          "Always tell a trusted adult",
          "It's okay to say no"
        ]
      },
      {
        type: "choice",
        content: "Who is a trusted adult you can ask for help?",
        task: "Think about people who keep you safe.",
        options: [
          "Parents, teachers, or police officers",
          "Anyone on the street",
          "People you met online",
          "Someone who asks you to keep secrets"
        ],
        correct: "Parents, teachers, or police officers",
        instruction: "Identify trusted adults",
        hints: [
          "Trusted adults are people you know well",
          "They have jobs or relationships that protect you",
          "Parents, teachers, and police are safe choices"
        ]
      }
    ]
  },
  {
    id: "safety-2",
    title: "Road Safety",
    category: "Safety",
    difficulty: "guided",
    description: "Learn important rules for crossing streets safely",
    microSteps: [
      "Stop and look",
      "Use crosswalks",
      "Follow signals"
    ],
    steps: [
      {
        type: "read",
        content: "Before crossing any street:",
        task: "Stop, Look Left, Look Right, Look Left Again. Only cross when it's clear and safe!",
        instruction: "Learn this important safety sequence",
        hints: [
          "Always stop before the curb",
          "Look both ways carefully",
          "Cars can come from either direction"
        ]
      },
      {
        type: "choice",
        content: "What does a red traffic light mean?",
        task: "You're at a crosswalk and see a red light.",
        options: [
          "Stop and wait",
          "Run across quickly",
          "Walk slowly",
          "It doesn't matter"
        ],
        correct: "Stop and wait",
        instruction: "Choose what red means",
        hints: [
          "Red means stop in all situations",
          "Wait for the green light or walk signal",
          "Never cross on red"
        ]
      },
      {
        type: "fill",
        content: "Complete the safety rule:",
        task: "Always use the ___ to cross the street.",
        answer: ["crosswalk", "crosswalks", "crossing"],
        instruction: "Type the word that completes the safety rule",
        hints: [
          "This is a marked area for pedestrians",
          "It's usually painted with white stripes",
          "The answer is 'crosswalk'"
        ]
      }
    ]
  }
];
