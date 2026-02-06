import React from "react";

interface ExercisesFeedbackProps {
    isCorrect: boolean | null;
    message: string;
    onRetry: () => void;
}

const ExercisesFeedback: React.FC<ExercisesFeedbackProps> = ({ isCorrect, message, onRetry }) => {
    if (isCorrect === null) return null;

    return (
        <div
            role="alert"
            aria-live="polite"
            className={`feedback-box ${isCorrect ? "success" : "retry"}`}
        >
            <div className="feedback-content">
                <span className="feedback-icon">{isCorrect ? "🌟" : "👀"}</span>
                <span className="feedback-text">{message}</span>
            </div>

            {!isCorrect && (
                <button
                    onClick={onRetry}
                    className="retry-btn"
                    aria-label="Try this step again"
                >
                    Try Again
                </button>
            )}
        </div>
    );
};

export default ExercisesFeedback;
