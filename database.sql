-- Create Inventory Table
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    location VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Staged Cart Table
CREATE TABLE cart (
    id SERIAL PRIMARY KEY,
    item_id INT REFERENCES inventory(id) ON DELETE CASCADE UNIQUE,
    quantity INT NOT NULL CHECK (quantity > 0)
);

-- Seed Initial Data
INSERT INTO inventory (name, quantity, location) VALUES
('Car Battery', 10, 'Shelf A'),
('Motor Oil (1L)', 25, 'Shelf B'),
('Brake Pads', 14, 'Shelf C');
