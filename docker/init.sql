-- Initialize KMRL Document Management Database

-- Create extension for vector operations (if available)
-- CREATE EXTENSION IF NOT EXISTS vector;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('LEADERSHIP', 'HR', 'FINANCE', 'ENGINEER', 'ADMIN')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by INTEGER REFERENCES users(id),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- AI-generated content
    summary_en TEXT,
    summary_ml TEXT,
    extracted_text TEXT,
    
    -- AI-generated metadata
    tags JSONB,
    allowed_roles JSONB, -- ["LEADERSHIP", "HR"] etc.
    ai_confidence DECIMAL(3,2), -- 0.00 to 1.00
    sensitivity_level VARCHAR(50) DEFAULT 'MEDIUM' CHECK (sensitivity_level IN ('LOW', 'MEDIUM', 'HIGH', 'CONFIDENTIAL')),
    
    -- Lifecycle
    retention_days INTEGER DEFAULT 2555, -- ~7 years default
    expiry_date DATE,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'QUARANTINED', 'EXPIRED', 'DELETED')),
    
    -- Embeddings (stored as JSON for simplicity in prototype)
    embeddings JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document access log
CREATE TABLE document_access_log (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id),
    user_id INTEGER REFERENCES users(id),
    access_type VARCHAR(50) NOT NULL, -- 'VIEW', 'DOWNLOAD', 'CHAT'
    access_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Chat sessions
CREATE TABLE chat_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    document_id INTEGER REFERENCES documents(id), -- NULL for global chat
    session_type VARCHAR(20) DEFAULT 'DOCUMENT' CHECK (session_type IN ('DOCUMENT', 'GLOBAL')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES chat_sessions(id) ON DELETE CASCADE,
    message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('USER', 'AI')),
    content TEXT NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document review queue (for low confidence AI predictions)
CREATE TABLE document_review_queue (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id),
    assigned_to INTEGER REFERENCES users(id),
    review_type VARCHAR(50) NOT NULL, -- 'ROLE_ASSIGNMENT', 'SENSITIVITY', 'CONTENT'
    ai_suggestion JSONB,
    human_decision JSONB,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'MODIFIED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_documents_allowed_roles ON documents USING gin(allowed_roles);
CREATE INDEX idx_documents_tags ON documents USING gin(tags);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_document_access_log_document_user ON document_access_log(document_id, user_id);
CREATE INDEX idx_chat_sessions_user_document ON chat_sessions(user_id, document_id);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES 
('admin', 'admin@kmrl.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye8H1g.YFz1lIh4QQj0W9.4yfC7v8M1Fe', 'System', 'Administrator', 'ADMIN'),
('leadership', 'leadership@kmrl.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye8H1g.YFz1lIh4QQj0W9.4yfC7v8M1Fe', 'Leadership', 'User', 'LEADERSHIP'),
('hr', 'hr@kmrl.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye8H1g.YFz1lIh4QQj0W9.4yfC7v8M1Fe', 'HR', 'User', 'HR'),
('finance', 'finance@kmrl.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye8H1g.YFz1lIh4QQj0W9.4yfC7v8M1Fe', 'Finance', 'User', 'FINANCE'),
('engineer', 'engineer@kmrl.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye8H1g.YFz1lIh4QQj0W9.4yfC7v8M1Fe', 'Engineer', 'User', 'ENGINEER');

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
