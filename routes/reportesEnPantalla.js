const express = require('express');
const router = express.Router();
const pool = require('../db');

// Set static file location
// router.use(express.static('public'));
// router.use('/css', express.static(__dirname + 'public/css'));
// router.use('/js', express.static(__dirname + 'public/js'));
// router.use('/img', express.static(__dirname + 'public/images'));

/* Ventas Detalladas */
router.get('/ventas-detalladas', (req,res) => {
    res.render('tabs/reportes-en-pantalla/ventasDetalladas');
});

router.get('/ventas-detalladas-todos-v', async(req,res) => {
    try {
        const query = await pool.query(`SELECT * FROM venta
                                        WHERE market_id = $1
                                        AND fecha_de_venta BETWEEN (SELECT fecha_apertura FROM turno WHERE fecha_apertura = fecha_cierre) 
                                        AND (SELECT fecha_apertura FROM turno WHERE fecha_apertura = fecha_cierre) + INTERVAL '1 DAY'`, 
                                        [req.user.market_id]);
        res.json(query.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/ventas-detalladas-contado-v', async(req,res) => {
    try {
        const query = await pool.query(`SELECT * FROM venta 
                                        WHERE market_id = $1 
                                        AND fecha_de_venta BETWEEN (SELECT fecha_apertura FROM turno WHERE fecha_apertura = fecha_cierre) 
                                        AND (SELECT fecha_apertura FROM turno WHERE fecha_apertura = fecha_cierre) + INTERVAL '1 DAY'
                                        AND tipo_de_pago = 'efectivo'`, [req.user.market_id]);
        res.json(query.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/ventas-detalladas-credito-v', async(req,res) => {
    try {
        const query = await pool.query(`SELECT * FROM venta 
                                        WHERE market_id = $1
                                        AND fecha_de_venta BETWEEN (SELECT fecha_apertura FROM turno WHERE fecha_apertura = fecha_cierre) 
                                        AND (SELECT fecha_apertura FROM turno WHERE fecha_apertura = fecha_cierre) + INTERVAL '1 DAY'
                                        AND tipo_de_pago = 'tarjeta'`, [req.user.market_id]);
        res.json(query.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/ventas-detalladas-todos-t', async(req,res) => {
    try {
        const query = await pool.query(`SELECT * FROM venta 
                                        WHERE market_id = $1`, [req.user.market_id]);
        res.json(query.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/ventas-detalladas-contado-t', async(req,res) => {
    try {
        const query = await pool.query(`SELECT * FROM venta 
                                        WHERE market_id = $1 AND tipo_de_pago = 'efectivo'`, [req.user.market_id]);
        res.json(query.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/ventas-detalladas-credito-t', async(req,res) => {
    try {
        const query = await pool.query(`SELECT * FROM venta 
                                        WHERE market_id = $1 AND tipo_de_pago = 'tarjeta'`, [req.user.market_id]);
        res.json(query.rows);
    } catch (err) {
        console.error(err.message);
    }
});

/* Ventas (Pagos) */
router.get('/ventas-pagos', (req,res) => {
    res.render('tabs/reportes-en-pantalla/ventasPagos');
});

/* Compras (Pagos) */
router.get('/compras-pagos', (req,res) => {
    res.render('tabs/reportes-en-pantalla/comprasPagos');
});

/* Devolucion de Ventas */
router.get('/devolucion-de-ventas', (req,res) => {
    res.render('tabs/reportes-en-pantalla/devolucionDeVentas');
});

/* Precios y Existencias */
router.get('/precios-y-existencias', (req,res) => {
    res.render('tabs/reportes-en-pantalla/preciosYExistencias');
});

/* Inventario Actual */
router.get('/inventario-actual', (req,res) => {
    res.render('tabs/reportes-en-pantalla/inventarioActual');
});

/* Productos Mas Vendidos */
router.get('/productos-mas-vendidos', (req,res) => {
    res.render('tabs/reportes-en-pantalla/productosMasVendidos');
});

router.get('/productos-mas-vendidos-report', async(req,res) => {
    try {
        const query = await pool.query(`SELECT descripcion, COUNT(descripcion) AS counts 
                                        FROM venta 
                                        WHERE market_id = $1
                                        GROUP BY descripcion 
                                        ORDER BY counts DESC
                                        LIMIT 5`, [req.user.market_id]);
        res.json(query.rows);
    } catch (err) {
        console.error(err.message);
    }
});

/* Productos por Fecha de Vencimiento */
router.get('/productos-por-fecha-de-vencimiento', (req,res) => {
    res.render('tabs/reportes-en-pantalla/productosPorFechaDeVencimiento');
});

module.exports = router;