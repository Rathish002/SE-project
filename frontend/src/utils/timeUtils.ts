/**
 * Time utilities for displaying timestamps
 */
import { Timestamp } from 'firebase/firestore';

export function formatLastActive(lastActive: Timestamp | undefined | any): string {
  if (!lastActive) return 'Unknown';
  
  const date = lastActive.toDate ? lastActive.toDate() : (lastActive instanceof Date ? lastActive : new Date());
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}
