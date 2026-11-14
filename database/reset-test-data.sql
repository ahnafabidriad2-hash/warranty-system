USE warranty_db;

-- age child table, tarpor parent (foreign key er jonno ei order)
DELETE FROM feedback;
DELETE FROM repair_parts;
DELETE FROM repairs;

UPDATE claims SET status = 'APPROVED' WHERE id = '11111111-1111-4111-8111-111111111111';
UPDATE parts SET stock = 5 WHERE sku = 'SCR-001';
UPDATE parts SET stock = 1 WHERE sku = 'BAT-001';