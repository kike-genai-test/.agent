-- =============================================================================
-- BIBLIOTECA — Seed Data
-- Datos de prueba para desarrollo y testing
-- Agente: db-migration-architect
-- =============================================================================

-- Usuario administrador
-- Password: "admin123" hasheada con bcrypt (10 rounds)
-- Hash generado: $2b$10$rBl9pJ8RZq7GkVh5J0lBbe9vkHZ4kjrLkm.A3CYaKZa4AqG.ygXZi
INSERT INTO usuarios (username, password, rol, activo) VALUES
  ('admin', '$2b$10$rBl9pJ8RZq7GkVh5J0lBbe9vkHZ4kjrLkm.A3CYaKZa4AqG.ygXZi', 'admin', 1),
  ('operador1', '$2b$10$rBl9pJ8RZq7GkVh5J0lBbe9vkHZ4kjrLkm.A3CYaKZa4AqG.ygXZi', 'operador', 1);

-- Socios (clientes) de prueba
INSERT INTO socios (apellidos, nombres, nro_doc, domicilio, telefono, activo) VALUES
  ('García',    'Juan Carlos',   '28341256', 'Av. Corrientes 1234, CABA',   '011-4523-8901', 1),
  ('Fernández', 'María Laura',   '31567890', 'Calle Mitre 567, Buenos Aires','011-4612-3456', 1),
  ('López',     'Roberto Ariel', '25789012', 'Rivadavia 890, Palermo',       '011-4789-2345', 1),
  ('Martínez',  'Ana Sofía',     '38901234', 'Callao 234, Balvanera',        '011-4567-8901', 1),
  ('Rodríguez', 'Carlos Eduardo','22345678', 'Santa Fe 1890, Recoleta',      '011-4890-1234', 1),
  ('Pérez',     'Lucía Valentina','41234567', 'Corrientes 3456, Almagro',    '011-4234-5678', 0); -- activo=0 para probar baja

-- Libros de prueba
INSERT INTO libros (titulo, autor, estado, socio_id, fecha_prestamo, fecha_devolucion, dias, activo) VALUES
  ('El Aleph',                   'Jorge Luis Borges',     'disponible', NULL, NULL,         NULL,         0,  1),
  ('Cien años de soledad',       'Gabriel García Márquez', 'disponible', NULL, NULL,         NULL,         0,  1),
  ('Don Quijote de la Mancha',   'Miguel de Cervantes',   'disponible', NULL, NULL,         NULL,         0,  1),
  ('La casa de los espíritus',   'Isabel Allende',        'prestado',   1,   '2026-02-15', '2026-03-15', 28, 1),
  ('Ficciones',                  'Jorge Luis Borges',     'prestado',   2,   '2026-02-20', '2026-03-05', 13, 1),
  ('Rayuela',                    'Julio Cortázar',        'disponible', NULL, NULL,         NULL,         0,  1),
  ('La ciudad y los perros',     'Mario Vargas Llosa',    'disponible', NULL, NULL,         NULL,         0,  1),
  ('Crónica de una muerte anunciada', 'Gabriel García Márquez', 'prestado', 3, '2026-02-25', '2026-03-10', 13, 1),
  ('El túnel',                   'Ernesto Sábato',        'disponible', NULL, NULL,         NULL,         0,  1),
  ('Sobre héroes y tumbas',      'Ernesto Sábato',        'disponible', NULL, NULL,         NULL,         0,  1),
  ('Manual del distraído',       'Alejandro Rossi',       'disponible', NULL, NULL,         NULL,         0,  1),
  ('El señor de los anillos',    'J.R.R. Tolkien',        'prestado',   4,   '2026-03-01', '2026-03-21', 20, 1);
