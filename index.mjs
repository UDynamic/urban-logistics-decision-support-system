import puppeteer from 'puppeteer';
import fs from 'fs';

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    userDataDir: "./tmp",
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" // Update this path if needed
  });




  const page = await browser.newPage();

  // Close the default blank tab
  const pages = await browser.pages();
  await pages[0].close();


  // 1. Go to landing page
  const urlLanding = 'https://app.snapp.taxi/login';
  await page.goto(urlLanding, { waitUntil: 'networkidle2' });

  // 2. Go to login page
  await page.waitForSelector('input[data-qa-id="cellphone-number-input"]', { visible: true });

  // Type the phone number
  await page.type('input[data-qa-id="cellphone-number-input"]', '09130398835');

  // Click the submit button (adjust the selector to match the one that says "ورود به وب اپلیکیشن اسنپ")
  await page.waitForSelector('button[type="button"]', { visible: true });
  await sleep(3000);
  await page.click('button[type="button"]'); // Or a better selector if needed
  await page.waitForNavigation({ waitUntil: 'networkidle2' });


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
    await sleep(5000);
  await browser.close();
})();
