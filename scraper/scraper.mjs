
import fs from 'fs';
import { TransportScraper } from './src/scraper.js';
import { logger } from './src/utils.js';

// Load environment variables
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../config/.env') });
// =============================================================================
// Main Scraper Entry Point
// =============================================================================

async function main() {
  let scraper = null;
  
  try {
    logger.info('Starting Urban Logistics Data Collection...');
    
    // Initialize scraper
    scraper = new TransportScraper();
    await scraper.initialize();
    
    // Load routes from JSON file
    const routesPath = process.argv[2] || '../data/routes.json';
    logger.info(`Loading routes from: ${routesPath}`);
    
    if (!fs.existsSync(routesPath)) {
      throw new Error(`Routes file not found: ${routesPath}`);
    }
    
    const routesData = JSON.parse(fs.readFileSync(routesPath, 'utf-8'));
    logger.info(`Loaded ${routesData.length} routes`);
    
    // Start scraping
    await scraper.scrapeRoutes(routesData);
    
    logger.info('Scraping completed successfully!');
    
  } catch (error) {
    logger.error('Scraping failed:', error);
    process.exit(1);
  } finally {
    if (scraper) {
      await scraper.cleanup();
    }
    process.exit(0);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Run the scraper
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 

