CREATE DATABASE gomarket_test;

CREATE TABLE usuario(
    uid BIGSERIAL PRIMARY KEY,
    n_usuario VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    pass VARCHAR(255) NOT NULL,
    cargo VARCHAR(255) NOT NULL,
    estado VARCHAR(255),
    direccion VARCHAR(255),
    celular VARCHAR(255),
    market_id VARCHAR(255) NOT NULL
);