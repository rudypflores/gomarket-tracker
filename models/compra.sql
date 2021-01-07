CREATE TABLE compra(
    compra_no BIGSERIAL PRIMARY KEY,
    nit VARCHAR(255) NOT NULL,
    no_factura BIGSERIAL,
    proveedor VARCHAR(255) NOT NULL,
    fecha_de_compra TIMESTAMP NOT NULL DEFAULT NOW(),
    direccion VARCHAR(255),
    codigo_de_producto VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255),
    precio_q DOUBLE PRECISION NOT NULL,
    cantidad INT NOT NULL,
    tipo_de_pago VARCHAR(255) NOT NULL
);