-- Insertar empresa por defecto si no existe
INSERT INTO empresa (id, nombre, ruc, estado) 
SELECT 1, 'Empresa Demo', '12345678901', true
WHERE NOT EXISTS (SELECT 1 FROM empresa WHERE id = 1);