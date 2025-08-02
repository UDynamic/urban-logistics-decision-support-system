import puppeteer from 'puppeteer';
import fs from 'fs';
import readline from 'readline';
import districts from './data/districts.json' with { type: 'json' };



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
  await page.waitForSelector(selectors.cabRequestBtn, {
    visible: true, waitUntil: 'networkidle2'
  });
  await page.click(selectors.cabRequestBtn);
  console.log('🚕 Cab request button detected and clicked!')

  // #########################################################
  // 6. Route Class
  // #########################################################

  // origin search bar selected
  await page.waitForSelector(selectors.originSearchBtn, { visible: true, waitUntil: 'networkidle2' });
  await page.click(selectors.originSearchBtn, { clickCount: 3 });

  // origin inputed
  await page.waitForSelector(selectors.originSearchInput, { visible: true, waitUntil: 'networkidle2' });
  console.log("🔍 origin searchbar found and active");


  // Clear any existing text in search input
  await page.click(selectors.destinationSearchInput, { clickCount: 3 });
  await page.keyboard.press('Backspace');

  // Type in origin search input
  await page.type(selectors.originSearchInput, "میدان راه آهن", { delay: 100 }); // delay for if prevents fast typing
  console.log("📝 origin typed");

  // Select first item in the search results
  await page.waitForSelector(selectors.firstSearchLi, { visible: true, waitUntil: 'networkidle2' });
  await page.click(selectors.firstSearchLi, { clickCount: 3 });
  console.log("👆 first item selected");

  // submit origin
  await page.waitForSelector(selectors.originSearchSubmit, { visible: true, waitUntil: 'networkidle2' });
  await sleep(2000);
  await page.click(selectors.originSearchSubmit, { clickCount: 3 });
  console.log("📤 origin submitted");
  await sleep(2000);

  //destination search bar 
  await page.waitForSelector(selectors.destinationSearchBtn, { visible: true, waitUntil: 'networkidle2' });
  await page.click(selectors.destinationSearchBtn, { clickCount: 3 });
  console.log("🔍 destination searchbar found and active");


  // Clear any existing text in search input
  await page.click(selectors.destinationSearchInput, { clickCount: 3 });
  await page.keyboard.press('Backspace');

  // Type in destination search input
  await page.type(selectors.destinationSearchInput, "دهکده المپیک", { delay: 100 }); // delay for if prevents fast typing
  console.log("📝 destination typed");

  // Select first item in the search results
  await page.waitForSelector(selectors.firstSearchLi, { visible: true, waitUntil: 'networkidle2' });
  await page.click(selectors.firstSearchLi, { clickCount: 3 });
  console.log("👆 first item selected");
  await sleep(2000);

  // submit destination
  await page.waitForSelector(selectors.destinationSearchSubmit, { visible: true });
  await sleep(2000);
  await page.click(selectors.destinationSearchSubmit, { clickCount: 3 });
  console.log("📤 destination submitted");


  page.waitForSelector(selectors.cabPriceSelector, { visible: true })
    .then(() => page.$(selectors.cabPriceSelector))
    .then(element => page.evaluate(el => el.textContent.trim(), element))
    .then(cabPriceText => {
      console.log("💰🚕 cab Price text:", cabPriceText);

      // Convert price to number
      const cabPriceNumber = persianToNumber(cabPriceText);
      console.log("💰🚕 cab price as number:", cabPriceNumber);

      // Transition to Bike price section
      return page.waitForSelector(selectors.bikePriceTab, { visible: true });
    })
    .then(() => page.click(selectors.bikePriceTab, { clickCount: 3 }))
    .catch(err => console.error("❌ Error during price extraction:", err));

  page.waitForSelector(selectors.bikePriceSelector, { visible: true })
    .then(() => page.$(selectors.bikePriceSelector))
    .then(element => page.evaluate(el => el.textContent.trim(), element))
    .then(bikePriceText => {
      console.log("💰🏍️ Bike Price text:", bikePriceText);

      // Convert price to number
      const bikePriceNumber = persianToNumber(bikePriceText);
      console.log("💰🏍️ Bike price as number:", bikePriceNumber);

      // Transition to Bike price section
      return page.waitForSelector(selectors.bikeDelivaryTab, { visible: true });
    })
    .then(() => page.click(selectors.bikeDelivaryTab, { clickCount: 3 }))
    .catch(err => console.error("❌ Error during price extraction:", err));

  page.waitForSelector(selectors.bikeDelivaryPriceSelector, { visible: true })
    .then(() => page.$(selectors.bikeDelivaryPriceSelector))
    .then(element => page.evaluate(el => el.textContent.trim(), element))
    .then(bikeDelivaryPriceText => {
      console.log("💰🛵 Bike delivary Price text:", bikeDelivaryPriceText);

      // Convert price to number
      const bikeDelivaryPriceNumber = persianToNumber(bikeDelivaryPriceText);
      console.log("💰🛵 Bike delivary price as number:", bikeDelivaryPriceNumber);
    })
    .catch(err => console.error("❌ Error during price extraction:", err));

    

  // ---------------------------------------------------------
  await sleep(10000);
  await browser.close();
})();
