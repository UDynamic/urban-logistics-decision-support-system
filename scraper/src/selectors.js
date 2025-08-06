// =============================================================================
// Transportation Service Selectors and Configuration
// =============================================================================

export const selectors = {
  // Login selectors
  phoneNumberInput: 'input[data-qa-id="cellphone-number-input"]',
  logInSubmitButton: '#login-submit',
  captchaDialog: 'div[role="dialog"]',
  captchaInput: 'input[placeholder="کدی را که در تصویر بالا می‌بینید وارد کنید"]',
  otpInputSelector: 'input',

  // Menu
  cabRequestBtn: '#ChoiceCab',

  // Route class selectors
  originSearchBtn: 'footer h6',
  originSearchInput: 'input[data-qa-id="search-input"]',
  firstSearchLi: 'li[data-index="0"]',
  originSearchSubmit: 'button[data-qa-id="confirm"]',
  destinationSearchBtn: 'footer h6',
  destinationSearchInput: 'input[data-qa-id="search-input"]',
  destinationSearchSubmit: 'button[data-qa-id="confirm"]',

  // Back button
  backButton: 'button[aria-label="بازگشت"]',

  // Price selectors
  cabPriceSelector: 'footer ul li span[data-qa-id="service-type-price-1"]',
  bikePriceTab: 'footer div button:nth-of-type(2)',
  bikePriceSelector: 'footer ul li span[data-qa-id="service-type-price-7"]',
  bikeDelivaryTab: 'footer div button:nth-of-type(3)',
  bikeDelivaryPriceSelector: 'footer ul li span[data-qa-id="service-type-price-5"]'
};

export const urls = {
  loginUrl: process.env.TRANSPORT_LOGIN_URL || "https://app.snapp.taxi/login",
  menuUrl: process.env.TRANSPORT_MENU_URL || "https://app.snapp.taxi/"
};

export const scraperConfig = {
  phoneNumber: process.env.SCRAPER_PHONE_NUMBER || '09130398835',
  delayBetweenRequests: parseInt(process.env.SCRAPER_DELAY_BETWEEN_REQUESTS) || 2000,
  maxConcurrentBrowsers: parseInt(process.env.SCRAPER_MAX_CONCURRENT_BROWSERS) || 3,
  headless: process.env.SCRAPER_HEADLESS === 'true',
  timeout: parseInt(process.env.SCRAPER_TIMEOUT) || 30000,
  retryAttempts: 3,
  retryDelay: 5000
}; 