
const fetch = require('node-fetch');

async function testExercisesApi() {
    const baseUrl = 'http://localhost:3001';
    // We'll test with lessonId 1 (Greetings)
    const lessonId = 1;

    console.log(`Testing GET /exercises/lesson/${lessonId}...`);
    try {
        const res = await fetch(`${baseUrl}/exercises/lesson/${lessonId}`);
        if (!res.ok) {
            console.error(`Status: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.error('Response:', text);
            return;
        }
        const data = await res.json();
        console.log('Success! Received data:');
        // Log structure summary
        if (data.exercises && Array.isArray(data.exercises)) {
            console.log(`Found ${data.exercises.length} exercises.`);
            if (data.exercises.length > 0) {
                console.log('First exercise sample:', JSON.stringify(data.exercises[0], null, 2));
            }
        } else {
            console.log('Unexpected data structure:', data);
        }

    } catch (err) {
        console.error('Fetch error:', err);
    }
}

testExercisesApi();
