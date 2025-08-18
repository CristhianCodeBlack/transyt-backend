-- Script para limpiar datos simulados y dejar el sistema limpio
-- Ejecutar para eliminar progreso artificial

-- Eliminar progreso de módulos simulado
DELETE FROM modulo_progreso 
WHERE usuario_id IN (SELECT id FROM usuario WHERE rol = 'EMPLEADO')
  AND completado = true
  AND fecha_completado > NOW() - INTERVAL '30 days';

-- Eliminar evaluaciones simuladas
DELETE FROM evaluacion_usuario 
WHERE usuario_id IN (SELECT id FROM usuario WHERE rol = 'EMPLEADO')
  AND fecha_realizacion > NOW() - INTERVAL '30 days';

-- Eliminar inscripciones simuladas
DELETE FROM curso_usuario 
WHERE usuario_id IN (SELECT id FROM usuario WHERE rol = 'EMPLEADO')
  AND fecha_inicio > NOW() - INTERVAL '30 days';

-- Verificar que se limpiaron los datos
SELECT 
    'Progreso módulos restante' as tipo,
    COUNT(*) as cantidad
FROM modulo_progreso mp
JOIN usuario u ON mp.usuario_id = u.id
WHERE u.rol = 'EMPLEADO'

UNION ALL

SELECT 
    'Evaluaciones restantes' as tipo,
    COUNT(*) as cantidad
FROM evaluacion_usuario eu
JOIN usuario u ON eu.usuario_id = u.id
WHERE u.rol = 'EMPLEADO'

UNION ALL

SELECT 
    'Inscripciones restantes' as tipo,
    COUNT(*) as cantidad
FROM curso_usuario cu
JOIN usuario u ON cu.usuario_id = u.id
WHERE u.rol = 'EMPLEADO';