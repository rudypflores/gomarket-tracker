const express = require('express');
const router = express.Router();
const pool = require('../db');
const fastCsv = require('fast-csv');
const fs = require('fs');
const folder = 'tabs/reportes';

// Set static file location
router.use(express.static('public'));
router.use('/css', express.static(__dirname + 'public/css'));
router.use('/js', express.static(__dirname + 'public/js'));
router.use('/img', express.static(__dirname + 'public/images'));

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
        const comprasPorDia = await pool.query(`SELECT to_char(fecha_de_compra, 'DD-MM-YYYY') AS fecha_de_compra, compra_no, proveedor, no_factura, codigo_de_producto, descripcion, cantidad, precio_q, cantidad*precio_q AS subtotal
                                                FROM compra
                                                WHERE DATE(fecha_de_compra) = $1`,
                                                [fecha]);
        res.json(comprasPorDia.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/compras-mensuales/:fecha', async (req,res) => {
    try {
        const { fecha } = req.params;
        const comprasMensuales = await pool.query(`SELECT to_char(fecha_de_compra, 'DD-MM-YYYY') AS fecha_de_compra, compra_no, proveedor, no_factura, codigo_de_producto, descripcion, cantidad, precio_q, cantidad*precio_q AS subtotal
                                                   FROM compra
                                                   WHERE to_char(fecha_de_compra, 'YYYY-MM') = $1`, [fecha]);
        res.json(comprasMensuales.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/compras-periodicas/:fechaEmpiezo/:fechaFinal', async (req,res) => {
    try {
        const { fechaEmpiezo, fechaFinal } = req.params;
        const comprasPeriodicas = await pool.query(`SELECT to_char(fecha_de_compra, 'DD-MM-YYYY') AS fecha_de_compra, compra_no, proveedor, no_factura, codigo_de_producto, descripcion, cantidad, precio_q, cantidad*precio_q AS subtotal
                                                    FROM compra
                                                    WHERE DATE(fecha_de_compra) >= $1 and DATE(fecha_de_compra) <= $2`,
                                                   [fechaEmpiezo, fechaFinal]);
        res.json(comprasPeriodicas.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/compras-por-dia-download/:fecha', async (req,res) => {
    try {
        const { fecha } = req.params;
        const ws = fs.createWriteStream(`reporte ${fecha}.csv`);
        let queryResponse = await pool.query(`SELECT to_char(fecha_de_compra, 'DD-MM-YYYY') AS fecha_de_compra, compra_no, proveedor, no_factura, codigo_de_producto, descripcion, cantidad, precio_q, cantidad*precio_q AS subtotal
                                              FROM compra
                                              WHERE fecha_de_compra = $1`,
                                              [fecha]);

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

router.get('/compras-mensuales-download/:fecha', async (req,res) => {
    try {
        const { fecha } = req.params;
        const ws = fs.createWriteStream(`reporte ${fecha}.csv`);
        let queryResponse = await pool.query(`SELECT to_char(fecha_de_compra, 'DD-MM-YYYY') AS fecha_de_compra, compra_no, proveedor, no_factura, codigo_de_producto, descripcion, cantidad, precio_q, cantidad*precio_q AS subtotal
                                              FROM compra
                                              WHERE to_char(fecha_de_compra, 'YYYY-MM') = $1`,
                                              [fecha]);

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

router.get('/compras-periodicas-download/:fechaEmpiezo/:fechaFinal', async (req,res) => {
    try {
        const { fechaEmpiezo, fechaFinal } = req.params;
        const ws = fs.createWriteStream(`reporte (${fechaEmpiezo} a ${fechaFinal}).csv`);
        let queryResponse = await pool.query(`SELECT to_char(fecha_de_compra, 'DD-MM-YYYY') AS fecha_de_compra, compra_no, proveedor, no_factura, codigo_de_producto, descripcion, cantidad, precio_q, cantidad*precio_q AS subtotal
                                              FROM compra
                                              WHERE DATE(fecha_de_compra) >= $1 and DATE(fecha_de_compra) <= $2`,
                                              [fechaEmpiezo, fechaFinal]);

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
                                        LEFT JOIN producto ON producto.codigo = inventario.codigo;`);
        res.json(query.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/inventario-nuevo-report', async (req,res) => {
    try {
        const query = await pool.query(`SELECT * FROM inventario
                                        LEFT JOIN producto ON producto.codigo = inventario.codigo;`);
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
                                        WHERE producto.ubicacion = $1`, [ubicacion]);
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
                                              WHERE DATE(fecha_de_venta) = $1`, [fecha]);

        const totalCompras = await pool.query(`SELECT DISTINCT SUM(cantidad*precio_q) AS total_compra
                                               FROM compra
                                               WHERE DATE(fecha_de_compra) = $1`, [fecha]);

        res.json({ 
                    'totalVentas': totalVentas.rows[0].total_venta, 
                    'totalCompras': totalCompras.rows[0].total_compra,
                    'utilidadNeta': totalVentas.rows[0].total_venta-totalCompras.rows[0].total_compra,
                    'pUtilidad': ((totalVentas.rows[0].total_venta-totalCompras.rows[0].total_compra)/totalVentas.rows[0].total_compra).toFixed(2)*100
                });
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/utilidad-diaria-download/:fecha', async (req,res) => {
    try {
        const { fecha } = req.params;
        const ws = fs.createWriteStream(`reporte ${fecha}.csv`);
        const totalVentas = await pool.query(`SELECT DISTINCT SUM(cantidad*precio_q) AS total_venta
                                              FROM venta
                                              WHERE DATE(fecha_de_venta) = $1`, [fecha]);

        const totalCompras = await pool.query(`SELECT DISTINCT SUM(cantidad*precio_q) AS total_compra
                                               FROM compra
                                               WHERE DATE(fecha_de_compra) = $1`, [fecha]);



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
                                              WHERE to_char(fecha_de_venta, 'YYYY-MM') = $1`, [fecha]);

        const totalCompras = await pool.query(`SELECT DISTINCT SUM(cantidad*precio_q) AS total_compra
                                               FROM compra
                                               WHERE to_char(fecha_de_compra, 'YYYY-MM') = $1`, [fecha]);

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

router.get('/utilidad-mensual-download/:fecha', async (req,res) => {
    try {
        const { fecha } = req.params;
        const ws = fs.createWriteStream(`reporte ${fecha}.csv`);
        const totalVentas = await pool.query(`SELECT DISTINCT SUM(cantidad*precio_q) AS total_venta
                                              FROM venta
                                              WHERE to_char(fecha_de_venta, 'YYYY-MM') = $1`, [fecha]);

        const totalCompras = await pool.query(`SELECT DISTINCT SUM(cantidad*precio_q) AS total_compra
                                               FROM compra
                                               WHERE to_char(fecha_de_compra, 'YYYY-MM') = $1`, [fecha]);

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
                                              WHERE DATE(fecha_de_venta) >= $1 and DATE(fecha_de_venta) <= $2`, [fechaComienzo, fechaFinal]);

        const totalCompras = await pool.query(`SELECT DISTINCT SUM(cantidad*precio_q) AS total_compra
                                               FROM compra
                                               WHERE DATE(fecha_de_compra) >= $1 and DATE(fecha_de_compra) <= $2`, [fechaComienzo, fechaFinal]);
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

router.get('/utilidades-periodicas-download/:fechaComienzo/:fechaFinal', async (req,res) => {
    try {
        const { fechaComienzo, fechaFinal } = req.params;
        const ws = fs.createWriteStream(`Reporte ${fechaComienzo} a ${fechaFinal}.csv`);
        const totalVentas = await pool.query(`SELECT DISTINCT SUM(cantidad*precio_q) AS total_venta
                                              FROM venta
                                              WHERE DATE(fecha_de_venta) >= $1 and DATE(fecha_de_venta) <= $2`, [fechaComienzo, fechaFinal]);

        const totalCompras = await pool.query(`SELECT DISTINCT SUM(cantidad*precio_q) AS total_compra
                                               FROM compra
                                               WHERE DATE(fecha_de_compra) >= $1 and DATE(fecha_de_compra) <= $2`, [fechaComienzo, fechaFinal]);

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
        const utilidadesDia = await pool.query(`SELECT venta.venta_no, venta.codigo_de_producto, venta.descripcion, venta.cantidad, producto.costo_q, producto.precio_publico, producto.precio_publico*venta.cantidad AS subtotal 
                                                FROM venta
                                                LEFT JOIN producto ON venta.codigo_de_producto = producto.codigo
                                                WHERE DATE(fecha_de_venta) = $1`,
                                                [fecha]);
        res.json(utilidadesDia.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/ventas-mensuales/:fecha', async (req,res) => {
    try {
        const { fecha } = req.params;
        const utilidadesMensuales = await pool.query(`SELECT venta.venta_no, venta.codigo_de_producto, venta.descripcion, venta.cantidad, producto.costo_q, producto.precio_publico, producto.precio_publico*venta.cantidad AS subtotal 
                                                      FROM venta
                                                      LEFT JOIN producto ON venta.codigo_de_producto = producto.codigo
                                                      WHERE to_char(fecha_de_venta, 'YYYY-MM') = $1`,
                                                      [fecha]);
        res.json(utilidadesMensuales.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/ventas-periodicas/:fechaEmpiezo/:fechaFinal', async (req,res) => {
    try {
        const { fechaEmpiezo, fechaFinal } = req.params;
        const utilidadesDia = await pool.query(`SELECT venta.venta_no, venta.codigo_de_producto, venta.descripcion, venta.cantidad, producto.costo_q, producto.precio_publico, producto.precio_publico*venta.cantidad AS subtotal 
                                                FROM venta
                                                LEFT JOIN producto ON venta.codigo_de_producto = producto.codigo
                                                WHERE DATE(fecha_de_venta) >= $1 and DATE(fecha_de_venta) <= $2`,
                                                [fechaEmpiezo, fechaFinal]);
        res.json(utilidadesDia.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/ventas-por-tiempo/:fechaEmpiezo/:fechaFinal', async(req,res) => {
    try {
        const { fechaEmpiezo, fechaFinal } = req.params;
        const ventasPorTiempo = await pool.query(`SELECT venta.venta_no, venta.codigo_de_producto, venta.descripcion, venta.cantidad, producto.costo_q, producto.precio_publico, producto.precio_publico*venta.cantidad AS subtotal, venta.tipo_de_pago 
                                                  FROM venta
                                                  LEFT JOIN producto ON venta.codigo_de_producto = producto.codigo
                                                  WHERE venta.fecha_de_venta between $1 and $2`, [fechaEmpiezo, fechaFinal]);
        res.json(ventasPorTiempo.rows);
    } catch (err) {
        console.error(err.message);
    }
});

router.get('/ventas-por-dia-download/:fecha', async (req,res) => {
    try {
        const { fecha } = req.params;
        const ws = fs.createWriteStream(`reporte ${fecha}.csv`);
        let queryResponse = await pool.query(`SELECT venta.venta_no, venta.codigo_de_producto, venta.descripcion, venta.cantidad, producto.costo_q, producto.precio_publico, producto.precio_publico*venta.cantidad AS subtotal 
                                             FROM venta
                                             LEFT JOIN producto ON venta.codigo_de_producto = producto.codigo
                                             WHERE DATE(fecha_de_venta) = $1`,
                                             [fecha]);

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

router.get('/ventas-mensuales-download/:fecha', async (req,res) => {
    try {
        const { fecha } = req.params;
        const ws = fs.createWriteStream(`reporte ${fecha}.csv`);
        let queryResponse = await pool.query(`SELECT venta.venta_no, venta.codigo_de_producto, venta.descripcion, venta.cantidad, producto.costo_q, producto.precio_publico, producto.precio_publico*venta.cantidad AS subtotal 
                                              FROM venta
                                              LEFT JOIN producto ON venta.codigo_de_producto = producto.codigo
                                              WHERE to_char(fecha_de_venta, 'YYYY-MM') = $1`,
                                              [fecha]);

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

router.get('/ventas-periodicas-download/:fechaEmpiezo/:fechaFinal', async (req,res) => {
    try {
        const { fechaEmpiezo, fechaFinal } = req.params;
        const ws = fs.createWriteStream(`reporte (${fechaEmpiezo} a ${fechaFinal}).csv`);
        let queryResponse = await pool.query(`SELECT venta.venta_no, venta.codigo_de_producto, venta.descripcion, venta.cantidad, producto.costo_q, producto.precio_publico, producto.precio_publico*venta.cantidad AS subtotal 
                                             FROM venta
                                             LEFT JOIN producto ON venta.codigo_de_producto = producto.codigo
                                             WHERE DATE(fecha_de_venta) >= $1 and DATE(fecha_de_venta) <= $2`,
                                             [fechaEmpiezo, fechaFinal]);

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
        const altasYBajas = await pool.query(`SELECT a.codigo, p.nombre, a.cantidad_cambio, a.razon AS descripcion
                                              FROM alta_y_baja AS a
                                              LEFT JOIN producto AS p ON p.codigo = a.codigo
                                              WHERE DATE(a.fecha) = $1`, [fecha]);
        res.json(altasYBajas.rows);
    } catch (err) {
        console.error(err.message);
    }
})

router.get('/altas-y-bajas-download/:fecha', async (req,res) => {
    try {
        const { fecha } = req.params;
        const ws = fs.createWriteStream(`reporte (${fecha}).csv`);
        let queryResponse = await pool.query(`SELECT a.codigo, p.nombre, a.cantidad_cambio, a.razon AS descripcion
                                              FROM alta_y_baja AS a
                                              LEFT JOIN producto AS p ON p.codigo = a.codigo
                                              WHERE DATE(a.fecha) = $1`,
                                             [fecha]);

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