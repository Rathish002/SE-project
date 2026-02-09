// Lesson Selection page component
// Shows a list of available lessons with progress tracking and modern UI

import React from 'react';
import { useTranslation } from 'react-i18next';
import { getLearningDirection } from '../utils/languageManager';
import { getAvailableLessonIds, fetchLesson, LessonData } from '../services/lessonService';
import './LessonSelection.css';

interface LessonSelectionProps {
  onSelectLesson: (lessonId: number) => void;
}

interface LessonInfo {
  id: number;
  title: string;
  description?: string;
}

const LessonSelection: React.FC<LessonSelectionProps> = ({ onSelectLesson }) => {
  const { t } = useTranslation();
  const learningDir = getLearningDirection();
  const [lessons, setLessons] = React.useState<LessonInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [completedLessons, setCompletedLessons] = React.useState<Set<number>>(new Set());

  // Load completed lessons from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('completedLessons');
      if (saved) {
        setCompletedLessons(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }, []);

  // Load lesson titles and descriptions
  React.useEffect(() => {
    const loadLessons = async () => {
      try {
        const lessonIds = getAvailableLessonIds();
        const lessonPromises = lessonIds.map(async (id) => {
          const data: LessonData = await fetchLesson(id, learningDir);
          return {
            id,
            title: data.lesson.title,
            description: data.lesson.content?.substring(0, 150) + '...',
          };
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

  // Calculate progress
  const totalLessons = lessons.length;
  const completedCount = completedLessons.size;
  const progressPercentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  return (
    <div className="lesson-selection-container">
      <div className="lesson-selection-content">
        {/* Page Header */}
        <h1>{t('lessons.title')}</h1>
        <p className="lesson-selection-subtitle">{t('lessons.selectLesson')}</p>

        {/* Progress Indicator */}
        {!loading && lessons.length > 0 && (
          <div className="progress-section">
            <div className="progress-header">
              <span className="progress-label">Your Progress</span>
              <span className="progress-count">
                {completedCount} of {totalLessons} completed
              </span>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>{t('app.loading')}</p>
          </div>
        ) : lessons.length === 0 ? (
          <div className="no-lessons">
            <p>{t('lessons.noLessons')}</p>
          </div>
        ) : (
          <div className="lessons-list">
            {lessons.map((lesson, index) => (
              <div key={lesson.id} className="lesson-card">
                {/* Lesson Number Badge */}
                <div className="lesson-number-badge">
                  {index + 1}
                </div>

                {/* Lesson Content */}
                <div className="lesson-content">
                  <h2 className="lesson-title">{lesson.title}</h2>
                  {lesson.description && (
                    <p className="lesson-description">{lesson.description}</p>
                  )}
                </div>

                {/* Lesson Actions */}
                <div className="lesson-actions">
                  <button
                    className="lesson-start-button"
                    onClick={() => onSelectLesson(lesson.id)}
                    aria-label={`${t('lessons.startLesson')}: ${lesson.title}`}
                  >
                    {t('lessons.startLesson')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonSelection;
