CREATE TABLE alta_y_baja (
    aid BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(255) NOT NULL,
    cantidad_cambio int NOT NULL,
    razon VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    market_id VARCHAR(255) NOT NULL
);