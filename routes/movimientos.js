const express = require('express');
const router = express.Router();
const pool = require('../db');

// Set static file location
router.use(express.static('public'));
router.use('/css', express.static(__dirname + 'public/css'));
router.use('/js', express.static(__dirname + 'public/js'));
router.use('/img', express.static(__dirname + 'public/images'));

// Control de Ventas
router.get('/ventas', (req,res) => {
    res.render('tabs/movimientos/ventas');
});

router.get('/ventas-data', async (req,res) => {
    try {
        const ventas = await pool.query(`SELECT * FROM venta`);
        res.json(ventas.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/ventas-data', async (req,res) => {
    try {
        const {
            nit,
            cliente,
            fechaDeVenta,
            direccion,
            codigoDeProducto,
            descripcion,
            precioQ,
            cantidad,
            tipoDePago
        } = req.body;

        const newVenta = await pool.query(`INSERT INTO venta (nit, cliente, fecha_de_venta, direccion, codigo_de_producto, descripcion, precio_q, cantidad, tipo_de_pago)
                                           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
                                          [nit, cliente, fechaDeVenta, direccion, codigoDeProducto, descripcion, precioQ, cantidad, tipoDePago]);
        
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err.message);
    }
});

// Apertura de turno --missing--
router.get('/apertura-turno', (req,res) => {
    res.render('tabs/movimientos/aperturaTurno');
});

// Cierre de turno --missing--
router.get('/cierre-turno', (req,res) => {
    res.render('tabs/movimientos/cierreTurno');
});

// Control de Compras
router.get('/compras', (req,res) => {
    res.render('tabs/movimientos/compras');
});

router.get('/compras-data', async (req,res) => {
    try {
        const compras = await pool.query(`SELECT * FROM compra`);
        res.json(compras.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/compras-data', async (req,res) => {
    try {
        const {
            nit,
            proveedor,
            fechaDeCompra,
            direccion,
            codigoDeProducto,
            descripcion,
            precioQ,
            cantidad,
            tipoDePago
        } = req.body;

        const newCompra = await pool.query(`INSERT INTO compra (nit, proveedor, fecha_de_compra, direccion, codigo_de_producto, descripcion, precio_q, cantidad, tipo_de_pago)
                                            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
                                            [nit, proveedor, fechaDeCompra, direccion, codigoDeProducto, descripcion, precioQ, cantidad, tipoDePago]);

        res.redirect('/dashboard');
    } catch (err) {
        console.error(err.message);
    }
});

// Control de Inventarios
router.get('/inventario', (req,res) => {
    res.render('tabs/movimientos/inventario');
});

router.get('/inventario-data', async (req,res) => {
    try {
        const inventarios = await pool.query(`SELECT * FROM inventario`);
        res.json(inventarios.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/inventario-data', async (req,res) => {
    try {
        const {
            codigo,
            descripcion,
            cantidad,
            existenciaActual
        } = req.body;

        const newInventario = await pool.query(`INSERT INTO inventario (codigo, descripcion, cantidad, existencia_actual)
                                                VALUES ($1,$2,$3,$4) RETURNING *`,
                                                [codigo, descripcion, cantidad, existenciaActual]);

        res.redirect('/dashboard');
    } catch (err) {
        console.error(err.message);
    }
});

// Control de Gastos
router.get('/gastos-generales', (req,res) => {
    res.render('tabs/movimientos/gastos/gastosGenerales');
});

router.get('/gastos-generales-data', async (req,res) => {
    try {
        const gastosGenerales = await pool.query(`SELECT * FROM gasto_general`);
        res.json(gastosGenerales.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/gastos-generales-data', async (req,res) => {
    try {
        const {
            codigo,
            usuario,
            tipoDeGasto,
            fecha,
            descripcion,
            totalQ
        } = req.body;

        const newGastoGeneral = await pool.query(`INSERT INTO gasto_general (codigo, usuario, tipo_de_gasto, fecha, descripcion, total_q)
                                                  VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
                                                  [codigo, usuario, tipoDeGasto, fecha, descripcion, totalQ]);

        res.redirect('/dashboard');
    } catch (err) {
        console.error(err.message);
    }
});

// Gastos Sobre Ventas
router.get('/gastos-ventas', (req,res) => {
    res.render('tabs/movimientos/gastos/gastosDeVentas');
});

router.get('/gastos-ventas-data', async (req,res) => {
    try {
        const gastosDeVentas = await pool.query(`SELECT * FROM gasto_venta`);
        res.json(gastosDeVentas.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/gastos-ventas-data', async (req,res) => {
    try {
        const {
            codigo,
            fecha,
            descripcion,
            totalQ,
            usuario
        } = req.body;

        const newGastoDeVenta = await pool.query(`INSERT INTO gasto_venta (codigo, fecha, descripcion, total_q, usuario)
                                                  VALUES ($1,$2,$3,$4,$5) RETURNING *`,
                                                  [codigo, fecha, descripcion, totalQ, usuario]);

        res.redirect('/dashboard');
    } catch (err) {
        console.error(err.message);
    }
});

module.exports = router;