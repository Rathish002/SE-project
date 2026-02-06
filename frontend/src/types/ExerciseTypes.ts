export type StepType =
    | "read"
    | "choice"
    | "fill"
    | "build"
    | "free"
    | "image-choice"
    | "pattern"
    | "emotion";

export interface Reinforcement {
    word: string;
    context: string;
}

export interface ImageOption {
    id: string;
    src: string; // URL or emoji for now
    alt: string;
    label?: string;
}

export interface LessonStep {
    type: StepType;
    content: string;
    task?: string;
    instruction: string;

    // Standard Text Options
    options?: string[];

    // New: Image Options
    imageOptions?: ImageOption[];

    // New: Visual/Audio Prompts
    visualPrompt?: string; // Content Image
    audioPrompt?: string; // TTS override text or Audio URL

    correct?: string; // ID for image options, or string for text
    answer?: string | string[];

    words?: string[]; // For build tasks
    hints: string[];
    reinforcement?: Reinforcement;
}

export interface Lesson {
    id: string; // Added ID for easier tracking
    title: string;
    category: "Language" | "Emotions" | "Social Skills" | "Daily Living" | "Safety";
    difficulty: "basic" | "guided" | "independent";
    description: string;
    microSteps: string[];
    steps: LessonStep[];
}
