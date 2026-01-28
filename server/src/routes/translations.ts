import { Router, Request, Response } from "express";

const router = Router();

const translations: Record<string, any> = {
  en: {
    buttons: {
      next: "Next",
      previous: "Previous",
      submit: "Submit",
      retry: "Try Again",
      start: "Start",
      finish: "Finish",
      playAudio: "Play Audio",
    },

    labels: {
      lesson: "Lesson",
      exercise: "Exercise",
      progress: "Progress",
      language: "Language",
      answer: "Your Answer",
    },

    instructions: {
      chooseAnswer: "Choose the correct answer.",
      typeAnswer: "Type your answer below.",
      speakAnswer: "Speak your answer clearly.",
      followSteps: "Follow the steps one by one.",
    },

    alerts: {
      correct: "Correct!",
      incorrect: "Incorrect. Try again.",
      lessonNotFound: "Lesson not found.",
      exerciseNotFound: "Exercise not found.",
      serverError: "Something went wrong. Please try again later.",
    },
  },

  hi: {
    buttons: {
      next: "अगला",
      previous: "पिछला",
      submit: "जमा करें",
      retry: "फिर से कोशिश करें",
      start: "शुरू करें",
      finish: "समाप्त",
      playAudio: "ऑडियो चलाएँ",
    },

    labels: {
      lesson: "पाठ",
      exercise: "अभ्यास",
      progress: "प्रगति",
      language: "भाषा",
      answer: "आपका उत्तर",
    },

    instructions: {
      chooseAnswer: "सही उत्तर चुनें।",
      typeAnswer: "अपना उत्तर नीचे लिखें।",
      speakAnswer: "अपना उत्तर स्पष्ट रूप से बोलें।",
      followSteps: "कदम दर कदम आगे बढ़ें।",
    },

    alerts: {
      correct: "सही!",
      incorrect: "गलत। फिर से कोशिश करें।",
      lessonNotFound: "पाठ नहीं मिला।",
      exerciseNotFound: "अभ्यास नहीं मिला।",
      serverError: "कुछ गलत हो गया। कृपया बाद में प्रयास करें।",
    },
  },
};

// ✅ GET /translations/:lang
router.get("/:lang", (req: Request, res: Response) => {
  const lang = String(req.params.lang);

  if (!translations[lang]) {


    return res.status(404).json({ message: "Language not supported" });
  }

  res.json(translations[lang]);
});

export default router;
