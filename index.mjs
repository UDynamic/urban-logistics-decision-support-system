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
  await page.type('input[data-qa-id="cellphone-number-input"]', '09130398835');
  console.log('🔐 Phone number entered');

  if (await page.$x("//h6[contains(text(), 'نیاز به کد امنیتی')]")) {
    // Handle CAPTCHA
    console.log("🔐 Capcha detected!")
    // Ask user to view the image and input the text
    const captchaInput = await askQuestion('🔐 Enter CAPTCHA shown in image: ');

    // Type into input field (adjust selector)
    await page.type('input[placeholder="کدی را که در تصویر بالا می‌بینید وارد کنید"]', captchaInput);

    // Click the submit button for captcha
    await page.waitForSelector('button[type="submit"]', { visible: true });
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Wait for OTP input field to appear
    await page.waitForSelector('input[data-qa-id="input-otp"]', { visible: true });
    // Ask user to enter the OTP in console
    const otpCode = await askQuestion('🔐 Enter OTP code: ');
    // Type the OTP into the web page
    await page.type('input[data-qa-id="input-otp"]', otpCode);
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

  }

  // Click the submit button (adjust the selector to match the one that says "ورود به وب اپلیکیشن اسنپ")
  await page.waitForSelector('#login-submit', { visible: true });
  await page.click('#login-submit');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  console.log('🔐 Login button clicked');

  // #########################################################
  // 2. OTP input
  // #########################################################
  await page.waitForTimeout(2000)

  await page.$('input[data-qa-id="input-otp"]');
  // Wait for OTP input field to appear
  await page.waitForSelector('input[data-qa-id="input-otp"]', { visible: true });
  // Ask user to enter the OTP in console
  const otpCode = await askQuestion('🔐 Enter OTP code: ');
  // Type the OTP into the web page
  await page.type('input[data-qa-id="input-otp"]', otpCode);
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
}

  // #########################################################
  // 3. Click on the login button
  // #########################################################


  await sleep(5000);
await browser.close();
}) ();
