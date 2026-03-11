const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

async function run() {
    await client.connect();
    try {
        const res = await client.query(`
      SELECT 
        s.id AS step_id,
        s.step_number,
        s.prompt,
        s.prompt_audio_url,
        s.hint_1,
        s.hint_2,
        s.hint_3,
        s.correct_option_id, 
        json_agg(
          json_build_object(
            'id', o.id,
            'text', o.option_text,
            'audio', o.option_audio_url,
            'order', o.option_order
          )
          ORDER BY o.option_order
        ) AS options
      FROM exercise_steps s
      LEFT JOIN exercise_step_options o ON o.step_id = s.id
      WHERE s.exercise_id = 1
      GROUP BY s.id
      ORDER BY s.step_number;
    `);
        console.log("SUCCESS length:", res.rows.length);
    } catch (e) {
        console.error("PG ERROR:", e.message);
    } finally {
        await client.end();
    }
}

run();
