import puppeteer from 'puppeteer';
import fs from 'fs';
import readline from 'readline';
import districts from './data/Districts.json' with { type: 'json' };



// #########################################################
// 00. Selectors and parameters
// #########################################################

// Defining all selectors for modular design
const selectors = {
  // login selectors
  phoneNumberInput: 'input[data-qa-id="cellphone-number-input"]',
  logInSubmitButton: '#login-submit',
  captchaDialog: 'div[role="dialog"]',
  captchaInput: 'input[placeholder="کدی را که در تصویر بالا می‌بینید وارد کنید"]',
  otpInputSelector: 'input[type="tel"]',

  // menue
  cabRequestBtn:'#ChoiceCab',

  // rout class selectors
  originSearchBtn: 'footer h6',
  originSearchInput: 'input[data-qa-id="search-input"]',
  destinationInput: 'input[data-qa-id="destination-search-input"]',
  resultItem: 'ul li:first-child',
  originSubmit: 'button[data-qa-id="origin-submit"]',
  destinationSubmit: 'button[data-qa-id="destination-submit"]',
};

const urls = {
  loginUrl: "https://app.snapp.taxi/login",
  menueUrl: "https://app.snapp.taxi/"
}

const params = {
  phoneNumber: '09130398835',
}


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
  await page.goto(urls.loginUrl, { waitUntil: 'networkidle2' });
  console.log('🛬 Login page loaded');

  // User Data persistance (loged in automatically or must run authentication)
  if (page.url() !== urls.menueUrl) {
    console.log('🔐 not Authenticated, commencing authentication');

    // Type the phone number
    await page.waitForSelector(selectors.phoneNumberInput, { visible: true })
    await page.type(selectors.phoneNumberInput, params.phoneNumber);
    console.log('📱 Phone number entered');


    // Click the submit button
    await page.waitForSelector(selectors.logInSubmitButton, { visible: true });
    await page.click(selectors.logInSubmitButton);
    console.log('👆 Login button clicked');

    // Captcha recognition
    const captchaDialog = await page.waitForSelector(selectors.captchaDialog, {
      visible: true,
      timeout: 1000,
    });

    // if there is captcha 
    if (selectors.captchaDialog) {
      console.log('⛔ CAPTCHA dialog recognized');

      // user input captcha solution
      const captchaSolution = await askQuestion('🔐 Enter CAPTCHA shown in image: ');
      await page.type(selectors.captchaInput, captchaSolution);
      console.log('📝 CAPTCHA entered');

      // captcha submission
      await page.keyboard.press('Enter');
      console.log('👆 CAPTCHA submitted');
    } else {
      console.log('🆗 No CAPTCHA dialog detected, continuing to OTP...');
    }
    // #########################################################
    // 2. OTP input
    // #########################################################

    // Wait for OTP input field to appear
    await page.waitForSelector(selectors.otpInputSelector, { visible: true });
    console.log('🔐 OTP input detected')

    // Ask user to enter the OTP in console
    const otpCode = await askQuestion('🔑 Enter OTP code: ');
    
    // Type the OTP into the web page (automatic submission)
    await page.type(selectors.otpInputSelector, otpCode);
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
  await page.waitForSelector(selectors.cabRequestBtn, { visible: true });
  await page.click(selectors.cabRequestBtn);
  console.log('🚕 Cab request button detected and clicked!')

  // #########################################################
  // 6. Route Class
  // #########################################################
  while (true) {
    // origin search bar selected
    await page.waitForSelector(selectors.originSearchBtn, { visible: true });
    await page.click(selectors.originSearchBtn);

    // origin inputed
    await page.waitForSelector(originSearchInput, { visible: true });
    await page.type(originSearchInput, districts);
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
