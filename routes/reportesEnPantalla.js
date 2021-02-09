const express = require('express');
const router = express.Router();
const pool = require('../db');

/* Ventas Detalladas */
router.get('/ventas-detalladas', (req,res) => {
    res.render('tabs/reportes-en-pantalla/ventasDetalladas');
});

router.get('/ventas-detalladas-todos-v', async(req,res) => {
    try {
        const query = await pool.query(`SELECT * FROM venta
                                        WHERE market_id = $1
                                        AND fecha_de_venta BETWEEN (SELECT date_trunc('day', fecha_apertura) + '07:00:00' FROM turno WHERE fecha_apertura = fecha_cierre AND market_id = $1 LIMIT 1) 
                                        AND (SELECT date_trunc('day', fecha_apertura) + '07:00:00' + INTERVAL '1 DAY' FROM turno WHERE fecha_apertura = fecha_cierre AND market_id = $1 LIMIT 1)
                                        ORDER BY fecha_de_venta DESC`, 
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
                                        AND fecha_de_venta BETWEEN (SELECT date_trunc('day', fecha_apertura) + '07:00:00' FROM turno WHERE fecha_apertura = fecha_cierre AND market_id = $1 LIMIT 1) 
                                        AND (SELECT date_trunc('day', fecha_apertura) + '07:00:00' + INTERVAL '1 DAY' FROM turno WHERE fecha_apertura = fecha_cierre AND market_id = $1 LIMIT 1)
                                        AND tipo_de_pago = 'efectivo' ORDER BY fecha_de_venta DESC`, [req.user.market_id]);
        res.json(query.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/ventas-detalladas-credito-v', async(req,res) => {
    try {
        const query = await pool.query(`SELECT * FROM venta 
                                        WHERE market_id = $1
                                        AND fecha_de_venta BETWEEN (SELECT date_trunc('day', fecha_apertura) + '07:00:00' FROM turno WHERE fecha_apertura = fecha_cierre AND market_id = $1 LIMIT 1) 
                                        AND (SELECT date_trunc('day', fecha_apertura) + '07:00:00' + INTERVAL '1 DAY' FROM turno WHERE fecha_apertura = fecha_cierre AND market_id = $1 LIMIT 1)
                                        AND tipo_de_pago = 'tarjeta' ORDER BY fecha_de_venta DESC`, [req.user.market_id]);
        res.json(query.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/ventas-detalladas-todos-t', async(req,res) => {
    try {
        const query = await pool.query(`SELECT * FROM venta 
                                        WHERE market_id = $1
                                        ORDER BY fecha_de_venta DESC`, [req.user.market_id]);
        res.json(query.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/ventas-detalladas-contado-t', async(req,res) => {
    try {
        const query = await pool.query(`SELECT * FROM venta 
                                        WHERE market_id = $1 AND tipo_de_pago = 'efectivo'
                                        ORDER BY fecha_de_venta DESC`, [req.user.market_id]);
        res.json(query.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/ventas-detalladas-credito-t', async(req,res) => {
    try {
        const query = await pool.query(`SELECT * FROM venta 
                                        WHERE market_id = $1 AND tipo_de_pago = 'tarjeta'
                                        ORDER BY fecha_de_venta DESC`, [req.user.market_id]);
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

router.get('/facturas-por-tiempo/:fechaComienzo/:fechaFinal', async (req,res) => {
    try {
        const { fechaComienzo, fechaFinal } = req.params;
        const facturasPorTiempo = await pool.query(`SELECT * FROM factura_venta
                                                    WHERE market_id = $3 AND fecha between $1 AND $2
                                                    ORDER BY factura_no DESC`, [fechaComienzo, fechaFinal, req.user.market_id]);
        res.json(facturasPorTiempo.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/venta/:facturaId', async (req,res) => {
    try {
        const { facturaId } = req.params;
        const ventasPorFactura = await pool.query(`SELECT * FROM venta WHERE factura_no = $1 AND market_id = $2`, [facturaId, req.user.market_id]);
        res.json(ventasPorFactura.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.put('/devolucion', async(req,res) => {
    try {
        const { codigo, cambio, ventaNo, total, facturaNo } = req.body;
        console.log('total: '  + total);
        console.log('facturaNo: ' + facturaNo);
        const updateInventario = await pool.query(`UPDATE inventario SET existencia_actual = existencia_actual + $1 WHERE market_id = $2 AND codigo = $3`, [cambio, req.user.market_id, codigo]);
        const updateVenta = await pool.query(`UPDATE venta SET cantidad = cantidad + $1 WHERE market_id = $2 AND venta_no = $3`, [cambio, req.user.market_id, ventaNo]);
        const updateFactura = await pool.query(`UPDATE factura_venta SET total = $1 WHERE factura_no = $2 AND market_id = $3`, [total, facturaNo, req.user.market_id]);
        res.json({ message: 'La devolución se ha procesado exitosamente.' });
    } catch (err) {
        console.error(err.message);
    }
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
                                        LIMIT 15`, [req.user.market_id]);
        res.json(query.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/productos-menos-vendidos-report', async (req,res) => {
    try {
        const query = await pool.query(`SELECT descripcion, COUNT(descripcion) AS counts 
                                        FROM venta 
                                        WHERE market_id = $1
                                        GROUP BY descripcion 
                                        ORDER BY counts ASC
                                        LIMIT 15`, [req.user.market_id]);
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