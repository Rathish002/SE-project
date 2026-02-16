```javascript
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function initDB() {
    try {
        const client = await pool.connect();
        console.log('✅ Connected to database...');

        // Safety check removed to force fresh install for user
        console.log('🔄 Forcing fresh database initialization...');

        // 🔴 SAFETY: Clean slate. Drop verify tables are gone before creating.
        console.log('Resetting tables (DROP CASCADE)...');
        await client.query(`
            DROP TABLE IF EXISTS exercise_answers CASCADE;
            DROP TABLE IF EXISTS exercise_progress CASCADE;
            DROP TABLE IF EXISTS exercise_step_options CASCADE;
            DROP TABLE IF EXISTS exercise_steps CASCADE;
            DROP TABLE IF EXISTS exercises CASCADE;
            DROP TABLE IF EXISTS lesson_keywords CASCADE;
            DROP TABLE IF EXISTS lessons CASCADE;
            DROP TABLE IF EXISTS evaluation_rules CASCADE;
            DROP TABLE IF EXISTS evaluation_intents CASCADE;
`);

        // Check tables are gone
        const check = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
    `);
        console.log('Tables remaining after drop: ' + check.rows.length);
        if (check.rows.length > 0) {
            check.rows.forEach(r => console.log(' - ' + r.table_name));
        }

        console.log('Creating schema...');
        const schemaSql = fs.readFileSync(path.join(__dirname, 'sql', 'schema.sql'), 'utf8');
        await client.query(schemaSql);

        console.log('Seeding data...');
        const seedSql = fs.readFileSync(path.join(__dirname, 'sql', 'seed-data.sql'), 'utf8');
        await client.query(seedSql);

        // Apply migration immediately
        console.log('Applying migration (user_id -> TEXT)...');
        const migrationSql = fs.readFileSync(path.join(__dirname, 'sql', 'update_schema_user_id.sql'), 'utf8');
        await client.query(migrationSql);

        console.log('✅ Database successfully initialized!');
        
        // Log counts
        const lessonCount = await client.query('SELECT COUNT(*) FROM lessons');
        console.log('Lessons created: ' + lessonCount.rows[0].count);

        client.release();
    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        await pool.end();
    }
}

initDB();
```
