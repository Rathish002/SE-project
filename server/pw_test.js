const { Client } = require('pg');

async function testPw(pw) {
    try {
        const u = `postgresql://postgres:${pw}@localhost:5432/se_project`;
        const c = new Client({ connectionString: u });
        await c.connect();
        console.log('SUCCESS se_project password:', pw);
        await c.end();
        return true;
    } catch (e) { }
    try {
        const u2 = `postgresql://postgres:${pw}@localhost:5432/se_project_db`;
        const c2 = new Client({ connectionString: u2 });
        await c2.connect();
        console.log('SUCCESS se_project_db password:', pw);
        await c2.end();
        return true;
    } catch (e) { }
    return false;
}

async function run() {
    for (let pw of ['postgres', 'admin', 'root', 'password', '']) {
        if (await testPw(pw)) {
            process.exit(0);
        }
    }
    console.log('ALL FAILED');
}

run();
