// Lesson Selection page component
// Shows a list of available lessons with static data

import React from 'react';
import { useTranslation } from 'react-i18next';
import { getLearningDirection } from '../utils/languageManager';
import lessonsData from '../data/lessons.json';
import './LessonSelection.css';

interface Lesson {
  id: number;
  title: {
    en: string;
    hi: string;
  };
  description: {
    en: string;
    hi: string;
  };
}

interface LessonSelectionProps {
  onSelectLesson: (lessonId: number) => void;
}

const LessonSelection: React.FC<LessonSelectionProps> = ({ onSelectLesson }) => {
  const { t, i18n } = useTranslation();
  const learningDir = getLearningDirection();
  const currentLang = i18n.language;
  
  // Get lesson title based on learning direction
  const getLessonTitle = (lesson: Lesson): string => {
    // If learning English from Hindi, show English title
    // If learning Hindi from English, show Hindi title
    if (learningDir === 'hi-to-en') {
      return lesson.title.en;
    } else {
      return lesson.title.hi;
    }
  };
  
  // Get lesson description based on learning direction
  const getLessonDescription = (lesson: Lesson): string => {
    // If learning English from Hindi, show English description
    // If learning Hindi from English, show Hindi description
    if (learningDir === 'hi-to-en') {
      return lesson.description.en;
    } else {
      return lesson.description.hi;
    }
  };

  const lessons = lessonsData as Lesson[];

  return (
    <div className="lesson-selection-container">
      <div className="lesson-selection-content">
        <h1>{t('lessons.title')}</h1>
        <p className="lesson-selection-subtitle">{t('lessons.selectLesson')}</p>
        
        {lessons.length === 0 ? (
          <div className="no-lessons">
            <p>{t('lessons.noLessons')}</p>
          </div>
        ) : (
          <div className="lessons-list">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="lesson-card">
                <h2 className="lesson-title">{getLessonTitle(lesson)}</h2>
                <p className="lesson-description">{getLessonDescription(lesson)}</p>
                <button
                  className="lesson-start-button"
                  onClick={() => onSelectLesson(lesson.id)}
                  aria-label={`${t('lessons.startLesson')}: ${getLessonTitle(lesson)}`}
                >
                  {t('lessons.startLesson')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonSelection;
