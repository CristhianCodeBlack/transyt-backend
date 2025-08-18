-- Script para aprobar evaluación manualmente para testing
-- Ejecutar para que el usuario pueda generar certificado

-- Aprobar evaluación del curso 25 para el usuario Damian
INSERT INTO evaluacion_usuario (evaluacion_id, usuario_id, puntaje_obtenido, puntaje_maximo, aprobado, fecha_inicio, fecha_realizacion, intentos)
SELECT 
    e.id as evaluacion_id,
    u.id as usuario_id,
    100 as puntaje_obtenido,
    100 as puntaje_maximo,
    true as aprobado,
    NOW() - INTERVAL '1 hour' as fecha_inicio,
    NOW() as fecha_realizacion,
    1 as intentos
FROM evaluacion e
CROSS JOIN usuario u
WHERE e.curso_id = 25 
  AND u.nombre = 'Damian'
  AND e.activo = true
  AND NOT EXISTS (
    SELECT 1 FROM evaluacion_usuario eu 
    WHERE eu.usuario_id = u.id AND eu.evaluacion_id = e.id
  );

-- Verificar que se creó correctamente
SELECT 
    u.nombre as usuario,
    e.titulo as evaluacion,
    c.titulo as curso,
    eu.aprobado,
    eu.puntaje_obtenido,
    eu.fecha_realizacion
FROM evaluacion_usuario eu
JOIN usuario u ON eu.usuario_id = u.id
JOIN evaluacion e ON eu.evaluacion_id = e.id
JOIN curso c ON e.curso_id = c.id
WHERE c.id = 25 AND u.nombre = 'Damian';