CREATE TABLE inventario(
    inventario_no BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    existencia_actual INT NOT NULL,
    market_id VARCHAR(255) NOT NULL
);