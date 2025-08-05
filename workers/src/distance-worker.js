import { Worker } from 'bullmq';
import { Client } from 'pg';
import axios from 'axios';
import winston from 'winston';

// =============================================================================
// Distance Worker - Enriches routes with travel time and distance
// =============================================================================

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'distance-worker' },
  transports: [
    new winston.transports.File({ filename: 'logs/distance-worker-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/distance-worker-combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

class DistanceWorker {
  constructor() {
    this.dbClient = null;
    this.worker = null;
  }

  async initialize() {
    try {
      // Initialize database connection
      await this.initializeDatabase();
      
      // Initialize worker
      await this.initializeWorker();
      
      logger.info('Distance worker initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize distance worker:', error);
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

  async initializeWorker() {
    try {
      this.worker = new Worker('route-enrichment', async (job) => {
        return await this.processRouteEnrichment(job);
      }, {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
          password: process.env.REDIS_PASSWORD
        },
        concurrency: parseInt(process.env.WORKER_CONCURRENCY) || 5
      });

      // Handle worker events
      this.worker.on('completed', (job) => {
        logger.info(`Job ${job.id} completed successfully`);
      });

      this.worker.on('failed', (job, err) => {
        logger.error(`Job ${job.id} failed:`, err);
      });

      this.worker.on('error', (err) => {
        logger.error('Worker error:', err);
      });

      logger.info('Distance worker started');
    } catch (error) {
      logger.error('Failed to initialize worker:', error);
      throw error;
    }
  }

  async processRouteEnrichment(job) {
    const { routeId, origin, destination } = job.data;
    
    try {
      logger.info(`Processing route enrichment for: ${routeId}`);
      
      // Get coordinates for origin and destination
      const originCoords = await this.getCoordinates(origin.name);
      const destCoords = await this.getCoordinates(destination.name);
      
      if (!originCoords || !destCoords) {
        throw new Error('Failed to get coordinates for route');
      }
      
      // Get route information from OSRM
      const routeInfo = await this.getRouteInfo(originCoords, destCoords);
      
      // Save enriched data to database
      await this.saveEnrichedData(routeId, routeInfo);
      
      logger.info(`Successfully enriched route: ${routeId}`);
      return { success: true, routeId };
      
    } catch (error) {
      logger.error(`Failed to process route enrichment for ${routeId}:`, error);
      throw error;
    }
  }

  async getCoordinates(locationName) {
    try {
      // For now, we'll use a simple geocoding approach
      // In production, you might want to use Google Maps Geocoding API or similar
      
      // This is a placeholder - you'll need to implement proper geocoding
      // For Tehran, you might have a predefined mapping of neighborhood names to coordinates
      
      const coordinates = await this.getCoordinatesFromDatabase(locationName);
      
      if (coordinates) {
        return coordinates;
      }
      
      // Fallback to external geocoding service
      return await this.geocodeLocation(locationName);
      
    } catch (error) {
      logger.error(`Failed to get coordinates for ${locationName}:`, error);
      return null;
    }
  }

  async getCoordinatesFromDatabase(locationName) {
    try {
      const query = `
        SELECT latitude, longitude 
        FROM neighborhoods 
        WHERE name ILIKE $1 
        LIMIT 1
      `;
      
      const result = await this.dbClient.query(query, [locationName]);
      
      if (result.rows.length > 0) {
        return {
          lat: result.rows[0].latitude,
          lng: result.rows[0].longitude
        };
      }
      
      return null;
    } catch (error) {
      logger.error('Failed to get coordinates from database:', error);
      return null;
    }
  }

  async geocodeLocation(locationName) {
    try {
      // This is a placeholder for external geocoding service
      // You can use Google Maps Geocoding API, OpenStreetMap Nominatim, etc.
      
      // Example with OpenStreetMap Nominatim (free, but with rate limits)
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: `${locationName}, Tehran, Iran`,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'SnappHeatmap/1.0'
        }
      });
      
      if (response.data && response.data.length > 0) {
        const location = response.data[0];
        return {
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lon)
        };
      }
      
      return null;
    } catch (error) {
      logger.error('Failed to geocode location:', error);
      return null;
    }
  }

  async getRouteInfo(originCoords, destCoords) {
    try {
      const osrmUrl = process.env.OSRM_BASE_URL || 'https://router.project-osrm.org/route/v1';
      
      const response = await axios.get(`${osrmUrl}/driving/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}`, {
        params: {
          overview: 'false',
          alternatives: 'false',
          steps: 'false'
        }
      });
      
      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        return {
          distance: route.distance, // meters
          duration: route.duration, // seconds
          geometry: route.geometry
        };
      }
      
      throw new Error('No route found');
    } catch (error) {
      logger.error('Failed to get route info from OSRM:', error);
      throw error;
    }
  }

  async saveEnrichedData(routeId, routeInfo) {
    try {
      const query = `
        UPDATE route_history 
        SET 
          distance_meters = $1,
          duration_seconds = $2,
          geometry = $3,
          enriched_at = NOW()
        WHERE route_id = $4
        AND scraped_at >= NOW() - INTERVAL '1 hour'
      `;
      
      await this.dbClient.query(query, [
        routeInfo.distance,
        routeInfo.duration,
        routeInfo.geometry,
        routeId
      ]);
      
      logger.info(`Saved enriched data for route: ${routeId}`);
    } catch (error) {
      logger.error('Failed to save enriched data:', error);
      throw error;
    }
  }

  async cleanup() {
    try {
      logger.info('Cleaning up distance worker...');
      
      if (this.worker) {
        await this.worker.close();
      }
      
      if (this.dbClient) {
        await this.dbClient.end();
      }
      
      logger.info('Distance worker cleanup completed');
    } catch (error) {
      logger.error('Failed to cleanup distance worker:', error);
    }
  }
}

// Export for use in other modules
export { DistanceWorker };

// Run as standalone worker
if (import.meta.url === `file://${process.argv[1]}`) {
  const worker = new DistanceWorker();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    await worker.cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    await worker.cleanup();
    process.exit(0);
  });

  // Start the worker
  worker.initialize().catch((error) => {
    logger.error('Failed to start distance worker:', error);
    process.exit(1);
  });
} 