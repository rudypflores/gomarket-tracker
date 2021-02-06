const express = require('express');
const router = express.Router();
const pool = require('../db');
const fastCsv = require('fast-csv');
const fs = require('fs');
const folder = 'tabs/reportes';

/* Compras */
router.get('/compras-mensuales', (req,res) => {
    res.render(`${folder}/compras/comprasMensuales`);
});

router.get('/compras-periodicas', (req,res) => {
    res.render(`${folder}/compras/comprasPeriodicas`);
});

router.get('/compras-por-dia', (req,res) => {
    res.render(`${folder}/compras/comprasPorDia`);
});

router.get('/compras-por-dia/:fecha', async (req,res) => {
    try {
        const { fecha } = req.params;
        const comprasPorDia = await pool.query(`SELECT to_char(fecha_de_compra, 'DD-MM-YYYY HH:MM:SS') AS fecha_de_compra, compra_no, proveedor, codigo_de_producto, descripcion, cantidad, precio_q, cantidad*precio_q AS subtotal, factura_no
                                                FROM compra
                                                WHERE DATE(fecha_de_compra) = $1 AND market_id = $2
                                                ORDER BY fecha_de_compra DESC`,
                                                [fecha, req.user.market_id]);
        res.json(comprasPorDia.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/compras-mensuales/:fecha', async (req,res) => {
    try {
        const { fecha } = req.params;
        const comprasMensuales = await pool.query(`SELECT to_char(fecha_de_compra, 'DD-MM-YYYY HH:MM:SS') AS fecha_de_compra, compra_no, proveedor, codigo_de_producto, descripcion, cantidad, precio_q, cantidad*precio_q AS subtotal, factura_no
                                                   FROM compra
                                                   WHERE to_char(fecha_de_compra, 'YYYY-MM') = $1 AND market_id = $2
                                                   ORDER BY fecha_de_compra DESC`, [fecha, req.user.market_id]);
        res.json(comprasMensuales.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/compras-periodicas/:fechaEmpiezo/:fechaFinal', async (req,res) => {
    try {
        const { fechaEmpiezo, fechaFinal } = req.params;
        const comprasPeriodicas = await pool.query(`SELECT to_char(fecha_de_compra, 'DD-MM-YYYY HH:MM:SS') AS fecha_de_compra, compra_no, proveedor, codigo_de_producto, descripcion, cantidad, precio_q, cantidad*precio_q AS subtotal, factura_no
                                                    FROM compra
                                                    WHERE DATE(fecha_de_compra) >= $1 AND DATE(fecha_de_compra) <= $2 AND market_id = $3
                                                    ORDER BY fecha_de_compra DESC`,
                                                   [fechaEmpiezo, fechaFinal, req.user.market_id]);
        res.json(comprasPeriodicas.rows);
    } catch (err) {
        console.error(err.message);
    }
});


router.get('/compras-por-tiempo/:fechaEmpiezo/:fechaFinal', async(req,res) => {
    try {
        const { fechaEmpiezo, fechaFinal } = req.params;
        const comprasPorTiempo = await pool.query(`SELECT compra.compra_no, compra.codigo_de_producto, compra.descripcion, compra.cantidad, producto.costo_q, compra.precio_q, compra.precio_q*compra.cantidad AS subtotal, compra.tipo_de_pago, compra.fecha_de_compra, factura_no
                                                  FROM compra
                                                  LEFT JOIN producto ON compra.codigo_de_producto = producto.codigo
                                                  WHERE compra.market_id = $3 AND compra.fecha_de_compra between $1 AND $2
                                                  ORDER BY fecha_de_compra ASC`, [fechaEmpiezo, fechaFinal, req.user.market_id]);
        res.json(comprasPorTiempo.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/compras-por-dia-download', async (req,res) => {
    try {
        const { fecha, location } = req.body;
        const ws = fs.createWriteStream(location);
        const queryResponse = await pool.query(`SELECT to_char(fecha_de_compra, 'DD-MM-YYYY HH:MM:SS') AS fecha_de_compra, proveedor, codigo_de_producto, descripcion, cantidad, precio_q, cantidad*precio_q AS subtotal, factura_no
                                                FROM compra
                                                WHERE DATE(fecha_de_compra) = $1 AND market_id = $2
                                                ORDER BY fecha_de_compra DESC`,
                                                [fecha, req.user.market_id]);

        const jsonData = JSON.parse(JSON.stringify(queryResponse.rows));

        fastCsv
        .write(jsonData, { headers: true })
        .on('finish', () => {
            console.log('file exported successfully.');
            res.json({ message:'Reporte exportado exitosamente.' });
        })
        .on('error', () => {
            console.log('file was not able to be exported.');
            res.json({ message:'Reporte no pudo ser exportado.' });
        })
        .pipe(ws);
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/compras-mensuales-download', async (req,res) => {
    try {
        const { fecha, location } = req.body;
        const ws = fs.createWriteStream(location);
        let queryResponse = await pool.query(`SELECT to_char(fecha_de_compra, 'DD-MM-YYYY HH:MM:SS') AS fecha_de_compra, compra_no, proveedor, codigo_de_producto, descripcion, cantidad, precio_q, cantidad*precio_q AS subtotal, factura_no
                                              FROM compra
                                              WHERE to_char(fecha_de_compra, 'YYYY-MM') = $1 AND market_id = $2
                                              ORDER BY fecha_de_compra DESC`,
                                              [fecha, req.user.market_id]);

        const jsonData = JSON.parse(JSON.stringify(queryResponse.rows));

        fastCsv
        .write(jsonData, { headers: true })
        .on('finish', () => {
            console.log('file exported successfully.');
            res.json({ message:'Reporte exportado exitosamente.' });
        })
        .on('error', () => {
            console.log('file was not able to be exported.');
            res.json({ message:'Reporte no pudo ser exportado.' });
        })
        .pipe(ws);
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/compras-periodicas-download', async (req,res) => {
    try {
        const { fechaEmpiezo, fechaFinal, location } = req.body;
        const ws = fs.createWriteStream(location);
        let queryResponse = await pool.query(`SELECT to_char(fecha_de_compra, 'DD-MM-YYYY HH:MM:SS') AS fecha_de_compra, proveedor, codigo_de_producto, descripcion, cantidad, precio_q, cantidad*precio_q AS subtotal, factura_no
                                              FROM compra
                                              WHERE DATE(fecha_de_compra) >= $1 and DATE(fecha_de_compra) <= $2 AND market_id = $3
                                              ORDER BY fecha_de_compra DESC`,
                                              [fechaEmpiezo, fechaFinal, req.user.market_id]);

        const jsonData = JSON.parse(JSON.stringify(queryResponse.rows));

        fastCsv
        .write(jsonData, { headers: true })
        .on('finish', () => {
            console.log('file exported successfully.');
            res.json({ message:'Reporte exportado exitosamente.' });
        })
        .on('error', () => {
            console.log('file was not able to be exported.');
            res.json({ message:'Reporte no pudo ser exportado.' });
        })
        .pipe(ws);
    } catch (err) {
        console.error(err.message);
    }
});

/* Gastos */
router.get('/gastos-de-venta', (req,res) => {
    res.render(`${folder}/gastos/gastosDeVenta`);
});

router.get('/gastos-generales', (req,res) => {
    res.render(`${folder}/gastos/gastosGenerales`);
});

/* Inventario */
router.get('/inventario-actual', (req,res) => {
    res.render(`${folder}/inventario/inventarioActual`);
});

router.get('/inventario-nuevo', (req,res) => {
    res.render(`${folder}/inventario/inventarioNuevo`);
});

router.get('/inventario-por-categoria', (req,res) => {
    res.render(`${folder}/inventario/inventarioPorCategoria`);
});;

router.get('/inventario-actual-report', async (req,res) => {
    try {
        const query = await pool.query(`SELECT * FROM inventario
                                        LEFT JOIN producto ON producto.codigo = inventario.codigo
                                        WHERE inventario.market_id = $1
                                        ORDER BY inventario_no DESC`, [req.user.market_id]);
        res.json(query.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/inventario-nuevo-report', async (req,res) => {
    try {
        const query = await pool.query(`SELECT * FROM inventario
                                        LEFT JOIN producto ON producto.codigo = inventario.codigo
                                        WHERE inventario.market_id = $1
                                        ORDER BY inventario_no DESC`, [req.user.market_id]);
        res.json(query.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/inventario-por-categoria-report/:ubicacion', async(req,res) => {
    try {
        const { ubicacion } = req.params;
        const query = await pool.query(`SELECT * FROM inventario
                                        LEFT JOIN producto ON producto.codigo = inventario.codigo
                                        WHERE producto.ubicacion = $1 AND inventario.market_id = $2
                                        ORDER BY inventario_no DESC`, [ubicacion, req.user.market_id]);
        res.json(query.rows);
    } catch (err) {
        console.error(err.message);
    }
});

/* Saldos */
router.get('/saldos-de-clientes', (req,res) => {
    res.render(`${folder}/saldos/saldosDeClientes`);
});

router.get('/saldos-de-proveedores', (req,res) => {
    res.render(`${folder}/saldos/saldosDeProveedores`);
});

/* Utilidades */
router.get('/utilidad-diaria', (req,res) => {
    res.render(`${folder}/utilidades/utilidadDiaria`);
});

router.get('/utilidades-mensuales', (req,res) => {
    res.render(`${folder}/utilidades/utilidadesMensuales`);
});

router.get('/utilidades-periodicas', (req,res) => {
    res.render(`${folder}/utilidades/utilidadesPeriodicas`);
});

router.get('/utilidad-diaria/:fecha', async (req,res) => {
    try {
        const { fecha } = req.params;
        const totalVentas = await pool.query(`SELECT DISTINCT SUM(cantidad*precio_q) AS total_venta
                                              FROM venta
                                              WHERE DATE(fecha_de_venta) = $1 AND market_id = $2`, [fecha, req.user.market_id]);

        const totalCompras = await pool.query(`SELECT DISTINCT SUM(cantidad*precio_q) AS total_compra
                                               FROM compra
                                               WHERE DATE(fecha_de_compra) = $1 AND market_id = $2`, [fecha, req.user.market_id]);

        res.json({ 
                    'totalVentas': totalVentas.rows[0].total_venta, 
                    'totalCompras': totalCompras.rows[0].total_compra,
                    'utilidadNeta': totalVentas.rows[0].total_venta-totalCompras.rows[0].total_compra,
                });
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/utilidad-diaria-download', async (req,res) => {
    try {
        const { fecha, location } = req.body;
        const ws = fs.createWriteStream(location);
        const totalVentas = await pool.query(`SELECT DISTINCT SUM(cantidad*precio_q) AS total_venta
                                              FROM venta
                                              WHERE DATE(fecha_de_venta) = $1 AND market_id = $2`, [fecha, req.user.market_id]);

        const totalCompras = await pool.query(`SELECT DISTINCT SUM(cantidad*precio_q) AS total_compra
                                               FROM compra
                                               WHERE DATE(fecha_de_compra) = $1 AND market_id = $2`, [fecha, req.user.market_id]);

        const jsonData = JSON.parse(JSON.stringify([{
            'Total Ventas': totalVentas.rows[0].total_venta, 
            'Total Compras': totalCompras.rows[0].total_compra,
            'Utilidad Neta': totalVentas.rows[0].total_venta-totalCompras.rows[0].total_compra,
            '% Utilidad': ((totalVentas.rows[0].total_venta-totalCompras.rows[0].total_compra)/totalVentas.rows[0].total_venta).toFixed(2)*100
        }]));

        fastCsv
        .write(jsonData, { headers: true })
        .on('finish', () => {
            console.log('file exported successfully.');
            res.json({ message:'Reporte exportado exitosamente.' });
        })
        .on('error', () => {
            console.log('file was not able to be exported.');
            res.json({ message:'Reporte no pudo ser exportado.' });
        })
        .pipe(ws);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/utilidad-mensual/:fecha', async (req,res) => {
    try {
        const { fecha } = req.params;
        const totalVentas = await pool.query(`SELECT DISTINCT SUM(cantidad*precio_q) AS total_venta
                                              FROM venta
                                              WHERE to_char(fecha_de_venta, 'YYYY-MM') = $1 AND market_id = $2`, [fecha, req.user.market_id]);

        const totalCompras = await pool.query(`SELECT DISTINCT SUM(cantidad*precio_q) AS total_compra
                                               FROM compra
                                               WHERE to_char(fecha_de_compra, 'YYYY-MM') = $1 AND market_id = $2`, [fecha, req.user.market_id]);

        res.json({ 
                    'totalVentas': totalVentas.rows[0].total_venta, 
                    'totalCompras': totalCompras.rows[0].total_compra,
                    'utilidadNeta': totalVentas.rows[0].total_venta-totalCompras.rows[0].total_compra,
                    'pUtilidad': ((totalVentas.rows[0].total_venta-totalCompras.rows[0].total_compra)/totalVentas.rows[0].total_venta).toFixed(2)*100
                });
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/utilidad-mensual-download', async (req,res) => {
    try {
        const { fecha, location } = req.body;
        const ws = fs.createWriteStream(location);
        const totalVentas = await pool.query(`SELECT DISTINCT SUM(cantidad*precio_q) AS total_venta
                                              FROM venta
                                              WHERE to_char(fecha_de_venta, 'YYYY-MM') = $1 AND market_id = $2`, [fecha, req.user.market_id]);

        const totalCompras = await pool.query(`SELECT DISTINCT SUM(cantidad*precio_q) AS total_compra
                                               FROM compra
                                               WHERE to_char(fecha_de_compra, 'YYYY-MM') = $1 AND market_id = $2`, [fecha, req.user.market_id]);

        const jsonData = JSON.parse(JSON.stringify([{
            'Total Ventas': totalVentas.rows[0].total_venta, 
            'Total Compras': totalCompras.rows[0].total_compra,
            'Utilidad Neta': totalVentas.rows[0].total_venta-totalCompras.rows[0].total_compra,
            '% Utilidad': ((totalVentas.rows[0].total_venta-totalCompras.rows[0].total_compra)/totalVentas.rows[0].total_venta).toFixed(2)*100
        }]));

        fastCsv
        .write(jsonData, { headers: true })
        .on('finish', () => {
            console.log('file exported successfully.');
            res.json({ message:'Reporte exportado exitosamente.' });
        })
        .on('error', () => {
            console.log('file was not able to be exported.');
            res.json({ message:'Reporte no pudo ser exportado.' });
        })
        .pipe(ws);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/utilidades-periodicas/:fechaComienzo/:fechaFinal', async (req,res) => {
    try {
        const { fechaComienzo, fechaFinal } = req.params;
        const totalVentas = await pool.query(`SELECT DISTINCT SUM(cantidad*precio_q) AS total_venta
                                              FROM venta
                                              WHERE DATE(fecha_de_venta) >= $1 and DATE(fecha_de_venta) <= $2 AND market_id = $3`, [fechaComienzo, fechaFinal, req.user.market_id]);

        const totalCompras = await pool.query(`SELECT DISTINCT SUM(cantidad*precio_q) AS total_compra
                                               FROM compra
                                               WHERE DATE(fecha_de_compra) >= $1 and DATE(fecha_de_compra) <= $2 AND market_id = $3`, [fechaComienzo, fechaFinal, req.user.market_id]);
        res.json({ 
                    'totalVentas': totalVentas.rows[0].total_venta, 
                    'totalCompras': totalCompras.rows[0].total_compra,
                    'utilidadNeta': totalVentas.rows[0].total_venta-totalCompras.rows[0].total_compra,
                    'pUtilidad': ((totalVentas.rows[0].total_venta-totalCompras.rows[0].total_compra)/totalVentas.rows[0].total_venta).toFixed(2)*100
                });
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/utilidades-periodicas-download', async (req,res) => {
    try {
        const { fechaComienzo, fechaFinal, location } = req.body;
        const ws = fs.createWriteStream(location);
        const totalVentas = await pool.query(`SELECT DISTINCT SUM(cantidad*precio_q) AS total_venta
                                              FROM venta
                                              WHERE DATE(fecha_de_venta) >= $1 AND DATE(fecha_de_venta) <= $2 AND market_id = $3`, [fechaComienzo, fechaFinal, req.user.market_id]);

        const totalCompras = await pool.query(`SELECT DISTINCT SUM(cantidad*precio_q) AS total_compra
                                               FROM compra
                                               WHERE DATE(fecha_de_compra) >= $1 AND DATE(fecha_de_compra) <= $2 AND market_id = $3`, [fechaComienzo, fechaFinal, req.user.market_id]);

        const jsonData = JSON.parse(JSON.stringify([{
            'Total Ventas': totalVentas.rows[0].total_venta, 
            'Total Compras': totalCompras.rows[0].total_compra,
            'Utilidad Neta': totalVentas.rows[0].total_venta-totalCompras.rows[0].total_compra,
            '% Utilidad': ((totalVentas.rows[0].total_venta-totalCompras.rows[0].total_compra)/totalVentas.rows[0].total_venta).toFixed(2)*100
        }]));

        fastCsv
        .write(jsonData, { headers: true })
        .on('finish', () => {
            console.log('file exported successfully.');
            res.json({ message:'Reporte exportado exitosamente.' });
        })
        .on('error', () => {
            console.log('file was not able to be exported.');
            res.json({ message:'Reporte no pudo ser exportado.' });
        })
        .pipe(ws);
    } catch (err) {
        console.error(err.message);
    }
});

/* Ventas */
router.get('/ventas-mensuales', (req,res) => {
    res.render(`${folder}/ventas/ventasMensuales`);
});

router.get('/ventas-periodicas', (req,res) => {
    res.render(`${folder}/ventas/ventasPeriodicas`);
});

router.get('/ventas-por-dia', (req,res) => {
    res.render(`${folder}/ventas/ventasPorDia`);
});

router.get('/ventas-por-dia/:fecha', async (req,res) => {
    try {
        const { fecha } = req.params;
        const utilidadesDia = await pool.query(`SELECT venta.codigo_de_producto, venta.descripcion, venta.cantidad, producto.costo_q, producto.precio_publico, producto.precio_publico*venta.cantidad AS subtotal, venta.fecha_de_venta, venta.factura_no
                                                FROM venta
                                                LEFT JOIN producto ON venta.codigo_de_producto = producto.codigo
                                                WHERE DATE(fecha_de_venta) = $1 AND venta.market_id = $2
                                                ORDER BY fecha_de_venta DESC`,
                                                [fecha, req.user.market_id]);
        res.json(utilidadesDia.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/ventas-mensuales/:fecha', async (req,res) => {
    try {
        const { fecha } = req.params;
        const utilidadesMensuales = await pool.query(`SELECT venta.codigo_de_producto, venta.descripcion, venta.cantidad, producto.costo_q, producto.precio_publico, producto.precio_publico*venta.cantidad AS subtotal, venta.factura_no
                                                      FROM venta
                                                      LEFT JOIN producto ON venta.codigo_de_producto = producto.codigo
                                                      WHERE to_char(fecha_de_venta, 'YYYY-MM') = $1 AND venta.market_id = $2
                                                      ORDER BY fecha_de_venta DESC`,
                                                      [fecha, req.user.market_id]);
        res.json(utilidadesMensuales.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/ventas-periodicas/:fechaEmpiezo/:fechaFinal', async (req,res) => {
    try {
        const { fechaEmpiezo, fechaFinal } = req.params;
        const utilidadesDia = await pool.query(`SELECT venta.codigo_de_producto, venta.descripcion, venta.cantidad, producto.costo_q, producto.precio_publico, producto.precio_publico*venta.cantidad AS subtotal, venta.factura_no
                                                FROM venta
                                                LEFT JOIN producto ON venta.codigo_de_producto = producto.codigo
                                                WHERE DATE(fecha_de_venta) >= $1 and DATE(fecha_de_venta) <= $2 AND venta.market_id = $3
                                                ORDER BY fecha_de_venta DESC`,
                                                [fechaEmpiezo, fechaFinal, req.user.market_id]);
        res.json(utilidadesDia.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/ventas-por-tiempo/:fechaEmpiezo/:fechaFinal', async(req,res) => {
    try {
        const { fechaEmpiezo, fechaFinal } = req.params;
        const ventasPorTiempo = await pool.query(`SELECT venta.venta_no, venta.codigo_de_producto, venta.descripcion, venta.cantidad, producto.costo_q, venta.precio_q, venta.precio_q*venta.cantidad AS subtotal, venta.tipo_de_pago, venta.fecha_de_venta, venta.factura_no
                                                  FROM venta
                                                  LEFT JOIN producto ON venta.codigo_de_producto = producto.codigo
                                                  WHERE venta.market_id = $3 AND venta.fecha_de_venta between $1 AND $2
                                                  ORDER BY fecha_de_venta ASC`, [fechaEmpiezo, fechaFinal, req.user.market_id]);
        res.json(ventasPorTiempo.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/ventas-por-dia-download', async (req,res) => {
    try {
        const { fecha, location } = req.body;
        const ws = fs.createWriteStream(location);
        let queryResponse = await pool.query(`SELECT venta.codigo_de_producto, venta.descripcion, venta.cantidad, producto.costo_q, producto.precio_publico, producto.precio_publico*venta.cantidad AS subtotal, venta.factura_no
                                             FROM venta
                                             LEFT JOIN producto ON venta.codigo_de_producto = producto.codigo
                                             WHERE DATE(fecha_de_venta) = $1 AND venta.market_id = $2
                                             ORDER BY fecha_de_venta DESC`,
                                             [fecha, req.user.market_id]);

        const jsonData = JSON.parse(JSON.stringify(queryResponse.rows));

        fastCsv
        .write(jsonData, { headers: true })
        .on('finish', () => {
            console.log('file exported successfully.');
            res.json({ message:'Reporte exportado exitosamente.' });
        })
        .on('error', () => {
            console.log('file was not able to be exported.');
            res.json({ message:'Reporte no pudo ser exportado.' });
        })
        .pipe(ws);
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/ventas-mensuales-download', async (req,res) => {
    try {
        const { fecha, location } = req.body;
        const ws = fs.createWriteStream(location);
        let queryResponse = await pool.query(`SELECT venta.codigo_de_producto, venta.descripcion, venta.cantidad, producto.costo_q, producto.precio_publico, producto.precio_publico*venta.cantidad AS subtotal, venta.factura_no
                                              FROM venta
                                              LEFT JOIN producto ON venta.codigo_de_producto = producto.codigo
                                              WHERE to_char(fecha_de_venta, 'YYYY-MM') = $1 AND venta.market_id = $2
                                              ORDER BY fecha_de_venta DESC`,
                                              [fecha, req.user.market_id]);

        const jsonData = JSON.parse(JSON.stringify(queryResponse.rows));

        fastCsv
        .write(jsonData, { headers: true })
        .on('finish', () => {
            console.log('file exported successfully.');
            res.json({ message:'Reporte exportado exitosamente.' });
        })
        .on('error', () => {
            console.log('file was not able to be exported.');
            res.json({ message:'Reporte no pudo ser exportado.' });
        })
        .pipe(ws);
    } catch (err) {
        console.error(err.message);
    }
});

router.post('/ventas-periodicas-download', async (req,res) => {
    try {
        const { fechaEmpiezo, fechaFinal, location } = req.body;
        const ws = fs.createWriteStream(location);
        let queryResponse = await pool.query(`SELECT venta.codigo_de_producto, venta.descripcion, venta.cantidad, producto.costo_q, producto.precio_publico, producto.precio_publico*venta.cantidad AS subtotal, venta.factura_no
                                             FROM venta
                                             LEFT JOIN producto ON venta.codigo_de_producto = producto.codigo
                                             WHERE DATE(fecha_de_venta) >= $1 and DATE(fecha_de_venta) <= $2 AND venta.market_id = $3
                                             ORDER BY fecha_de_venta DESC`,
                                             [fechaEmpiezo, fechaFinal, req.user.market_id]);

        const jsonData = JSON.parse(JSON.stringify(queryResponse.rows));

        fastCsv
        .write(jsonData, { headers: true })
        .on('finish', () => {
            console.log('file exported successfully.');
            res.json({ message:'Reporte exportado exitosamente.' });
        })
        .on('error', () => {
            console.log('file was not able to be exported.');
            res.json({ message:'Reporte no pudo ser exportado.' });
        })
        .pipe(ws);
    } catch (err) {
        console.error(err.message);
    }
});

/* Altas y Bajas */
router.get('/altas-y-bajas', (req,res) => {
    res.render(`${folder}/altasYBajas`);
});

router.get('/altas-y-bajas/:fecha', async (req,res) => {
    try {
        const { fecha } = req.params;
        const altasYBajas = await pool.query(`SELECT a.fecha, a.codigo, p.nombre, a.cantidad_cambio, a.razon AS descripcion
                                              FROM alta_y_baja AS a
                                              LEFT JOIN producto AS p ON p.codigo = a.codigo
                                              WHERE DATE(a.fecha) = $1 AND a.market_id = $2
                                              ORDER BY fecha DESC`, [fecha, req.user.market_id]);
        res.json(altasYBajas.rows);
    } catch (err) {
        console.error(err.message);
    }
})

router.post('/altas-y-bajas-download', async (req,res) => {
    try {
        const { fecha, location } = req.body;
        const ws = fs.createWriteStream(location);
        let queryResponse = await pool.query(`SELECT a.fecha, a.codigo, p.nombre, a.cantidad_cambio, a.razon AS descripcion
                                              FROM alta_y_baja AS a
                                              LEFT JOIN producto AS p ON p.codigo = a.codigo
                                              WHERE DATE(a.fecha) = $1 AND a.market_id = $2
                                              ORDER BY fecha DESC`,
                                             [fecha, req.user.market_id]);

        const jsonData = JSON.parse(JSON.stringify(queryResponse.rows));

        fastCsv
        .write(jsonData, { headers: true })
        .on('finish', () => {
            console.log('file exported successfully.');
            res.json({ message:'Reporte exportado exitosamente.' });
        })
        .on('error', () => {
            console.log('file was not able to be exported.');
            res.json({ message:'Reporte no pudo ser exportado.' });
        })
        .pipe(ws);
    } catch (err) {
        console.error(err.message);
    }
});

/* Cierres de Turno */
router.get('/cierres-de-turno', (req,res) => {
    res.render(`${folder}/cierresDeTurno`);
});

/* Productos Vendidos */
router.get('/productos-vendidos', (req,res) => {
    res.render(`${folder}/productosVendidos`);
});

module.exports = router;