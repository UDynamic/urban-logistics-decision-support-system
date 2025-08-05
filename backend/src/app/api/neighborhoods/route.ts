import { NextRequest, NextResponse } from 'next/server';
import { getNeighborhoods, searchNeighborhoods } from '@/lib/db';
import { z } from 'zod';

// =============================================================================
// Neighborhoods API Route Handler
// =============================================================================

// Validation schema
const neighborhoodQuerySchema = z.object({
  search: z.string().optional(),
});

// GET /api/neighborhoods - Get all neighborhoods or search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedQuery = neighborhoodQuerySchema.parse(query);
    
    let neighborhoods;
    
    if (validatedQuery.search) {
      // Search neighborhoods
      neighborhoods = await searchNeighborhoods(validatedQuery.search);
    } else {
      // Get all neighborhoods
      neighborhoods = await getNeighborhoods();
    }
    
    return NextResponse.json({
      success: true,
      data: neighborhoods,
      count: neighborhoods.length,
      search: validatedQuery.search || null,
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