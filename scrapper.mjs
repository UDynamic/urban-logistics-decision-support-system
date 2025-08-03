import puppeteer from 'puppeteer';
import fs from 'fs';
import readline from 'readline';
import districts from './data/districts.json' with { type: 'json' };
import routes from './data/routes.json' with { type: 'json' };


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
  otpInputSelector: 'input',

  // menue
  cabRequestBtn: '#ChoiceCab',

  // rout class selectors
  originSearchBtn: 'footer h6',
  originSearchInput: 'input[data-qa-id="search-input"]',
  firstSearchLi: 'li[data-index="0"]',
  originSearchSubmit: 'button[data-qa-id="confirm"]',
  destinationSearchBtn: 'footer h6',
  destinationSearchInput: 'input[data-qa-id="search-input"]',
  destinationSearchSubmit: 'button[data-qa-id="confirm"]',

  // back button
  backButton: 'button[aria-label="بازگشت"]',  

  cabPriceSelector: 'footer ul li span[data-qa-id="service-type-price-1"]',
  bikePriceTab: 'footer div button:nth-of-type(2)',
  bikePriceSelector: 'footer ul li span[data-qa-id="service-type-price-7"]',
  bikeDelivaryTab: 'footer div button:nth-of-type(3)',
  bikeDelivaryPriceSelector: 'footer ul li span[data-qa-id="service-type-price-5"]'
};

const urls = {
  loginUrl: "https://app.snapp.taxi/login",
  menueUrl: "https://app.snapp.taxi/"
}

const params = {
  phoneNumber: '09130398835',
}

const routesExample = [
  {
    "id": "D01_N01__D22_N13",
    "origin": {
      "id": "D01_N01",
      "name": "ازگل"
    },
    "destination": {
      "id": "D22_N13",
      "name": "شهرک راه آهن"
    }
  },
  {
    "id": "D21_N13__D16_N01",
    "origin": {
      "id": "D21_N13",
      "name": "چیتگر جنوبی (شهرک ۲۲ بهمن)"
    },
    "destination": {
      "id": "D16_N01",
      "name": "جوادیه"
    }
  }
];

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

// persian price text to math numbers
function persianToNumber(str) {
  if (!str) return 0;

  // Replace Persian and Arabic-Indic digits with English digits
  const englishStr = str
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))  // Persian
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)); // Arabic-Indic

  // Remove any thousands separators like "٬" or ","
  return Number(englishStr.replace(/[٬,]/g, ''));
}


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
// 4. OOP implementation
// #########################################################
class PriceResult {
  constructor(routeId, cabPriceText, bikePriceText, bikeDelivaryPriceText, durationMs) {
    this.routeId = routeId;

    // Raw text
    this.cabPriceText = cabPriceText;
    this.bikePriceText = bikePriceText;
    this.bikeDelivaryPriceText = bikeDelivaryPriceText;

    // Numbers
    this.cabPriceNumber = persianToNumber(cabPriceText);
    this.bikePriceNumber = persianToNumber(bikePriceText);
    this.bikeDelivaryPriceNumber = persianToNumber(bikeDelivaryPriceText);

    // Metadata
    this.timestamp = new Date(); // Track when data was fetched
    this.durationMs = durationMs; // Time spent for this iteration
  }
}

class PriceScraper {
  constructor(page, selectors) {
    this.page = page;          // Puppeteer page instance
    this.selectors = selectors; // Object with all CSS selectors
  }

  // Extracts all price types for a given route
  async extractPrice(route) {
    console.log(`\n[INFO] Extracting prices for route: ${route.id} (${route.origin.name} -> ${route.destination.name})`);

    // 1. Input origin
    console.log("[STEP] Entering origin...");
    await this.page.click(this.selectors.originSearchBtn);
    await this.page.type(this.selectors.originSearchInput, route.origin.name, { delay: 100 });
    await sleep(3000);
    await this.page.click(this.selectors.firstSearchLi);
    await sleep(3000);
    await this.page.click(this.selectors.originSearchSubmit);

    // 2. Input destination
    console.log("[STEP] Entering destination...");
    await this.page.click(this.selectors.destinationSearchBtn);
    await this.page.type(this.selectors.destinationSearchInput, route.destination.name, { delay: 100 });
    await sleep(3000);
    await this.page.click(this.selectors.firstSearchLi);
    await sleep(3000);
    await this.page.click(this.selectors.destinationSearchSubmit);

    // 3. Extract cab price
    console.log("[STEP] Extracting cab price...");
    await sleep(3000);
    const cabPriceText = await this.page.$eval(
      this.selectors.cabPriceSelector,
      el => el.textContent.trim()
    );
    console.log(`  [DATA] Cab price: ${cabPriceText}`);

    // 4. Extract bike price
    console.log("[STEP] Extracting bike price...");
    await this.page.click(this.selectors.bikePriceTab);
    await sleep(3000);
    const bikePriceText = await this.page.$eval(
      this.selectors.bikePriceSelector,
      el => el.textContent.trim()
    );
    console.log(`  [DATA] Bike price: ${bikePriceText}`);

    // 5. Extract bike delivery price
    console.log("[STEP] Extracting bike delivery price...");
    await this.page.click(this.selectors.bikeDelivaryTab);
    await sleep(3000);
    const bikeDelivaryPriceText = await this.page.$eval(
      this.selectors.bikeDelivaryPriceSelector,
      el => el.textContent.trim()
    );
    console.log(`  [DATA] Bike delivery price: ${bikeDelivaryPriceText}`);

    // 6. Return structured result
    console.log(`[INFO] Extraction complete for route: ${route.id}`);
    await this.page.click(this.selectors.backButton);
    await sleep(1000);
    await this.page.click(this.selectors.backButton);
    await sleep(1000);
    return new PriceResult(
      route.id,
      cabPriceText,
      bikePriceText,
      bikeDelivaryPriceText
    );
  }
}


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

  // login URL
  console.log('🛬 Login page loading...');
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

  // !TODO
  console.log('🆗 no popups detected!')

  // Cab Requestion from menue
  await page.waitForSelector(selectors.cabRequestBtn, {
    visible: true, waitUntil: 'networkidle2'
  });
  await page.click(selectors.cabRequestBtn);
  console.log('🚕 Cab request button detected and clicked!')

  // initiation of the scraper
  const scraper = new PriceScraper(page, selectors);

  // extraction of the prices for all routes
  for (const route of routesExample) {
    const priceResult = await scraper.extractPrice(route);
    console.log('[RESULT]', priceResult);
  }


  // ---------------------------------------------------------
  await sleep(10000);
  await browser.close();
})();
