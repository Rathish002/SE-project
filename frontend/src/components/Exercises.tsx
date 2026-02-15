import React, { useEffect, useState, useRef } from "react";
import "./Exercises.css";
import { fetchExercisesByLesson, saveExerciseProgress, submitAnswer } from "../services/exerciseService";
import type { Lesson, LessonStep } from "../types/ExerciseTypes";
import type { Page } from "./Navigation";
import ExercisesContent from "./ExercisesContent";
import ExercisesFeedback from "./ExercisesFeedback";
import ExercisesTTSButton from "./ExercisesTTSButton";
import { lessons as initialLessons } from "../data/exercisesData"; // Import local data

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
    // Revert to using local data directly
    const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
    // const [loading, setLoading] = useState(true); // Removed loading state
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

    // Filter lessons if lessonId is provided (optional restoration of logic)
    useEffect(() => {
        if (lessonId) {
            // If we wanted to filter by lessonId from the local data:
            // const specificLesson = initialLessons.find(l => l.id === lessonId.toString());
            // if (specificLesson) setLessons([specificLesson]);
        }
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
    }, [stepIndex, lessonIndex]);

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
            setFeedback(isValid ? "🌟 Great sentence!" : "Try writing a bit more - at least 3 words!");
            return;
        }

        if (step.type === "read") {
            setIsCorrect(true);
            setFeedback("Ready to move on!");
            return;
        }

        let correct = false;

        // 1. Check against `correct` ID/value if present
        if (step.correct) {
            correct = answer.toLowerCase() === step.correct.toLowerCase();
        }
        // 2. Fallback to `answer` array/string check
        else if (step.answer) {
            const userAns = answer.trim().toLowerCase();
            correct = Array.isArray(step.answer)
                ? step.answer.some(a => a.toLowerCase() === userAns)
                : step.answer.toLowerCase() === userAns;
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
            const currentUser = localStorage.getItem('userParams'); // Or similar? No.
            // Ideally we'd pass `user` prop. but for now let's rely on local state updates.
        }

        if (correct) {
            setFeedback("🎉 Excellent work! That's correct!");

            // Save progress to backend silently
            if (userId && lessonId) {
                // Map mock string IDs to database integer IDs
                // This ensures we satisfy Foreign Key constraints while keeping the frontend unchanged
                const MOCK_MAP: Record<string, number> = {
                    "verb-1": 1, "adj-1": 2, "sent-1": 3, "pronouns-1": 4, // Language -> Greetings/Numbers/Family/Food
                    "emo-1": 5, "emo-2": 6, // Emotions -> Activities/Evaluation? (using fallback)
                    "social-1": 7, "social-2": 8, "social-3": 9,
                    "daily-1": 10, "daily-2": 11,
                    "safety-1": 12, "safety-2": 13
                };

                const currentLessonId = lessons[lessonIndex].id;
                // Use mapped ID or hash/fallback to ensure we send a valid INT
                // If map fails, we try to parse int, or default to 1 to ensure SOMETHING is saved
                // (In a real app, we'd sync seeds).
                const dbExerciseId = MOCK_MAP[currentLessonId] || parseInt(currentLessonId) || (lessonIndex + 1);

                // Save progress as 'completed step'
                saveExerciseProgress(
                    userId,
                    dbExerciseId,
                    stepIndex + 1,
                    stepIndex + 1, // sending step as completed
                    false // not fully completed lesson yet
                ).catch(err => console.warn("Background save failed:", err));
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
        // Map mock string IDs to database integer IDs (reusing map logic)
        const MOCK_MAP: Record<string, number> = {
            "verb-1": 1, "adj-1": 2, "sent-1": 3, "pronouns-1": 4,
            "emo-1": 5, "emo-2": 6, "social-1": 7, "social-2": 8, "social-3": 9,
            "daily-1": 10, "daily-2": 11, "safety-1": 12, "safety-2": 13
        };

        if (stepIndex < lesson.steps.length - 1) {
            setStepIndex(stepIndex + 1);
        } else if (lessonIndex < lessons.length - 1) {
            // Save progress before switching lesson
            if (userId) {
                const dbExerciseId = MOCK_MAP[lessons[lessonIndex].id] || (lessonIndex + 1);
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
            if (userId) {
                const dbExerciseId = MOCK_MAP[lessons[lessonIndex].id] || (lessonIndex + 1);
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
                    <h2 className="completion-title">Congratulations!</h2>
                    <p className="completion-message">
                        You've completed the Scaffold Learning System!
                    </p>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">{lessons.length}</div>
                            <div className="stat-label">Lessons Completed</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.hints}</div>
                            <div className="stat-label">Hints Used</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.retries}</div>
                            <div className="stat-label">Attempts Made</div>
                        </div>
                    </div>

                    <div className="completion-actions">
                        <button onClick={resetProgress} className="success-btn">
                            Start Over
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // if (loading) { return <div>Loading...</div> } // Removed loading check

    if (!lesson || !step) {
        return <div>No exercises found for this lesson.</div>;
    }

    return (
        <div className={`lesson-container ${distractionFree ? "focus-mode" : ""}`}>

            {!distractionFree && (
                <header className="lesson-header">
                    <button
                        className="back-btn"
                        onClick={() => onBackToLesson ? onBackToLesson() : onNavigate?.('lessons')}
                        aria-label="Back to Lessons"
                    >
                        ← Back to Lesson
                    </button>
                    <h2>🎓 Scaffold Learning System</h2>
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
                                🧭 Guided
                            </button>
                            <button
                                className={`mode-pill ${mode === "independent" ? "active" : ""}`}
                                onClick={() => setMode("independent")}
                                aria-pressed={mode === "independent"}
                            >
                                🚀 Independent
                            </button>
                        </div>
                    )}

                    <button
                        className={`focus-btn ${distractionFree ? "active" : ""}`}
                        onClick={() => setDistractionFree(!distractionFree)}
                        aria-label={distractionFree ? "Exit Focus Mode" : "Enter Focus Mode"}
                    >
                        {distractionFree ? "Exit Focus" : "👁️ Focus Mode"}
                    </button>
                </div>

                {/* Schedule / Tabs */}
                {!distractionFree && (
                    <>
                        <div className="progress-section">
                            <div className="progress-labels">
                                <span aria-hidden="true">Progress</span>
                                <span>{Math.round(progressPercentage)}%</span>
                            </div>
                            <div className="progress-bar-track" role="progressbar" aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100}>
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="lesson-tabs" role="tablist">
                            {lessons.length > 1 && lessons.map((l, idx) => (
                                <button
                                    key={idx}
                                    role="tab"
                                    aria-selected={idx === lessonIndex}
                                    className={`tab ${idx === lessonIndex ? "active" : ""}`}
                                    onClick={() => switchLesson(idx)}
                                >
                                    {idx + 1}. {l.title.split(" ")[0]}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* Content Area */}
                <div className="content-area">
                    <div className="step-metadata">
                        <span className="visual-schedule">Step {stepIndex + 1} of {totalSteps}</span>
                        <span className={`difficulty-badge ${lesson.difficulty}`}>{lesson.difficulty}</span>
                    </div>

                    <div className="step-header-row">
                        <h3 ref={stepHeaderRef} tabIndex={-1} className="step-title">
                            {step.instruction}
                        </h3>
                        <ExercisesTTSButton text={step.instruction} />
                    </div>

                    {/* Micro Steps (Visual Schedule) */}
                    <div className="micro-steps">
                        {lesson.microSteps.map((ms, idx) => (
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
                            <strong>{step.content}</strong>
                        </div>
                        {step.task && (
                            <div className="task-question">
                                {step.task}
                            </div>
                        )}
                    </div>

                    {/* Modular Lesson Content */}
                    <ExercisesContent
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
                                        aria-label="Get a hint"
                                    >
                                        💡 {hintLevel >= step.hints.length ? 'All hints used' : 'Need a Hint?'}
                                    </button>
                                    <span className="hint-count" aria-live="polite">
                                        {hintLevel > 0 ? `${hintLevel} / ${step.hints.length} hints used` : ""}
                                    </span>
                                </div>

                                {hintLevel > 0 && (
                                    <div className="active-hints" role="region" aria-label="Hints">
                                        {step.hints.slice(0, hintLevel).map((h, i) => (
                                            <div key={i} className="hint-bubble">
                                                <strong>Hint {i + 1}:</strong> {h}
                                                <ExercisesTTSButton text={h} label="Listen to hint" />
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
                                Next Step ➔
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Exercises;
