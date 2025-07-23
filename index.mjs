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


  // Type the phone number
  await page.waitForSelector('input[data-qa-id="cellphone-number-input"]', { visible: true });
  await page.type('input[data-qa-id="cellphone-number-input"]', '09173978579');
  console.log('🔐 Phone number entered');


  // Click the submit button (adjust the selector to match the one that says "ورود به وب اپلیکیشن اسنپ")
  await page.waitForSelector('#login-submit', { visible: true });
  await page.click('#login-submit');
  console.log('🔐 Login button clicked');

  try {
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
      await page.waitForTimeout(2000);
    }
  } catch (e) {
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

  // #########################################################
  // 3. Click on the login button
  // #########################################################


  await sleep(5000);
  await browser.close();
})();
