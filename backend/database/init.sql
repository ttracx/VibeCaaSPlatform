CREATE DATABASE IF NOT EXISTS vibecaas;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    plan VARCHAR(50) DEFAULT 'free',
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Apps table
CREATE TABLE IF NOT EXISTS apps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language VARCHAR(50) NOT NULL,
    framework VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'stopped',
    url VARCHAR(255),
    repository_url VARCHAR(255),
    build_command TEXT,
    start_command TEXT,
    environment_variables JSONB DEFAULT '{}',
    resources JSONB DEFAULT '{"cpu": "0.5 vCPU", "memory": "1GB", "storage": "5GB"}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deployments table
CREATE TABLE IF NOT EXISTS deployments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    build_logs TEXT,
    deploy_logs TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- GPU allocations table
CREATE TABLE IF NOT EXISTS gpu_allocations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    gpu_id VARCHAR(255) NOT NULL,
    gpu_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'allocated',
    allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deallocated_at TIMESTAMP
);

-- Resource usage logs
CREATE TABLE IF NOT EXISTS resource_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(10,2),
    network_rx DECIMAL(10,2),
    network_tx DECIMAL(10,2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_apps_user_id ON apps(user_id);
CREATE INDEX IF NOT EXISTS idx_deployments_app_id ON deployments(app_id);
CREATE INDEX IF NOT EXISTS idx_gpu_allocations_app_id ON gpu_allocations(app_id);
CREATE INDEX IF NOT EXISTS idx_resource_usage_app_id ON resource_usage(app_id);
CREATE INDEX IF NOT EXISTS idx_resource_usage_timestamp ON resource_usage(timestamp);

-- Insert demo user
INSERT INTO users (email, name, password_hash, plan) 
VALUES ('demo@vibecaas.com', 'Demo User', '$2a$10$rQBLFj7R7LxjNQCQi8GJyO9d9c9L1n9y9QhT8sS9y7F7x7F7x7F7x', 'pro')
ON CONFLICT (email) DO NOTHING;