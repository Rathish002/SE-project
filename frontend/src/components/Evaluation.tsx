/**
 * Evaluation Page Component
 * Displays evaluation questions one by one with scoring
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getEvaluationQuestions, evaluateAnswer } from '../services/evaluationService';
import type { EvaluationQuestion, EvaluationResult } from '../services/evaluationService';
import './Evaluation.css';

interface EvaluationPageProps {
  lessonId: number;
  lessonTitle: string;
  onExit: () => void;
}

const EvaluationPage: React.FC<EvaluationPageProps> = ({
  lessonId,
  lessonTitle,
  onExit,
}) => {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<EvaluationQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: EvaluationResult }>({});
  const [allScores, setAllScores] = useState<number[]>([]);

  // Fetch evaluation questions on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setQuestionLoading(true);
        const fetchedQuestions = await getEvaluationQuestions(lessonId);
        setQuestions(fetchedQuestions);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching questions:', err);
        setError(t('evaluation.error.fetchQuestions') || 'Failed to load evaluation questions');
      } finally {
        setQuestionLoading(false);
      }
    };

    fetchQuestions();
  }, [lessonId, t]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasAnswered = evaluationResult !== null;

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) {
      setError(t('evaluation.error.emptyAnswer') || 'Please enter an answer');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await evaluateAnswer(
        lessonId,
        currentQuestion.id,
        userAnswer
      );
      
      setEvaluationResult(result);
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: result,
      }));
      setAllScores((prev) => [...prev, result.finalScore]);
    } catch (err: any) {
      console.error('Error evaluating answer:', err);
      setError(t('evaluation.error.evaluate') || 'Failed to evaluate answer');
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      // All questions completed - show summary
      handleShowSummary();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setUserAnswer('');
      setEvaluationResult(null);
    }
  };

  const handleShowSummary = () => {
    // Calculate average score
    const avgScore =
      allScores.length > 0
        ? (allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 0;

    alert(
      `${t('evaluation.complete') || 'Evaluation Complete!'}\n\n` +
      `${t('evaluation.summary.totalQuestions') || 'Total Questions'}: ${questions.length}\n` +
      `${t('evaluation.summary.averageScore') || 'Average Score'}: ${(avgScore * 100).toFixed(1)}%`
    );
    onExit();
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setUserAnswer('');
      setEvaluationResult(null);
    }
  };

  if (questionLoading) {
    return (
      <div className="evaluation-page">
        <div className="loading-spinner">
          {t('evaluation.loading') || 'Loading evaluation questions...'}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="evaluation-page">
        <div className="no-questions">
          <h2>{t('evaluation.noQuestions') || 'No evaluation questions available'}</h2>
          <button className="button button-primary" onClick={onExit}>
            {t('evaluation.exit') || 'Exit'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="evaluation-page">
      {/* Header */}
      <header className="evaluation-header">
        <h1>{t('evaluation.title') || 'Self-Evaluation'}</h1>
        <p>{lessonTitle}</p>
      </header>

      {/* Progress Indicator */}
      <div className="evaluation-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            }}
          ></div>
        </div>
        <p className="progress-text">
          {t('evaluation.question')} {currentQuestionIndex + 1} {t('evaluation.of')} {questions.length}
        </p>
      </div>

      {/* Question Display */}
      <div className="evaluation-card">
        <div className="question-section">
          <h2 className="question-text">{currentQuestion?.question}</h2>
        </div>

        {/* Answer Input Area */}
        <div className="answer-section">
          {hasAnswered ? (
            <>
              {/* Score Display */}
              <div className={`score-display ${getScoreClass(evaluationResult!.finalScore)}`}>
                <div className="score-circle">
                  <span className="score-value">
                    {(evaluationResult!.finalScore * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="score-details">
                  <p className="score-label">{t('evaluation.score') || 'Score'}</p>
                  <p className="score-feedback">{evaluationResult!.feedback}</p>
                  {evaluationResult!.matchedKeywords && evaluationResult!.matchedKeywords.length > 0 && (
                    <div className="matched-keywords">
                      <p className="keywords-label">{t('evaluation.matchedKeywords') || 'Matched Concepts'}:</p>
                      <div className="keywords-list">
                        {evaluationResult!.matchedKeywords.map((keyword, idx) => (
                          <span key={idx} className="keyword-badge">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Your Answer Display */}
              <div className="your-answer">
                <h3>{t('evaluation.yourAnswer') || 'Your Answer'}</h3>
                <p className="answer-text">{userAnswer}</p>
              </div>
            </>
          ) : (
            <>
              <label htmlFor="answer-input">{t('evaluation.enterAnswer') || 'Enter your answer'}</label>
              <textarea
                id="answer-input"
                className="answer-input"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={t('evaluation.answerPlaceholder') || 'Type your answer here...'}
                disabled={loading}
                rows={5}
              />
            </>
          )}
        </div>

        {/* Error Display */}
        {error && <div className="error-message">{error}</div>}

        {/* Action Buttons */}
        <div className="evaluation-actions">
          {hasAnswered ? (
            <>
              {currentQuestionIndex > 0 && (
                <button
                  className="button button-secondary"
                  onClick={handlePreviousQuestion}
                >
                  ← {t('evaluation.previous') || 'Previous'}
                </button>
              )}
              <button
                className="button button-primary"
                onClick={handleNextQuestion}
              >
                {isLastQuestion
                  ? `${t('evaluation.finish') || 'Finish'} →`
                  : `${t('evaluation.next') || 'Next'} →`}
              </button>
            </>
          ) : (
            <button
              className="button button-primary"
              onClick={handleEvaluate}
              disabled={loading}
            >
              {loading ? `${t('evaluation.evaluating') || 'Evaluating'}...` : (t('evaluation.evaluate') || 'Evaluate Answer')}
            </button>
          )}

          <button
            className="button button-secondary button-exit"
            onClick={onExit}
          >
            {t('evaluation.exit') || 'Exit'}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {allScores.length > 0 && (
        <div className="evaluation-stats">
          <h3>{t('evaluation.yourProgress') || 'Your Progress'}</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">{t('evaluation.completed') || 'Completed'}</span>
              <span className="stat-value">{allScores.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t('evaluation.average') || 'Average'}</span>
              <span className="stat-value">
                {((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">{t('evaluation.best') || 'Best Score'}</span>
              <span className="stat-value">
                {(Math.max(...allScores) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Get CSS class based on score
 */
function getScoreClass(score: number): string {
  if (score >= 0.8) return 'excellent';
  if (score >= 0.6) return 'good';
  if (score >= 0.4) return 'fair';
  return 'needs-improvement';
}

export default EvaluationPage;
