-- Script para crear datos de prueba para el sistema de progreso
-- Ejecutar en la base de datos para probar certificados

-- 1. Crear progreso de módulos para el usuario (simular módulos completados)
INSERT INTO modulo_progreso (usuario_id, modulo_id, completado, porcentaje_progreso, fecha_inicio, fecha_completado)
SELECT 
    u.id as usuario_id,
    m.id as modulo_id,
    true as completado,
    100 as porcentaje_progreso,
    NOW() - INTERVAL '7 days' as fecha_inicio,
    NOW() - INTERVAL '1 day' as fecha_completado
FROM usuario u
CROSS JOIN modulo m
WHERE u.rol = 'EMPLEADO' 
  AND m.curso_id IN (22, 23)
  AND NOT EXISTS (
    SELECT 1 FROM modulo_progreso mp 
    WHERE mp.usuario_id = u.id AND mp.modulo_id = m.id
  )
LIMIT 10;

-- 2. Crear evaluaciones aprobadas para el usuario
INSERT INTO evaluacion_usuario (evaluacion_id, usuario_id, puntaje_obtenido, puntaje_maximo, aprobado, fecha_inicio, fecha_realizacion, intentos)
SELECT 
    e.id as evaluacion_id,
    u.id as usuario_id,
    85 as puntaje_obtenido,
    100 as puntaje_maximo,
    true as aprobado,
    NOW() - INTERVAL '2 days' as fecha_inicio,
    NOW() - INTERVAL '1 day' as fecha_realizacion,
    1 as intentos
FROM usuario u
CROSS JOIN evaluacion e
WHERE u.rol = 'EMPLEADO' 
  AND e.curso_id IN (22, 23)
  AND e.activo = true
  AND NOT EXISTS (
    SELECT 1 FROM evaluacion_usuario eu 
    WHERE eu.usuario_id = u.id AND eu.evaluacion_id = e.id
  )
LIMIT 10;

-- 3. Crear inscripciones de curso si no existen
INSERT INTO curso_usuario (curso_id, usuario_id, completado, porcentaje_progreso, fecha_inicio, fecha_completado)
SELECT 
    c.id as curso_id,
    u.id as usuario_id,
    true as completado,
    100 as porcentaje_progreso,
    NOW() - INTERVAL '10 days' as fecha_inicio,
    NOW() as fecha_completado
FROM usuario u
CROSS JOIN curso c
WHERE u.rol = 'EMPLEADO' 
  AND c.id IN (22, 23)
  AND c.activo = true
  AND NOT EXISTS (
    SELECT 1 FROM curso_usuario cu 
    WHERE cu.usuario_id = u.id AND cu.curso_id = c.id
  )
LIMIT 5;

-- Verificar los datos creados
SELECT 
    'Módulos completados' as tipo,
    COUNT(*) as cantidad
FROM modulo_progreso mp
JOIN usuario u ON mp.usuario_id = u.id
WHERE u.rol = 'EMPLEADO' AND mp.completado = true

UNION ALL

SELECT 
    'Evaluaciones aprobadas' as tipo,
    COUNT(*) as cantidad
FROM evaluacion_usuario eu
JOIN usuario u ON eu.usuario_id = u.id
WHERE u.rol = 'EMPLEADO' AND eu.aprobado = true

UNION ALL

SELECT 
    'Cursos inscritos' as tipo,
    COUNT(*) as cantidad
FROM curso_usuario cu
JOIN usuario u ON cu.usuario_id = u.id
WHERE u.rol = 'EMPLEADO';