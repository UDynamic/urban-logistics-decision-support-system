import puppeteer from 'puppeteer';
import { Client } from 'pg';
import { Queue } from 'bullmq';
import { selectors, urls, scraperConfig } from './selectors.js';
import { TransportAuth } from './auth.js';
import { 
  logger, 
  sleep, 
  extractPrice, 
  generateRouteId, 
  validateRouteData,
  retryWithBackoff,
  formatDuration,
  chunkArray,
  calculateProgress
} from './utils.js';

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../config/.env') });
// =============================================================================
// Main Scraper Class
// =============================================================================

export class TransportScraper {
  constructor() {
    this.browser = null;
    this.dbClient = null;
    this.queue = null;
    this.activePages = [];
    this.stats = {
      totalRoutes: 0,
      processedRoutes: 0,
      successfulRoutes: 0,
      failedRoutes: 0,
      startTime: null
    };
  }

  async initialize() {
    try {
      logger.info('Initializing Transport Scraper...');
      
      // Initialize database connection
      await this.initializeDatabase();
      
      // Initialize Redis queue
      // await this.initializeQueue();
      
      // Launch browser
      await this.launchBrowser();
      
      // Initialize authentication
      await this.initializeAuthentication();
      
      logger.info('Scraper initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize scraper:', error);
      throw error;
    }
  }

  async initializeDatabase() {
    try {
      this.dbClient = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      
      await this.dbClient.connect();
      logger.info('Database connection established');
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async initializeQueue() {
    try {
      this.queue = new Queue('route-enrichment', {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
          password: process.env.REDIS_PASSWORD
        }
      });
      
      logger.info('Redis queue initialized');
    } catch (error) {
      logger.error('Failed to initialize queue:', error);
      throw error;
    }
  }

  async launchBrowser() {
    try {
      this.browser = await puppeteer.launch({
        headless: scraperConfig.headless,
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ],
        // defaultViewport: { width: 1280, height: 720 },
        userDataDir: "./puppeteer_profile"

      });
      this.page = await this.browser.newPage();
      const pages = await this.browser.pages();
     
      // closed the first blank tab
      await pages[0].close();
      
      logger.info('Browser launched successfully');
    } catch (error) {
      logger.error('Failed to launch browser:', error);
      throw error;
    }
  }

  async initializeAuthentication() {
    try {
      
      // first page selection for authentication
      const pages = await this.browser.pages();
      const page = pages[0];
      const auth = new TransportAuth(page);
      
      // Set user agent
      // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Authenticate
      await auth.authenticate();
      
      // Store authenticated page
      this.authenticatedPage = page;
      this.auth = auth;
      
      logger.info('Authentication completed');
    } catch (error) {
      logger.error('Failed to initialize authentication:', error);
      throw error;
    }
  }

  async scrapeRoutes(routes) {
    try {
      this.stats.startTime = Date.now();
      this.stats.totalRoutes = routes.length;
      
      logger.info(`Starting to scrape ${routes.length} routes...`);
      
      // Process routes in batches
      const batches = chunkArray(routes, scraperConfig.maxConcurrentBrowsers);
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        logger.info(`Processing batch ${i + 1}/${batches.length} (${batch.length} routes)`);
        
        // Process batch concurrently
        const promises = batch.map(route => this.scrapeRoute(route));
        await Promise.allSettled(promises);
        
        // Progress update
        const progress = calculateProgress(this.stats.processedRoutes, this.stats.totalRoutes);
        logger.info(`Progress: ${progress}% (${this.stats.processedRoutes}/${this.stats.totalRoutes})`);
        
        // Delay between batches
        if (i < batches.length - 1) {
          await sleep(scraperConfig.delayBetweenRequests);
        }
      }
      
      // Final statistics
      const duration = formatDuration(this.stats.startTime);
      logger.info(`Scraping completed in ${duration}`);
      logger.info(`Statistics: ${this.stats.successfulRoutes} successful, ${this.stats.failedRoutes} failed`);
      
    } catch (error) {
      logger.error('Failed to scrape routes:', error);
      throw error;
    }
  }

  async scrapeRoute(route) {
    let page = null;
    
    try {
      // Validate route data
      if (!validateRouteData(route)) {
        logger.warn('Invalid route data:', route);
        this.stats.failedRoutes++;
        return;
      }

      // Create new page for this route
      page = await this.browser.newPage();
      // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Navigate to menu
      await page.goto(urls.menuUrl, { waitUntil: 'networkidle2' });
      await sleep(1000);
      
      // Click on cab request
      await page.click(selectors.cabRequestBtn);
      await sleep(2000);
      
      // Set origin
      await this.setLocation(page, route.origin, 'origin');
      
      // Set destination
      await this.setLocation(page, route.destination, 'destination');
      
      // Extract prices
      const prices = await this.extractPrices(page);
      
      // Save to database
      await this.saveRouteData(route, prices);
      
      // Add to enrichment queue
      // await this.queueRouteEnrichment(route);
      
      this.stats.successfulRoutes++;
      logger.info(`Successfully scraped route: ${route.origin.name} → ${route.destination.name}`);
      
    } catch (error) {
      this.stats.failedRoutes++;
      logger.error(`Failed to scrape route ${route?.origin?.name} → ${route?.destination?.name}:`, error);
    } finally {
      this.stats.processedRoutes++;
      
      if (page) {
        await page.close();
      }
    }
  }

  async setLocation(page, location, type) {
    try {
      const searchBtn = type === 'origin' ? selectors.originSearchBtn : selectors.destinationSearchBtn;
      const searchInput = type === 'origin' ? selectors.originSearchInput : selectors.destinationSearchInput;
      const searchSubmit = type === 'origin' ? selectors.originSearchSubmit : selectors.destinationSearchSubmit;
      
      // Click search button
      await page.click(searchBtn);
      await sleep(1000);
      
      // Enter location name
      await page.type(searchInput, location.name);
      await sleep(2000);
      
      // Select first result
      await page.click(selectors.firstSearchLi);
      await sleep(1000);
      
      // Confirm selection
      await page.click(searchSubmit);
      await sleep(2000);
      
    } catch (error) {
      logger.error(`Failed to set ${type} location:`, error);
      throw error;
    }
  }

  async extractPrices(page) {
    try {
      const prices = {};
      
      // Extract cab price
      try {
        await page.waitForSelector(selectors.cabPriceSelector, { timeout: 5000 }).catch((error) => {
          logger.error('Failed to find the cabPriceSelector:', error)
        });

        const cabPriceElement = await page.$(selectors.cabPriceSelector);
        if (cabPriceElement) {
          const cabPriceText = await page.evaluate(el => el.textContent, cabPriceElement);
          prices.cab = extractPrice(cabPriceText);
        }
      } catch (error) {
        logger.warn('Failed to extract cab price:', error);
      }
      
      // Extract bike price
      try {
        await page.click(selectors.bikePriceTab);
        // await sleep(1000);
        await page.waitForSelector(selectors.bikePriceSelector, { timeout: 5000 }).catch((error) => {
          logger.error('Failed to find the bikePriceSelector:', error)
        });

        
        const bikePriceElement = await page.$(selectors.bikePriceSelector);
        if (bikePriceElement) {
          const bikePriceText = await page.evaluate(el => el.textContent, bikePriceElement);
          prices.bike = extractPrice(bikePriceText);
        }
      } catch (error) {
        logger.warn('Failed to extract bike price:', error);
      }
      
      // Extract bike delivery price
      try {
        await page.click(selectors.bikeDelivaryTab);
        await sleep(1000);
        
        await page.waitForSelector(selectors.bikeDelivaryPriceSelector, { timeout: 5000 }).catch((error) => {
          logger.error('Failed to find the bikeDelivaryPriceSelector:', error)
        });

        const bikeDeliveryPriceElement = await page.$(selectors.bikeDelivaryPriceSelector);
        if (bikeDeliveryPriceElement) {
          const bikeDeliveryPriceText = await page.evaluate(el => el.textContent, bikeDeliveryPriceElement);
          prices.bikeDelivery = extractPrice(bikeDeliveryPriceText);
        }
      } catch (error) {
        logger.warn('Failed to extract bike delivery price:', error);
      }
      
      return prices;
    } catch (error) {
      logger.error('Failed to extract prices:', error);
      return {};
    }
  }

  async saveRouteData(route, prices) {
    try {
      // handling the "no resalt" case for the routes and prices
      ['cab', 'bike', 'bikeDelivery'].forEach(price => {
        if (!prices[price]) logger.warn(`${price} price missing for route ${route.origin.name} → ${route.destination.name}`);
      });
      
      if (!route || !route.origin || !route.destination) {
        throw new Error('Invalid route object');
      }
      if (!prices || !prices.cab || !prices.bike || !prices.bikeDelivery) {
        throw new Error('Incomplete prices data');
      }


      const routeId = generateRouteId(route.origin.id, route.destination.id);
      const timestamp = new Date();
      const dateOnly = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD format for `date` column

      const query = `
      INSERT INTO route_history (
        route_id, 
        date, 
        captured_at, 
        cab_price_text, 
        cab_price_number, 
        bike_price_text, 
        bike_price_number, 
        bike_delivery_text, 
        bike_delivery_number
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (route_id, captured_at, date) DO UPDATE SET
        cab_price_text = EXCLUDED.cab_price_text,
        cab_price_number = EXCLUDED.cab_price_number,
        bike_price_text = EXCLUDED.bike_price_text,
        bike_price_number = EXCLUDED.bike_price_number,
        bike_delivery_text = EXCLUDED.bike_delivery_text,
        bike_delivery_number = EXCLUDED.bike_delivery_number,
        captured_at = EXCLUDED.captured_at
    `;

    await this.dbClient.query(query, [
      routeId,
      dateOnly,
      timestamp,
      prices.cab.text,
      prices.cab.number,
      prices.bike.text,
      prices.bike.number,
      prices.bikeDelivery.text,
      prices.bikeDelivery.number
    ]);
      
    } catch (error) {
      logger.error('Failed to save route data:', error);
      throw error;
    }
  }

  async queueRouteEnrichment(route) {
    try {
      await this.queue.add('enrich-route', {
        routeId: generateRouteId(route.origin.id, route.destination.id),
        origin: route.origin,
        destination: route.destination
      }, {
        removeOnComplete: 100,
        removeOnFail: 50
      });
    } catch (error) {
      logger.error('Failed to queue route enrichment:', error);
    }
  }

  async cleanup() {
    try {
      logger.info('Cleaning up scraper resources...');
      
      if (this.authenticatedPage) {
        await this.authenticatedPage.close();
      }
      
      if (this.browser) {
        await this.browser.close();
      }
      
      if (this.dbClient) {
        await this.dbClient.end();
      }
      
      if (this.queue) {
        await this.queue.close();
      }
      
      logger.info('Cleanup completed');
    } catch (error) {
      logger.error('Failed to cleanup:', error);
    }
  }
} 