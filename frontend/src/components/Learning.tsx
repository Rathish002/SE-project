/**
 * Learning Page Component
 * Clean, focused reading experience for lesson content
 * Single-column centered layout with minimal controls
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { getLearningDirection } from '../utils/languageManager';
import { fetchLesson, getAvailableLessonIds, type LessonData } from '../services/lessonService';
import ErrorFallback from './ErrorFallback';
import Evaluation from './Evaluation';
import type { AudioSpeed } from '../types/accessibility';
import './Learning.css';

interface LearningProps {
  lessonId: number;
  onBack: () => void;
  onNavigateLesson?: (lessonId: number) => void;
  focusMode: boolean;
  onFocusModeChange: (enabled: boolean) => void;
  onNavigateToExercises?: () => void;
}

const Learning: React.FC<LearningProps> = ({
  lessonId,
  onBack,
  onNavigateLesson,
  focusMode,
  onFocusModeChange,
  onNavigateToExercises
}) => {
  const { t } = useTranslation();
  const { preferences, updateAudioSpeed } = useAccessibility();
  const learningDir = getLearningDirection();

  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [totalLessons, setTotalLessons] = useState(0);

  // TTS states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Load lesson and total count
  useEffect(() => {
    const loadLesson = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchLesson(lessonId, learningDir);
        setLessonData(data);
        setTotalLessons(getAvailableLessonIds().length);
      } catch (err) {
        console.error('Error loading lesson:', err);
        setError(t('learning.error'));
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [lessonId, learningDir, t]);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Highlight keywords in content
  const highlightKeywords = (text: string): string => {
    if (!lessonData || !lessonData.keywords || lessonData.keywords.length === 0) {
      return text;
    }

    const sortedKeywords = [...lessonData.keywords].sort(
      (a, b) => b.keyword.length - a.keyword.length
    );
    let result = text;

    sortedKeywords.forEach((kw) => {
      const escaped = kw.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b(${escaped})\\b`, 'gi');
      result = result.replace(regex, (match) => {
        return `<span class="kw-highlight" data-keyword="${match}" tabindex="0" role="button" aria-label="${t('learning.keywords')}: ${match}">${match}</span>`;
      });
    });

    return result;
  };

  // Speak text
  const speakText = useCallback((text: string, speed?: number) => {
    if (!synthRef.current || !text) return;

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed !== undefined ? speed : preferences.audioSpeed;
    utterance.lang = learningDir === 'hi-to-en' ? 'en-US' : 'hi-IN';

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  }, [preferences.audioSpeed, learningDir]);

  // Play lesson
  const handlePlay = useCallback(() => {
    if (!lessonData) return;
    const textToSpeak = lessonData.lesson.instructions
      ? `${lessonData.lesson.instructions}\n\n${lessonData.lesson.content}`
      : lessonData.lesson.content;
    speakText(textToSpeak);
  }, [lessonData, speakText]);

  // Pause TTS
  const handlePause = () => {
    if (synthRef.current && synthRef.current.speaking && !synthRef.current.paused) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };

  // Resume TTS
  const handleResume = () => {
    if (synthRef.current && synthRef.current.paused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  };

  // Stop TTS
  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  // Handle keyword click
  const handleKeywordClick = useCallback((keywordText: string) => {
    if (!lessonData) return;
    const keyword = lessonData.keywords.find(
      (kw) => kw.keyword.toLowerCase() === keywordText.toLowerCase()
    );
    if (keyword) {
      speakText(keyword.explanation || keyword.keyword);
    }
  }, [lessonData, speakText]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && document.activeElement === document.body) {
        e.preventDefault();
        if (synthRef.current) {
          if (synthRef.current.speaking && !synthRef.current.paused) {
            handlePause();
          } else if (synthRef.current.paused) {
            handleResume();
          } else {
            handlePlay();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlay]);

  // Enter/exit fullscreen when focus mode changes
  useEffect(() => {
    const applyFullscreen = async () => {
      try {
        const el: any = document.documentElement;
        if (focusMode) {
          if (!document.fullscreenElement) {
            if (el.requestFullscreen) {
              await el.requestFullscreen();
            } else if (el.webkitRequestFullscreen) {
              el.webkitRequestFullscreen();
            }
          }
        } else {
          if (document.fullscreenElement) {
            if (document.exitFullscreen) {
              await document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
              (document as any).webkitExitFullscreen();
            }
          }
        }
      } catch (err) {
        console.warn('Fullscreen API error:', err);
      }
    };

    applyFullscreen();
  }, [focusMode, onFocusModeChange]);

  // Sync focus mode with fullscreen state
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement && focusMode) {
        onFocusModeChange(false);
      }
    };

    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange as EventListener);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange as EventListener);
    };
  }, [focusMode, onFocusModeChange]);

  // Handle highlighted keyword clicks
  useEffect(() => {
    const handleKeywordElementClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('kw-highlight')) {
        const keywordText = target.textContent?.trim();
        if (keywordText) {
          handleKeywordClick(keywordText);
        }
      }
    };

    const handleKeywordElementKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('kw-highlight') && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        const keywordText = target.textContent?.trim();
        if (keywordText) {
          handleKeywordClick(keywordText);
        }
      }
    };

    document.addEventListener('click', handleKeywordElementClick);
    document.addEventListener('keydown', handleKeywordElementKeyDown);

    return () => {
      document.removeEventListener('click', handleKeywordElementClick);
      document.removeEventListener('keydown', handleKeywordElementKeyDown);
    };
  }, [lessonData, handleKeywordClick]);

  // Loading state
  if (loading) {
    return (
      <div className="learning-container">
        <div className="learning-content">
          <p>{t('learning.loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !lessonData) {
    return (
      <div className="learning-container">
        <ErrorFallback
          error={error || t('learning.error')}
          title={t('learning.errorTitle')}
          message={t('learning.errorMessage')}
          onRetry={() => {
            setError(null);
            setLoading(true);
            fetchLesson(lessonId, learningDir)
              .then((data) => {
                setLessonData(data);
                setLoading(false);
              })
              .catch((err) => {
                console.error('Error loading lesson:', err);
                setError(t('learning.error'));
                setLoading(false);
              });
          }}
          onGoBack={onBack}
        />
      </div>
    );
  }

  // Evaluation view
  if (showEvaluation && lessonData) {
    return (
      <div className="learning-container">
        <Evaluation
          lessonId={lessonId}
          lessonTitle={lessonData.lesson.title}
          onExit={() => setShowEvaluation(false)}
        />
      </div>
    );
  }

  const highlightedContent = highlightKeywords(lessonData.lesson.content);
  const progressPercentage = totalLessons > 0 ? (lessonId / totalLessons) * 100 : 0;

  return (
    <div className="learning-container">
      <a className="skip-link" href="#content">
        {t('learning.skipToContent')}
      </a>

      {/* Minimal Header */}
      <header className="lesson-header">
        <nav className="nav" aria-label="Lesson navigation">
          <button
            onClick={() => {
              if (lessonId > 1 && onNavigateLesson) {
                onNavigateLesson(lessonId - 1);
              } else {
                onBack();
              }
            }}
            aria-label={lessonId > 1 ? t('learning.navigation.previous') : 'Back to lessons'}
          >
            ← {lessonId > 1 ? t('learning.navigation.previous') : 'Lessons'}
          </button>

          {/* Progress Indicator */}
          <div className="progress-indicator">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span>{lessonId} / {totalLessons}</span>
          </div>

          <button
            onClick={() => {
              if (onNavigateLesson && lessonId < totalLessons) {
                onNavigateLesson(lessonId + 1);
              }
            }}
            disabled={lessonId >= totalLessons}
            aria-label={t('learning.navigation.next')}
          >
            {t('learning.navigation.next')} →
          </button>
        </nav>

        {/* Focus Mode Toggle Only */}
        <div className="controls">
          <label>
            <input
              type="checkbox"
              checked={focusMode}
              onChange={(e) => onFocusModeChange(e.target.checked)}
            />
            {t('learning.accessibility.distractionFree')}
          </label>
        </div>
      </header>

      {/* Main Content */}
      <main className="lesson-main" role="main">
        {/* Lesson Title Section */}
        <section className="lesson-header-section">
          <h1 id="lessonTitle">{lessonData.lesson.title}</h1>
          {lessonData.lesson.instructions && (
            <p className="definition">{lessonData.lesson.instructions}</p>
          )}
          {lessonData.lesson.image_url && (
            <img
              src={lessonData.lesson.image_url}
              alt={lessonData.lesson.title}
              className="lesson-image"
            />
          )}
        </section>

        {/* Audio Controls */}
        <section className="lesson-controls" aria-label="Audio controls">
          <div className="tts-controls">
            <button
              id="playBtn"
              onClick={isPaused ? handleResume : handlePlay}
              disabled={isPlaying && !isPaused}
            >
              {isPaused ? 'Resume' : isPlaying ? 'Playing...' : t('learning.controls.play')}
            </button>
            {(isPlaying || isPaused) && (
              <button id="stopBtn" onClick={handleStop}>
                {t('learning.controls.stop')}
              </button>
            )}
            <label>
              {t('learning.controls.speed')}
              <input
                type="range"
                min="0.75"
                max="1.5"
                step="0.25"
                value={preferences.audioSpeed}
                onChange={(e) => {
                  const newSpeed = parseFloat(e.target.value) as AudioSpeed;
                  updateAudioSpeed(newSpeed);
                }}
              />
            </label>
          </div>
        </section>

        {/* Main Content Card */}
        <article
          id="content"
          ref={contentRef}
          tabIndex={0}
          aria-live="polite"
          dangerouslySetInnerHTML={{ __html: highlightedContent }}
        />

        {/* Keywords Section (Inline) */}
        {lessonData.keywords && lessonData.keywords.length > 0 && (
          <aside className="keywords-sidebar" aria-label={t('learning.keywords')}>
            <h3>{t('learning.keywords')}</h3>
            <ul className="keyword-list">
              {lessonData.keywords.map((kw, index) => (
                <li key={index}>
                  <button
                    className="keyword"
                    onClick={() => handleKeywordClick(kw.keyword)}
                    aria-label={`${t('learning.keywords')}: ${kw.keyword}`}
                  >
                    {kw.keyword}
                  </button>
                  <div className="keyword-explanation">{kw.explanation}</div>
                </li>
              ))}
            </ul>
          </aside>
        )}

        {/* Exercise Buttons */}
        <div className="exercises-section">
          <button
            className="exercises-button"
            onClick={onNavigateToExercises}
            aria-label={t('lessons.goToExercises')}
          >
            {t('lessons.goToExercises')}
          </button>
          <button
            className="evaluation-button"
            onClick={() => setShowEvaluation(true)}
            aria-label={'Evaluate yourself'}
          >
            {'Evaluate Yourself'}
          </button>
        </div>
      </main>

      {/* Focus Mode Exit Button */}
      {focusMode && (
        <button
          className="exit-distraction"
          onClick={() => onFocusModeChange(false)}
          aria-label={t('learning.accessibility.exitDistraction')}
        >
          {t('learning.accessibility.exitDistraction')}
        </button>
      )}
    </div>
  );
};

export default Learning;
