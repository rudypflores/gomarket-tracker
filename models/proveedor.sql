CREATE TABLE proveedor (
    codigo BIGSERIAL PRIMARY KEY NOT NULL,
    nit VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    celular VARCHAR(255) NOT NULL,
    saldo DOUBLE PRECISION NOT NULL,
    market_id VARCHAR(255) NOT NULL
);