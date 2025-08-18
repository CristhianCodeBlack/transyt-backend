-- Script para crear evaluación de prueba para el módulo 60

-- Crear evaluación para el módulo 60
INSERT INTO evaluacion (titulo, descripcion, modulo_id, curso_id, nota_minima, activo, fecha_creacion)
SELECT 
    'Evaluación del Módulo' as titulo,
    'Evaluación de conocimientos del módulo' as descripcion,
    60 as modulo_id,
    m.curso_id,
    70 as nota_minima,
    true as activo,
    NOW() as fecha_creacion
FROM modulo m
WHERE m.id = 60
  AND NOT EXISTS (SELECT 1 FROM evaluacion WHERE modulo_id = 60);

-- Obtener el ID de la evaluación creada
SET @evaluacion_id = (SELECT id FROM evaluacion WHERE modulo_id = 60 ORDER BY id DESC LIMIT 1);

-- Crear pregunta de ejemplo
INSERT INTO pregunta (enunciado, puntaje, tipo, evaluacion_id)
VALUES 
('¿Cuál es el concepto principal de este módulo?', 10, 'multiple', @evaluacion_id);

-- Obtener el ID de la pregunta creada
SET @pregunta_id = (SELECT id FROM pregunta WHERE evaluacion_id = @evaluacion_id ORDER BY id DESC LIMIT 1);

-- Crear respuestas de ejemplo
INSERT INTO respuesta (texto, es_correcta, pregunta_id)
VALUES 
('Respuesta correcta', true, @pregunta_id),
('Respuesta incorrecta 1', false, @pregunta_id),
('Respuesta incorrecta 2', false, @pregunta_id),
('Respuesta incorrecta 3', false, @pregunta_id);

-- Verificar que se creó correctamente
SELECT 
    e.id as evaluacion_id,
    e.titulo,
    e.modulo_id,
    COUNT(p.id) as num_preguntas,
    COUNT(r.id) as num_respuestas
FROM evaluacion e
LEFT JOIN pregunta p ON e.id = p.evaluacion_id
LEFT JOIN respuesta r ON p.id = r.pregunta_id
WHERE e.modulo_id = 60
GROUP BY e.id, e.titulo, e.modulo_id;