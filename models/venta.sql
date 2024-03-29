CREATE TABLE venta (
    venta_no BIGSERIAL PRIMARY KEY NOT NULL,
    nit VARCHAR(255) NOT NULL,
    cliente VARCHAR(255) NOT NULL,
    fecha_de_venta TIMESTAMP NOT NULL DEFAULT NOW(),
    direccion VARCHAR(255) NOT NULL,
    codigo_de_producto VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    precio_q DOUBLE PRECISION NOT NULL,
    cantidad INT NOT NULL,
    tipo_de_pago VARCHAR(255) NOT NULL,
    n_usuario VARCHAR(255) NOT NULL,
    market_id VARCHAR(255) NOT NULL,
    factura_no VARCHAR(255) NOT NULL
);