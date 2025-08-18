-- Datos de prueba para el sistema de progreso
-- Ejecutar para crear progreso de módulos y evaluaciones

-- 1. Crear progreso de módulos para empleados (marcar algunos como completados)
INSERT INTO modulo_progreso (usuario_id, modulo_id, completado, porcentaje_progreso, fecha_inicio, fecha_completado)
SELECT 
    u.id as usuario_id,
    m.id as modulo_id,
    CASE 
        WHEN ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY m.id) <= 2 THEN true 
        ELSE false 
    END as completado,
    CASE 
        WHEN ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY m.id) <= 2 THEN 100 
        ELSE 0 
    END as porcentaje_progreso,
    NOW() - INTERVAL '5 days' as fecha_inicio,
    CASE 
        WHEN ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY m.id) <= 2 THEN NOW() - INTERVAL '1 day'
        ELSE NULL 
    END as fecha_completado
FROM usuario u
CROSS JOIN modulo m
WHERE u.rol = 'EMPLEADO' 
  AND m.curso_id IN (SELECT id FROM curso WHERE activo = true)
  AND NOT EXISTS (
    SELECT 1 FROM modulo_progreso mp 
    WHERE mp.usuario_id = u.id AND mp.modulo_id = m.id
  )
LIMIT 20;

-- 2. Crear evaluaciones aprobadas para empleados
INSERT INTO evaluacion_usuario (evaluacion_id, usuario_id, puntaje_obtenido, puntaje_maximo, aprobado, fecha_inicio, fecha_realizacion, intentos)
SELECT 
    e.id as evaluacion_id,
    u.id as usuario_id,
    80 as puntaje_obtenido,
    100 as puntaje_maximo,
    true as aprobado,
    NOW() - INTERVAL '2 days' as fecha_inicio,
    NOW() - INTERVAL '1 day' as fecha_realizacion,
    1 as intentos
FROM usuario u
CROSS JOIN evaluacion e
WHERE u.rol = 'EMPLEADO' 
  AND e.activo = true
  AND NOT EXISTS (
    SELECT 1 FROM evaluacion_usuario eu 
    WHERE eu.usuario_id = u.id AND eu.evaluacion_id = e.id
  )
LIMIT 10;

-- 3. Crear inscripciones de curso
INSERT INTO curso_usuario (curso_id, usuario_id, completado, porcentaje_progreso, fecha_inicio, fecha_completado)
SELECT 
    c.id as curso_id,
    u.id as usuario_id,
    false as completado,
    50 as porcentaje_progreso,
    NOW() - INTERVAL '7 days' as fecha_inicio,
    NULL as fecha_completado
FROM usuario u
CROSS JOIN curso c
WHERE u.rol = 'EMPLEADO' 
  AND c.activo = true
  AND NOT EXISTS (
    SELECT 1 FROM curso_usuario cu 
    WHERE cu.usuario_id = u.id AND cu.curso_id = c.id
  )
LIMIT 10;

-- Verificar datos creados
SELECT 
    'Progreso de módulos' as tipo,
    COUNT(*) as total,
    SUM(CASE WHEN completado = true THEN 1 ELSE 0 END) as completados
FROM modulo_progreso mp
JOIN usuario u ON mp.usuario_id = u.id
WHERE u.rol = 'EMPLEADO'

UNION ALL

SELECT 
    'Evaluaciones' as tipo,
    COUNT(*) as total,
    SUM(CASE WHEN aprobado = true THEN 1 ELSE 0 END) as aprobadas
FROM evaluacion_usuario eu
JOIN usuario u ON eu.usuario_id = u.id
WHERE u.rol = 'EMPLEADO'

UNION ALL

SELECT 
    'Inscripciones' as tipo,
    COUNT(*) as total,
    SUM(CASE WHEN completado = true THEN 1 ELSE 0 END) as completadas
FROM curso_usuario cu
JOIN usuario u ON cu.usuario_id = u.id
WHERE u.rol = 'EMPLEADO';