const express = require('express');
const router = express.Router();
const pool = require('../db');

// Control de Ventas
router.get('/ventas', (req,res) => {
    res.render('tabs/movimientos/ventas');
});

router.get('/ventas-data', async (req,res) => {
    try {
        const ventas = await pool.query(`SELECT * FROM venta WHERE market_id = $1`, [req.user.market_id]);
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
            direccion,
            codigoDeProducto,
            descripcion,
            precioQ,
            cantidad,
            tipoDePago,
            facturaNo
        } = req.body;
    
        const newVenta = await pool.query(`INSERT INTO venta (nit, cliente, direccion, codigo_de_producto, descripcion, precio_q, cantidad, tipo_de_pago, n_usuario, market_id, factura_no)
                                           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
                                          [nit, cliente, direccion, codigoDeProducto, descripcion, precioQ, cantidad, tipoDePago, req.user.n_usuario, req.user.market_id, facturaNo]);
        res.json(newVenta.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.put('/ventas-data', async (req,res) => {
    try {
        const { facturaNo, tipoDePago } = req.body;
        const updateTipoDePago = await pool.query(`UPDATE venta SET tipo_de_pago = $1 WHERE factura_no = $2 AND market_id = $3`, [tipoDePago, facturaNo, req.user.market_id]);
        res.json(updateTipoDePago.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.delete('/ventas-data/:id', async (req,res) => {
    try {
        const { id } = req.params;
        const deletedVenta = await pool.query(`DELETE FROM venta
                                               WHERE venta_no = $1 AND market_id = $2
                                               RETURNING *`, [id, req.user.market_id]);
        res.json({ message: `Item with id ${id} removed successfully` });
    } catch (err) {
        console.error(err.message);
    }
});

/* Facturas de venta */
router.get('/factura-venta', async(req,res) => {
    try {
        const facturas = await pool.query(`SELECT * FROM factura_venta WHERE market_id = $1`, [req.user.market_id]);
        res.json(facturas.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/factura-venta', async(req,res) => {
    try {
        // Generate next serial number based on market location
        let getNextSerial = await pool.query(`SELECT MAX(factura_no)+1 AS next_factura FROM factura_venta WHERE market_id = $1`, [req.user.market_id]);
        getNextSerial.rows[0].next_factura = getNextSerial.rows[0].next_factura == null ? 1 : getNextSerial.rows[0].next_factura;

        const nuevaFactura = await pool.query(`INSERT INTO factura_venta (factura_no, market_id)
                                               VALUES ($1,$2) RETURNING *`, [getNextSerial.rows[0].next_factura, req.user.market_id]);
        res.json(nuevaFactura.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.put('/factura-venta', async(req,res) => {
    try {
        const { total, facturaNo } = req.body;
        const editarFactura = await pool.query(`UPDATE factura_venta SET total = $1 WHERE factura_no = $2 AND market_id = $3`, [total, facturaNo, req.user.market_id]);
        res.json({ message: 'updated successfully' });
    } catch (err) {
        console.error(err.message);
    }
});

router.delete('/factura-venta/:id', async(req,res) => {
    try {
        const { id } = req.params;
        const deleteFactura = await pool.query(`DELETE FROM factura_venta WHERE factura_no = $1 AND market_id = $2`, [id, req.user.market_id]);
        res.json({ message: 'factura removed successfully' });
    } catch (err) {
        console.error(err.message);
    }
});

/* Facturas de compra */
router.get('/factura-compra', async(req,res) => {
    try {
        const facturas = await pool.query(`SELECT * FROM factura_compra WHERE market_id = $1`, [req.user.market_id]);
        res.json(facturas.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/factura-compra', async(req,res) => {
    try {
        // Generate next serial number based on market location
        let getNextSerial = await pool.query(`SELECT MAX(factura_no)+1 AS next_factura FROM factura_compra WHERE market_id = $1`, [req.user.market_id]);
        getNextSerial.rows[0].next_factura = getNextSerial.rows[0].next_factura == null ? 1 : getNextSerial.rows[0].next_factura;

        const nuevaFactura = await pool.query(`INSERT INTO factura_compra (factura_no, market_id)
                                               VALUES ($1,$2) RETURNING *`, [getNextSerial.rows[0].next_factura, req.user.market_id]);
        res.json(nuevaFactura.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.put('/factura-compra', async(req,res) => {
    try {
        const { total, facturaNo } = req.body;
        const editarFactura = await pool.query(`UPDATE factura_compra SET total = $1 WHERE factura_no = $2 AND market_id = $3`, [total, facturaNo, req.user.market_id]);
        res.json({ message: 'updated successfully' });
    } catch (err) {
        console.error(err.message);
    }
});

router.delete('/factura-compra/:id', async(req,res) => {
    try {
        const { id } = req.params;
        const deleteFactura = await pool.query(`DELETE FROM factura_compra WHERE factura_no = $1 AND market_id = $2`, [id, req.user.market_id]);
        res.json({ message: 'factura removed successfully' });
    } catch (err) {
        console.error(err.message);
    }
});

// Apertura de turno
router.get('/apertura-turno', (req,res) => {
    res.render('tabs/movimientos/aperturaTurno');
});

router.post('/apertura-turno', async (req,res) => {
    try {
        const { efectivo } = req.body;
        const nuevoTurno = await pool.query(`INSERT INTO turno (n_usuario, efectivo_apertura, market_id)
                                             VALUES ($1,$2,$3) RETURNING *`, [req.user.n_usuario, efectivo, req.user.market_id]);
        res.json({ message: 'Turno iniciado exitosamente!' });
    } catch (err) {
        console.error(err.message);
    }
});

// Cierre de turno
router.get('/cierre-turno', (req,res) => {
    res.render('tabs/movimientos/cierreTurno');
});

router.put('/cierre-turno', async (req,res) => {
    try {
        const { efectivo } = req.body;
        const latestDate = await pool.query(`SELECT max(to_char(fecha_apertura, 'YYYY-MM-DD HH24:MI:SS')) AS max_fecha FROM turno WHERE n_usuario = $1 AND market_id = $2`, [req.user.n_usuario, req.user.market_id]);
        const updateTurno = await pool.query(`UPDATE turno SET efectivo_cierre = $1, fecha_cierre = NOW() WHERE to_char(fecha_apertura, 'YYYY-MM-DD HH24:MI:SS') = $2 AND n_usuario = $3 AND market_id = $4 RETURNING *`, [efectivo, latestDate.rows[0].max_fecha, req.user.n_usuario, req.user.market_id]);
        res.json(updateTurno.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/turno', async(req,res) => {
    try {
        const turnos = await pool.query(`SELECT no_turno, n_usuario, efectivo_apertura, efectivo_cierre, to_char(fecha_apertura, 'YYYY-MM-DD HH24:MI:SS') AS fecha_apertura, to_char(fecha_cierre, 'YYYY-MM-DD HH24:MI:SS') AS fecha_cierre FROM turno
                                         WHERE market_id = $1
                                         ORDER BY fecha_apertura ASC`, [req.user.market_id]);
        res.json(turnos.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/turno-en-proceso', async(req,res) => {
    try {
        const turnoEnProceso = await pool.query('SELECT * FROM turno WHERE fecha_apertura = fecha_cierre AND market_id = $1', [req.user.market_id]);
        res.json(turnoEnProceso.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/turno-hoy', async(req,res) => {
    try {
        const turnos = await pool.query(`SELECT t.no_turno, t.n_usuario, t.efectivo_apertura, t.efectivo_cierre, to_char(t.fecha_apertura, 'YYYY-MM-DD HH24:MI:SS') AS fecha_apertura, to_char(t.fecha_cierre, 'YYYY-MM-DD HH24:MI:SS') AS fecha_cierre, t.market_id FROM turno AS t 
                                         WHERE to_char(NOW(), 'YYYY-MM-DD') = to_char(fecha_cierre, 'YYYY-MM-DD') AND t.market_id = $1
                                         ORDER BY fecha_apertura ASC`, [req.user.market_id]);
        res.json(turnos.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/turno-mes', async(req,res) => {
    try {
        const turnos = await pool.query(`SELECT no_turno, n_usuario, efectivo_apertura, efectivo_cierre, to_char(fecha_apertura, 'YYYY-MM-DD HH24:MI:SS') AS fecha_apertura, to_char(fecha_cierre, 'YYYY-MM-DD HH24:MI:SS') AS fecha_cierre, market_id FROM turno
                                         WHERE to_char(NOW(), 'YYYY-MM') = to_char(fecha_cierre, 'YYYY-MM') AND market_id = $1
                                         ORDER BY fecha_apertura ASC`, [req.user.market_id]);
        res.json(turnos.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/turno/:nUsuario/:fecha', async(req,res) => {
    try {
        const { nUsuario, fecha } = req.params;
        const specificTurno = await pool.query(`SELECT no_turno, n_usuario, efectivo_apertura, efectivo_cierre, to_char(fecha_apertura, 'YYYY-MM-DD HH24:MI:SS') AS fecha_apertura, to_char(fecha_cierre, 'YYYY-MM-DD HH24:MI:SS') AS fecha_cierre, market_id FROM turno 
                                                WHERE n_usuario = $1 AND to_char(fecha_apertura, 'YYYY-MM-DD HH24:MI:SS') = $2 AND market_id = $3`, [nUsuario, fecha, req.user.market_id]);
    } catch (err) {
        console.error(err.message);
    }
});

// Control de Compras
router.get('/compras', (req,res) => {
    res.render('tabs/movimientos/compras');
});

router.get('/compras-data', async (req,res) => {
    try {
        const compras = await pool.query(`SELECT * FROM compra WHERE market_id = $1`, [req.user.market_id]);
        res.json(compras.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/compras-data', async (req,res) => {
    try {
        const {
            proveedor,
            nit,
            direccion,
            codigoDeProducto,
            descripcion,
            precioQ,
            cantidad,
            tipoDePago,
            facturaNo,
            noFactura
        } = req.body;

        const newCompra = await pool.query(`INSERT INTO compra (nit, proveedor, direccion, codigo_de_producto, descripcion, precio_q, cantidad, tipo_de_pago, market_id, factura_no, n_usuario, no_factura)
                                            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
                                            [nit, proveedor, direccion, codigoDeProducto, descripcion, precioQ, cantidad, tipoDePago, req.user.market_id, facturaNo, req.user.n_usuario, noFactura]);

        res.json(newCompra.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.put('/compras-data', async (req,res) => {
    try {
        const { facturaNo, tipoDePago } = req.body;
        const updateTipoDePago = await pool.query(`UPDATE compra SET tipo_de_pago = $1 WHERE factura_no = $2 AND market_id = $3`, [tipoDePago, facturaNo, req.user.market_id]);
        res.json(updateTipoDePago.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.delete('/compras-data/:id', async (req,res) => {
    try {
        const { id } = req.params;
        const deletedCompra = await pool.query(`DELETE FROM compra WHERE compra_no = $1 AND market_id = $2`, [id, req.user.market_id]);
        res.json({ message: `Item with id ${id} removed successfully` });
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