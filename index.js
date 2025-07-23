const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" // Update this path if needed
  });
  const page = await browser.newPage();

  // 1. Go to landing page
  const urlLanding = 'https://snapp.ir/';
  await page.goto(urlLanding, { waitUntil: 'networkidle2' });

  // 2. Login (replace selectors and credentials as needed)
//   await page.type('#username', 'yourUsername'); // Replace with actual selector
//   await page.type('#password', 'yourPassword'); // Replace with actual selector
//   await Promise.all([
//     page.click('#loginButton'), // Replace with actual selector
//     page.waitForNavigation({ waitUntil: 'networkidle2' }),
//   ]);

//   // 3. On menu page, navigate to main page (e.g., click a menu item)
//   await Promise.all([
//     page.click('#mainMenuItem'), // Replace with actual selector
//     page.waitForNavigation({ waitUntil: 'networkidle2' }),
//   ]);

//   // 4. Now on main page, scrape as needed
//   const mainContent = await page.$eval('#mainContent', el => el.textContent); // Replace selector
//   console.log('Main Content:', mainContent);

//   await browser.close();
})();
