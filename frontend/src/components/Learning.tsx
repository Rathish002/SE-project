/**
 * Learning Page Component
 * Matches epic1 layout exactly but implemented in React/TypeScript
 * Grid layout: main content (1fr) + keywords sidebar (300px)
 * Header with navigation and accessibility controls
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { getLearningDirection } from '../utils/languageManager';
import { fetchLesson, type LessonData } from '../services/lessonService';
import ErrorFallback from './ErrorFallback';
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

  // Accessibility states (local to lesson page)
  const [dyslexiaMode, setDyslexiaMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [autoScroll, setAutoScroll] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(800);

  // TTS states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Load lesson
  useEffect(() => {
    const loadLesson = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchLesson(lessonId, learningDir);
        setLessonData(data);
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
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Apply dyslexia mode
  useEffect(() => {
    if (dyslexiaMode) {
      document.body.classList.add('dyslexia-mode');
    } else {
      document.body.classList.remove('dyslexia-mode');
    }
  }, [dyslexiaMode]);

  // Load dyslexia preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dyslexia-mode');
      if (saved === '1') {
        setDyslexiaMode(true);
      }
    } catch (e) {
      // Ignore
    }
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

  // Play instructions
  const handlePlayInstructions = () => {
    if (lessonData?.lesson.instructions) {
      speakText(lessonData.lesson.instructions);
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

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && contentRef.current) {
      const startAutoScroll = () => {
        if (autoScrollIntervalRef.current) {
          clearInterval(autoScrollIntervalRef.current);
        }

        const pxPerSec = Math.round(
          Math.max(20, Math.min(200, Math.round(((scrollSpeed - 200) / (2000 - 200)) * (200 - 20) + 20)))
        );
        let last = Date.now();

        autoScrollIntervalRef.current = setInterval(() => {
          if (!contentRef.current) return;
          const now = Date.now();
          const dt = (now - last) / 1000;
          last = now;
          const delta = Math.max(1, Math.round(pxPerSec * dt));

          contentRef.current.scrollTop = Math.min(
            contentRef.current.scrollTop + delta,
            contentRef.current.scrollHeight - contentRef.current.clientHeight
          );

          if (
            contentRef.current.scrollTop + contentRef.current.clientHeight >=
            contentRef.current.scrollHeight - 1
          ) {
            setAutoScroll(false);
            if (autoScrollIntervalRef.current) {
              clearInterval(autoScrollIntervalRef.current);
              autoScrollIntervalRef.current = null;
            }
          }
        }, 50);
      };

      startAutoScroll();
    } else {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    }

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [autoScroll, scrollSpeed]);

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

  if (loading) {
    return (
      <div className={`learning-container ${highContrast ? 'high-contrast' : ''}`}>
        <div className="learning-content">
          <p>{t('learning.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !lessonData) {
    return (
      <div className={`learning-container ${highContrast ? 'high-contrast' : ''}`}>
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

  const highlightedContent = highlightKeywords(lessonData.lesson.content);
  const firstSentence = lessonData.lesson.content.split(/[.!?]\s/)[0]?.trim() || '';

  return (
    <div className={`learning-container ${highContrast ? 'high-contrast' : ''}`}>
      <a className="skip-link" href="#content">
        {t('learning.skipToContent')}
      </a>

      <header id="topbar" className="lesson-header">
        <nav className="nav" aria-label="Main navigation">
          <button
            id="backBtn"
            onClick={() => {
              if (lessonId > 1 && onNavigateLesson) {
                onNavigateLesson(lessonId - 1);
              }
            }}
            aria-label={t('learning.navigation.previous')}
            disabled={lessonId <= 1}
          >
            ◀ {t('learning.navigation.previous')}
          </button>
          <div className="nav-title" role="heading" aria-level={1}>
            {t('learning.title')}
          </div>
          <button
            id="nextBtn"
            onClick={() => {
              if (onNavigateLesson) {
                onNavigateLesson(lessonId + 1);
              }
            }}
            aria-label={t('learning.navigation.next')}
          >
            {t('learning.navigation.next')} ▶
          </button>
        </nav>
        <div className="controls" aria-hidden={focusMode}>
          <label>
            <input
              type="checkbox"
              id="dyslexiaToggle"
              checked={dyslexiaMode}
              onChange={(e) => {
                setDyslexiaMode(e.target.checked);
                try {
                  localStorage.setItem('dyslexia-mode', e.target.checked ? '1' : '0');
                } catch (err) {
                  // Ignore
                }
              }}
            />
            {t('learning.accessibility.dyslexiaFont')}
          </label>
          <label>
            <input
              type="checkbox"
              id="contrastToggle"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
            />
            {t('learning.accessibility.highContrast')}
          </label>
          <label>
            <input
              type="checkbox"
              id="distractionToggle"
              checked={focusMode}
              onChange={(e) => onFocusModeChange(e.target.checked)}
            />
            {t('learning.accessibility.distractionFree')}
          </label>
        </div>
      </header>

      <main id="app" role="main" className="lesson-main">
        <section id="lessonHeader" className="lesson-header-section">
          <h1 id="lessonTitle">{lessonData.lesson.title}</h1>
          {firstSentence && (
            <p id="lessonDefinition" className="definition" aria-live="polite">
              {firstSentence}.
            </p>
          )}
          {lessonData.lesson.image_url && (
            <img
              id="lessonImage"
              src={lessonData.lesson.image_url}
              alt={lessonData.lesson.title}
              className="lesson-image"
            />
          )}
        </section>

        <section id="controls" className="lesson-controls" aria-label="Playback and pacing controls">
          <div className="tts-controls">
            <button id="playBtn" onClick={isPaused ? handleResume : handlePlay} disabled={isPlaying && !isPaused}>
              {isPaused ? t('learning.controls.play') : isPlaying ? t('learning.controls.pause') : t('learning.controls.play')}
            </button>
            {isPlaying && !isPaused && (
              <button id="pauseBtn" onClick={handlePause}>
                {t('learning.controls.pause')}
              </button>
            )}
            <button id="stopBtn" onClick={handleStop} disabled={!isPlaying && !isPaused}>
              {t('learning.controls.stop')}
            </button>
            <label>
              {t('learning.controls.speed')}{' '}
              <input
                id="speed"
                type="range"
                min="0.75"
                max="1.5"
                step="0.25"
                value={preferences.audioSpeed}
                onChange={(e) => {
                  const newSpeed = parseFloat(e.target.value) as AudioSpeed;
                  updateAudioSpeed(newSpeed);
                  if (synthRef.current && synthRef.current.speaking && utteranceRef.current) {
                    const wasPaused = synthRef.current.paused;
                    const currentText = utteranceRef.current.text;
                    synthRef.current.cancel();
                    if (!wasPaused) {
                      speakText(currentText, newSpeed);
                    }
                  }
                }}
              />
            </label>
          </div>
          <div className="pacing-controls">
            <label>
              {t('learning.controls.autoScroll')}{' '}
              <input
                id="autoscroll"
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
              />
            </label>
            <label>
              {t('learning.controls.scrollSpeed')}{' '}
              <input
                id="scrollSpeed"
                type="range"
                min="200"
                max="2000"
                step="100"
                value={scrollSpeed}
                onChange={(e) => setScrollSpeed(parseInt(e.target.value, 10))}
              />
            </label>
          </div>
        </section>

        {lessonData.lesson.instructions && (
          <section id="instructions" className="lesson-instructions">
            <h2>{t('learning.instructions')}</h2>
            <div id="instructionText">{lessonData.lesson.instructions}</div>
            <button id="instrAudio" onClick={handlePlayInstructions}>
              {t('learning.playInstructions')}
            </button>
          </section>
        )}

        <div className="exercises-section">
          <button
            className="exercises-button"
            onClick={onNavigateToExercises}
            aria-label={t('lessons.goToExercises')}
          >
            {t('lessons.goToExercises')}
          </button>
        </div>


        <article
          id="content"
          ref={contentRef}
          className="lesson-content"
          tabIndex={0}
          aria-live="polite"
          dangerouslySetInnerHTML={{ __html: highlightedContent }}
        />

        {lessonData.keywords && lessonData.keywords.length > 0 && (
          <aside id="keywords" className="keywords-sidebar" aria-label={t('learning.keywords')}>
            <h3>{t('learning.keywords')}</h3>
            <ul id="keywordList" className="keyword-list">
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
      </main>

      {focusMode && (
        <button
          id="exitDistraction"
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
