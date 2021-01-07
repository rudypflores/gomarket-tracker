CREATE TABLE turno (
    no_turno BIGSERIAL PRIMARY KEY,
    n_usuario VARCHAR(255) NOT NULL,
    efectivo_apertura DOUBLE PRECISION NOT NULL,
    efectivo_cierre DOUBLE PRECISION DEFAULT 0,
    fecha_apertura TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_cierre TIMESTAMP DEFAULT NOW()
);