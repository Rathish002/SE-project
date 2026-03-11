import React, { useState, useEffect } from 'react';
import './UpdateNotificationBanner.css';

const CURRENT_VERSION = process.env.REACT_APP_VERSION || '1.0.0';
const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Polls /meta.json every 5 minutes.
 * When the deployed version differs from REACT_APP_VERSION (set at build time),
 * shows a banner prompting the user to refresh.
 * To trigger the banner: bump the "version" field in public/meta.json.
 */
const UpdateNotificationBanner: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`/meta.json?t=${Date.now()}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.version && data.version !== CURRENT_VERSION) {
          setUpdateAvailable(true);
        }
      } catch {
        // Ignore network errors silently
      }
    };

    check();
    const interval = setInterval(check, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (!updateAvailable) return null;

  return (
    <div className="update-banner" role="alert" aria-live="polite">
      <span>🔄 A new version of the app is available.</span>
      <button className="update-refresh-btn" onClick={() => window.location.reload()}>
        Refresh now
      </button>
      <button
        className="update-dismiss-btn"
        onClick={() => setUpdateAvailable(false)}
        aria-label="Dismiss update notification"
      >
        ✕
      </button>
    </div>
  );
};

export default UpdateNotificationBanner;
