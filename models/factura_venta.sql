CREATE TABLE factura_venta(
    factura_no BIGSERIAL PRIMARY KEY,
    total DOUBLE PRECISION DEFAULT 0,
    market_id VARCHAR(255) NOT NULL
);