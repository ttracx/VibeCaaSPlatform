-- VibeCaaS Database Initialization Script

-- Create database if not exists
-- CREATE DATABASE vibecaas;

-- Create custom types
CREATE TYPE user_tier AS ENUM ('free', 'hobby', 'pro', 'team', 'enterprise');
CREATE TYPE app_status AS ENUM ('creating', 'building', 'deploying', 'running', 'stopped', 'failed', 'terminated');

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    tier user_tier DEFAULT 'free',
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Apps table
CREATE TABLE IF NOT EXISTS apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    framework VARCHAR(50),
    runtime_version VARCHAR(20),
    status app_status DEFAULT 'creating',
    container_id VARCHAR(100),
    port INTEGER DEFAULT 8000,
    url VARCHAR(255),
    gpu_enabled BOOLEAN DEFAULT FALSE,
    gpu_type VARCHAR(20),
    cpu_limit DECIMAL(3,2) DEFAULT 0.5,
    memory_limit VARCHAR(10) DEFAULT '512M',
    storage_limit VARCHAR(10) DEFAULT '1G',
    environment_vars JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_deployed TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- App metrics table
CREATE TABLE IF NOT EXISTS app_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(10,2),
    storage_usage DECIMAL(10,2),
    requests_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    response_time_ms DECIMAL(10,2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Billing table
CREATE TABLE IF NOT EXISTS billing_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    app_id UUID REFERENCES apps(id) ON DELETE SET NULL,
    resource_type VARCHAR(50),
    quantity DECIMAL(10,2),
    unit_price DECIMAL(10,4),
    total_cost DECIMAL(10,2),
    billing_period DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_apps_user_id ON apps(user_id);
CREATE INDEX idx_apps_status ON apps(status);
CREATE INDEX idx_app_metrics_app_id ON app_metrics(app_id);
CREATE INDEX idx_app_metrics_timestamp ON app_metrics(timestamp);
CREATE INDEX idx_billing_user_id ON billing_records(user_id);
CREATE INDEX idx_billing_period ON billing_records(billing_period);

-- Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apps_updated_at BEFORE UPDATE ON apps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO users (email, username, hashed_password, tier, is_superuser)
VALUES ('admin@vibecaas.local', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY3L2oFDlJ4D872', 'enterprise', TRUE)
ON CONFLICT DO NOTHING;

-- Grant permissions (create user if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'vibecaas_user') THEN
        CREATE USER vibecaas_user WITH PASSWORD 'vibecaas_dev_password';
    END IF;
END
$$;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vibecaas_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vibecaas_user;