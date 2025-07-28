import puppeteer from 'puppeteer';
import fs from 'fs';
import readline from 'readline';
import Districts from './data/Districts.json' with { type: 'json' };



// #########################################################
// 00. Selectors and parameters
// #########################################################

// Defining all selectors for modular design
const selectors = {
  originInput: 'footer h6',
  destinationInput: 'input[data-qa-id="destination-search-input"]', // example
  resultItem: 'ul li:first-child',
  originSubmit: 'button[data-qa-id="origin-submit"]',
  destinationSubmit: 'button[data-qa-id="destination-submit"]',
};


// #########################################################
// 00. Helper Functions
// #########################################################

// Input data via console
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

// sleep method for specific idle time
const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

/* neighborhood counter
const totalNeighborhoods = Districts.reduce((count, district) => {
    return count + district.neighborhoods.length;
}, 0);
console.log(`Total neighborhoods: ${totalNeighborhoods}`);
console.log("total routs: ", totalNeighborhoods * totalNeighborhoods);

## output:
Total neighborhoods: 408
Total routs:  166464
*/


// #########################################################
// 01. Pupetteer setup & lunch
// #########################################################

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

  // Closing the default first blank tab
  const pages = await browser.pages();
  await pages[0].close();

  // #########################################################
  // 02. Loging in through log in page
  // #########################################################

  // login URL
  await page.goto('https://app.snapp.taxi/login', { waitUntil: 'networkidle2' });
  console.log('🛬 Login page loaded');

  // User Data persistance (loged in automatically or must run authentication)
  if (page.url() !== "https://app.snapp.taxi/") {

    console.log('🔐 not Authenticated, commencing authentication');
    // Type the phone number
    await page.waitForSelector('input[data-qa-id="cellphone-number-input"]', { visible: true })
    await page.type('input[data-qa-id="cellphone-number-input"]', '09130398835');
    console.log('📱 Phone number entered');


    // Click the submit button (adjust the selector to match the one that says "ورود به وب اپلیکیشن اسنپ")
    await page.waitForSelector('#login-submit', { visible: true });
    await page.click('#login-submit');
    console.log('👆 Login button clicked');

    const captchaDialog = await page.waitForSelector('div[role="dialog"]', {
      visible: true,
      timeout: 3000, // Don't wait forever
    });

    if (captchaDialog) {
      console.log('⛔ CAPTCHA dialog recognized');

      const captchaInput = await askQuestion('🔐 Enter CAPTCHA shown in image: ');
      await page.type('input[placeholder="کدی را که در تصویر بالا می‌بینید وارد کنید"]', captchaInput);
      console.log('📝 CAPTCHA entered');

      await page.keyboard.press('Enter');
      console.log('👆 CAPTCHA submitted');

      // Optional: wait a little for the OTP input to load properly
      sleep(2000);
    } else {
      console.log('🆗 No CAPTCHA dialog detected, continuing to OTP...');
    }
    // #########################################################
    // 2. OTP input
    // #########################################################

    // Wait for OTP input field to appear
    await page.waitForSelector('input[type="tel"]', { visible: true });
    console.log('🔐 OTP input detected')

    // Ask user to enter the OTP in console
    const otpCode = await askQuestion('🔑 Enter OTP code: ');
    // Type the OTP into the web page
    await page.type('input[type="tel"]', otpCode);
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
  }

  // #########################################################
  // 3. Middle popups for Menue
  // #########################################################

  // !TODO
  console.log('🆗 no popups detected!')

  // #########################################################
  // 4. Urban logistics Micro service (from menue)
  // #########################################################

  // Cab Requestion from menue
  await page.waitForSelector('#ChoiceCab', { visible: true });
  await page.click('#ChoiceCab');
  console.log('🚕 Cab request button detected and clicked!')

  // #########################################################
  // 6. Route Class
  // #########################################################
  while (true) { 
  await page.waitForSelector(selectors.originInput, { visible: true });
  await page.click(selectors.originInput);
  sleep(5000)
}

  // main scrapper process and logic
  class routeScrapper {
    /**
     * @param {puppeteer.Page} page - Puppeteer page instance
     * @param {Object} Districts - Object with district codes as keys, search terms as values
     * @param {Object} selectors - All selectors needed for input fields, buttons, etc.
     */
    constructor(page, Districts, routeSelectors) {
      this.page = page;
      this.Districts = Districts;
      this.routeSelectors = routeSelectors;
    }

    // Main loop: for each origin, loop over all destinations
    async run() {
      const districtCodes = Object.keys(this.Districts);

      for (const originCode of districtCodes) {
        const originName = this.Districts[originCode];
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
  // 7. Instantiate Navigation Class 
  // #########################################################
  const scrapper = new routeScrapper(page, districtSearchMap, selectors);
  await scrapper.run();


  // ---------------------------------------------------------
  // ---------------------------------------------------------
  await sleep(50000);
  await browser.close();
})();
