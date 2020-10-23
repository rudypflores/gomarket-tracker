CREATE TABLE producto (
    codigo VARCHAR(255) PRIMARY KEY NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    costo_q DOUBLE PRECISION NOT NULL,
    precio_publico DOUBLE PRECISION NOT NULL,
    p_utilidad DOUBLE PRECISION NOT NULL,
    ubicacion VARCHAR(255),
    estado VARCHAR(255) NOT NULL,
    vencimiento DATE NOT NULL
);