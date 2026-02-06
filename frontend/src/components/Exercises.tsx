import React, { useEffect, useState, useRef } from "react";
import "./Exercises.css";
import { lessons } from "../data/exercisesData";
import type { LessonStep } from "../types/ExerciseTypes";
import type { Page } from "./Navigation";
import ExercisesContent from "./ExercisesContent";
import ExercisesFeedback from "./ExercisesFeedback";
import ExercisesTTSButton from "./ExercisesTTSButton";

interface Stats {
    completed: number;
    hints: number;
    retries: number;
}


interface ExercisesProps {
    onNavigate?: (page: Page) => void;
}

const Exercises: React.FC<ExercisesProps> = ({ onNavigate }) => {
    const [lessonIndex, setLessonIndex] = useState(() =>
        parseInt(localStorage.getItem('currentLesson') || '0')
    );
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

    const lesson = lessons[lessonIndex];
    const step: LessonStep = lesson?.steps[stepIndex];
    const totalSteps = lesson?.steps.length || 0;
    const progressPercentage = ((stepIndex) / totalSteps) * 100;

    // Save progress to localStorage
    useEffect(() => {
        localStorage.setItem('currentLesson', lessonIndex.toString());
        localStorage.setItem('currentStep', stepIndex.toString());
        localStorage.setItem('learningMode', mode);
        localStorage.setItem('stats', JSON.stringify(stats));
    }, [lessonIndex, stepIndex, mode, stats]);

    useEffect(() => {
        // Check if completed all lessons
        if (lessonIndex >= lessons.length) {
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

        if (correct) {
            setFeedback("🎉 Excellent work! That's correct!");
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
        if (stepIndex < lesson.steps.length - 1) {
            setStepIndex(stepIndex + 1);
        } else if (lessonIndex < lessons.length - 1) {
            setLessonIndex(lessonIndex + 1);
            setStepIndex(0);
            setStats(prev => ({ ...prev, completed: prev.completed + 1 }));
        } else {
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
                    <h2 style={{ color: '#2193b0', marginBottom: '20px' }}>Congratulations!</h2>
                    <p style={{ fontSize: '18px', marginBottom: '30px' }}>
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

                    <div style={{ marginTop: '30px' }}>
                        <button onClick={resetProgress} className="success-btn">
                            Start Over
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!lesson || !step) {
        return <div>Loading...</div>;
    }

    return (
        <div className={`lesson-container ${distractionFree ? "focus-mode" : ""}`}>

            {!distractionFree && (
                <header className="lesson-header">
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
                            {lessons.map((l, idx) => (
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
