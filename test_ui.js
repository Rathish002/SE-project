const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    // Intercept console messages
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

    await page.goto('http://localhost:3000');

    // Click "Lesson Section"
    try {
        await page.waitForSelector('.feature-card.lessons-card', { timeout: 5000 });
        await page.click('.feature-card.lessons-card');
        console.log("Clicked lesson section");

        // Click "Start Lesson" for Lesson 1
        await page.waitForSelector('.start-btn', { timeout: 5000 });
        await page.click('.start-btn'); // Clicks the first one
        console.log("Clicked start lesson");

        // Click "Go to Exercise Page"
        await page.waitForSelector('.action-buttons button.primary-btn', { timeout: 5000 });
        await page.click('.action-buttons button.primary-btn');
        console.log("Clicked go to exercise page");

        // Wait for options to load
        await page.waitForSelector('.option-btn', { timeout: 5000 });

        // Override the checkAnswer function on window or evaluate directly?
        // Better: let's inject a script to log the internal React state if possible, or just look at DOM.
        // Wait, we can't easily access React state. What if we just click and see the feedback?

        // Click option 0 ("Namaste")
        const btns = await page.$$('.option-btn');
        console.log("Found", btns.length, "options");
        await btns[0].click();
        console.log("Clicked option 0");

        // Click "Check Answer"
        const checkBtn = await page.$('.check-btn');
        await checkBtn.click();
        console.log("Clicked check answer");

        // Wait a moment for feedback
        await new Promise(r => setTimeout(r, 1000));
        const feedback = await page.$eval('.feedback-text', el => el.textContent);
        console.log("Feedback:", feedback);

    } catch (err) {
        console.error(err);
    } finally {
        await browser.close();
    }
})();
