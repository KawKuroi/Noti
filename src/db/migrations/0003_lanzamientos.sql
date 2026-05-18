INSERT INTO categories (slug, name, icon, color) VALUES
  ('tv',    'Series',      'Tv',         '#0EA5E9'),
  ('games', 'Videojuegos', 'Gamepad2',   '#16A34A'),
  ('music', 'Musica',      'Music',      '#EA580C'),
  ('books', 'Libros',      'BookMarked', '#8B5CF6')
ON CONFLICT (slug) DO NOTHING;

UPDATE categories SET name = 'Peliculas' WHERE slug = 'movies';

UPDATE reminders
SET category_id = (SELECT id FROM categories WHERE slug = 'tv')
WHERE metadata->>'tipo' = 'tv';

UPDATE reminders
SET category_id = (SELECT id FROM categories WHERE slug = 'games')
WHERE metadata->>'tipo' = 'game';

UPDATE reminders
SET category_id = (SELECT id FROM categories WHERE slug = 'music')
WHERE metadata->>'tipo' = 'album';
