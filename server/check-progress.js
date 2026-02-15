const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkProgress() {
    try {
        const client = await pool.connect();
        console.log('Connected to database...');

        const res = await client.query('SELECT * FROM exercise_progress ORDER BY updated_at DESC LIMIT 10');

        console.log('\n--- Recent Exercise Progress ---');
        if (res.rows.length === 0) {
            console.log('No progress found yet. Try completing some exercises on the frontend!');
        } else {
            console.table(res.rows);
        }

        client.release();
    } catch (err) {
        console.error('Error querying database:', err);
    } finally {
        await pool.end();
    }
}

checkProgress();
