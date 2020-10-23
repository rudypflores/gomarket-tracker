const express = require('express');
const router = express.Router();
const pool = require('../db');
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

router.get('/inventario-periodico', (req,res) => {
    res.render(`${folder}/inventario/inventarioPeriodico`);
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

/* Altas y Bajas */
router.get('/altas-y-bajas', (req,res) => {
    res.render(`${folder}/altasYBajas`);
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