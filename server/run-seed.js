const fs = require('fs');
const { Client } = require('pg');

const runSeed = async () => {
    const connectionString = 'postgresql://postgres.wtxsvhubriusvsikigzu:Rxddqysproj@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting to database...');
        await client.connect();

        console.log('Reading seed file...');
        const seedSql = fs.readFileSync('sql/seed-data.sql', 'utf8');

        console.log('Executing seed script...');
        await client.query(seedSql);

        console.log('Seed executed successfully!');
    } catch (err) {
        console.error('Error executing seed:', err);
    } finally {
        await client.end();
    }
};

runSeed();
