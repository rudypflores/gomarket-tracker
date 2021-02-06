CREATE TABLE factura_compra(
    factura_no BIGINT NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT NOW(),
    total DOUBLE PRECISION DEFAULT 0,
    market_id VARCHAR(255) NOT NULL,
    PRIMARY KEY(market_id, factura_no)
);