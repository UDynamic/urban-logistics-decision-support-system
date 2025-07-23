const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, defaultViewport: false, userDataDir: "./tmp", executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.waitForXPath("//h1");
  console.log('XPath worked!');
  await browser.close();
})();