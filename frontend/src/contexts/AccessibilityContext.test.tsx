/**
 * AccessibilityContext Tests
 * Tests for accessibility preferences and state management
 */

import React, { ReactNode } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AccessibilityProvider, useAccessibility } from './AccessibilityContext';

// Mock accessibility storage
jest.mock('../utils/accessibilityStorage');

import * as accessibilityStorage from '../utils/accessibilityStorage';

/**
 * Test component that uses AccessibilityContext
 */
const TestComponent: React.FC = () => {
  const {
    preferences,
    updateTheme,
    updateFontSize,
    updateAudioSpeed,
    updateContrastMode,
    updateDistractionFreeMode,
    updateReducedMotion,
    updateDyslexiaFont,
    updateBlueLightFilter,
    updateReadingMask,
    resetToDefaults,
  } = useAccessibility();

  return (
    <div>
      <div data-testid="theme-display">{preferences.theme}</div>
      <div data-testid="font-size-display">{preferences.fontSize}</div>
      <div data-testid="audio-speed-display">{preferences.audioSpeed}</div>
      <div data-testid="contrast-mode-display">
        {preferences.contrastMode ? 'enabled' : 'disabled'}
      </div>
      <div data-testid="reduced-motion-display">
        {preferences.reducedMotion ? 'enabled' : 'disabled'}
      </div>
      <div data-testid="dyslexia-font-display">
        {preferences.dyslexiaFont ? 'enabled' : 'disabled'}
      </div>
      <div data-testid="distraction-free-display">
        {preferences.distractionFreeMode ? 'enabled' : 'disabled'}
      </div>
      <div data-testid="blue-light-filter-display">
        {preferences.blueLightFilter ? 'enabled' : 'disabled'}
      </div>
      <div data-testid="reading-mask-display">
        {preferences.readingMask ? 'enabled' : 'disabled'}
      </div>

      <button onClick={() => updateTheme('dark')} data-testid="theme-button">
        Toggle to Dark
      </button>
      <button onClick={() => updateFontSize(20)} data-testid="font-size-button">
        Increase Font
      </button>
      <button onClick={() => updateAudioSpeed(1.5)} data-testid="audio-speed-button">
        Increase Speed
      </button>
      <button onClick={() => updateContrastMode(true)} data-testid="contrast-button">
        Enable Contrast
      </button>
      <button onClick={() => updateDistractionFreeMode(true)} data-testid="distraction-button">
        Enable Distraction Free
      </button>
      <button onClick={() => updateReducedMotion(true)} data-testid="motion-button">
        Enable Reduced Motion
      </button>
      <button onClick={() => updateDyslexiaFont(true)} data-testid="dyslexia-button">
        Enable Dyslexia Font
      </button>
      <button onClick={() => updateBlueLightFilter(true)} data-testid="blue-light-button">
        Enable Blue Light Filter
      </button>
      <button onClick={() => updateReadingMask(true)} data-testid="reading-mask-button">
        Enable Reading Mask
      </button>
      <button onClick={() => resetToDefaults()} data-testid="reset-button">
        Reset to Defaults
      </button>
    </div>
  );
};

describe('AccessibilityContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear document attributes
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.className = '';
    
    // Setup mock return value
    (accessibilityStorage.loadPreferences as jest.Mock).mockReturnValue({
      theme: 'light' as const,
      fontSize: 16,
      audioSpeed: 1,
      contrastMode: false,
      distractionFreeMode: false,
      reducedMotion: false,
      dyslexiaFont: false,
      blueLightFilter: false,
      readingMask: false,
    });
    (accessibilityStorage.savePreferences as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Provider and Hook', () => {
    test('provides default preferences on mount', () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(screen.getByTestId('theme-display')).toHaveTextContent('light');
      expect(screen.getByTestId('font-size-display')).toHaveTextContent('16');
      expect(screen.getByTestId('audio-speed-display')).toHaveTextContent('1');
    });

    test('loads preferences from storage on mount', () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(accessibilityStorage.loadPreferences).toHaveBeenCalled();
    });

    test('throws error when useAccessibility is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Theme Management', () => {
    test('provides initial light theme', () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(screen.getByTestId('theme-display')).toHaveTextContent('light');
    });

    test('updates theme to dark', async () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      const themeButton = screen.getByTestId('theme-button');
      fireEvent.click(themeButton);

      await waitFor(() => {
        expect(screen.getByTestId('theme-display')).toHaveTextContent('dark');
      });
    });

    test('applies theme to document element', async () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      const themeButton = screen.getByTestId('theme-button');
      fireEvent.click(themeButton);

      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });
    });
  });

  describe('Font Size Management', () => {
    test('provides initial font size', () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(screen.getByTestId('font-size-display')).toHaveTextContent('16');
    });

    test('updates font size', async () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      const fontButton = screen.getByTestId('font-size-button');
      fireEvent.click(fontButton);

      await waitFor(() => {
        expect(screen.getByTestId('font-size-display')).toHaveTextContent('20');
      });
    });

    test('applies font size CSS variables to document', async () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      const fontButton = screen.getByTestId('font-size-button');
      fireEvent.click(fontButton);

      await waitFor(() => {
        const style = getComputedStyle(document.documentElement);
        expect(document.documentElement.style.getPropertyValue('--base-font-size')).toBe('20px');
      });
    });
  });

  describe('Audio Speed Management', () => {
    test('provides initial audio speed', () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(screen.getByTestId('audio-speed-display')).toHaveTextContent('1');
    });

    test('updates audio speed', async () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      const speedButton = screen.getByTestId('audio-speed-button');
      fireEvent.click(speedButton);

      await waitFor(() => {
        expect(screen.getByTestId('audio-speed-display')).toHaveTextContent('1.5');
      });
    });
  });

  describe('Contrast Mode', () => {
    test('contrast mode is initially disabled', () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(screen.getByTestId('contrast-mode-display')).toHaveTextContent('disabled');
    });

    test('enables contrast mode', async () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      const contrastButton = screen.getByTestId('contrast-button');
      fireEvent.click(contrastButton);

      await waitFor(() => {
        expect(screen.getByTestId('contrast-mode-display')).toHaveTextContent('enabled');
      });
    });

    test('applies high-contrast class to document', async () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      const contrastButton = screen.getByTestId('contrast-button');
      fireEvent.click(contrastButton);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
      });
    });
  });

  describe('Reduced Motion', () => {
    test('reduced motion is initially disabled', () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(screen.getByTestId('reduced-motion-display')).toHaveTextContent('disabled');
    });

    test('enables reduced motion', async () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      const motionButton = screen.getByTestId('motion-button');
      fireEvent.click(motionButton);

      await waitFor(() => {
        expect(screen.getByTestId('reduced-motion-display')).toHaveTextContent('enabled');
      });
    });

    test('applies reduced-motion class to document', async () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      const motionButton = screen.getByTestId('motion-button');
      fireEvent.click(motionButton);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('reduced-motion')).toBe(true);
      });
    });
  });

  describe('Dyslexia Font', () => {
    test('dyslexia font is initially disabled', () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(screen.getByTestId('dyslexia-font-display')).toHaveTextContent('disabled');
    });

    test('enables dyslexia font', async () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      const dyslexiaButton = screen.getByTestId('dyslexia-button');
      fireEvent.click(dyslexiaButton);

      await waitFor(() => {
        expect(screen.getByTestId('dyslexia-font-display')).toHaveTextContent('enabled');
      });
    });

    test('applies dyslexia-font class to document', async () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      const dyslexiaButton = screen.getByTestId('dyslexia-button');
      fireEvent.click(dyslexiaButton);

      await waitFor(() => {
        expect(document.documentElement.classList.contains('dyslexia-font')).toBe(true);
      });
    });
  });

  describe('Distraction Free Mode', () => {
    test('distraction free mode is initially disabled', () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(screen.getByTestId('distraction-free-display')).toHaveTextContent('disabled');
    });

    test('enables distraction free mode', async () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      const distractionButton = screen.getByTestId('distraction-button');
      fireEvent.click(distractionButton);

      await waitFor(() => {
        expect(screen.getByTestId('distraction-free-display')).toHaveTextContent('enabled');
      });
    });
  });

  describe('Blue Light Filter', () => {
    test('blue light filter is initially disabled', () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(screen.getByTestId('blue-light-filter-display')).toHaveTextContent('disabled');
    });

    test('enables blue light filter', async () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      const blueLightButton = screen.getByTestId('blue-light-button');
      fireEvent.click(blueLightButton);

      await waitFor(() => {
        expect(screen.getByTestId('blue-light-filter-display')).toHaveTextContent('enabled');
      });
    });
  });

  describe('Reading Mask', () => {
    test('reading mask is initially disabled', () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      expect(screen.getByTestId('reading-mask-display')).toHaveTextContent('disabled');
    });

    test('enables reading mask', async () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      const readingMaskButton = screen.getByTestId('reading-mask-button');
      fireEvent.click(readingMaskButton);

      await waitFor(() => {
        expect(screen.getByTestId('reading-mask-display')).toHaveTextContent('enabled');
      });
    });
  });

  describe('Reset to Defaults', () => {
    test('resets all preferences to defaults', async () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      // Change some preferences
      fireEvent.click(screen.getByTestId('theme-button'));
      fireEvent.click(screen.getByTestId('font-size-button'));
      fireEvent.click(screen.getByTestId('contrast-button'));

      // Wait for changes
      await waitFor(() => {
        expect(screen.getByTestId('theme-display')).toHaveTextContent('dark');
      });

      // Reset
      fireEvent.click(screen.getByTestId('reset-button'));

      // Verify defaults are restored
      await waitFor(() => {
        expect(screen.getByTestId('contrast-mode-display')).toHaveTextContent('disabled');
      });
    });
  });

  describe('Multiple Preference Updates', () => {
    test('allows multiple preferences to be updated independently', async () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      fireEvent.click(screen.getByTestId('theme-button'));
      fireEvent.click(screen.getByTestId('contrast-button'));
      fireEvent.click(screen.getByTestId('motion-button'));

      await waitFor(() => {
        expect(screen.getByTestId('theme-display')).toHaveTextContent('dark');
        expect(screen.getByTestId('contrast-mode-display')).toHaveTextContent('enabled');
        expect(screen.getByTestId('reduced-motion-display')).toHaveTextContent('enabled');
      });
    });

    test('maintains independent state for each preference', async () => {
      render(
        <AccessibilityProvider>
          <TestComponent />
        </AccessibilityProvider>
      );

      fireEvent.click(screen.getByTestId('theme-button'));

      await waitFor(() => {
        expect(screen.getByTestId('theme-display')).toHaveTextContent('dark');
      });

      // Verify other preferences unchanged
      expect(screen.getByTestId('font-size-display')).toHaveTextContent('16');
      expect(screen.getByTestId('contrast-mode-display')).toHaveTextContent('disabled');
    });
  });
});
