// Lesson Selection page component
// Shows a list of available lessons with static data

import React from 'react';
import { useTranslation } from 'react-i18next';
import { getLearningDirection } from '../utils/languageManager';
import { getAvailableLessonIds, fetchLesson } from '../services/lessonService';
import './LessonSelection.css';

interface LessonSelectionProps {
  onSelectLesson: (lessonId: number) => void;
}

const LessonSelection: React.FC<LessonSelectionProps> = ({ onSelectLesson }) => {
  const { t } = useTranslation();
  const learningDir = getLearningDirection();
  const [lessons, setLessons] = React.useState<Array<{ id: number; title: string }>>([]);
  const [loading, setLoading] = React.useState(true);

  // Load lesson titles
  React.useEffect(() => {
    const loadLessons = async () => {
      try {
        const lessonIds = getAvailableLessonIds();
        const lessonPromises = lessonIds.map(async (id) => {
          const data = await fetchLesson(id, learningDir);
          return { id, title: data.lesson.title };
        });
        const loadedLessons = await Promise.all(lessonPromises);
        setLessons(loadedLessons);
      } catch (error) {
        console.error('Error loading lessons:', error);
      } finally {
        setLoading(false);
      }
    };
    loadLessons();
  }, [learningDir]);

  return (
    <div className="lesson-selection-container">
      <div className="lesson-selection-content">
        <h1>{t('lessons.title')}</h1>
        <p className="lesson-selection-subtitle">{t('lessons.selectLesson')}</p>

        {loading ? (
          <div className="no-lessons">
            <p>{t('app.loading')}</p>
          </div>
        ) : lessons.length === 0 ? (
          <div className="no-lessons">
            <p>{t('lessons.noLessons')}</p>
          </div>
        ) : (
          <div className="lessons-list">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="lesson-card">
                <h2 className="lesson-title">{lesson.title}</h2>
                <button
                  className="lesson-start-button"
                  onClick={() => onSelectLesson(lesson.id)}
                  aria-label={`${t('lessons.startLesson')}: ${lesson.title}`}
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
