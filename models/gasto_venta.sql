CREATE TABLE gasto_venta (
    gid BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    comprobante_no BIGSERIAL,
    descripcion VARCHAR(255),
    total_q INT NOT NULL,
    usuario VARCHAR(255) NOT NULL
);