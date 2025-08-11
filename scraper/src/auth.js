import { selectors, urls, scraperConfig } from './selectors.js';
import { logger, sleep, askQuestion, retryWithBackoff } from './utils.js';

// =============================================================================
// Authentication Module
// =============================================================================

export class TransportAuth {
  constructor(page) {
    this.page = page;
    this.isAuthenticated = false;
  }

  async authenticate() {
    try {
      logger.info('Starting authentication process...');

      // Navigate to login page
      await this.page.goto(urls.loginUrl, { waitUntil: 'networkidle2' });
      await sleep(2000);

      this.checkAuthenticationStatus();

      //checking authentication
      if (this.isAuthenticated) {
        logger.info('Authentication successful!');
      } else {

        // Enter phone number
        await this.enterPhoneNumber();

        // Handle captcha if present
        await this.handleCaptcha();

        // Wait for OTP input
        await this.waitForOTP();

        // Enter OTP
        await this.enterOTP();

        // Verify successful login
        await this.verifyLogin();

        this.isAuthenticated = true;
        logger.info('Authentication successful!');
      }

    } catch (error) {
      logger.error('Authentication failed:', error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async enterPhoneNumber() {
    try {
      logger.info('Entering phone number...');

      await this.page.waitForSelector(selectors.phoneNumberInput, { timeout: 10000 });
      await this.page.click(selectors.phoneNumberInput);
      await this.page.type(selectors.phoneNumberInput, scraperConfig.phoneNumber);

      await this.page.click(selectors.logInSubmitButton);
      await sleep(2000);

      logger.info('Phone number entered successfully');
    } catch (error) {
      logger.error('Failed to enter phone number:', error);
      throw error;
    }
  }

  async handleCaptcha() {
    try {
      // Check if captcha dialog is present
      const captchaDialog = await this.page.$(selectors.captchaDialog);

      if (captchaDialog) {
        logger.info('Captcha detected, waiting for manual input...');

        // Wait for user to solve captcha manually
        const captchaCode = await askQuestion('Please solve the captcha and enter the code: ');

        if (captchaCode) {
          await this.page.type(selectors.captchaInput, captchaCode);
          await this.page.keyboard.press('Enter');
          await sleep(2000);
        }
      }
    } catch (error) {
      logger.warn('Captcha handling failed:', error);
      // Continue anyway as captcha might not be present
    }
  }

  async waitForOTP() {
    try {
      logger.info('Waiting for OTP input field...');

      // Wait for OTP input field to appear
      await this.page.waitForSelector(selectors.otpInputSelector, { timeout: 30000 });
      await sleep(1000);

      logger.info('OTP input field ready');
    } catch (error) {
      logger.error('Failed to wait for OTP input:', error);
      throw error;
    }
  }

  async enterOTP() {
    try {
      logger.info('Waiting for OTP code...');

      // Wait for user to provide OTP
      const otpCode = await askQuestion('Please enter the OTP code sent to your phone: ');

      if (!otpCode) {
        throw new Error('OTP code is required');
      }

      // Enter OTP
      await this.page.type(selectors.otpInputSelector, otpCode);
      await this.page.keyboard.press('Enter');
      await sleep(3000);

      logger.info('OTP entered successfully');
    } catch (error) {
      logger.error('Failed to enter OTP:', error);
      throw error;
    }
  }

  async verifyLogin() {
    try {
      logger.info('Verifying login success...');

      // Wait for redirect to menu page
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });

      // Check if we're on the menu page
      const currentUrl = this.page.url();
      if (currentUrl === process.env.TRANSPORT_MENU_URL) {
        logger.info('Successfully redirected to menu page');
        return true;
      } else {
        throw new Error('Failed to reach menu page after login');
      }
    } catch (error) {
      logger.error('Login verification failed:', error);
      throw error;
    }
  }

  async checkAuthenticationStatus() {
    try {
      // Navigate to menu page
      // await this.page.goto(urls.menuUrl, { waitUntil: 'networkidle2' });


      // old version of authentication checker
      /*
      await page.goto(urlLanding, { waitUntil: 'networkidle2' });
      console.log('🔐 Login page loaded');

      const currentUrl = page.url()
      if (currentUrl !== "https://app.snapp.taxi/") {

        console.log('⛔ not Authenticated, commencing authentication');
        // Type the phone number
        await page.waitForSelector('input[data-qa-id="cellphone-number-input"]', { visible: true })
        await page.type('input[data-qa-id="cellphone-number-input"]', '09130398835');
        console.log('🔐 Phone number entered');
      };
      */
      
      
      // Check if we're redirected to login page
      const currentUrl = this.page.url();
      if (currentUrl !== urls.menuUrl) {
        this.isAuthenticated = false;
        logger.info('Session expired, re-authentication required');
        return false;
      } else {
        this.isAuthenticated = true;
        logger.info('Session is still valid');
        return true;
      }
    } catch (error) {
      logger.error('Failed to check authentication status:', error);
      this.isAuthenticated = false;
      return false;
    }
  }

  async ensureAuthenticated() {
    if (!this.isAuthenticated) {
      const isStillValid = await this.checkAuthenticationStatus();
      if (!isStillValid) {
        await this.authenticate();
      }
    }
  }
} 