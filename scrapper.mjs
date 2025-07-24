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
  // 6. Navigator Class
  // #########################################################
  class CanvasNavigator {
    constructor(page, boundingBox, referenceWidth = 1000, baseStepLength = 100) {
      this.page = page;
      this.boundingBox = boundingBox;
      this.baseStepLength = baseStepLength;

      this.startX = boundingBox.x + boundingBox.width / 2;
      this.startY = boundingBox.y + boundingBox.height / 2;

      const scaleFactor = boundingBox.width / referenceWidth;
      this.stepLength = baseStepLength * scaleFactor;

      this.directionVectors = {
        right: { x: -1, y: 0 },
        up: { x: 0, y: 1 },
        left: { x: 1, y: 0 },
        down: { x: 0, y: -1 },
      };
    }

    async moveInDirection(direction, steps) {
      const vector = this.directionVectors[direction];
      if (!vector) {
        throw new Error(`Unknown direction: ${direction}`);
      }

      console.log(`🚀 Starting to move ${steps} steps to the ${direction.toUpperCase()}`);

      for (let i = 1; i <= steps; i++) {
        const fromX = this.startX;
        const fromY = this.startY;

        const toX = fromX + vector.x * this.stepLength;
        const toY = fromY + vector.y * this.stepLength;

        await this.page.mouse.move(fromX, fromY);
        await this.page.mouse.down();
        await this.page.mouse.move(toX, toY, { steps: 20 });
        await this.page.mouse.up();

        console.log(`${i}/${steps} ➡️ Moved one step ${direction}`);
      }

      console.log(`✅ Finished ${direction.toUpperCase()} movement`);
    }

    async moveByPattern(pattern) {
      for (const [direction, steps] of Object.entries(pattern)) {
        await this.moveInDirection(direction, steps);
      }
    }
  }

  // #########################################################
  // 7. Movement patterns
  // #########################################################

  // ! must add file or integrate database
  const D01movementPattern = {
    right: 28,
    up: 14,
  };

  // #########################################################
  // 7. Instantiate Navigation Class 
  // #########################################################
  const navigator = new CanvasNavigator(page, boundingBox);

  console.log(boundingBox.width, boundingBox.height);

  await navigator.moveByPattern(D01movementPattern);





  // ---------------------------------------------------------
  // ---------------------------------------------------------
  await sleep(50000);
  await browser.close();
})();
