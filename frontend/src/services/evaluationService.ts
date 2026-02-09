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
  feedback: string;
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
  answer: string
): Promise<EvaluationResult> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/evaluation/evaluate-intent`,
      {
        lessonId,
        evaluationIntentId,
        answer,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to evaluate answer:', error);
    throw error;
  }
}
