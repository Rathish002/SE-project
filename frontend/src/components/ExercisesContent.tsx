import React from "react";
import type { LessonStep, ImageOption } from "../types/ExerciseTypes";
import ExercisesTTSButton from "./ExercisesTTSButton";
import { useTranslation } from "react-i18next";

interface ExercisesContentProps {
    lessonId: string;
    stepIndex: number;
    step: LessonStep;
    answer: string;
    setAnswer: (ans: string) => void;
    checkAnswer: () => void;
    feedback: string;
    isCorrect: boolean | null;
}

const ExercisesContent: React.FC<ExercisesContentProps> = ({
    lessonId,
    stepIndex,
    step,
    answer,
    setAnswer,
    checkAnswer,
    feedback,
    isCorrect
}) => {
    const { t } = useTranslation();

    // Pull translations safely
    const localizedOptions = t(`lessonData.${lessonId}.steps.${stepIndex}.options`, { returnObjects: true, defaultValue: step.options }) as string[] | undefined;
    const localizedWords = t(`lessonData.${lessonId}.steps.${stepIndex}.words`, { returnObjects: true, defaultValue: step.words }) as string[] | undefined;

    // We only need labels from image options
    const rawImageOptions = step.imageOptions || [];

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
        const options = (t(`lessonData.${lessonId}.steps.${stepIndex}.options`, { returnObjects: true, defaultValue: step.options }) as string[]) || [];

        return (
            <div className="interaction-content">
                {renderVisualPrompt()}
                <div className="options-grid" role="radiogroup" aria-label="Answer choices">
                    {options.map((opt) => (
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
                        {t('exercises.actions.checkAnswer')}
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
                    {step.imageOptions?.map((opt: ImageOption, idx: number) => {
                        const label = t(`lessonData.${lessonId}.steps.${stepIndex}.imageOptions.${idx}.label`, { defaultValue: opt.label });
                        const alt = t(`lessonData.${lessonId}.steps.${stepIndex}.imageOptions.${idx}.alt`, { defaultValue: opt.alt });
                        return (
                            <button
                                key={opt.id}
                                role="radio"
                                aria-checked={answer === opt.id}
                                className={`image-option-btn ${answer === opt.id ? "selected" : ""} ${isCorrect === true && opt.id === step.correct ? "correct" : ""
                                    }`}
                                onClick={() => handleOptionSelect(opt.id)}
                                disabled={isCorrect === true}
                            >
                                <div className="image-placeholder" role="img" aria-label={alt}>
                                    {opt.src}
                                </div>
                                {label && <span className="image-label">{label}</span>}
                                <ExercisesTTSButton text={label || alt} label={`Listen to ${label || alt}`} />
                            </button>
                        );
                    })}
                </div>
                <div className="action-row">
                    <button
                        className="check-btn primary"
                        onClick={checkAnswer}
                        disabled={!answer || isCorrect === true}
                    >
                        {t('exercises.actions.checkAnswer')}
                    </button>
                </div>
            </div>
        );
    }

    // 3. Inputs (Fill / Build / Free)
    if (step.type === "fill" || step.type === "build" || step.type === "free") {
        const words = (t(`lessonData.${lessonId}.steps.${stepIndex}.words`, { returnObjects: true, defaultValue: step.words }) as string[]) || [];

        return (
            <div className="interaction-content">
                {renderVisualPrompt()}

                {step.type === "build" && words.length > 0 && (
                    <div className="word-bank">
                        {words.map((word, idx) => {
                            const isUsed = answer.includes(word);
                            return (
                                <button
                                    key={idx}
                                    className={`word-btn ${isUsed ? "used" : ""}`}
                                    onClick={() => {
                                        if (!isUsed && isCorrect !== true) {
                                            setAnswer(answer ? `${answer} ${word}` : word);
                                        }
                                    }}
                                    disabled={isCorrect === true || isUsed}
                                >
                                    {word}
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className="input-wrapper">
                    <input
                        type="text"
                        className="text-input"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder={t('exercises.inputs.typeAnswer')}
                        aria-label={t('exercises.inputs.yourAnswer')}
                        disabled={isCorrect === true}
                    />
                </div>
                <div className="action-row">
                    <button
                        className="check-btn primary"
                        onClick={checkAnswer}
                        disabled={!answer || isCorrect === true}
                    >
                        {t('exercises.actions.checkAnswer')}
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
                    <p>{t(`lessonData.${lessonId}.steps.${stepIndex}.task`, { defaultValue: step.task })}</p>
                    <ExercisesTTSButton text={t(`lessonData.${lessonId}.steps.${stepIndex}.task`, { defaultValue: step.task }) as string} />
                </div>
                <div className="action-row">
                    <button className="check-btn primary" onClick={checkAnswer}>
                        {t('exercises.actions.imReady')}
                    </button>
                </div>
            </div>
        )
    }

    return <div>{t('exercises.errors.unknownStepType')}</div>;
};

export default ExercisesContent;
