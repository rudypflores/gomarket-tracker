CREATE TABLE proveedor (
    codigo VARCHAR(255) PRIMARY KEY NOT NULL,
    nit VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    celular VARCHAR(255) NOT NULL,
    saldo DOUBLE PRECISION NOT NULL
);