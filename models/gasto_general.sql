CREATE TABLE gasto_general (
    gid BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(255) NOT NULL,
    usuario VARCHAR(255) NOT NULL,
    tipo_de_gasto VARCHAR(255) NOT NULL,
    comprobante_no BIGSERIAL,
    fecha DATE NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    total_q INT NOT NULL
);