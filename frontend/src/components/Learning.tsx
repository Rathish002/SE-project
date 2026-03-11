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

  // Scroll to top on lesson change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [lessonId]);

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
    <div className="learning-container learning-container-v2">

      {/* Modern Top Header */}
      <header className="lesson-nav-header">
        <div className="nav-group-left">
           <button className="nav-text-btn" onClick={onBack}>
              &larr; {t('learning.navigation.lessons')}
           </button>
        </div>

        <div className="nav-group-center">
            <div className="progress-group">
                <div className="progress-bar-v2">
                   <div className="progress-fill-v2" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <span className="progress-count">{lessonId} / {totalLessons}</span>
            </div>
        </div>

        <div className="nav-group-right">
            <button 
              className="nav-text-btn" 
              onClick={() => onNavigateLesson && lessonId < totalLessons && onNavigateLesson(lessonId + 1)}
              disabled={lessonId >= totalLessons}
            >
               {t('learning.navigation.next')} &rarr;
            </button>
            <div className="distraction-mode-toggle">
                <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={focusMode}
                      onChange={(e) => onFocusModeChange(e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    <span className="toggle-label">{t('learning.accessibility.distractionFree')}</span>
                </label>
            </div>
        </div>
      </header>

      {/* Single Column Main Content */}
      <main className="lesson-scroll-area">
        <div className="lesson-document">
            {/* Title Block */}
            <h1 className="main-title">{lessonData.lesson.title}</h1>
            {lessonData.lesson.instructions && (
              <p className="subtitle-instructions">{lessonData.lesson.instructions}</p>
            )}

            {/* Premium Audio Control Card */}
            <div className="audio-card-modern">
                <div className="audio-primary-controls">
                    <button 
                      className={`btn-play-rounded ${isPlaying && !isPaused ? 'playing' : ''}`}
                      onClick={isPlaying ? (isPaused ? handleResume : handlePause) : handlePlay}
                    >
                      <span className="icon">
                        {isPaused || !isPlaying ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                          </svg>
                        )}
                      </span>
                      {isPaused ? 'Resume' : isPlaying ? 'Playing' : t('learning.controls.play')}
                    </button>
                    
                    <div className="speed-slider-group">
                        <span className="speed-label">{t('learning.controls.speed')}</span>
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.25"
                          value={preferences.audioSpeed}
                          onChange={(e) => updateAudioSpeed(parseFloat(e.target.value) as AudioSpeed)}
                          className="premium-range"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Box */}
            <article className="content-box-v2" id="content" tabIndex={0}>
               <div dangerouslySetInnerHTML={{ __html: highlightedContent }} />
            </article>

            {/* Key Vocabulary / Keywords Section */}
            {lessonData.keywords && lessonData.keywords.length > 0 && (
              <section className="key-vocabulary">
                 <h2 className="section-heading">
                    <svg className="heading-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                       <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                       <circle cx="12" cy="10" r="3" />
                    </svg>
                    {t('learning.keywords').toUpperCase()}
                 </h2>
                 <div className="keyword-cards-v2">
                    {lessonData.keywords.map((kw, i) => (
                      <div key={i} className="kw-card">
                         <div className="kw-name" onClick={() => handleKeywordClick(kw.keyword)}>
                            {kw.keyword}
                         </div>
                         <div className="kw-def">
                            {kw.explanation}
                         </div>
                      </div>
                    ))}
                 </div>
              </section>
            )}

            {/* Bottom Actions */}
            <div className="completion-actions">
               <button className="btn-action exercises-gradient" onClick={onNavigateToExercises}>
                  {t('lessons.goToExercises')}
               </button>
               <button className="btn-action evaluate-gradient" onClick={() => setShowEvaluation(true)}>
                  {t('learning.navigation.evaluateYourself')}
               </button>
            </div>
        </div>
      </main>

      {/* Focus Mode Overlay UI */}
      {focusMode && (
        <button
          className="exit-focus-overlay"
          onClick={() => onFocusModeChange(false)}
        >
           &times; {t('learning.accessibility.exitDistraction')}
        </button>
      )}
    </div>
  );
};

export default Learning;
