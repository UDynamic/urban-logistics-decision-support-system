import puppeteer from 'puppeteer';
import fs from 'fs';
import readline from 'readline';

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve =>
    rl.question(query, ans => {
      rl.close();
      resolve(ans);
    })
  );
}


const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    args: [
      '--window-size=600,800',
    ],
    userDataDir: "./tmp",
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" // Update this path if needed
  });

  const page = await browser.newPage();

  // Close the default blank tab
  const pages = await browser.pages();
  await pages[0].close();

  // #########################################################
  // 1. Go to login page
  // #########################################################

  const urlLanding = 'https://app.snapp.taxi/login';
  await page.goto(urlLanding, { waitUntil: 'networkidle2' });
  console.log('🔐 Login page loaded');

  const currentUrl = page.url()
  if (currentUrl !== "https://app.snapp.taxi/") {

    console.log('⛔ not Authenticated, commencing authentication');
    // Type the phone number
    await page.waitForSelector('input[data-qa-id="cellphone-number-input"]', { visible: true })
    await page.type('input[data-qa-id="cellphone-number-input"]', '09130398835');
    console.log('🔐 Phone number entered');


    // Click the submit button (adjust the selector to match the one that says "ورود به وب اپلیکیشن اسنپ")
    await page.waitForSelector('#login-submit', { visible: true });
    await page.click('#login-submit');
    console.log('🔐 Login button clicked');

    const captchaDialog = await page.waitForSelector('div[role="dialog"]', {
      visible: true,
      timeout: 3000, // Don't wait forever
    });

    if (captchaDialog) {
      console.log('🔐 CAPTCHA dialog recognized');

      const captchaInput = await askQuestion('🔐 Enter CAPTCHA shown in image: ');
      await page.type('input[placeholder="کدی را که در تصویر بالا می‌بینید وارد کنید"]', captchaInput);
      console.log('🔐 CAPTCHA entered');

      await page.keyboard.press('Enter');
      console.log('🔐 CAPTCHA submitted');

      // Optional: wait a little for the OTP input to load properly
      sleep(2000);
    } else {
      console.log('✅ No CAPTCHA dialog detected, continuing to OTP...');
    }
    // #########################################################
    // 2. OTP input
    // #########################################################

    // Wait for OTP input field to appear
    await page.waitForSelector('input[type="tel"]', { visible: true });
    console.log('🔐 OTP input detected')

    // Ask user to enter the OTP in console
    const otpCode = await askQuestion('🔐 Enter OTP code: ');
    // Type the OTP into the web page
    await page.type('input[type="tel"]', otpCode);
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
  }
  // #########################################################
  // 3. Middle popups
  // #########################################################
  // ignored for now
  console.log('👍no popups detected!')

  // #########################################################
  // 4. Click on the cab request
  // #########################################################

  await page.waitForSelector('#ChoiceCab', { visible: true });
  await page.click('#ChoiceCab');
  console.log('🚕 Cab request button detected and clicked!')

  // #########################################################
  // 5. Canvas preparation
  // #########################################################
  await page.hover('canvas'); // Ensure canvas is focused

  await page.mouse.wheel({ deltaY: 5000 }); // Scroll down to zoom out
  await page.mouse.wheel({ deltaY: 5000 }); // Scroll down to zoom out
  await page.mouse.wheel({ deltaY: 5000 }); // Scroll down to zoom out

  const canvas = await page.$('canvas');
  const boundingBox = await canvas.boundingBox();

  // #########################################################
  // 6. Route Class
  // #########################################################
  class RouteAnalyzer {
    /**
     * @param {puppeteer.Page} page - Puppeteer page instance
     * @param {Object} districtDB - Object with district codes as keys, search terms as values
     * @param {Object} selectors - All selectors needed for input fields, buttons, etc.
     */
    constructor(page, districtDB, selectors) {
      this.page = page;
      this.districtDB = districtDB;
      this.selectors = selectors;
    }

    // Main loop: for each origin, loop over all destinations
    async run() {
      const districtCodes = Object.keys(this.districtDB);

      for (const originCode of districtCodes) {
        const originName = this.districtDB[originCode];
        console.log(`🚩 Origin: ${originCode} (${originName})`);

        for (const destCode of districtCodes) {
          const destinationName = this.districtDB[destCode];

          if (originCode === destCode) {
            console.log(`⏩ Skipping same district (${originCode})`);
            continue;
          }

          console.log(`➡️ Route: ${originCode} ➡️ ${destCode}`);

          try {
            await this.setOrigin(originName);
            await this.setDestination(destinationName);
            await this.extractRouteData(originCode, destCode);
          } catch (err) {
            console.error(`❌ Failed route ${originCode} ➡️ ${destCode}:`, err.message);
          }

          await this.reset();
        }
      }

      console.log("✅ All routes analyzed.");
    }

    // Set origin by typing into the search input
    async setOrigin(searchQuery) {
      await this.page.waitForSelector(this.selectors.originInput, { visible: true });
      await this.page.click(this.selectors.originInput, { clickCount: 3 });
      await this.page.keyboard.press('Backspace');
      await this.page.type(this.selectors.originInput, searchQuery, { delay: 50 });

      await this.page.waitForSelector(this.selectors.resultItem, { visible: true });
      await this.page.click(this.selectors.resultItem);
      await this.page.click(this.selectors.originSubmit);
    }

    // Set destination by typing into the same or another input
    async setDestination(searchQuery) {
      await this.page.waitForSelector(this.selectors.destinationInput, { visible: true });
      await this.page.click(this.selectors.destinationInput, { clickCount: 3 });
      await this.page.keyboard.press('Backspace');
      await this.page.type(this.selectors.destinationInput, searchQuery, { delay: 50 });

      await this.page.waitForSelector(this.selectors.resultItem, { visible: true });
      await this.page.click(this.selectors.resultItem);
      await this.page.click(this.selectors.destinationSubmit);
    }

    // Placeholder: Implement how to extract the route info
    async extractRouteData(originCode, destCode) {
      console.log(`🔍 Extracting data for ${originCode} ➡️ ${destCode}`);
      // TODO: Add your actual logic here (screenshot, scrape price/time, etc.)
    }

    // Clear or reset the interface between routes
    async reset() {
      // TODO: Implement if there's a "clear" or "reset" button
      // Or just reload the page if it's cleaner
      await this.page.reload({ waitUntil: 'networkidle2' });
    }
  }

  // #########################################################
  // 7. Route parameters
  // #########################################################
  // Define your district code-to-searchText mapping
  const districtSearchMap = {
    D01: "تهران‌پارس",
    D02: "صادقیه",
    D03: "تجریش",
    // ... D04 to D22
  };

  // Define all selectors once
  const selectors = {
    originInput: 'input[data-qa-id="origin-search-input"]',          // example
    destinationInput: 'input[data-qa-id="destination-search-input"]', // example
    resultItem: 'ul li:first-child',
    originSubmit: 'button[data-qa-id="origin-submit"]',
    destinationSubmit: 'button[data-qa-id="destination-submit"]',
  };


  // #########################################################
  // 7. Instantiate Navigation Class 
  // #########################################################
  const analyzer = new RouteAnalyzer(page, districtSearchMap, selectors);
  await analyzer.run();





  // ---------------------------------------------------------
  // ---------------------------------------------------------
  await sleep(50000);
  await browser.close();
})();
