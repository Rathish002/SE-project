const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    const client = await pool.connect();

    const res = await client.query(`
        SELECT es.id as step_id, es.prompt, es.correct_option_id, eso.id as opt_id, eso.option_text 
        FROM exercise_steps es 
        JOIN exercises e on e.id = es.exercise_id
        JOIN exercise_step_options eso ON es.id = eso.step_id 
        WHERE e.lesson_id = 1
    `);

    console.log("DB DATA:");

    const steps = {};
    res.rows.forEach(r => {
        if (!steps[r.step_id]) steps[r.step_id] = { prompt: r.prompt, correct_id: r.correct_option_id, options: [] };
        steps[r.step_id].options.push({ id: r.opt_id, text: r.option_text });
    });

    console.dir(steps, { depth: null });

    client.release();
    await pool.end();
}

run();
