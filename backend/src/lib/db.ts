import { Pool } from 'pg';

// =============================================================================
// Database Connection Pool
// =============================================================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// =============================================================================
// Database Query Functions
// =============================================================================

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function getClient() {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;
  
  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
    console.error(`The last executed query on this client was: ${client.lastQuery}`);
  }, 5000);
  
  // Monkey patch the query method to keep track of the last query executed
  client.query = (...args: any[]) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };
  
  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release.apply(client);
  };
  
  return client;
}

// =============================================================================
// Route-specific Query Functions
// =============================================================================

export async function getLatestPrices(limit = 100) {
  const query = `
    SELECT 
      rh.route_id,
      rh.origin_id,
      rh.destination_id,
      rh.cab_price,
      rh.bike_price,
      rh.bike_delivery_price,
      rh.distance_meters,
      rh.duration_seconds,
      rh.scraped_at,
      o.name as origin_name,
      d.name as destination_name
    FROM latest_prices rh
    JOIN neighborhoods o ON rh.origin_id = o.id
    JOIN neighborhoods d ON rh.destination_id = d.id
    ORDER BY rh.scraped_at DESC
    LIMIT $1
  `;
  
  const result = await query(query, [limit]);
  return result.rows;
}

export async function getRoutesByOrigin(originId: string, limit = 50) {
  const query = `
    SELECT 
      rh.route_id,
      rh.origin_id,
      rh.destination_id,
      rh.cab_price,
      rh.bike_price,
      rh.bike_delivery_price,
      rh.distance_meters,
      rh.duration_seconds,
      rh.scraped_at,
      o.name as origin_name,
      d.name as destination_name
    FROM latest_prices rh
    JOIN neighborhoods o ON rh.origin_id = o.id
    JOIN neighborhoods d ON rh.destination_id = d.id
    WHERE rh.origin_id = $1
    ORDER BY rh.cab_price ASC
    LIMIT $2
  `;
  
  const result = await query(query, [originId, limit]);
  return result.rows;
}

export async function getRouteHistory(routeId: string, days = 7) {
  const query = `
    SELECT 
      route_id,
      cab_price,
      bike_price,
      bike_delivery_price,
      distance_meters,
      duration_seconds,
      scraped_at
    FROM route_history
    WHERE route_id = $1
    AND scraped_at >= NOW() - INTERVAL '${days} days'
    ORDER BY scraped_at DESC
  `;
  
  const result = await query(query, [routeId]);
  return result.rows;
}

export async function getNeighborhoods() {
  const query = `
    SELECT 
      n.id,
      n.name,
      n.latitude,
      n.longitude,
      d.name as district_name
    FROM neighborhoods n
    JOIN districts d ON n.district_id = d.id
    ORDER BY d.name, n.name
  `;
  
  const result = await query(query);
  return result.rows;
}

export async function searchNeighborhoods(searchTerm: string) {
  const query = `
    SELECT 
      n.id,
      n.name,
      n.latitude,
      n.longitude,
      d.name as district_name
    FROM neighborhoods n
    JOIN districts d ON n.district_id = d.id
    WHERE n.name ILIKE $1 OR d.name ILIKE $1
    ORDER BY 
      CASE WHEN n.name ILIKE $1 THEN 1 ELSE 2 END,
      n.name
    LIMIT 10
  `;
  
  const result = await query(query, [`%${searchTerm}%`]);
  return result.rows;
}

export async function getPriceAnalytics(originId?: string, destinationId?: string) {
  let query = `
    SELECT 
      AVG(cab_price) as avg_cab_price,
      AVG(bike_price) as avg_bike_price,
      AVG(bike_delivery_price) as avg_bike_delivery_price,
      COUNT(*) as total_routes,
      MIN(scraped_at) as earliest_data,
      MAX(scraped_at) as latest_data
    FROM route_history
    WHERE scraped_at >= NOW() - INTERVAL '24 hours'
  `;
  
  const params: any[] = [];
  let paramCount = 0;
  
  if (originId) {
    paramCount++;
    query += ` AND origin_id = $${paramCount}`;
    params.push(originId);
  }
  
  if (destinationId) {
    paramCount++;
    query += ` AND destination_id = $${paramCount}`;
    params.push(destinationId);
  }
  
  const result = await query(query, params);
  return result.rows[0];
}

// =============================================================================
// Health Check
// =============================================================================

export async function healthCheck() {
  try {
    const result = await query('SELECT NOW() as current_time');
    return {
      status: 'healthy',
      timestamp: result.rows[0].current_time,
      database: 'connected'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      database: 'disconnected'
    };
  }
}

export default pool; 