USE warranty_db;

-- users (shudhu test er jonno)
INSERT IGNORE INTO users (id, name, email, password, role) VALUES
('11111111-1111-4111-8111-111111111111', 'Test Admin',      'admin@test.com',      'x', 'ADMIN'),
('22222222-2222-4222-8222-222222222222', 'Test Technician', 'technician@test.com', 'x', 'TECHNICIAN'),
('33333333-3333-4333-8333-333333333333', 'Test Customer',   'customer@test.com',   'x', 'CUSTOMER'),
('77777777-7777-4777-8777-777777777777', 'Test Seller',     'seller@test.com',     'x', 'SELLER');

INSERT IGNORE INTO categories (id, name) VALUES
('88888888-8888-4888-8888-888888888888', 'Mobile');

INSERT IGNORE INTO products (id, name, brand, warrantyMonths, categoryId, sellerId) VALUES
('99999999-9999-4999-8999-999999999999', 'Galaxy A55', 'Samsung', 12,
 '88888888-8888-4888-8888-888888888888', '77777777-7777-4777-8777-777777777777');

INSERT IGNORE INTO warranties (id, serialNumber, purchaseDate, expiryDate, productId, customerId, sellerId) VALUES
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'SN-001', '2026-11-01', '2027-11-01',
 '99999999-9999-4999-8999-999999999999', '33333333-3333-4333-8333-333333333333',
 '77777777-7777-4777-8777-777777777777');

-- approved claim: CreateRepairDto er example claimId er sathe mile
INSERT IGNORE INTO claims (id, issueDescription, status, warrantyId) VALUES
('11111111-1111-4111-8111-111111111111', 'Screen cracked', 'APPROVED',
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');

-- parts: transaction test er jonno (battery er stock ichhe kore 1)
INSERT IGNORE INTO parts (id, name, sku, stock, unitPrice) VALUES
('44444444-4444-4444-8444-444444444444', 'Screen',  'SCR-001', 5, 2500.00),
('55555555-5555-4555-8555-555555555555', 'Battery', 'BAT-001', 1, 1200.00);