// Learning placeholder page component
// Shows placeholder content when a lesson is selected

import React from 'react';
import { useTranslation } from 'react-i18next';
import { getLearningDirection } from '../utils/languageManager';
import lessonsData from '../data/lessons.json';
import './Learning.css';

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

interface LearningProps {
  lessonId: number;
  onBack: () => void;
}

const Learning: React.FC<LearningProps> = ({ lessonId, onBack }) => {
  const { t } = useTranslation();
  const learningDir = getLearningDirection();
  
  // Find the lesson by ID
  const lessons = lessonsData as Lesson[];
  const lesson = lessons.find((l) => l.id === lessonId);
  
  // Get lesson title based on learning direction
  const getLessonTitle = (): string => {
    if (!lesson) return t('learning.title');
    
    // If learning English from Hindi, show English title
    // If learning Hindi from English, show Hindi title
    if (learningDir === 'hi-to-en') {
      return lesson.title.en;
    } else {
      return lesson.title.hi;
    }
  };
  
  // Get direction-aware placeholder text
  const getDirectionText = (): string => {
    if (learningDir === 'en-to-hi') {
      return t('learning.placeholder.enToHi');
    } else {
      return t('learning.placeholder.hiToEn');
    }
  };

  return (
    <div className="learning-container">
      <div className="learning-content">
        <h1>{getLessonTitle()}</h1>
        
        <div className="learning-placeholder">
          <p className="direction-text">{getDirectionText()}</p>
          <p className="coming-soon">{t('learning.comingSoon')}</p>
        </div>
        
        <div className="learning-actions">
          <button
            onClick={onBack}
            className="learning-back-button"
            aria-label={t('app.back')}
          >
            {t('app.back')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Learning;
