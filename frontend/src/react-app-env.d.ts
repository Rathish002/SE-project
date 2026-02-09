/// <reference types="react-scripts" />

declare module 'firebase/auth' {
    export const getAuth: any;
    export const onAuthStateChanged: any;
    export const GoogleAuthProvider: any;
    export const signInWithPopup: any;
    export const signInWithEmailAndPassword: any;
    export const createUserWithEmailAndPassword: any;
    export const signOut: any;
    export const sendPasswordResetEmail: any;
    export const updateProfile: any;
    export const updatePassword: any;
    export const reauthenticateWithCredential: any;
    export const EmailAuthProvider: any;
    export const deleteUser: any;

    export interface User {
        uid: string;
        email: string | null;
        displayName: string | null;
        photoURL: string | null;
        [key: string]: any;
    }

    export type Auth = any;
}

declare module 'firebase/firestore' {
    export const getFirestore: any;
    export const collection: any;
    export const addDoc: any;
    export const getDocs: any;
    export const doc: any;
    export const getDoc: any;
    export const setDoc: any;
    export const updateDoc: any;
    export const deleteDoc: any;
    export const onSnapshot: any;
    export const query: any;
    export const where: any;
    export const orderBy: any;
    export const limit: any;
    export const startAfter: any;
    export const serverTimestamp: any;
    export const Timestamp: any;
    export const arrayUnion: any;
    export const arrayRemove: any;
    export const deleteField: any;
    export type QuerySnapshot<T = any> = any;
    export type DocumentData = any;
    export type QueryDocumentSnapshot<T = any> = any;
    export type DocumentSnapshot<T = any> = any;
    export type Timestamp = any;
}

declare module 'firebase/storage' {
    export const getStorage: any;
    export const ref: any;
    export const uploadBytes: any;
    export const getDownloadURL: any;
}

declare module 'firebase/app' {
    export const initializeApp: any;
}
