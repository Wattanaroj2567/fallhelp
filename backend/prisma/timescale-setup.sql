-- ========================================
-- TimescaleDB Setup Script for Events Table
-- ========================================
-- This script should be run AFTER the initial Prisma migration
-- Run with: psql postgresql://postgres:268033@localhost:5432/fallhelp_db -f prisma/timescale-setup.sql

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Convert events table to TimescaleDB hypertable
-- Partition by timestamp column with 7-day chunks
SELECT create_hypertable(
  'events', 
  'timestamp',
  chunk_time_interval => INTERVAL '7 days',
  if_not_exists => TRUE
);

-- ========================================
-- Performance Optimization
-- ========================================

-- Indexes are already created by Prisma migration:
-- - events_elderId_timestamp_idx
-- - events_deviceId_timestamp_idx  
-- - events_type_timestamp_idx

-- Add additional index for severity queries
CREATE INDEX IF NOT EXISTS events_severity_timestamp_idx 
  ON events (severity, timestamp DESC);

-- ========================================
-- Data Compression (Optional but Recommended)
-- ========================================

-- Enable compression for older data
-- This saves 90%+ storage space for time-series data
ALTER TABLE events SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = '"elderId", "deviceId", type',
  timescaledb.compress_orderby = 'timestamp DESC'
);

-- Automatically compress chunks older than 30 days
SELECT add_compression_policy(
  'events', 
  INTERVAL '30 days',
  if_not_exists => TRUE
);

-- ========================================
-- Data Retention Policy (Optional)
-- ========================================

-- Uncomment to automatically drop data older than 1 year
-- SELECT add_retention_policy('events', INTERVAL '1 year', if_not_exists => TRUE);

-- ========================================
-- Continuous Aggregates for Summary (Optional)
-- ========================================

-- Create materialized view for daily event summary
CREATE MATERIALIZED VIEW IF NOT EXISTS events_daily_summary
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 day', timestamp) AS day,
  "elderId",
  "deviceId",
  type,
  severity,
  COUNT(*) as event_count,
  COUNT(*) FILTER (WHERE "isCancelled" = false) as confirmed_count,
  COUNT(*) FILTER (WHERE "isCancelled" = true) as cancelled_count,
  AVG(value) as avg_value,
  MIN(value) as min_value,
  MAX(value) as max_value
FROM events
GROUP BY day, "elderId", "deviceId", type, severity
WITH NO DATA;

-- Add refresh policy: refresh every hour for last 2 days
SELECT add_continuous_aggregate_policy(
  'events_daily_summary',
  start_offset => INTERVAL '3 days',
  end_offset => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour',
  if_not_exists => TRUE
);

-- Refresh the materialized view for existing data
CALL refresh_continuous_aggregate('events_daily_summary', NULL, NULL);

-- ========================================
-- Verification Queries
-- ========================================

-- Check if events is a hypertable
SELECT * FROM timescaledb_information.hypertables 
WHERE hypertable_name = 'events';

-- Check compression settings
SELECT * FROM timescaledb_information.compression_settings 
WHERE hypertable_name = 'events';

-- Check policies
SELECT * FROM timescaledb_information.jobs 
WHERE hypertable_name = 'events';

COMMENT ON TABLE events IS 'TimescaleDB hypertable for storing fall detection and heart rate events with 7-day partitions';
COMMENT ON VIEW events_daily_summary IS 'Daily aggregated summary for events (auto-refreshed every hour)';
