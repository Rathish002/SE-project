import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3001';

export interface UserStats {
    lessonsStarted: number;
    lessonsCompleted: number;
}

/**
 * Fetches learning statistics for a given user.
 * This service is dedicated to progress tracking.
 */
export const fetchUserStats = async (userId: string): Promise<UserStats> => {
    try {
        const response = await axios.get(`${API_URL}/user/${userId}/stats`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return {
            lessonsStarted: 0,
            lessonsCompleted: 0
        };
    }
};

/**
 * Fetches the specific IDs of lessons completed by the user.
 */
export const fetchCompletedLessons = async (userId: string): Promise<number[]> => {
    try {
        const response = await axios.get(`${API_URL}/user/${userId}/completed-lessons`);
        return response.data.completedLessonIds || [];
    } catch (error) {
        console.error('Error fetching completed lessons:', error);
        return [];
    }
};
