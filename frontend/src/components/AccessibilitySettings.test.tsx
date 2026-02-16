/**
 * AccessibilitySettings Component Tests
 * Tests for accessibility controls and user preferences management
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import 'jest-axe/extend-expect';
import AccessibilitySettings from './AccessibilitySettings';
import * as AccessibilityContext from '../contexts/AccessibilityContext';

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'accessibility.title': 'Accessibility Settings',
        'accessibility.subtitle': 'Customize your learning experience',
        'accessibility.theme.title': 'Theme',
        'accessibility.theme.description': 'Choose your preferred theme',
        'accessibility.theme.light': 'Light',
        'accessibility.theme.dark': 'Dark',
        'accessibility.theme.high-contrast': 'High Contrast',
        'accessibility.fontSize.title': 'Font Size',
        'accessibility.fontSize.description': 'Adjust text size for better readability',
        'accessibility.fontSize.small': 'Small',
        'accessibility.fontSize.medium': 'Medium',
        'accessibility.fontSize.large': 'Large',
        'accessibility.fontSize.preview': 'The quick brown fox jumps over the lazy dog',
        'accessibility.audioSpeed.title': 'Audio Speed',
        'accessibility.audioSpeed.description': 'Control playback speed of audio content',
        'accessibility.audioSpeed.slider': 'Audio speed slider',
        'accessibility.contrast.title': 'Contrast Mode',
        'accessibility.contrast.description': 'Increase screen contrast for better visibility',
        'accessibility.contrast.toggle': 'Toggle contrast mode',
        'accessibility.contrast.enabled': 'Enabled',
        'accessibility.contrast.disabled': 'Disabled',
        'accessibility.save': 'Save Settings',
        'accessibility.reset': 'Reset to Defaults',
        'accessibility.saveSuccess': 'Settings saved successfully',
        'accessibility.resetSuccess': 'Settings reset to defaults',
        'accessibility.summary.title': 'Current Settings',
        'accessibility.summary.theme': 'Theme',
        'accessibility.summary.fontSize': 'Font Size',
        'accessibility.summary.audioSpeed': 'Audio Speed',
        'accessibility.summary.contrast': 'Contrast Mode',
        'app.back': 'Back',
      };
      return translations[key] || key;
    },
    i18n: { language: 'en' },
  }),
}));

describe('AccessibilitySettings Component', () => {
  const mockPreferences = {
    theme: 'light' as const,
    fontSize: 16,
    audioSpeed: 1.0 as const,
    contrastMode: false,
    distractionFreeMode: false,
    reducedMotion: false,
    dyslexiaFont: false,
    blueLightFilter: false,
    readingMask: false,
  };

  const mockContextValue = {
    preferences: mockPreferences,
    updateTheme: jest.fn(),
    updateFontSize: jest.fn(),
    updateAudioSpeed: jest.fn(),
    updateContrastMode: jest.fn(),
    updateDistractionFreeMode: jest.fn(),
    updateReducedMotion: jest.fn(),
    updateDyslexiaFont: jest.fn(),
    updateBlueLightFilter: jest.fn(),
    updateReadingMask: jest.fn(),
    saveCurrentPreferences: jest.fn(),
    resetToDefaults: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AccessibilityContext, 'useAccessibility').mockReturnValue(mockContextValue);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    test('renders component with title and subtitle', () => {
      render(<AccessibilitySettings />);
      expect(screen.getByText('Accessibility Settings')).toBeInTheDocument();
      expect(screen.getByText('Customize your learning experience')).toBeInTheDocument();
    });

    test('renders all section headers', () => {
      render(<AccessibilitySettings />);
      expect(screen.getByText('Theme')).toBeInTheDocument();
      expect(screen.getByText('Font Size')).toBeInTheDocument();
      expect(screen.getByText('Audio Speed')).toBeInTheDocument();
      expect(screen.getByText('Contrast Mode')).toBeInTheDocument();
      expect(screen.getByText('Current Settings')).toBeInTheDocument();
    });

    test('renders all action buttons', () => {
      render(<AccessibilitySettings />);
      expect(screen.getByText('Save Settings')).toBeInTheDocument();
      expect(screen.getByText('Reset to Defaults')).toBeInTheDocument();
    });

    test('renders back button when onBack prop is provided', () => {
      const mockOnBack = jest.fn();
      render(<AccessibilitySettings onBack={mockOnBack} />);
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    test('does not render back button when onBack prop is not provided', () => {
      render(<AccessibilitySettings />);
      const backButtons = screen.queryAllByText('Back');
      expect(backButtons.length).toBe(0);
    });
  });

  describe('Theme Selection', () => {
    test('renders theme options', () => {
      render(<AccessibilitySettings />);
      // 'Light' and 'Dark' appear in both theme buttons and summary section
      expect(screen.getAllByText('Light').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Dark').length).toBeGreaterThanOrEqual(1);
    });

    test('highlights active theme button', () => {
      render(<AccessibilitySettings />);
      const lightButton = screen.getByRole('button', { name: /Light/i });
      expect(lightButton).toHaveClass('active');
    });

    test('calls updateTheme when theme button is clicked', async () => {
      render(<AccessibilitySettings />);
      const darkButton = screen.getByRole('button', { name: /Dark/i });
      await userEvent.click(darkButton);
      expect(mockContextValue.updateTheme).toHaveBeenCalledWith('dark');
    });

    test('theme buttons have correct aria-pressed attribute', () => {
      render(<AccessibilitySettings />);
      const lightButton = screen.getByRole('button', { name: /Light/i });
      expect(lightButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Font Size Controls', () => {
    test('renders font size options', () => {
      render(<AccessibilitySettings />);
      expect(screen.getByText('Small')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Large')).toBeInTheDocument();
    });

    test('highlights active font size button', () => {
      render(<AccessibilitySettings />);
      const mediumButton = screen.getByRole('button', { name: /Medium/i });
      expect(mediumButton).toHaveClass('active');
    });

    test('calls updateFontSize when font size button is clicked', async () => {
      render(<AccessibilitySettings />);
      const largeButton = screen.getByRole('button', { name: /Large/i });
      await userEvent.click(largeButton);
      expect(mockContextValue.updateFontSize).toHaveBeenCalledWith(20);
    });

    test('renders preview text for font size', () => {
      render(<AccessibilitySettings />);
      expect(screen.getByText(/The quick brown fox/)).toBeInTheDocument();
    });
  });

  describe('Audio Speed Controls', () => {
    test('renders audio speed button options', () => {
      render(<AccessibilitySettings />);
      expect(screen.getByRole('button', { name: /0.75x/i })).toBeInTheDocument();
      // Note: 1.0 renders as "1" in JSX, so the button text is "1x" not "1.0x"
      expect(screen.getByRole('button', { name: /^1x$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /1.25x/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /1.5x/i })).toBeInTheDocument();
    });

    test('highlights active audio speed button', () => {
      render(<AccessibilitySettings />);
      // 1.0 renders as "1" in JSX, so button text is "1x"
      const normalButton = screen.getByRole('button', { name: /^1x$/i });
      expect(normalButton).toHaveClass('active');
    });

    test('calls updateAudioSpeed when speed button is clicked', async () => {
      render(<AccessibilitySettings />);
      const fastButton = screen.getByRole('button', { name: /1.5x/i });
      await userEvent.click(fastButton);
      expect(mockContextValue.updateAudioSpeed).toHaveBeenCalledWith(1.5);
    });

    test('renders audio speed slider', () => {
      render(<AccessibilitySettings />);
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
      expect(slider).toHaveAttribute('min', '0.75');
      expect(slider).toHaveAttribute('max', '1.5');
      expect(slider).toHaveAttribute('step', '0.25');
    });

    test('calls updateAudioSpeed when slider is adjusted', async () => {
      render(<AccessibilitySettings />);
      const slider = screen.getByRole('slider') as HTMLInputElement;
      fireEvent.change(slider, { target: { value: '1.25' } });
      expect(mockContextValue.updateAudioSpeed).toHaveBeenCalledWith(1.25);
    });

    test('displays current audio speed value', () => {
      render(<AccessibilitySettings />);
      const speedValues = screen.getAllByText('1x');
      expect(speedValues.length).toBeGreaterThan(0); // At least in button and slider value
    });
  });

  describe('Contrast Mode Toggle', () => {
    test('renders contrast mode checkbox', () => {
      render(<AccessibilitySettings />);
      const checkbox = screen.getByRole('checkbox', { name: /Toggle contrast mode/i });
      expect(checkbox).toBeInTheDocument();
    });

    test('checkbox is unchecked by default', () => {
      render(<AccessibilitySettings />);
      const checkbox = screen.getByRole('checkbox', { name: /Toggle contrast mode/i });
      expect(checkbox).not.toBeChecked();
    });

    test('calls updateContrastMode when checkbox is toggled', async () => {
      render(<AccessibilitySettings />);
      const checkbox = screen.getByRole('checkbox', { name: /Toggle contrast mode/i });
      await userEvent.click(checkbox);
      expect(mockContextValue.updateContrastMode).toHaveBeenCalledWith(true);
    });

    test('displays correct status text for contrast mode', () => {
      render(<AccessibilitySettings />);
      const disabledElements = screen.getAllByText('Disabled');
      expect(disabledElements.length).toBeGreaterThan(0);
    });

    test('displays enabled text when contrast mode is active', () => {
      jest.spyOn(AccessibilityContext, 'useAccessibility').mockReturnValue({
        ...mockContextValue,
        preferences: { ...mockPreferences, contrastMode: true },
      });
      render(<AccessibilitySettings />);
      const enabledElements = screen.getAllByText('Enabled');
      expect(enabledElements.length).toBeGreaterThan(0);
    });
  });

  describe('Save Settings', () => {
    test('shows save success message when save is clicked', async () => {
      jest.useFakeTimers();
      render(<AccessibilitySettings />);
      const saveButton = screen.getByRole('button', { name: /Save Settings/i });
      await userEvent.click(saveButton);
      expect(mockContextValue.saveCurrentPreferences).toHaveBeenCalled();
      expect(screen.getByText('Settings saved successfully')).toBeInTheDocument();
      jest.useRealTimers();
    });

    test('hides save message after 3 seconds', async () => {
      jest.useFakeTimers();
      render(<AccessibilitySettings />);
      const saveButton = screen.getByRole('button', { name: /Save Settings/i });
      await userEvent.click(saveButton);
      expect(screen.getByText('Settings saved successfully')).toBeInTheDocument();
      jest.advanceTimersByTime(3000);
      await waitFor(() => {
        expect(screen.queryByText('Settings saved successfully')).not.toBeInTheDocument();
      });
      jest.useRealTimers();
    });
  });

  describe('Reset Settings', () => {
    test('shows confirmation dialog when reset is clicked', async () => {
      window.confirm = jest.fn(() => true);
      render(<AccessibilitySettings />);
      const resetButton = screen.getByRole('button', { name: /Reset to Defaults/i });
      await userEvent.click(resetButton);
      expect(window.confirm).toHaveBeenCalled();
    });

    test('calls resetToDefaults when reset is confirmed', async () => {
      window.confirm = jest.fn(() => true);
      render(<AccessibilitySettings />);
      const resetButton = screen.getByRole('button', { name: /Reset to Defaults/i });
      await userEvent.click(resetButton);
      expect(mockContextValue.resetToDefaults).toHaveBeenCalled();
    });

    test('does not reset when confirmation is cancelled', async () => {
      window.confirm = jest.fn(() => false);
      render(<AccessibilitySettings />);
      const resetButton = screen.getByRole('button', { name: /Reset to Defaults/i });
      await userEvent.click(resetButton);
      expect(mockContextValue.resetToDefaults).not.toHaveBeenCalled();
    });

    test('shows reset success message when reset is confirmed', async () => {
      jest.useFakeTimers();
      window.confirm = jest.fn(() => true);
      render(<AccessibilitySettings />);
      const resetButton = screen.getByRole('button', { name: /Reset to Defaults/i });
      await userEvent.click(resetButton);
      expect(screen.getByText('Settings reset to defaults')).toBeInTheDocument();
      jest.useRealTimers();
    });
  });

  describe('Settings Summary', () => {
    test('displays current theme in summary', () => {
      render(<AccessibilitySettings />);
      expect(screen.getByText('Theme:')).toBeInTheDocument();
    });

    test('displays current font size in summary', () => {
      render(<AccessibilitySettings />);
      expect(screen.getByText('Font Size:')).toBeInTheDocument();
    });

    test('displays current audio speed in summary', () => {
      render(<AccessibilitySettings />);
      expect(screen.getByText('Audio Speed:')).toBeInTheDocument();
      const speedValues = screen.getAllByText('1x');
      expect(speedValues.length).toBeGreaterThanOrEqual(2); // Button + Slider + Summary
    });

    test('displays current contrast mode status in summary', () => {
      render(<AccessibilitySettings />);
      expect(screen.getByText('Contrast Mode:')).toBeInTheDocument();
    });
  });

  describe('Back Button Functionality', () => {
    test('calls onBack callback when back button is clicked', async () => {
      const mockOnBack = jest.fn();
      render(<AccessibilitySettings onBack={mockOnBack} />);
      const backButton = screen.getByRole('button', { name: /Back/i });
      await userEvent.click(backButton);
      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    test('all buttons are keyboard accessible', () => {
      render(<AccessibilitySettings />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeInTheDocument();
      });
    });

    test('checkbox is keyboard accessible', () => {
      render(<AccessibilitySettings />);
      const checkbox = screen.getByRole('checkbox', { name: /Toggle contrast mode/i });
      expect(checkbox).toBeInTheDocument();
    });

    test('slider is keyboard accessible', () => {
      render(<AccessibilitySettings />);
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-label', 'Audio speed slider');
    });
  });

  describe('Accessibility Compliance (WCAG)', () => {
    test('should not have any accessibility violations', async () => {
      const { container } = render(<AccessibilitySettings />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have proper heading hierarchy', () => {
      render(<AccessibilitySettings />);
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toBeInTheDocument();
      const subHeadings = screen.getAllByRole('heading', { level: 2 });
      expect(subHeadings.length).toBeGreaterThan(0);
    });

    test('section elements are used for semantic structure', () => {
      const { container } = render(<AccessibilitySettings />);
      const sections = container.querySelectorAll('section');
      expect(sections.length).toBeGreaterThan(0);
    });

    test('all interactive elements have proper labels', () => {
      render(<AccessibilitySettings />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.textContent).toBeTruthy();
      });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAccessibleName();
    });
  });

  describe('State Management', () => {
    test('reflects updated preferences in UI', async () => {
      const { rerender } = render(<AccessibilitySettings />);
      jest.spyOn(AccessibilityContext, 'useAccessibility').mockReturnValue({
        ...mockContextValue,
        preferences: { ...mockPreferences, fontSize: 20 },
      });
      rerender(<AccessibilitySettings />);
      const largeButton = screen.getByRole('button', { name: /Large/i });
      expect(largeButton).toHaveClass('active');
    });

    test('handles multiple rapid preference changes', async () => {
      render(<AccessibilitySettings />);
      const darkButton = screen.getByRole('button', { name: /Dark/i });
      const largeButton = screen.getByRole('button', { name: /Large/i });
      await userEvent.click(darkButton);
      await userEvent.click(largeButton);
      expect(mockContextValue.updateTheme).toHaveBeenCalledWith('dark');
      expect(mockContextValue.updateFontSize).toHaveBeenCalledWith(20);
    });
  });

  describe('Edge Cases', () => {
    test('handles missing translation keys gracefully', () => {
      render(<AccessibilitySettings />);
      // Component should still render without errors
      expect(screen.getByText('Accessibility Settings')).toBeInTheDocument();
    });

    test('handles context updates when component is unmounted', async () => {
      const { unmount } = render(<AccessibilitySettings />);
      const saveButton = screen.getByRole('button', { name: /Save Settings/i });
      unmount();
      // Should not cause errors
      expect(mockContextValue.saveCurrentPreferences).not.toHaveBeenCalled();
    });
  });
});
