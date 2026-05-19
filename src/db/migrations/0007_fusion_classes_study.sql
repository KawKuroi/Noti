-- Fase 14: Fusion de categorias classes -> study
-- Migrar todos los recordatorios de classes a study y eliminar la categoria

UPDATE reminders
SET category_id = (SELECT id FROM categories WHERE slug = 'study')
WHERE category_id = (SELECT id FROM categories WHERE slug = 'classes');

DELETE FROM categories WHERE slug = 'classes';

-- Rename tasks: 'Tareas' -> 'Pendientes' (el slug se mantiene)
UPDATE categories SET name = 'Pendientes' WHERE slug = 'tasks';
