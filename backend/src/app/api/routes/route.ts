import { NextRequest, NextResponse } from 'next/server';
import { getLatestPrices, getRoutesByOrigin, getRouteHistory } from '@/lib/db';
import { z } from 'zod';

// =============================================================================
// API Route Handlers
// =============================================================================

// Validation schemas
const routeQuerySchema = z.object({
  origin: z.string().optional(),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(100)).optional(),
  days: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(30)).optional(),
});

const routeIdSchema = z.object({
  routeId: z.string(),
  days: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(30)).optional(),
});

// GET /api/routes - Get latest route prices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedQuery = routeQuerySchema.parse(query);
    
    let routes;
    
    if (validatedQuery.origin) {
      // Get routes by origin
      routes = await getRoutesByOrigin(
        validatedQuery.origin, 
        validatedQuery.limit || 50
      );
    } else {
      // Get all latest prices
      routes = await getLatestPrices(validatedQuery.limit || 100);
    }
    
    return NextResponse.json({
      success: true,
      data: routes,
      count: routes.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// GET /api/routes/[routeId] - Get route history
export async function GET_ROUTE_HISTORY(request: NextRequest, { params }: { params: { routeId: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    
    // Validate parameters
    const validatedParams = routeIdSchema.parse({
      routeId: params.routeId,
      days: query.days
    });
    
    const history = await getRouteHistory(
      validatedParams.routeId, 
      validatedParams.days || 7
    );
    
    return NextResponse.json({
      success: true,
      data: history,
      count: history.length,
      routeId: validatedParams.routeId,
      days: validatedParams.days || 7,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid parameters',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 