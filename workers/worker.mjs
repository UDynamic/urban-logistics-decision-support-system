import dotenv from 'dotenv';
import { DistanceWorker } from './src/distance-worker.js';
import winston from 'winston';

// Load environment variables
dotenv.config();

// =============================================================================
// Main Worker Entry Point
// =============================================================================

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'worker-manager' },
  transports: [
    new winston.transports.File({ filename: 'logs/worker-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/worker-combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

class WorkerManager {
  constructor() {
    this.workers = [];
  }

  async startWorkers() {
    try {
      logger.info('Starting worker manager...');
      
      // Start distance worker
      const distanceWorker = new DistanceWorker();
      await distanceWorker.initialize();
      this.workers.push(distanceWorker);
      
      logger.info('All workers started successfully');
      
      // Keep the process alive
      this.keepAlive();
      
    } catch (error) {
      logger.error('Failed to start workers:', error);
      throw error;
    }
  }

  keepAlive() {
    // Keep the process running
    setInterval(() => {
      // Heartbeat
      logger.debug('Worker manager heartbeat');
    }, 60000); // Every minute
  }

  async stopWorkers() {
    try {
      logger.info('Stopping all workers...');
      
      for (const worker of this.workers) {
        await worker.cleanup();
      }
      
      logger.info('All workers stopped');
    } catch (error) {
      logger.error('Failed to stop workers:', error);
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  if (global.workerManager) {
    await global.workerManager.stopWorkers();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  if (global.workerManager) {
    await global.workerManager.stopWorkers();
  }
  process.exit(0);
});

// Run the worker manager
if (import.meta.url === `file://${process.argv[1]}`) {
  const workerManager = new WorkerManager();
  global.workerManager = workerManager;
  
  workerManager.startWorkers().catch((error) => {
    logger.error('Failed to start worker manager:', error);
    process.exit(1);
  });
} 