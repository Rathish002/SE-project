// Polyfills for Node.js environment (required for Firebase)
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextEncoder, TextDecoder });

// Polyfill for ReadableStream - define a simple implementation
if (!global.ReadableStream) {
  class ReadableStream {
    constructor() {}
  }
  Object.assign(global, { ReadableStream });
}

// Mock Firebase modules before importing anything else
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({ appId: 'mock-app' })),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
  GoogleAuthProvider: jest.fn(),
  signInWithGoogle: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({ name: 'mock-firestore' })),
  collection: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  onSnapshot: jest.fn(),
  addDoc: jest.fn(),
  arrayUnion: jest.fn((val) => val),
  arrayRemove: jest.fn((val) => val),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({ name: 'mock-storage' })),
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

jest.mock('./firebase', () => ({
  auth: { currentUser: null },
  db: { name: 'mock-firestore' },
  storage: { name: 'mock-storage' },
}));

// Mock scrollIntoView which is not available in Jest environment
Element.prototype.scrollIntoView = jest.fn();

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jest-axe adds custom jest matchers for accessibility testing
import 'jest-axe/extend-expect';
