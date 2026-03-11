import React, { useEffect, useState, useRef } from "react";
import "./Exercises.css";
import { fetchExercisesByLesson, saveExerciseProgress } from "../services/exerciseService";
import type { Lesson, LessonStep } from "../types/ExerciseTypes";
import type { Page } from "./Navigation";
import ExercisesContent from "./ExercisesContent";
import ExercisesFeedback from "./ExercisesFeedback";
import ExercisesTTSButton from "./ExercisesTTSButton";
import { useTranslation } from "react-i18next";

interface Stats {
    completed: number;
    hints: number;
    retries: number;
}


interface ExercisesProps {
    onNavigate?: (page: Page) => void;
    onBackToLesson?: () => void;
    lessonId?: number;
    userId?: string;
}

const Exercises: React.FC<ExercisesProps> = ({ onNavigate, onBackToLesson, lessonId, userId }) => {
    const { t } = useTranslation();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lessonIndex, setLessonIndex] = useState(0);

    const [stepIndex, setStepIndex] = useState(() =>
        parseInt(localStorage.getItem('currentStep') || '0')
    );
    const [answer, setAnswer] = useState("");
    const [feedback, setFeedback] = useState("");
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [hintLevel, setHintLevel] = useState(0);
    const [mode, setMode] = useState<"guided" | "independent">(() =>
        (localStorage.getItem('learningMode') as "guided" | "independent") || "guided"
    );
    const [distractionFree, setDistractionFree] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [stats, setStats] = useState<Stats>(() =>
        JSON.parse(localStorage.getItem('stats') || '{"completed": 0, "hints": 0, "retries": 0}')
    );
    const [showCompletion, setShowCompletion] = useState(false);

    // Refs for focus management
    const mainCardRef = useRef<HTMLDivElement>(null);
    const stepHeaderRef = useRef<HTMLHeadingElement>(null);

    // Fetch exercises dynamically from backend when lessonId changes
    useEffect(() => {
        const loadExercises = async () => {
            if (!lessonId) return;
            setLoading(true);
            setError(null);
            try {
                // Ensure lessonId is treated as a number
                const parsedId = typeof lessonId === "string" ? parseInt(lessonId, 10) : lessonId;
                if (isNaN(parsedId)) {
                    throw new Error("Invalid lesson ID");
                }
                const fetchedLessons = await fetchExercisesByLesson(parsedId);
                if (fetchedLessons.length > 0) {
                    setLessons(fetchedLessons);
                    setLessonIndex(0);
                } else {
                    setError("No exercises found for this lesson.");
                }
            } catch (err: any) {
                console.error("Failed to load exercises:", err);
                setError(err.message || "Failed to load exercises");
            } finally {
                setLoading(false);
            }
        };

        loadExercises();
    }, [lessonId]);

    const lesson = lessons[lessonIndex];
    const step: LessonStep | undefined = lesson?.steps[stepIndex]; // step might be undefined if loading or index out of bounds
    const totalSteps = lesson?.steps.length || 0;
    const progressPercentage = totalSteps > 0 ? ((stepIndex) / totalSteps) * 100 : 0;

    // Save progress to localStorage
    useEffect(() => {
        localStorage.setItem('currentLesson', lessonIndex.toString());
        localStorage.setItem('currentStep', stepIndex.toString());
        localStorage.setItem('learningMode', mode);
        localStorage.setItem('stats', JSON.stringify(stats));
    }, [lessonIndex, stepIndex, mode, stats]);

    useEffect(() => {
        // Check if completed all lessons
        if (lessons.length > 0 && lessonIndex >= lessons.length) {
            setShowCompletion(true);
            return;
        }

        // Reset state on step change
        setAnswer("");
        setFeedback("");
        setIsCorrect(null);
        setHintLevel(0);
        setAttempts(0);

        // Focus management for accessibility
        if (stepHeaderRef.current) {
            stepHeaderRef.current.focus();
        }
    }, [stepIndex, lessonIndex, lessons.length]);

    // Enter/exit fullscreen when focus mode (distractionFree) changes
    useEffect(() => {
        const applyFullscreen = async () => {
            try {
                const el: any = document.documentElement;
                if (distractionFree) {
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
    }, [distractionFree]);

    // Sync focus mode with fullscreen state (ESC key handling)
    useEffect(() => {
        const onFsChange = () => {
            if (!document.fullscreenElement && distractionFree) {
                setDistractionFree(false);
            }
        };

        document.addEventListener('fullscreenchange', onFsChange);
        document.addEventListener('webkitfullscreenchange', onFsChange as EventListener);
        return () => {
            document.removeEventListener('fullscreenchange', onFsChange);
            document.removeEventListener('webkitfullscreenchange', onFsChange as EventListener);
        };
    }, [distractionFree]);


    const checkAnswer = () => {
        // Logic for "Free" text type (always correct/self-evaluated for now)
        if (step.type === "free") {
            const userAns = answer.trim();
            const isValid = userAns.split(' ').length >= 3;
            setIsCorrect(isValid);
            setFeedback(isValid ? t('exercises.feedback.greatSentence') : t('exercises.feedback.needsMoreWords'));
            return;
        }

        if (step.type === "read") {
            setIsCorrect(true);
            setFeedback(t('exercises.feedback.readyToMoveOn'));
            return;
        }

        let correct = false;

        // Check directly against the strict string exactly returned by backend logic
        if (step.correct) {
            correct = answer.toLowerCase() === String(step.correct).toLowerCase();
        }

        setIsCorrect(correct);

        // Submit answer to backend (fire and forget or wait?)
        // We already have `userId` in App context but it's not passed here. 
        // For now, let's assume valid user if they are here. 
        // We'll need to update `ExercisesProps` or use a context to get userId if we want to save properly.
        // Assuming we might not have userId readily available in this component without Context, 
        // I will skip `userId` for now or use a placeholder if valid.
        // Actually, `App.tsx` has `user` state. It should be passed or accessed via Context.
        // Since I didn't update App to pass user, and `useUser` isn't standard here, I will check if I can get current user from firebase auth directly.

        // Save progress if correct
        if (correct && lessonId) {
            // We need a userId. Let's try to get it safely.
            // Ideally we'd pass `user` prop. but for now let's rely on local state updates.
        }

        if (correct) {
            setFeedback(`🎉 ${t('exercises.feedback.correctAnswer')}`);

            // Save progress to backend silently
            if (userId && lessonId) {
                const dbExerciseId = parseInt(lessons[lessonIndex].id, 10);

                if (!isNaN(dbExerciseId)) {
                    // Save progress as 'completed step'
                    saveExerciseProgress(
                        userId,
                        dbExerciseId,
                        stepIndex + 1,
                        stepIndex + 1, // sending step as completed
                        false // not fully completed lesson yet
                    ).catch(err => console.warn("Background save failed:", err));
                }
            }

        } else {
            // Error recovery with encouragement
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            setStats(prev => ({ ...prev, retries: prev.retries + 1 }));

            const encouragements = [
                "Not quite, but you're thinking in the right direction! 💪",
                "Good try! Let's look at this from another angle. 🤔",
                "You're close! Take another look at the clues. 🔍",
                "Learning happens through trying! Give it another shot. 🌟"
            ];

            const encouragement = encouragements[Math.min(newAttempts - 1, encouragements.length - 1)];
            setFeedback(encouragement);
        }
    };

    const nextStep = () => {
        const dbExerciseId = parseInt(lessons[lessonIndex].id, 10);

        if (stepIndex < lesson.steps.length - 1) {
            setStepIndex(stepIndex + 1);
        } else if (lessonIndex < lessons.length - 1) {
            // Save progress before switching lesson
            if (userId && !isNaN(dbExerciseId)) {
                saveExerciseProgress(
                    userId,
                    dbExerciseId,
                    lessons[lessonIndex].steps.length,
                    lessons[lessonIndex].steps.length,
                    true // Completed this lesson/exercise
                );
            }

            setLessonIndex(lessonIndex + 1);
            setStepIndex(0);
            setStats(prev => ({ ...prev, completed: prev.completed + 1 }));
        } else {
            if (userId && !isNaN(dbExerciseId)) {
                saveExerciseProgress(
                    userId,
                    dbExerciseId,
                    lessons[lessonIndex].steps.length,
                    lessons[lessonIndex].steps.length,
                    true // Completed this lesson/exercise
                );
            }
            setStats(prev => ({ ...prev, completed: prev.completed + 1 }));
            setShowCompletion(true);
        }
    };

    const retryStep = () => {
        setAnswer("");
        setFeedback("");
        setIsCorrect(null);
    };

    const switchLesson = (index: number) => {
        setLessonIndex(index);
        setStepIndex(0);
    };

    const handleHint = () => {
        if (hintLevel < step.hints.length) {
            setHintLevel(prev => prev + 1);
            setStats(prev => ({ ...prev, hints: prev.hints + 1 }));
        }
    };

    const resetProgress = () => {
        localStorage.clear();
        window.location.reload();
    };

    // Completion Screen
    if (showCompletion) {
        return (
            <div className="lesson-container">
                <div className="main-card completion-celebration">
                    <div className="emoji">🎉</div>
                    <h2 className="completion-title">{t('exercises.completion.title')}</h2>
                    <p className="completion-message">
                        {t('exercises.completion.message')}
                    </p>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">{lessons.length}</div>
                            <div className="stat-label">{t('exercises.completion.stats.lessons')}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.hints}</div>
                            <div className="stat-label">{t('exercises.completion.stats.hints')}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.retries}</div>
                            <div className="stat-label">{t('exercises.completion.stats.attempts')}</div>
                        </div>
                    </div>

                    <div className="completion-actions">
                        <button onClick={resetProgress} className="success-btn">
                            {t('exercises.completion.startOver')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="lesson-container">
                <div className="main-card loading-state">
                    <h2>Loading exercises...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="lesson-container">
                <div className="main-card error-state">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button className="back-btn" onClick={() => onBackToLesson ? onBackToLesson() : onNavigate?.('lessons')}>
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!lesson || !step) {
        return <div>{t('exercises.noExercisesFound')}</div>;
    }

    return (
        <div className={`lesson-container ${distractionFree ? "focus-mode" : ""}`}>

            {!distractionFree && (
                <header className="lesson-header">
                    <button
                        className="back-btn"
                        onClick={() => onBackToLesson ? onBackToLesson() : onNavigate?.('lessons')}
                        aria-label={t('exercises.header.backToLesson')}
                    >
                        ← {t('exercises.header.backToLesson')}
                    </button>
                    <h2>🎓 {t('exercises.header.title')}</h2>
                </header>
            )}

            <div className="main-card" ref={mainCardRef}>

                {/* Controls Row */}
                <div className="controls-row">
                    {!distractionFree && (
                        <div className="mode-toggle compact">
                            <button
                                className={`mode-pill ${mode === "guided" ? "active" : ""}`}
                                onClick={() => setMode("guided")}
                                aria-pressed={mode === "guided"}
                            >
                                🧭 {t('exercises.controls.guided')}
                            </button>
                            <button
                                className={`mode-pill ${mode === "independent" ? "active" : ""}`}
                                onClick={() => setMode("independent")}
                                aria-pressed={mode === "independent"}
                            >
                                🚀 {t('exercises.controls.independent')}
                            </button>
                        </div>
                    )}

                    <button
                        className={`focus-btn ${distractionFree ? "active" : ""}`}
                        onClick={() => setDistractionFree(!distractionFree)}
                        aria-label={distractionFree ? t('exercises.controls.exitFocusMode') : t('exercises.controls.enterFocusMode')}
                    >
                        {distractionFree ? t('exercises.controls.exitFocus') : `👁️ ${t('exercises.controls.focusMode')}`}
                    </button>
                </div>

                {/* Schedule / Tabs */}
                {!distractionFree && (
                    <>
                        <div className="progress-section">
                            <div className="progress-labels">
                                <span aria-hidden="true">{t('exercises.progress.label')}</span>
                                <span>{Math.round(progressPercentage)}%</span>
                            </div>
                            <div className="progress-bar-track" role="progressbar" aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100}>
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>

                        {lessons.length > 1 && (
                            <div className="lesson-tabs" role="tablist">
                                {lessons.map((l, idx) => (
                                    <button
                                        key={idx}
                                        role="tab"
                                        aria-selected={idx === lessonIndex}
                                        className={`tab ${idx === lessonIndex ? "active" : ""}`}
                                        onClick={() => switchLesson(idx)}
                                    >
                                        {idx + 1}. {l.title ? l.title.split(" ")[0] : `Exercise ${idx + 1}`}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Content Area */}
                <div className="content-area">
                    <div className="step-metadata">
                        <span className="visual-schedule">{t('exercises.progress.stepXofY', { step: stepIndex + 1, total: totalSteps })}</span>
                        <span className={`difficulty-badge ${lesson.difficulty}`}>{t(`exercises.difficulty.${lesson.difficulty}`, { defaultValue: lesson.difficulty })}</span>
                    </div>

                    <div className="step-header-row">
                        <h3 ref={stepHeaderRef} tabIndex={-1} className="step-title">
                            {t(`lessonData.lesson-${lesson.id}.steps.${stepIndex}.instruction`, { defaultValue: step.instruction })}
                        </h3>
                        <ExercisesTTSButton text={t(`lessonData.lesson-${lesson.id}.steps.${stepIndex}.instruction`, { defaultValue: step.instruction }) as string} />
                    </div>

                    {/* Micro Steps (Visual Schedule) */}
                    <div className="micro-steps">
                        {(lesson.microSteps || []).map((ms, idx) => (
                            <div key={idx} className={`micro-step ${idx <= stepIndex ? "current" : ""} ${idx < stepIndex ? "completed" : ""}`}>
                                <span className="check-icon" aria-hidden="true">
                                    {idx < stepIndex ? "✅" : idx === stepIndex ? "➡️" : "○"}
                                </span>
                                <span>{ms}</span>
                            </div>
                        ))}
                    </div>

                    <hr className="divider" />

                    {/* Task Content Display */}
                    <div className="task-display">
                        <div className="task-content-text">
                            <strong>{t(`lessonData.lesson-${lesson.id}.steps.${stepIndex}.content`, { defaultValue: step.content })}</strong>
                        </div>
                        {step.task && (
                            <div className="task-question">
                                {t(`lessonData.lesson-${lesson.id}.steps.${stepIndex}.task`, { defaultValue: step.task })}
                            </div>
                        )}
                    </div>

                    {/* Modular Lesson Content */}
                    <ExercisesContent
                        lessonId={lesson.id}
                        stepIndex={stepIndex}
                        step={step}
                        answer={answer}
                        setAnswer={setAnswer}
                        checkAnswer={checkAnswer}
                        feedback={feedback}
                        isCorrect={isCorrect}
                    />

                    {/* Feedback & Actions */}
                    <div className="footer-actions">

                        <ExercisesFeedback
                            isCorrect={isCorrect}
                            message={feedback}
                            onRetry={retryStep}
                        />

                        {/* Hints: Only in Guided Mode & When not correct yet */}
                        {mode === "guided" && !isCorrect && (
                            <div className="hint-section">
                                <div className="hint-controls">
                                    <button
                                        className="hint-btn"
                                        onClick={handleHint}
                                        disabled={hintLevel >= step.hints.length}
                                        aria-label={t('exercises.hints.getHint')}
                                    >
                                        💡 {hintLevel >= step.hints.length ? t('exercises.hints.allUsed') : t('exercises.hints.needAHint')}
                                    </button>
                                    <span className="hint-count" aria-live="polite">
                                        {hintLevel > 0 ? t('exercises.hints.usedCount', { current: hintLevel, total: step.hints.length }) : ""}
                                    </span>
                                </div>

                                {hintLevel > 0 && (
                                    <div className="active-hints" role="region" aria-label={t('exercises.hints.label')}>
                                        {((t(`lessonData.lesson-${lesson.id}.steps.${stepIndex}.hints`, { returnObjects: true, defaultValue: step.hints }) as string[]) || []).slice(0, hintLevel).map((h, i) => (
                                            <div key={i} className="hint-bubble">
                                                <strong>{t('exercises.hints.hintNumber', { number: i + 1 })}:</strong> {h}
                                                <ExercisesTTSButton text={h} label={t('exercises.hints.listenToHint')} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Next Button - Only appears when correct or reading */}
                        {isCorrect && (
                            <button
                                className="next-btn"
                                onClick={nextStep}
                                autoFocus
                            >
                                {t('exercises.actions.nextStep')} ➔
                            </button>
                        )}
                    </div>

                </div>

                {/* Left Arrow Button -> Return to Lesson */}
                <div className="exercise-nav-arrows">
                    <button
                        className="exercise-nav-arrow left"
                        onClick={() => onBackToLesson ? onBackToLesson() : onNavigate?.('lessons')}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onBackToLesson ? onBackToLesson() : onNavigate?.('lessons');
                            }
                        }}
                        tabIndex={0}
                        aria-label="Return to Lesson"
                        title="Return to Lesson"
                    >
                        <span>◀</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Exercises;
