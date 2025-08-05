import { NextResponse } from 'next/server';
import { healthCheck } from '@/lib/db';

// =============================================================================
// Health Check API Route Handler
// =============================================================================

// GET /api/health - Health check endpoint
export async function GET() {
  try {
    const dbHealth = await healthCheck();
    
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbHealth.status,
        api: 'healthy'
      },
      uptime: process.uptime()
    };
    
    // Determine overall status
    const isHealthy = dbHealth.status === 'healthy';
    const statusCode = isHealthy ? 200 : 503;
    
    return NextResponse.json(response, { status: statusCode });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      services: {
        database: 'unhealthy',
        api: 'unhealthy'
      }
    }, { status: 503 });
  }
} 