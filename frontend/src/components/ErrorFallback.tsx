/**
 * Error Fallback Component
 * Shows user-friendly error messages with recovery actions
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import './ErrorFallback.css';

interface ErrorFallbackProps {
  error?: Error | string | null;
  onRetry?: () => void;
  onGoBack?: () => void;
  title?: string;
  message?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
  onGoBack,
  title,
  message,
}) => {
  const { t } = useTranslation();

  const errorMessage = message || (typeof error === 'string' ? error : error?.message) || t('error.generic');

  return (
    <div className="error-fallback">
      <div className="error-fallback-content">
        <div className="error-icon">⚠️</div>
        <h2 className="error-title">{title || t('error.title')}</h2>
        <p className="error-message">{errorMessage}</p>
        <div className="error-actions">
          {onRetry && (
            <button
              className="error-button error-button-primary"
              onClick={onRetry}
              aria-label={t('error.retry')}
            >
              {t('error.retry')}
            </button>
          )}
          {onGoBack && (
            <button
              className="error-button error-button-secondary"
              onClick={onGoBack}
              aria-label={t('app.back')}
            >
              {t('app.back')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
