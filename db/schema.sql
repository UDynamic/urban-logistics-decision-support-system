-- =============================================================================
-- Snapp Heatmap Database Schema
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =============================================================================
-- Districts Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS districts (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- Neighborhoods Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS neighborhoods (
    id VARCHAR(20) PRIMARY KEY,
    district_id VARCHAR(10) NOT NULL REFERENCES districts(id),
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    geom GEOMETRY(POINT, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spatial index for neighborhoods
CREATE INDEX IF NOT EXISTS idx_neighborhoods_geom ON neighborhoods USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_district ON neighborhoods(district_id);

-- =============================================================================
-- Routes Table (Master table for route definitions)
-- =============================================================================
CREATE TABLE IF NOT EXISTS routes (
    id VARCHAR(50) PRIMARY KEY,
    origin_id VARCHAR(20) NOT NULL REFERENCES neighborhoods(id),
    destination_id VARCHAR(20) NOT NULL REFERENCES neighborhoods(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(origin_id, destination_id)
);

CREATE INDEX IF NOT EXISTS idx_routes_origin ON routes(origin_id);
CREATE INDEX IF NOT EXISTS idx_routes_destination ON routes(destination_id);

-- =============================================================================
-- Route History Table (Partitioned by month)
-- =============================================================================
CREATE TABLE IF NOT EXISTS route_history (
    id BIGSERIAL,
    route_id VARCHAR(50) NOT NULL,
    origin_id VARCHAR(20) NOT NULL,
    destination_id VARCHAR(20) NOT NULL,
    
    -- Price data
    cab_price DECIMAL(10, 2),
    bike_price DECIMAL(10, 2),
    bike_delivery_price DECIMAL(10, 2),
    
    -- Enriched data
    distance_meters INTEGER,
    duration_seconds INTEGER,
    geometry TEXT, -- GeoJSON geometry
    
    -- Timestamps
    scraped_at TIMESTAMP WITH TIME ZONE NOT NULL,
    enriched_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) PARTITION BY RANGE (scraped_at);

-- Create primary key constraint for partitioned table
ALTER TABLE route_history ADD CONSTRAINT route_history_pkey 
    PRIMARY KEY (route_id, scraped_at);

-- Create indexes for partitioned table
CREATE INDEX IF NOT EXISTS idx_route_history_route_id ON route_history(route_id);
CREATE INDEX IF NOT EXISTS idx_route_history_scraped_at ON route_history(scraped_at);
CREATE INDEX IF NOT EXISTS idx_route_history_origin ON route_history(origin_id);
CREATE INDEX IF NOT EXISTS idx_route_history_destination ON route_history(destination_id);

-- =============================================================================
-- Create partitions for route_history (example for 2024-2025)
-- =============================================================================

-- 2024 partitions
CREATE TABLE IF NOT EXISTS route_history_2024_01 PARTITION OF route_history
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE IF NOT EXISTS route_history_2024_02 PARTITION OF route_history
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

CREATE TABLE IF NOT EXISTS route_history_2024_03 PARTITION OF route_history
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');

CREATE TABLE IF NOT EXISTS route_history_2024_04 PARTITION OF route_history
    FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');

CREATE TABLE IF NOT EXISTS route_history_2024_05 PARTITION OF route_history
    FOR VALUES FROM ('2024-05-01') TO ('2024-06-01');

CREATE TABLE IF NOT EXISTS route_history_2024_06 PARTITION OF route_history
    FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');

CREATE TABLE IF NOT EXISTS route_history_2024_07 PARTITION OF route_history
    FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');

CREATE TABLE IF NOT EXISTS route_history_2024_08 PARTITION OF route_history
    FOR VALUES FROM ('2024-08-01') TO ('2024-09-01');

CREATE TABLE IF NOT EXISTS route_history_2024_09 PARTITION OF route_history
    FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');

CREATE TABLE IF NOT EXISTS route_history_2024_10 PARTITION OF route_history
    FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');

CREATE TABLE IF NOT EXISTS route_history_2024_11 PARTITION OF route_history
    FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');

CREATE TABLE IF NOT EXISTS route_history_2024_12 PARTITION OF route_history
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

-- 2025 partitions
CREATE TABLE IF NOT EXISTS route_history_2025_01 PARTITION OF route_history
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE IF NOT EXISTS route_history_2025_02 PARTITION OF route_history
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

CREATE TABLE IF NOT EXISTS route_history_2025_03 PARTITION OF route_history
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

CREATE TABLE IF NOT EXISTS route_history_2025_04 PARTITION OF route_history
    FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');

CREATE TABLE IF NOT EXISTS route_history_2025_05 PARTITION OF route_history
    FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');

CREATE TABLE IF NOT EXISTS route_history_2025_06 PARTITION OF route_history
    FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');

CREATE TABLE IF NOT EXISTS route_history_2025_07 PARTITION OF route_history
    FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');

CREATE TABLE IF NOT EXISTS route_history_2025_08 PARTITION OF route_history
    FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');

CREATE TABLE IF NOT EXISTS route_history_2025_09 PARTITION OF route_history
    FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');

CREATE TABLE IF NOT EXISTS route_history_2025_10 PARTITION OF route_history
    FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

CREATE TABLE IF NOT EXISTS route_history_2025_11 PARTITION OF route_history
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

CREATE TABLE IF NOT EXISTS route_history_2025_12 PARTITION OF route_history
    FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- =============================================================================
-- Analytics Views
-- =============================================================================

-- Latest prices view
CREATE OR REPLACE VIEW latest_prices AS
SELECT DISTINCT ON (route_id)
    route_id,
    origin_id,
    destination_id,
    cab_price,
    bike_price,
    bike_delivery_price,
    distance_meters,
    duration_seconds,
    scraped_at
FROM route_history
WHERE scraped_at >= NOW() - INTERVAL '24 hours'
ORDER BY route_id, scraped_at DESC;

-- Price trends view
CREATE OR REPLACE VIEW price_trends AS
SELECT 
    route_id,
    origin_id,
    destination_id,
    DATE(scraped_at) as date,
    AVG(cab_price) as avg_cab_price,
    AVG(bike_price) as avg_bike_price,
    AVG(bike_delivery_price) as avg_bike_delivery_price,
    COUNT(*) as data_points
FROM route_history
WHERE scraped_at >= NOW() - INTERVAL '7 days'
GROUP BY route_id, origin_id, destination_id, DATE(scraped_at)
ORDER BY route_id, date;

-- =============================================================================
-- Functions and Triggers
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_districts_updated_at 
    BEFORE UPDATE ON districts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_neighborhoods_updated_at 
    BEFORE UPDATE ON neighborhoods 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at 
    BEFORE UPDATE ON routes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create new partitions automatically
CREATE OR REPLACE FUNCTION create_route_history_partition(partition_date DATE)
RETURNS VOID AS $$
DECLARE
    partition_name TEXT;
    start_date DATE;
    end_date DATE;
BEGIN
    partition_name := 'route_history_' || TO_CHAR(partition_date, 'YYYY_MM');
    start_date := DATE_TRUNC('month', partition_date);
    end_date := start_date + INTERVAL '1 month';
    
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF route_history
                    FOR VALUES FROM (%L) TO (%L)',
                    partition_name, start_date, end_date);
    
    RAISE NOTICE 'Created partition % for period % to %', partition_name, start_date, end_date;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Comments
-- =============================================================================

COMMENT ON TABLE districts IS 'Tehran districts information';
COMMENT ON TABLE neighborhoods IS 'Tehran neighborhoods with coordinates';
COMMENT ON TABLE routes IS 'Route definitions between neighborhoods';
COMMENT ON TABLE route_history IS 'Historical price and route data, partitioned by month';
COMMENT ON VIEW latest_prices IS 'Latest price data for each route';
COMMENT ON VIEW price_trends IS 'Daily price trends for routes'; 