# Environment Variables Setup

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your Firebase configuration:**
   Open `.env.local` and replace the placeholder values with your actual Firebase config from Firebase Console.

3. **Get your Firebase config:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Click the gear icon ⚙️ > Project settings
   - Scroll to "Your apps" section
   - Copy the config values

4. **Example `.env.local` file:**
   ```
   REACT_APP_FIREBASE_API_KEY=AIzaSyDCdnY6dl65ajLQjY9XiVy2V9z0jHDsZtA
   REACT_APP_FIREBASE_AUTH_DOMAIN=se-01-18cc8.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=se-01-18cc8
   REACT_APP_FIREBASE_STORAGE_BUCKET=se-01-18cc8.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=698206432143
   REACT_APP_FIREBASE_APP_ID=1:698206432143:web:762b399aaf23fa584bb9fa
   REACT_APP_FIREBASE_MEASUREMENT_ID=G-C23HP9D8GH
   ```

## Important Notes

- ⚠️ **Never commit `.env.local` to git** - it's already in `.gitignore`
- ✅ The app will work without `.env.local` (uses fallback values in code)
- ✅ Use `.env.local` for local development
- ✅ Use environment variables in your deployment platform for production

## For Create React App

Create React App requires the `REACT_APP_` prefix for environment variables to be accessible in the browser.

After creating `.env.local`, restart your development server:
```bash
npm start
```
