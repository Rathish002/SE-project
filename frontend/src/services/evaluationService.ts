/**
 * Evaluation Service
 * Handles evaluation questions and scoring via backend API
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export interface EvaluationQuestion {
  id: number;
  question: string;
}

export interface EvaluationResult {
  finalScore: number;
  semanticScore?: number;
  keywordScore?: number;
  matchedKeywords?: string[];
  missedKeywords?: string[];
  feedback: string;
  transcript?: string;
  normalizedAnswer?: string;
  adaptiveThreshold?: number;
  difficultyLabel?: string;
}

/**
 * Fetch all evaluation questions for a lesson
 */
export async function getEvaluationQuestions(
  lessonId: number
): Promise<EvaluationQuestion[]> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/evaluation/lesson/${lessonId}/questions`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch evaluation questions:', error);
    throw error;
  }
}

/**
 * Evaluate a single answer against a question
 */
export async function evaluateAnswer(
  lessonId: number,
  evaluationIntentId: number,
  answer: string,
  userId?: string
): Promise<EvaluationResult> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/evaluation/evaluate-intent`,
      {
        lessonId,
        evaluationIntentId,
        answer,
        userId
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to evaluate answer:', error);
    throw error;
  }
}

/**
 * Evaluate a spoken answer against a question using audio recording
 */
export async function evaluateSpeechAnswer(
  lessonId: number,
  evaluationIntentId: number,
  audioBlob: Blob,
  userId?: string
): Promise<EvaluationResult> {
  try {
    const formData = new FormData();
    formData.append('lessonId', lessonId.toString());
    formData.append('evaluationIntentId', evaluationIntentId.toString());
    formData.append('audio', audioBlob, 'recording.webm');
    if (userId) formData.append('userId', userId);

    const response = await axios.post(
      `${API_BASE_URL}/evaluation/evaluate-speech-intent`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to evaluate speech answer:', error);
    throw error;
  }
}
