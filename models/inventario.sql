CREATE TABLE inventario(
    inventario_no BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255),
    cantidad INT NOT NULL,
    existencia_actual INT NOT NULL
);