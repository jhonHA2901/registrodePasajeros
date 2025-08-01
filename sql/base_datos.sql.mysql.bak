CREATE DATABASE registro_pasajeros;
USE registro_pasajeros;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  dni VARCHAR(8) UNIQUE,
  correo VARCHAR(100),
  contraseña VARCHAR(255),
  rol ENUM('admin', 'pasajero') DEFAULT 'pasajero'
);

CREATE TABLE rutas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  origen VARCHAR(100),
  destino VARCHAR(100)
);

CREATE TABLE registros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  ruta_id INT,
  fecha_registro DATE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (ruta_id) REFERENCES rutas(id)
);

-- Insertar un usuario administrador por defecto
INSERT INTO usuarios (nombre, dni, correo, contraseña, rol)
VALUES ('Administrador', '12345678', 'admin@metro.com', '$2b$10$XOPbrlUPQdwdJUpSrIF6X.MPaOzW/yZZ3siPzgO.PbZbCiQKxvtlu', 'admin');
-- Contraseña: admin123

-- Insertar algunas rutas por defecto
INSERT INTO rutas (origen, destino) VALUES ('Estación Central', 'Chorrillos');
INSERT INTO rutas (origen, destino) VALUES ('Naranjal', 'Chorrillos');
INSERT INTO rutas (origen, destino) VALUES ('Matellini', 'Estación Central');
INSERT INTO rutas (origen, destino) VALUES ('Angamos', 'Naranjal');