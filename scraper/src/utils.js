import readline from 'readline';
import winston from 'winston';

// =============================================================================
// Utility Functions
// =============================================================================

// Configure logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'scraper' },
  transports: [
    new winston.transports.File({ filename: 'logs/scraper-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/scraper-combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Sleep function for delays
export const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

// Input data via console
export function askQuestion(query) {
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

// Extract price from text
export function extractPrice(priceText) {
  if (!priceText) return null;
  
  // Remove non-numeric characters except decimal point
  const numericPrice = priceText.replace(/[^\d.]/g, '');
  const price = parseFloat(numericPrice);
  
  return isNaN(price) ? null : price;
}

// Generate route ID
export function generateRouteId(originId, destinationId) {
  return `${originId}__${destinationId}`;
}

// Validate route data
export function validateRouteData(route) {
  return route && 
         route.origin && 
         route.destination && 
         route.origin.id && 
         route.destination.id;
}

// Retry function with exponential backoff
export async function retryWithBackoff(fn, maxAttempts = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, { error: error.message });
      await sleep(delay);
    }
  }
}

// Format duration for logging
export function formatDuration(startTime) {
  const duration = Date.now() - startTime;
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

// Batch array into chunks
export function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// Calculate progress percentage
export function calculateProgress(current, total) {
  return Math.round((current / total) * 100);
} 