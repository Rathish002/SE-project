// Language and Learning Direction Manager
// Manages interface language and learning direction using LocalStorage

export type InterfaceLanguage = 'en' | 'hi';
export type LearningDirection = 'en-to-hi' | 'hi-to-en';

const INTERFACE_LANGUAGE_KEY = 'se-project-interface-language';
const LEARNING_DIRECTION_KEY = 'se-project-learning-direction';

// Default values
const DEFAULT_INTERFACE_LANGUAGE: InterfaceLanguage = 'en';
const DEFAULT_LEARNING_DIRECTION: LearningDirection = 'en-to-hi';

/**
 * Get the current interface language from LocalStorage
 * Returns default if not set or invalid
 */
export const getInterfaceLanguage = (): InterfaceLanguage => {
  try {
    const stored = localStorage.getItem(INTERFACE_LANGUAGE_KEY);
    if (stored === 'en' || stored === 'hi') {
      return stored;
    }
  } catch (error) {
    console.warn('Failed to read interface language from LocalStorage:', error);
  }
  return DEFAULT_INTERFACE_LANGUAGE;
};

/**
 * Set the interface language and save to LocalStorage
 */
export const setInterfaceLanguage = (language: InterfaceLanguage): void => {
  try {
    localStorage.setItem(INTERFACE_LANGUAGE_KEY, language);
  } catch (error) {
    console.warn('Failed to save interface language to LocalStorage:', error);
  }
};

/**
 * Get the current learning direction from LocalStorage
 * Returns default if not set or invalid
 */
export const getLearningDirection = (): LearningDirection => {
  try {
    const stored = localStorage.getItem(LEARNING_DIRECTION_KEY);
    if (stored === 'en-to-hi' || stored === 'hi-to-en') {
      return stored;
    }
  } catch (error) {
    console.warn('Failed to read learning direction from LocalStorage:', error);
  }
  return DEFAULT_LEARNING_DIRECTION;
};

/**
 * Set the learning direction and save to LocalStorage
 */
export const setLearningDirection = (direction: LearningDirection): void => {
  try {
    localStorage.setItem(LEARNING_DIRECTION_KEY, direction);
  } catch (error) {
    console.warn('Failed to save learning direction to LocalStorage:', error);
  }
};

/**
 * Initialize language and direction from LocalStorage
 * Call this on app startup to restore user preferences
 */
export const initializeLanguageSettings = (): {
  interfaceLanguage: InterfaceLanguage;
  learningDirection: LearningDirection;
} => {
  return {
    interfaceLanguage: getInterfaceLanguage(),
    learningDirection: getLearningDirection()
  };
};
