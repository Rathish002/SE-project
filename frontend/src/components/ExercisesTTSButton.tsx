import React from "react";

interface ExercisesTTSButtonProps {
    text: string;
    label?: string;
}

const ExercisesTTSButton: React.FC<ExercisesTTSButtonProps> = ({ text, label }) => {
    const speak = () => {
        // Cancel any current speech to avoid overlap
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        // Use a slightly slower rate for better accessibility
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    return (
        <button
            onClick={speak}
            className="tts-btn"
            aria-label={label || `Read aloud: ${text}`}
            title="Read Aloud"
        >
            🔊
        </button>
    );
};

export default ExercisesTTSButton;
