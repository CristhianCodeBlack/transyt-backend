-- Script para verificar evaluaciones del módulo 60
-- Ejecutar para ver si hay evaluaciones

-- Verificar evaluaciones del módulo 60
SELECT 
    e.id,
    e.titulo,
    e.descripcion,
    e.modulo_id,
    e.curso_id,
    e.activo,
    m.titulo as modulo_titulo,
    c.titulo as curso_titulo
FROM evaluacion e
LEFT JOIN modulo m ON e.modulo_id = m.id
LEFT JOIN curso c ON e.curso_id = c.id
WHERE e.modulo_id = 60 OR e.curso_id = (SELECT curso_id FROM modulo WHERE id = 60);

-- Ver todas las evaluaciones activas
SELECT 
    e.id,
    e.titulo,
    e.modulo_id,
    e.curso_id,
    e.activo,
    COALESCE(m.titulo, 'Sin módulo') as modulo_titulo,
    c.titulo as curso_titulo
FROM evaluacion e
LEFT JOIN modulo m ON e.modulo_id = m.id
LEFT JOIN curso c ON e.curso_id = c.id
WHERE e.activo = true
ORDER BY e.id DESC;

-- Ver información del módulo 60
SELECT 
    m.id,
    m.titulo,
    m.curso_id,
    c.titulo as curso_titulo
FROM modulo m
JOIN curso c ON m.curso_id = c.id
WHERE m.id = 60;