import React from "react";
import type { LessonStep, ImageOption } from "../types/ExerciseTypes";
import ExercisesTTSButton from "./ExercisesTTSButton";

interface ExercisesContentProps {
    step: LessonStep;
    answer: string;
    setAnswer: (ans: string) => void;
    checkAnswer: () => void;
    feedback: string;
    isCorrect: boolean | null;
}

const ExercisesContent: React.FC<ExercisesContentProps> = ({
    step,
    answer,
    setAnswer,
    checkAnswer,
    feedback,
    isCorrect
}) => {

    const handleOptionSelect = (val: string) => {
        if (isCorrect === true) return; // Prevent changing after correct
        setAnswer(val);
    };

    const handleKeyDown = (e: React.KeyboardEvent, val: string) => {
        if (e.key === "Enter" || e.key === " ") {
            handleOptionSelect(val);
        }
    };

    // Render Visual Prompt if exists
    const renderVisualPrompt = () => {
        if (!step.visualPrompt) return null;
        return (
            <div className="visual-prompt" aria-hidden="true">
                {step.visualPrompt}
            </div>
        );
    };

    // 1. Choice (Text)
    if (step.type === "choice") {
        return (
            <div className="interaction-content">
                {renderVisualPrompt()}
                <div className="options-grid" role="radiogroup" aria-label="Answer choices">
                    {step.options?.map((opt) => (
                        <button
                            key={opt}
                            role="radio"
                            aria-checked={answer === opt}
                            tabIndex={0}
                            className={`option-btn ${answer === opt ? "selected" : ""} ${isCorrect === true && opt === step.correct ? "correct" : ""
                                } ${isCorrect === false && answer === opt ? "incorrect" : ""}`}
                            onClick={() => handleOptionSelect(opt)}
                            onKeyDown={(e) => handleKeyDown(e, opt)}
                            disabled={isCorrect === true}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
                <div className="action-row">
                    <button
                        className="check-btn primary"
                        onClick={checkAnswer}
                        disabled={!answer || isCorrect === true}
                    >
                        Check Answer
                    </button>
                </div>
            </div>
        );
    }

    // 2. Image Choice / Emotion / Pattern
    if (step.type === "image-choice" || step.type === "emotion" || step.type === "pattern") {
        return (
            <div className="interaction-content">
                {renderVisualPrompt()}
                <div className="image-options-grid" role="radiogroup" aria-label="Select an image">
                    {step.imageOptions?.map((opt: ImageOption) => (
                        <button
                            key={opt.id}
                            role="radio"
                            aria-checked={answer === opt.id}
                            className={`image-option-btn ${answer === opt.id ? "selected" : ""} ${isCorrect === true && opt.id === step.correct ? "correct" : ""
                                }`}
                            onClick={() => handleOptionSelect(opt.id)}
                            disabled={isCorrect === true}
                        >
                            <div className="image-placeholder" role="img" aria-label={opt.alt}>
                                {opt.src}
                            </div>
                            {opt.label && <span className="image-label">{opt.label}</span>}
                            <ExercisesTTSButton text={opt.label || opt.alt} label={`Listen to ${opt.label || opt.alt}`} />
                        </button>
                    ))}
                </div>
                <div className="action-row">
                    <button
                        className="check-btn primary"
                        onClick={checkAnswer}
                        disabled={!answer || isCorrect === true}
                    >
                        Check Answer
                    </button>
                </div>
            </div>
        );
    }

    // 3. Inputs (Fill / Build / Free)
    if (step.type === "fill" || step.type === "build" || step.type === "free") {
        return (
            <div className="interaction-content">
                {renderVisualPrompt()}
                <div className="input-wrapper">
                    <input
                        type="text"
                        className="text-input"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        aria-label="Your answer"
                        disabled={isCorrect === true}
                    />
                </div>
                <div className="action-row">
                    <button
                        className="check-btn primary"
                        onClick={checkAnswer}
                        disabled={!answer || isCorrect === true}
                    >
                        Check Answer
                    </button>
                </div>
            </div>
        );
    }

    // 4. Read Only
    if (step.type === "read") {
        return (
            <div className="interaction-content">
                {renderVisualPrompt()}
                <div className="read-content">
                    <p>{step.task}</p>
                    <ExercisesTTSButton text={step.task || ""} />
                </div>
                <div className="action-row">
                    <button className="check-btn primary" onClick={checkAnswer}>
                        I'm Ready
                    </button>
                </div>
            </div>
        )
    }

    return <div>Unknown step type</div>;
};

export default ExercisesContent;
