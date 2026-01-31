/**
 * Activity Tracker
 * Tracks user's last collaboration activity in LocalStorage
 */

const ACTIVITY_KEY = 'collaboration_activity';

export interface ActivityData {
  lastConversationId?: string;
  lastConversationName?: string;
  lastFriendUid?: string;
  lastFriendName?: string;
  lastActivityTime?: number;
}

export function saveActivity(activity: Partial<ActivityData>): void {
  const existing = loadActivity();
  const updated: ActivityData = {
    ...existing,
    ...activity,
    lastActivityTime: Date.now(),
  };
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(updated));
}

export function loadActivity(): ActivityData {
  const stored = localStorage.getItem(ACTIVITY_KEY);
  if (!stored) {
    return {};
  }
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

export function clearActivity(): void {
  localStorage.removeItem(ACTIVITY_KEY);
}
