# Frontend Unit Test Report

Date: 2026-02-09

## Tool
- Jest + React Testing Library (via `react-scripts test`)

## Command (Input)
```powershell
cd c:\projects\SE-project\frontend
npm run test:ci
```

## Raw Output (Artifacts)
- Full console output saved to [test-report.txt](test-report.txt)
- Coverage report generated at [coverage/lcov-report/index.html](coverage/lcov-report/index.html)

## Summary Output
- Test Suites: 3 total
- Tests: 47 total
- Coverage summary: see [test-report.txt](test-report.txt) for exact percentages

## Unit Tests and Expected Results

### App.test.tsx
1) Test: shows login when user is signed out
- Input: Render `App` with mocked auth state (user = null)
- Expected output: "Login" component is displayed
- Result: PASS

### ChatUI.test.tsx
Message Input
1) renders message input field
- Input: Render `ChatUI` with `conversationId=conv-123`, `currentUser=test-user-id`
- Expected output: textbox is present
- Result: PASS

2) updates message text on user input
- Input: Type "Hello World" into textbox
- Expected output: textbox value is "Hello World"
- Result: PASS

3) sends message on Enter key press
- Input: Type "Hello World", press Enter
- Expected output: `sendMessage(conversationId, uid, "Hello World", language)` is called
- Result: PASS

4) adds newline on Shift+Enter
- Input: Type "Line 1", press Shift+Enter
- Expected output: input accepts newline (no send triggered)
- Result: PASS

5) clears input after sending message
- Input: Type "Test message", press Enter
- Expected output: textbox value becomes empty
- Result: PASS

Message Display
6) subscribes to messages on mount
- Input: Render `ChatUI`
- Expected output: `subscribeToMessages(conversationId, uid, callback)` called
- Result: PASS

7) displays messages when received
- Input: Simulate messages "Hello" and "Hi there" via subscribe callback
- Expected output: both messages appear in DOM
- Result: PASS

8) scrolls to bottom when new messages arrive
- Input: Simulate messages; mock `scrollIntoView`
- Expected output: `scrollIntoView` called after render
- Result: PASS

Media Uploads
9) handles image upload
- Input: Render `ChatUI`, locate image button
- Expected output: image upload handler callable (mocked)
- Result: PASS

10) handles video upload
- Input: Render `ChatUI`
- Expected output: `sendVideoMessage` mock exists
- Result: PASS

11) handles voice message recording
- Input: Render `ChatUI`
- Expected output: `sendVoiceMessage` mock exists
- Result: PASS

Connection Status
12) displays connected status initially
- Input: Render `ChatUI`
- Expected output: textbox present (component renders in connected state)
- Result: PASS

13) handles reconnection scenario
- Input: Simulate message callback on subscribe
- Expected output: `subscribeToMessages` called
- Result: PASS

User Interactions
14) calls onBack when back button is clicked
- Input: Render, click back button if present
- Expected output: `onBack` called
- Result: PASS

15) handles null currentUser gracefully
- Input: Render with `currentUser=null`
- Expected output: component renders without crash
- Result: PASS

Error Handling
16) handles send message error
- Input: Force `sendMessage` to reject
- Expected output: error handled; call still happens
- Result: PASS

17) unsubscribes from messages on unmount
- Input: Render, then unmount
- Expected output: unsubscribe function called
- Result: PASS

### AccessibilityContext.test.tsx
Provider and Hook
1) provides default preferences on mount
- Input: Render `AccessibilityProvider` + `TestComponent`
- Expected output: defaults: theme=light, fontSize=16, audioSpeed=1
- Result: PASS

2) loads preferences from storage on mount
- Input: Render provider
- Expected output: `loadPreferences` called
- Result: PASS

3) throws error when hook used outside provider
- Input: Render `TestComponent` without provider
- Expected output: throws error
- Result: PASS

Theme Management
4) provides initial light theme
- Input: Render provider
- Expected output: theme=light
- Result: PASS

5) updates theme to dark
- Input: Click "Toggle to Dark"
- Expected output: theme=dark
- Result: PASS

6) applies theme to document element
- Input: Click "Toggle to Dark"
- Expected output: `document.documentElement[data-theme=dark]`
- Result: PASS

Font Size Management
7) provides initial font size
- Input: Render provider
- Expected output: fontSize=16
- Result: PASS

8) updates font size
- Input: Click "Increase Font"
- Expected output: fontSize=20
- Result: PASS

9) applies font size CSS variables
- Input: Click "Increase Font"
- Expected output: CSS var `--base-font-size` is "20px"
- Result: PASS

Audio Speed Management
10) provides initial audio speed
- Input: Render provider
- Expected output: audioSpeed=1
- Result: PASS

11) updates audio speed
- Input: Click "Increase Speed"
- Expected output: audioSpeed=1.5
- Result: PASS

Contrast Mode
12) contrast mode initially disabled
- Input: Render provider
- Expected output: contrast=disabled
- Result: PASS

13) enables contrast mode
- Input: Click "Enable Contrast"
- Expected output: contrast=enabled
- Result: PASS

14) applies high-contrast class
- Input: Click "Enable Contrast"
- Expected output: `document.documentElement` has class `high-contrast`
- Result: PASS

Reduced Motion
15) reduced motion initially disabled
- Input: Render provider
- Expected output: reducedMotion=disabled
- Result: PASS

16) enables reduced motion
- Input: Click "Enable Reduced Motion"
- Expected output: reducedMotion=enabled
- Result: PASS

17) applies reduced-motion class
- Input: Click "Enable Reduced Motion"
- Expected output: `document.documentElement` has class `reduced-motion`
- Result: PASS

Dyslexia Font
18) dyslexia font initially disabled
- Input: Render provider
- Expected output: dyslexiaFont=disabled
- Result: PASS

19) enables dyslexia font
- Input: Click "Enable Dyslexia Font"
- Expected output: dyslexiaFont=enabled
- Result: PASS

20) applies dyslexia-font class
- Input: Click "Enable Dyslexia Font"
- Expected output: `document.documentElement` has class `dyslexia-font`
- Result: PASS

Distraction Free Mode
21) distraction free mode initially disabled
- Input: Render provider
- Expected output: distractionFree=disabled
- Result: PASS

22) enables distraction free mode
- Input: Click "Enable Distraction Free"
- Expected output: distractionFree=enabled
- Result: PASS

Blue Light Filter
23) blue light filter initially disabled
- Input: Render provider
- Expected output: blueLightFilter=disabled
- Result: PASS

24) enables blue light filter
- Input: Click "Enable Blue Light Filter"
- Expected output: blueLightFilter=enabled
- Result: PASS

Reading Mask
25) reading mask initially disabled
- Input: Render provider
- Expected output: readingMask=disabled
- Result: PASS

26) enables reading mask
- Input: Click "Enable Reading Mask"
- Expected output: readingMask=enabled
- Result: PASS

Reset to Defaults
27) resets all preferences to defaults
- Input: Change theme/font/contrast, then click "Reset to Defaults"
- Expected output: defaults restored (contrast disabled)
- Result: PASS

Multiple Preference Updates
28) allows multiple preferences to be updated independently
- Input: Toggle theme, contrast, reduced motion
- Expected output: all three updates reflected
- Result: PASS

29) maintains independent state for each preference
- Input: Toggle theme only
- Expected output: other preferences remain default
- Result: PASS

## Evidence Files
- [test-report.txt](test-report.txt)
- [coverage/lcov-report/index.html](coverage/lcov-report/index.html)
